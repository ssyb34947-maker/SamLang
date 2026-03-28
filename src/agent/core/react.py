"""
ReACT (Reasoning and Acting) 框架实现
支持 LLM 进行推理、选择行动、观察结果的循环
"""

from typing import List, Dict, Any, Optional, Tuple
import json
import re
from loguru import logger
from src.agent.tools import ToolManager
from src.agent.llm.llmclient import LLMClient


class ReACTAgent:
    """
    ReACT Agent

    功能：
    - 实现 Thought -> Action -> Observation 循环
    - 支持多轮工具调用
    - 自动规划和执行任务
    """

    def __init__(
        self,
        llm_client: LLMClient,
        tool_manager: ToolManager,
        max_iterations: int = 5,
        verbose: bool = False,
        stream: bool = True
    ):
        """
        初始化 ReACT Agent

        输入：
            llm_client: LLM 客户端
            tool_manager: 工具管理器
            max_iterations: 最大迭代次数
            verbose: 是否打印详细日志
            stream: 是否使用流式输出
        输出：无
        """
        self.llm_client = llm_client
        self.tool_manager = tool_manager
        self.max_iterations = max_iterations
        self.verbose = verbose
        self.stream = stream

    def _build_react_prompt(self, user_query: str, history: List[Dict[str, str]]) -> str:
        """
        构建 ReACT 提示词

        输入：
            user_query: 用户查询
            history: 对话历史中的思考-行动-观察记录
        输出：
            ReACT 格式的提示词
        """
        tools_desc = self.tool_manager.format_tools_description()

        # 检查是否使用 deepseek reasoner 模型
        is_deepseek_reasoner = "reasoner" in self.llm_client.config.model_name.lower()

        if is_deepseek_reasoner:
            # deepseek reasoner 格式
            prompt = f"""你是一个智能助手，可以使用工具来帮助回答问题。

{tools_desc}

请按照以下格式思考和行动：

思考：我需要思考如何解决这个问题
操作：工具名称
操作输入：{{"参数名": "参数值"}}
观察：[工具返回的结果会自动填充在这里]

如果不需要使用工具，或者已经获得足够信息，使用以下格式给出最终答案：

思考：我现在可以回答这个问题了
最终答案：[你的最终答案]

用户问题：{user_query}

请开始：
"""
        else:
            # 标准格式
            prompt = f"""你是一个智能助手，可以使用工具来帮助回答问题。

{tools_desc}

请按照以下格式思考和行动：

Thought: 我需要思考如何解决这个问题
Action: 工具名称
Action Input: {{"参数名": "参数值"}}
Observation: [工具返回的结果会自动填充在这里]

如果不需要使用工具，或者已经获得足够信息，使用以下格式给出最终答案：

Thought: 我现在可以回答这个问题了
Final Answer: [你的最终答案]

用户问题：{user_query}

请开始：
"""

        if history:
            prompt += "\n之前的思考和行动：\n" + "\n".join(history) + "\n\n请继续："

        return prompt

    def _parse_react_output(self, text: str) -> Tuple[Optional[str], Optional[str], Optional[Dict]]:
        """
        解析 LLM 的 ReACT 输出

        输入：
            text: LLM 输出文本
        输出：
            (thought, action, action_input) 或 (thought, "Final Answer", final_answer)
        """
        # 标准化文本，去除多余空白
        text = text.strip()

        # 检查是否是 deepseek reasoner 格式
        is_deepseek_reasoner = "思考：" in text or "操作：" in text

        if is_deepseek_reasoner:
            # 解析 deepseek reasoner 格式
            # 提取思考
            thought_match = re.search(r'思考：\s*(.+?)(?=\n(?:操作|最终答案))', text, re.DOTALL)
            thought = thought_match.group(1).strip() if thought_match else None

            # 检查是否有最终答案
            final_answer_match = re.search(r'最终答案：\s*(.+)', text, re.DOTALL)
            if final_answer_match:
                final_answer = final_answer_match.group(1).strip()
                return thought, "Final Answer", final_answer

            # 提取操作
            action_match = re.search(r'操作：\s*(.+?)(?=\n)', text)
            action = action_match.group(1).strip() if action_match else None

            # 提取操作输入
            action_input_match = re.search(r'操作输入：\s*(\{.+?\})', text, re.DOTALL)
            action_input = None
            if action_input_match:
                try:
                    action_input = json.loads(action_input_match.group(1))
                except json.JSONDecodeError:
                    # 尝试提取简单的键值对
                    input_text = action_input_match.group(1)
                    action_input = {"query": input_text.strip('{}').strip()}
        else:
            # 解析标准格式
            # 提取 Thought
            thought_match = re.search(r'Thought:\s*(.+?)(?=\n(?:Action|Final Answer))', text, re.DOTALL)
            thought = thought_match.group(1).strip() if thought_match else None

            # 检查是否有 Final Answer
            final_answer_match = re.search(r'Final Answer:\s*(.+)', text, re.DOTALL)
            if final_answer_match:
                final_answer = final_answer_match.group(1).strip()
                return thought, "Final Answer", final_answer

            # 提取 Action
            action_match = re.search(r'Action:\s*(.+?)(?=\n)', text)
            action = action_match.group(1).strip() if action_match else None

            # 提取 Action Input
            action_input_match = re.search(r'Action Input:\s*(\{.+?\})', text, re.DOTALL)
            action_input = None
            if action_input_match:
                try:
                    action_input = json.loads(action_input_match.group(1))
                except json.JSONDecodeError:
                    # 尝试提取简单的键值对
                    input_text = action_input_match.group(1)
                    action_input = {"query": input_text.strip('{}').strip()}

        return thought, action, action_input

    def run(self, user_query: str, context_messages: List[Dict[str, str]] = None, thinking_callback=None) -> str:
        """
        运行 ReACT 循环

        输入：
            user_query: 用户查询
            context_messages: 上下文消息（可选）
            thinking_callback: 思考过程回调函数，用于实时返回思考步骤
        输出：
            最终答案
        """
        history = []
        iteration = 0

        while iteration < self.max_iterations:
            iteration += 1

            if self.verbose:
                print(f"\n{'='*50}")
                print(f"迭代 {iteration}/{self.max_iterations}")
                print(f"{'='*50}")

            # 构建提示词
            react_prompt = self._build_react_prompt(user_query, history)

            # 构建消息列表
            messages = context_messages.copy() if context_messages else []
            messages.append({"role": "user", "content": react_prompt})

            # 调用 LLM
            if self.verbose:
                print("\n[LLM 响应]")

            if self.stream and self.verbose:
                # 流式输出
                response = self.llm_client.chat_stream(messages, print_output=True)
            else:
                # 非流式输出
                response = self.llm_client.chat(messages)
                if self.verbose:
                    print(response)

            # 解析输出
            thought, action, action_input = self._parse_react_output(response)

            # 记录 Thought
            if thought:
                history.append(f"Thought: {thought}")
                if self.verbose:
                    print(f"\n[思考] {thought}")
                
                # 调用思考回调
                if thinking_callback:
                    thinking_callback("thinking_step", {
                        "thought": thought,
                        "tool_call": None
                    })

            # 检查是否是最终答案
            if action == "Final Answer":
                if self.verbose:
                    print(f"\n[最终答案] {action_input}")
                return action_input

            # 执行 Action
            if action and action_input:
                history.append(f"Action: {action}")
                history.append(f"Action Input: {json.dumps(action_input, ensure_ascii=False)}")

                if self.verbose:
                    print(f"\n[工具] {action}")
                    print(f"[参数] {action_input}")
                
                # 调用工具回调
                if thinking_callback:
                    thinking_callback("tool_call", {
                        "tool_name": action,
                        "arguments": action_input,
                        "result": None
                    })

                # 调用工具
                try:
                    observation = self.tool_manager.call_tool(action, action_input)
                    history.append(f"Observation: {observation}")

                    if self.verbose:
                        print(f"[观察] {observation[:200]}...")
                    
                    # 调用工具结果回调
                    if thinking_callback:
                        thinking_callback("tool_result", {
                            "tool_name": action,
                            "arguments": action_input,
                            "result": observation
                        })
                except Exception as e:
                    observation = f"Error: {str(e)}"
                    history.append(f"Observation: {observation}")
                    
                    if self.verbose:
                        print(f"[错误] {observation}")
                    
                    # 调用工具结果回调（错误）
                    if thinking_callback:
                        thinking_callback("tool_result", {
                            "tool_name": action,
                            "arguments": action_input,
                            "result": observation
                        })
            else:
                # 无法解析出有效的 action，尝试直接返回响应
                if self.verbose:
                    print("\n[警告] 无法解析 Action，返回当前响应")
                return response

        # 达到最大迭代次数
        if self.verbose:
            print(f"\n[警告] 达到最大迭代次数 {self.max_iterations}")

        return "抱歉，我无法在规定的步骤内完成这个任务。请尝试简化您的问题。"


class ReACTAgentWithFunctionCalling(ReACTAgent):
    """
    使用 OpenAI Function Calling 的 ReACT Agent

    功能：使用原生的 function calling 而不是文本解析
    """

    def run(self, user_query: str, context_messages: List[Dict[str, str]] = None, thinking_callback=None) -> str:
        """
        运行 ReACT 循环（使用 function calling）

        输入：
            user_query: 用户查询
            context_messages: 上下文消息（可选）
            thinking_callback: 思考过程回调函数，用于实时返回思考步骤
        输出：
            最终答案
        """
        messages = context_messages.copy() if context_messages else []
        messages.append({"role": "user", "content": user_query})

        tools = self.tool_manager.get_tools_for_llm()
        iteration = 0

        # 检查是否使用 deepseek-reasoner 模型
        is_deepseek_reasoner = "reasoner" in self.llm_client.config.model_name.lower()
        print(f"使用模型是否为思考模型: {is_deepseek_reasoner}")

        while iteration < self.max_iterations:
            iteration += 1

            if self.verbose:
                #print(f"\n{'='*50}")
                logger.info(f"迭代 {iteration}/{self.max_iterations}")
                #print(f"{'='*50}")

            # 调用 LLM with function calling
            if self.stream and self.verbose:
                # 流式输出（对于 function calling 需要特殊处理）
                #logger.debug(f"tools: {tools}")
                stream_result = self._stream_with_function_calling(messages, tools)

                # 从字典构造消息对象
                assistant_message_dict = {
                    "role": "assistant",
                    "content": stream_result["content"]
                }

                # 如果有 tool_calls，添加到消息中
                if stream_result["tool_calls"]:
                    # 转换为 OpenAI 格式的 tool_calls
                    tool_calls = []
                    for tc in stream_result["tool_calls"]:
                        tool_calls.append({
                            "id": tc["id"],
                            "type": tc["type"],
                            "function": {
                                "name": tc["function"]["name"],
                                "arguments": tc["function"]["arguments"]
                            }
                        })
                    assistant_message_dict["tool_calls"] = tool_calls

                # 使用字典格式的消息
                has_tool_calls = stream_result["tool_calls"] is not None
                content = stream_result["content"]
                reasoning_content = stream_result.get("reasoning_content")
                if reasoning_content:
                    assistant_message_dict["reasoning_content"] = reasoning_content
            else:
                # 非流式输出
                logger.debug(f"tools: {tools}")
                response = self.llm_client.get_client().chat.completions.create(
                    model=self.llm_client.config.model_name,
                    messages=messages,
                    tools=tools,
                    temperature=self.llm_client.config.temperature,
                    max_tokens=self.llm_client.config.max_tokens
                )
            
                assistant_message = response.choices[0].message

                # 转换为字典格式
                assistant_message_dict = {
                    "role": "assistant",
                    "content": assistant_message.content
                }

                # 处理 deepseek-reasoner 的 reasoning_content
                reasoning_content = None
                if hasattr(assistant_message, 'reasoning_content') and assistant_message.reasoning_content:
                    assistant_message_dict["reasoning_content"] = assistant_message.reasoning_content
                    reasoning_content = assistant_message.reasoning_content

                if assistant_message.tool_calls:
                    tool_calls = []
                    for tc in assistant_message.tool_calls:
                        tool_calls.append({
                            "id": tc.id,
                            "type": tc.type,
                            "function": {
                                "name": tc.function.name,
                                "arguments": tc.function.arguments
                            }
                        })
                    assistant_message_dict["tool_calls"] = tool_calls

                has_tool_calls = assistant_message.tool_calls is not None
                content = assistant_message.content

                # 打印输出
                if self.verbose:
                    if is_deepseek_reasoner and reasoning_content:
                        logger.info(reasoning_content)
                    elif content:
                        logger.info(content)
                
                # 调用思考回调（包含思考内容）
                thought_content = reasoning_content if reasoning_content else content
                if thought_content and thinking_callback:
                    thinking_callback("thinking_step", {
                        "thought": thought_content,
                        "tool_call": None
                    })

            # 检查是否需要调用工具
            if has_tool_calls:
                # 添加助手消息到历史（包含 reasoning_content 用于 deepseek-reasoner）
                messages.append(assistant_message_dict)

                # 执行工具调用
                for tool_call in assistant_message_dict["tool_calls"]:
                    function_name = tool_call["function"]["name"]
                    function_args = json.loads(tool_call["function"]["arguments"])

                    if self.verbose:
                        logger.info(f"\n[调用工具] {function_name}")
                        logger.info(f"[参数] {function_args}")
                    
                    # 调用工具回调
                    if thinking_callback:
                        thinking_callback("tool_call", {
                            "tool_name": function_name,
                            "arguments": function_args,
                            "result": None
                        })

                    # 调用工具
                    try:
                        observation = self.tool_manager.call_tool(function_name, function_args)

                        if self.verbose:
                            logger.info(f"[结果] {observation[:200]}...")
                        
                        # 调用工具结果回调
                        if thinking_callback:
                            thinking_callback("tool_result", {
                                "tool_name": function_name,
                                "arguments": function_args,
                                "result": observation
                            })
                    except Exception as e:
                        observation = f"Error: {str(e)}"
                        if self.verbose:
                            logger.error(f"[错误] {observation}")
                        
                        # 调用工具结果回调（错误）
                        if thinking_callback:
                            thinking_callback("tool_result", {
                                "tool_name": function_name,
                                "arguments": function_args,
                                "result": observation
                            })

                    # 添加工具结果到消息
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call["id"],
                        "name": function_name,
                        "content": observation
                    })
            else:
                # 没有工具调用，返回最终答案
                if self.verbose:
                    logger.info(f"\n[最终答案]")
                    if not self.stream:
                        logger.info(content)
                return content

        # 达到最大迭代次数
        if self.verbose:
            logger.warning(f"\n[警告] 达到最大迭代次数 {self.max_iterations}")

        return "抱歉，我无法在规定的步骤内完成这个任务。"

    def _stream_with_function_calling(self, messages: List[Dict], tools: List[Dict]) -> Any:
        """
        流式输出 + Function Calling

        输入：
            messages: 消息列表
            tools: 工具列表
        输出：
            包含 assistant_message 和 tool_calls_info 的字典
        """
        stream = self.llm_client.get_client().chat.completions.create(
            model=self.llm_client.config.model_name,
            messages=messages,
            tools=tools,
            temperature=self.llm_client.config.temperature,
            max_tokens=self.llm_client.config.max_tokens,
            stream=True
        )

        # 收集流式响应
        full_content = ""
        full_reasoning_content = ""
        tool_calls_data = []

        print("[LLM 响应] ", end='', flush=True)

        # 检查是否使用 deepseek-reasoner 模型
        is_deepseek_reasoner = "reasoner" in self.llm_client.config.model_name.lower()
        
        begin_content=True

        for chunk in stream:
            delta = chunk.choices[0].delta
            
            # 处理 deepseek-reasoner 的 reasoning_content
            if is_deepseek_reasoner and hasattr(delta, 'reasoning_content') and delta.reasoning_content and delta.reasoning_content != "":
                full_reasoning_content += delta.reasoning_content
                print(delta.reasoning_content, end='', flush=True)

            # 处理文本内容
            elif delta.content:
                if begin_content:
                    print(f"\n[正式回答]\n")
                    begin_content=False
                else:
                    full_content += delta.content
                    print(delta.content, end='', flush=True)

            # 处理 tool_calls
            if delta.tool_calls:
                for tool_call_delta in delta.tool_calls:
                    # 确保有足够的空间存储
                    while len(tool_calls_data) <= tool_call_delta.index:
                        tool_calls_data.append({
                            "id": None,
                            "type": "function",
                            "function": {"name": "", "arguments": ""}
                        })

                    if tool_call_delta.id:
                        tool_calls_data[tool_call_delta.index]["id"] = tool_call_delta.id

                    if tool_call_delta.function:
                        if tool_call_delta.function.name:
                            tool_calls_data[tool_call_delta.index]["function"]["name"] = tool_call_delta.function.name
                        if tool_call_delta.function.arguments:
                            tool_calls_data[tool_call_delta.index]["function"]["arguments"] += tool_call_delta.function.arguments

        print()  # 换行

        # 返回字典格式，而不是对象
        result = {
            "content": full_content if full_content else None,
            "tool_calls": tool_calls_data if tool_calls_data else None
        }

        # 添加 reasoning_content（如果有）
        if full_reasoning_content:
            result["reasoning_content"] = full_reasoning_content

        return result

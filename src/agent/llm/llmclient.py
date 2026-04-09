"""
LLM客户端，支持与模型交互
"""

from typing import List, Dict, Any, Optional, Iterator, Union, Tuple, Callable
import sys
from openai import OpenAI
from src.config import LLMConfig


class ChatResponse:
    """
    聊天响应包装类
    包含响应内容和token使用统计
    """
    def __init__(
        self,
        content: str,
        reasoning_content: Optional[str] = None,
        prompt_tokens: int = 0,
        completion_tokens: int = 0,
        total_tokens: int = 0,
        model: Optional[str] = None
    ):
        self.content = content
        self.reasoning_content = reasoning_content
        self.prompt_tokens = prompt_tokens
        self.completion_tokens = completion_tokens
        self.total_tokens = total_tokens
        self.model = model

    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            'content': self.content,
            'reasoning_content': self.reasoning_content,
            'prompt_tokens': self.prompt_tokens,
            'completion_tokens': self.completion_tokens,
            'total_tokens': self.total_tokens,
            'model': self.model
        }


class LLMClient:
    """
    LLM客户端

    功能：提供与大模型交互的接口
    输入：LLM配置
    输出：模型响应
    """

    def __init__(self, config: LLMConfig):
        """
        初始化LLM客户端

        输入：config - LLM配置对象
        输出：无
        """
        self.config = config
        self.client = OpenAI(
            api_key=config.api_key,
            base_url=config.base_url
        )

    def _extract_token_usage(self, response) -> Tuple[int, int, int]:
        """
        从API响应中提取token使用量

        Args:
            response: OpenAI API响应对象

        Returns:
            (prompt_tokens, completion_tokens, total_tokens)
        """
        prompt_tokens = 0
        completion_tokens = 0
        total_tokens = 0

        # 尝试从usage字段获取token使用量
        if hasattr(response, 'usage') and response.usage:
            prompt_tokens = getattr(response.usage, 'prompt_tokens', 0) or 0
            completion_tokens = getattr(response.usage, 'completion_tokens', 0) or 0
            total_tokens = getattr(response.usage, 'total_tokens', 0) or 0

        return prompt_tokens, completion_tokens, total_tokens

    def chat(self, messages: List[Dict[str, str]]) -> Union[str, Tuple[str, str], ChatResponse]:
        """
        与模型对话（非流式）

        输入：messages - 消息列表，包含系统消息、用户消息等
        输出：模型回复文本 或 ChatResponse对象
        """
        response = self.client.chat.completions.create(
            model=self.config.model_name,
            messages=messages,
            temperature=self.config.temperature,
            max_tokens=self.config.max_tokens
        )

        # 提取token使用量
        prompt_tokens, completion_tokens, total_tokens = self._extract_token_usage(response)

        # 提取响应内容
        content = response.choices[0].message.content or ""
        reasoning_content = None

        if self.config.model_name.lower().startswith("deepseek"):
            if "reasoner" in self.config.model_name.lower():
                reasoning_content = getattr(response.choices[0].message, 'reasoning_content', None)
                # 返回ChatResponse对象，包含token统计
                return ChatResponse(
                    content=content,
                    reasoning_content=reasoning_content,
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens,
                    total_tokens=total_tokens,
                    model=self.config.model_name
                )
            elif "chat" in self.config.model_name.lower():
                return ChatResponse(
                    content=content,
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens,
                    total_tokens=total_tokens,
                    model=self.config.model_name
                )

        return ChatResponse(
            content=content,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            model=self.config.model_name
        )

    def chat_simple(self, messages: List[Dict[str, str]]) -> str:
        """
        简单的非流式对话（仅返回文本内容，向后兼容）

        输入：messages - 消息列表
        输出：模型回复文本
        """
        result = self.chat(messages)
        if isinstance(result, ChatResponse):
            return result.content
        elif isinstance(result, tuple):
            return result[1] if len(result) > 1 else result[0]
        return result

    def chat_stream(self, messages: List[Dict[str, str]], print_output: bool = True) -> str:
        """
        流式对话（返回完整字符串）

        输入：
            messages - 消息列表
            print_output - 是否实时打印输出
        输出：完整的模型回复文本
        """
        stream = self.client.chat.completions.create(
            model=self.config.model_name,
            messages=messages,
            temperature=self.config.temperature,
            max_tokens=self.config.max_tokens,
            stream=True
        )

        full_response = ""
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                content = chunk.choices[0].delta.content
                full_response += content
                if print_output:
                    print(content, end='', flush=True)

        if print_output:
            print()  # 换行

        return full_response

    def chat_stream_with_callback(self, messages: List[Dict[str, str]],
                                   token_callback: Callable[[str], None],
                                   print_output: bool = False) -> str:
        """
        流式对话，每生成一个token就调用回调函数

        输入：
            messages - 消息列表
            token_callback - 每生成一个token时的回调函数，参数为token内容
            print_output - 是否实时打印输出
        输出：完整的模型回复文本
        """
        stream = self.client.chat.completions.create(
            model=self.config.model_name,
            messages=messages,
            temperature=self.config.temperature,
            max_tokens=self.config.max_tokens,
            stream=True
        )

        full_response = ""
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                content = chunk.choices[0].delta.content
                full_response += content

                # 调用回调函数，传递当前token
                token_callback(content)

                if print_output:
                    print(content, end='', flush=True)

        if print_output:
            print()  # 换行

        return full_response

    def get_client(self) -> OpenAI:
        """
        获取底层OpenAI客户端

        输入：无
        输出：OpenAI客户端实例
        """
        return self.client

"""
LLM客户端，支持与模型交互
"""

from typing import List, Dict, Any, Optional, Iterator, Union, Tuple
import sys
from openai import OpenAI
from src.config import LLMConfig


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

    def chat(self, messages: List[Dict[str, str]]) -> Union[str, Tuple[str, str]]:
        """
        与模型对话

        输入：messages - 消息列表，包含系统消息、用户消息等
        输出：模型回复文本
        """
        response = self.client.chat.completions.create(
            model=self.config.model_name,
            messages=messages,
            temperature=self.config.temperature,
            max_tokens=self.config.max_tokens
        )
        if self.config.model_name.lower().startswith("deepseek"):
            if "reasoner" in self.config.model_name.lower():
                # print(response.choices[0].message.reasoning_content)
                # print(response.choices[0].message.content)
                return response.choices[0].message.reasoning_content,response.choices[0].message.content
            elif "chat" in self.config.model_name.lower():
                # print(response.choices[0].message.content)
                return response.choices[0].message.content
        return response.choices[0].message.content

    def chat_stream(self, messages: List[Dict[str, str]], print_output: bool = True) -> str:
        """
        流式对话

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

    def get_client(self) -> OpenAI:
        """
        获取底层OpenAI客户端

        输入：无
        输出：OpenAI客户端实例
        """
        return self.client

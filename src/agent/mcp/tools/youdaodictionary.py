"""
网易有道词典 API 构建的 MCP 工具
"""

from fastmcp import FastMCP
from src.config import get_config

youdao_mcp = FastMCP("youdaodictionary")


class YoudaoDictionary:
    """
    网易有道词典 API
    """

    def __init__(self):
        self.config = get_config()
        self.base_url = self.config.tool.youdao_dictionary.base_url
        self.api_key = self.config.tool.youdao_dictionary.api_key

    def find_in_dictionary(self, word: str) -> str:
        """
        在词典中查找单词

        Args:
            word: 要查找的单词

        Returns:
            单词的解释或错误信息
        """
        if not self.base_url or not self.api_key:
            return self._mock_dictionary_lookup(word)

        try:
            # TODO: 实现真实的有道 API 调用
            return self._mock_dictionary_lookup(word)
        except Exception as e:
            return f"查询错误：{str(e)}"

    def _mock_dictionary_lookup(self, word: str) -> str:
        """
        模拟词典查询（假逻辑）

        Args:
            word: 要查找的单词

        Returns:
            模拟的单词解释
        """
        return f"""单词：{word}
音标：[模拟音标]
释义：
  1. (n.) 这是一个模拟的释义
  2. (v.) 这是另一个模拟的释义
例句：
  - This is a mock example sentence for '{word}'.
  - 这是一个模拟的例句。"""


@youdao_mcp.tool(
    name="youdaodictionary",
    description="在网易有道词典中查找单词的解释，当需要知道某个词汇的具体信息，如音标、相关词、考试类型时可调用该工具"
)
def youdaodictionary_tool(word: str) -> str:
    """
    调用网易有道词典 API 查找单词解释

    Args:
        word: 要查找的单词

    Returns:
        单词的解释或错误信息
    """
    dictionary = YoudaoDictionary()
    return dictionary.find_in_dictionary(word)


if __name__ == "__main__":
    print("启动有道词典 MCP 服务器...")
    print("服务器地址：http://localhost:8000")
    youdao_mcp.run(host="localhost", port=8000, transport="sse")

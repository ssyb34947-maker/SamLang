"""
基于DictionaryAPI的词典 MCP工具
"""

from fastmcp import FastMCP
import requests


dictionary_mcp = FastMCP("DictionaryAPI MCP tool")

class DictionaryAPI:
    def __init__(self):
       self.url="https://api.dictionaryapi.dev/api/v2/entries/en/"

    def get_word_info(self, word: str)-> dict:
        """
        获取单词的详细信息

        输入：word - 要查询的单词
        输出：单词的详细信息（String 格式）
        """
        url=self.url+word

        try:
            response = requests.get(url)
            response.raise_for_status()  # 如果状态码不是 2xx，会抛异常
            
            data = response.json()
            
            # 打印原始完整返回（调试用）
            # print(json.dumps(data, indent=2, ensure_ascii=False))
            
            # 提取常用信息（示例）
            if not data:  # 空列表表示没找到
                return {"error": "Word not found"}
            
            entry = data[0]  # 通常第一个是最主要的
            
            result = {
                "word": entry.get("word", word),
                "phonetic": entry.get("phonetic"),  # 简写音标
                "phonetics": [
                    {
                        "text": p.get("text"),
                        "audio": p.get("audio")  # mp3链接，如果有的话
                    } for p in entry.get("phonetics", [])
                ],
                "meanings": []
            }
            
            for meaning in entry.get("meanings", []):
                part = meaning.get("partOfSpeech", "unknown")
                defs = []
                for def_item in meaning.get("definitions", []):
                    defs.append({
                        "definition": def_item.get("definition"),
                        "example": def_item.get("example"),
                        "synonyms": def_item.get("synonyms", []),
                        "antonyms": def_item.get("antonyms", [])
                    })
                result["meanings"].append({"partOfSpeech": part, "definitions": defs})
            
            return result
        
        except requests.exceptions.HTTPError as e:
            if response.status_code == 404:
                return {"error": f"Word '{word}' not found (404)"}
            return {"error": f"HTTP error: {e}"}
        except Exception as e:
            return {"error": f"Request failed: {str(e)}"}

    def get_word_info_str(self, word: str)-> str:
        """
        获取单词的详细信息（字符串格式）
        """
        info = self.get_word_info(word)
        if "error" in info:
            return info["error"]

        else:
            result = f"Word: {info['word']}\n"
            if info["phonetic"]:
                result += f"Phonetic: {info['phonetic']}\n"
        
        for ph in info["phonetics"]:
            if ph["audio"]:
                result += f"Audio: {ph['audio']}\n"
        
        for m in info["meanings"]:
            result += f"\n[{m['partOfSpeech'].upper()}]"
            for i,d in enumerate(m["definitions"]):
                result += f"  [{i+1}] [definition] {d['definition']}\n"
                if d["example"]:
                    result += f"    Example: {d['example']}\n"
                
                if d["synonyms"]:
                    result += f"    Synonyms: {', '.join(d['synonyms'])}\n"
                
                if d["antonyms"]:
                    result += f"    Antonyms: {', '.join(d['antonyms'])}\n"
        return result


@dictionary_mcp.tool(
    name="dictionary",
    description="这是一个用于查询英语单词的详细信息的工具，当需要某个英语单词的详细解释、音标、例句、词性、近义词或反义词时，使用此工具。",
)
def dictionary(word: str)-> str:
    """
    查询单词的详细信息

    输入：word - 要查询的单词
    输出：单词的详细信息（字符串格式）
    """
    dict_api=DictionaryAPI()
    return dict_api.get_word_info_str(word)

if __name__ == "__main__":
    dictionary_mcp.run(transport="sse")
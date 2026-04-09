"""
轻量级Token估算器
基于字符和单词的简易估算，无需外部依赖

规则：
- 英文单词：每个单词算1个token
- 中文字符：每个字算1个token
- 数字串：每3-4个数字算1个token
- Markdown符号：根据复杂度计算
- 代码块：按字符密度计算
"""

import re
from typing import Dict, List, Tuple


def estimate_tokens(text: str) -> int:
    """
    估算文本的token数量
    
    Args:
        text: 输入文本
        
    Returns:
        估算的token数
    """
    if not text:
        return 0
    
    # 移除首尾空白
    text = text.strip()
    if not text:
        return 0
    
    total_tokens = 0
    
    # 1. 计算中文字符数（每个汉字算1个token）
    chinese_chars = re.findall(r'[\u4e00-\u9fff]', text)
    total_tokens += len(chinese_chars)
    
    # 2. 计算英文单词数
    # 移除中文字符后处理英文
    text_without_chinese = re.sub(r'[\u4e00-\u9fff]', ' ', text)
    
    # 英文单词（连续的字母序列）
    english_words = re.findall(r'[a-zA-Z]+', text_without_chinese)
    total_tokens += len(english_words)
    
    # 3. 计算数字序列（每3-4个数字算1个token）
    numbers = re.findall(r'\d+', text_without_chinese)
    for num in numbers:
        total_tokens += max(1, len(num) // 3)
    
    # 4. 计算特殊符号和标点
    # 代码块标记（```）算1个token
    code_blocks = re.findall(r'```', text)
    total_tokens += len(code_blocks) // 2  # 成对出现
    
    # 行内代码（`code`）算1个token
    inline_codes = re.findall(r'`[^`]+`', text)
    total_tokens += len(inline_codes)
    
    # Markdown标题符号（# ## ###）
    headers = re.findall(r'^#{1,6}\s', text, re.MULTILINE)
    total_tokens += len(headers)
    
    # 列表符号（- * +）
    list_items = re.findall(r'^[\s]*[-*+]\s', text, re.MULTILINE)
    total_tokens += len(list_items)
    
    # 数字列表（1. 2.）
    numbered_lists = re.findall(r'^[\s]*\d+\.\s', text, re.MULTILINE)
    total_tokens += len(numbered_lists)
    
    # 链接 [text](url) 算2个token（文本+链接）
    links = re.findall(r'\[([^\]]+)\]\([^)]+\)', text)
    total_tokens += len(links) * 2
    
    # 图片 ![alt](url) 算2个token
    images = re.findall(r'!\[([^\]]*)\]\([^)]+\)', text)
    total_tokens += len(images) * 2
    
    # 粗体/斜体标记（** * __ _）
    bold_italic = re.findall(r'\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_', text)
    total_tokens += len(bold_italic)
    
    # 换行符（每5行算1个token）
    newlines = text.count('\n')
    total_tokens += newlines // 5
    
    # 5. 处理剩余的特殊字符
    # 移除已计算的字符
    remaining = re.sub(r'[\u4e00-\u9fff]', '', text)  # 移除中文
    remaining = re.sub(r'[a-zA-Z]+', '', remaining)   # 移除英文单词
    remaining = re.sub(r'\d+', '', remaining)         # 移除数字
    remaining = re.sub(r'```|`[^`]+`|\[([^\]]+)\]\([^)]+\)|!\[([^\]]*)\]\([^)]+\)', '', remaining)  # 移除markdown
    remaining = re.sub(r'[#\-*+_\n\s]', '', remaining)  # 移除常见符号和空白
    
    # 剩余的特殊字符，每2个算1个token
    total_tokens += len(remaining) // 2
    
    return max(1, total_tokens)


def estimate_messages_tokens(messages: List[Dict[str, str]]) -> Tuple[int, int, int]:
    """
    估算多条消息的token数量
    
    Args:
        messages: 消息列表，每条消息包含role和content
        
    Returns:
        (prompt_tokens, completion_tokens, total_tokens)
    """
    prompt_tokens = 0
    completion_tokens = 0
    
    for msg in messages:
        content = msg.get("content", "")
        role = msg.get("role", "")
        
        # 每条消息的role也占token
        role_tokens = 3  # role字段通常占3-4个token
        content_tokens = estimate_tokens(content)
        
        if role == "assistant":
            completion_tokens += content_tokens + role_tokens
        else:
            # user和system都算input
            prompt_tokens += content_tokens + role_tokens
    
    # 添加消息格式开销（每条消息间隔约3个token）
    overhead = len(messages) * 3
    prompt_tokens += overhead
    
    total_tokens = prompt_tokens + completion_tokens
    
    return prompt_tokens, completion_tokens, total_tokens


def estimate_conversation_stats(messages: List[Dict[str, str]]) -> Dict[str, int]:
    """
    估算整个对话的token统计
    
    Args:
        messages: 对话消息列表
        
    Returns:
        {
            "prompt_tokens": 输入token数,
            "completion_tokens": 输出token数,
            "total_tokens": 总token数
        }
    """
    prompt_tokens, completion_tokens, total_tokens = estimate_messages_tokens(messages)
    
    return {
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "total_tokens": total_tokens
    }


# 简单的测试
if __name__ == "__main__":
    # 测试用例
    test_cases = [
        "Hello world",  # 2个英文单词
        "你好世界",  # 4个中文字
        "Hello 你好 world 世界",  # 混合
        "```python\nprint('hello')\n```",  # 代码块
        "This is **bold** and *italic* text",  # markdown格式
        "1. First item\n2. Second item",  # 列表
    ]
    
    for text in test_cases:
        tokens = estimate_tokens(text)
        print(f"'{text[:30]}...' -> {tokens} tokens")

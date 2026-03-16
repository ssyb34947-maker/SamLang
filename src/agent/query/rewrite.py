"""
query重写模块
用于对用户输入进行预处理和重写
"""

import re

def rewrite_query(user_input: str) -> str:
    """
    重写用户输入的查询
    
    功能：如果用户输入末尾没有标点符号，就补上一个句号
    
    输入：user_input - 用户输入的文本
    输出：重写后的文本
    """
    # 检查输入是否为空
    if not user_input:
        return user_input
    
    # 检查末尾是否有标点符号
    # 常见的标点符号包括：句号、问号、感叹号、省略号等
    punctuation_pattern = r'[。？！.!?…]+$'
    if not re.search(punctuation_pattern, user_input.strip()):
        # 末尾没有标点符号，添加句号
        return user_input.strip() + '。'
    
    return user_input

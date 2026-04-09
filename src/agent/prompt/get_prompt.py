"""获取提示词和进行上下文工程"""

from src.agent.prompt.system_prompt import (
    get_system_prompt,
    get_agent_name,
    AGENT_PROMPT_SYSTEM_PROFESSOR,
    AGENT_PROMPT_SYSTEM_ASSISTANT,
    AGENT_PROMPT_SYSTEM_ADMIN,
    AGENT_PROMPT_MAP,
    AGENT_TYPE_NAMES
)


def get_system_template(agent_type: int = 1) -> str:
    """
    根据Agent类型获取系统提示词模板
    
    Args:
        agent_type: Agent类型（1=教授, 2=助教, 3=管理员AI）
        
    Returns:
        系统提示词模板
    """
    return get_system_prompt(agent_type)


def context_with_user(user_name: str, system_prompt: str) -> str:
    """
    将用户名注入系统提示词
    
    Args:
        user_name: 用户名
        system_prompt: 系统提示词模板
        
    Returns:
        注入用户名后的提示词
    """
    system_prompt = system_prompt.replace("{user_name}", user_name)
    return system_prompt


def context_with_current_time(system_prompt: str) -> str:
    """
    将当前时间注入系统提示词
    
    Args:
        system_prompt: 系统提示词模板
        
    Returns:
        注入时间后的提示词
    """
    from datetime import datetime
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    system_prompt = system_prompt.replace("{current_time}", current_time)
    return system_prompt


def get_full_system_prompt(user_name: str, agent_type: int = 1) -> str:
    """
    获取完整的系统提示词（包含用户和时间信息）
    
    Args:
        user_name: 用户名
        agent_type: Agent类型（1=教授, 2=助教, 3=管理员AI）
        
    Returns:
        完整的系统提示词
    """
    prompt = get_system_template(agent_type)
    prompt = context_with_user(user_name, prompt)
    prompt = context_with_current_time(prompt)
    return prompt


# 导出所有需要的符号
__all__ = [
    'get_system_template',
    'get_full_system_prompt',
    'context_with_user',
    'context_with_current_time',
    'get_agent_name',
    'AGENT_PROMPT_SYSTEM_PROFESSOR',
    'AGENT_PROMPT_SYSTEM_ASSISTANT',
    'AGENT_PROMPT_SYSTEM_ADMIN',
    'AGENT_PROMPT_MAP',
    'AGENT_TYPE_NAMES',
]

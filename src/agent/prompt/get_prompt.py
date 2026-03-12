"""获取提示词和进行上下文工程"""


from src.agent.prompt.system_prompt import AGENT_PROMPT_SYSTEM

def get_system_template()->str:
    return AGENT_PROMPT_SYSTEM


def context_with_user(user_name:str,system_prompt:str)->str:
    system_prompt = system_prompt.replace("{user_name}",user_name)
    return system_prompt

def context_with_current_time(system_prompt:str)->str:
    from datetime import datetime
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    system_prompt = system_prompt.replace("{current_time}",current_time)
    return system_prompt
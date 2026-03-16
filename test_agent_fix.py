"""测试Agent修复"""

from src.agent.agent import ConversationAgent

# 创建代理实例
agent = ConversationAgent()

# 获取系统消息
messages = agent.get_history()
system_message = [msg for msg in messages if msg.get('role') == 'system'][0]
print("初始化时的系统提示词:")
print(system_message['content'])
print("\n---\n")

# 测试聊天功能
response = agent.chat("你好", user_name="测试用户")
print("用户输入: 你好")
print("AI回复:", response)
print("\n---\n")

# 再次获取系统消息
messages = agent.get_history()
system_message = [msg for msg in messages if msg.get('role') == 'system'][0]
print("聊天后的系统提示词:")
print(system_message['content'])

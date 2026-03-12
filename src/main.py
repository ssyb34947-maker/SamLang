"""
AIchatbot 主程序入口
提供命令行对话界面
"""

import sys
import io
from dotenv import load_dotenv
from src.agent import ConversationAgent
from src.config import get_config

# 设置控制台输出为 UTF-8 编码，解决 Windows 下中文显示问题
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


def main():
    """
    主函数：启动对话机器人

    输入：无
    输出：无
    """
    load_dotenv()

    print("=== 山姆英语 ===")
    print(r"输入 '\quit' 或 '\exit' 退出")
    print(r"输入 '\reset' 重置对话")
    print(r"输入 '\tools' 查看可用工具")
    print(r"输入 '\skills' 查看可用技能")
    print(r"输入 '\toggle' 切换 ReACT 模式")

    try:
        config = get_config()
        # 默认启用 ReACT 模式和详细日志
        agent = ConversationAgent(config=config, use_react=True, verbose=True)
        
        print(f"使用模型: {config.llm.model_name}")
        print(f"API 地址: {config.llm.base_url}")
        print(f"ReACT 模式: {'启用' if agent.use_react else '禁用'}")
        print(f"最大迭代次数: {config.agent.react_max_iterations}\n")
    except (ValueError, FileNotFoundError) as e:
        print(f"错误：{e}")
        print("请检查 config.yaml 和 .env 文件配置")
        return

    while True:
        try:
            user_input = input("你: ").strip()

            if not user_input:
                continue

            if user_input.lower() in [r'\quit', r'\exit']:
                print("再见！")
                break

            if user_input.lower() == r'\reset':
                agent.reset()
                print("对话已重置\n")
                continue

            if user_input.lower() == r'\tools':
                tools = agent.get_available_tools()
                print(f"\n可用工具 ({len(tools)} 个)：")
                for i, tool in enumerate(tools, 1):
                    print(f"{i}. {tool.get('name')}")
                    print(f"   {tool.get('description', '无描述')}\n")
                continue

            if user_input.lower() == r'\skills':
                skills = agent.get_available_skills()
                print(f"\n可用技能 ({len(skills)} 个)：")
                for i, skill in enumerate(skills, 1):
                    print(f"{i}. {skill.get('name')}")
                    print(f"   {skill.get('description', '无描述')}\n")
                continue

            if user_input.lower() == r'\toggle':
                agent.toggle_react_mode(not agent.use_react)
                print(f"ReACT 模式已{'启用' if agent.use_react else '禁用'}\n")
                continue

            response = agent.chat(user_input)
            # 流式输出已在 agent 内部完成，这里不需要再打印
            if not agent.verbose or not agent.stream:
                print(f"AI: {response}")
            print()  # 空行分隔

        except KeyboardInterrupt:
            print("\n\n再见！")
            break
        except Exception as e:
            print(f"发生错误：{e}\n")


if __name__ == "__main__":
    main()

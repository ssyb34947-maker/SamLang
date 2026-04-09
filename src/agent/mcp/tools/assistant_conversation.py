"""
助教专用 MCP 工具 - 对话管理
提供查询、查看、删除、修改对话等功能
"""

from typing import Optional, List
from datetime import datetime, timedelta
from fastmcp import FastMCP
from loguru import logger

# 创建助教对话管理 MCP Server
assistant_conversation_mcp = FastMCP(name="assistant_conversation")


@assistant_conversation_mcp.tool(
    name="conversation_query",
    description="""查询指定时间段内的对话列表。

使用场景：
- 用户说"帮我整理今天的学习内容"时，先查询今天的对话
- 用户说"查看上周的对话"时，查询上周的对话
- 需要获取对话列表以便后续操作

参数说明：
- start_date: 开始日期，格式 "YYYY-MM-DD"（必填）
- end_date: 结束日期，格式 "YYYY-MM-DD"（可选，默认为今天）
- limit: 最多返回多少条对话（默认20，最大100）

返回：对话列表，包含对话ID、标题、最后消息时间、消息数量
"""
)
async def conversation_query(
    start_date: str,
    user_id: str,
    end_date: Optional[str] = None,
    limit: int = 20
) -> str:
    """
    查询指定时间段的对话列表
    """
    try:
        from src.db.conversation import get_user_conversations_by_date_range
        
        # 设置默认结束日期为今天
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        
        # 限制 limit 范围
        limit = max(1, min(limit, 100))
        
        logger.info(f"[Assistant MCP] 用户 {user_id} 查询对话: {start_date} 到 {end_date}")
        
        # 查询对话
        conversations = get_user_conversations_by_date_range(
            user_id=int(user_id) if user_id.isdigit() else 0,
            start_date=start_date,
            end_date=end_date,
            limit=limit
        )
        
        if not conversations:
            return f"在 {start_date} 到 {end_date} 期间没有找到对话。"
        
        # 格式化结果
        output_parts = [f"找到 {len(conversations)} 个对话（{start_date} 至 {end_date}）：\n"]
        
        for i, conv in enumerate(conversations, 1):
            title = conv.get("title", "未命名对话")
            conv_id = conv.get("conversation_id", "")
            last_time = conv.get("last_message_time", "")
            msg_count = conv.get("message_count", 0)
            
            output_parts.append(f"\n{i}. {title}")
            output_parts.append(f"   ID: {conv_id}")
            output_parts.append(f"   最后消息: {last_time}")
            output_parts.append(f"   消息数: {msg_count}")
        
        return "\n".join(output_parts)
        
    except Exception as e:
        logger.error(f"[Assistant MCP] 查询对话失败: {e}")
        return f"查询对话失败: {str(e)}"


@assistant_conversation_mcp.tool(
    name="conversation_get_detail",
    description="""获取指定对话的详细消息内容。

使用场景：
- 需要查看某个对话的具体内容时
- 整理学习内容前获取完整对话
- 分析对话历史

参数说明：
- conversation_id: 对话ID（必填）
- limit: 最多返回多少条消息（默认50，最大100）

返回：对话的完整消息内容，包含用户和AI的所有消息
"""
)
async def conversation_get_detail(
    conversation_id: str,
    user_id: str,
    limit: int = 50
) -> str:
    """
    获取对话详情
    """
    try:
        from src.db.message import get_conversation_messages_for_assistant
        
        # 限制 limit 范围
        limit = max(1, min(limit, 100))
        
        logger.info(f"[Assistant MCP] 用户 {user_id} 查看对话详情: {conversation_id}")
        
        # 获取消息
        messages = get_conversation_messages_for_assistant(
            conversation_id=conversation_id,
            user_id=int(user_id) if user_id.isdigit() else 0,
            limit=limit
        )
        
        if not messages:
            return "该对话不存在或没有消息。"
        
        # 格式化结果
        output_parts = [f"对话内容（共 {len(messages)} 条消息）：\n"]
        output_parts.append("=" * 50)
        
        for msg in messages:
            role = msg.get("role", "")
            content = msg.get("content", "")
            timestamp = msg.get("created_at", "")
            
            role_display = "用户" if role == "user" else "AI"
            output_parts.append(f"\n[{role_display}] {timestamp}")
            output_parts.append(f"{content}")
            output_parts.append("-" * 30)
        
        return "\n".join(output_parts)
        
    except Exception as e:
        logger.error(f"[Assistant MCP] 获取对话详情失败: {e}")
        return f"获取对话详情失败: {str(e)}"


@assistant_conversation_mcp.tool(
    name="conversation_delete",
    description="""删除指定的对话。

使用场景：
- 用户要求删除某个对话时
- 清理过期对话

⚠️ 重要：删除前必须向用户确认！

参数说明：
- conversation_id: 要删除的对话ID（必填）
- confirmed: 是否已确认删除（默认False，必须先询问用户）

返回：删除结果消息
"""
)
async def conversation_delete(
    conversation_id: str,
    user_id: str,
    confirmed: bool = False
) -> str:
    """
    删除对话
    """
    try:
        from src.db.conversation import delete_conversation_with_permission
        
        logger.info(f"[Assistant MCP] 用户 {user_id} 请求删除对话: {conversation_id}, confirmed={confirmed}")
        
        # 如果未确认，返回确认提示
        if not confirmed:
            return f"⚠️ 即将删除对话 {conversation_id}。此操作不可恢复！\n\n请向用户确认：是否确定删除此对话？如果用户确认，请再次调用此工具并设置 confirmed=true"
        
        # 执行删除
        success, message = delete_conversation_with_permission(
            conversation_id=conversation_id,
            user_id=int(user_id) if user_id.isdigit() else 0
        )
        
        if success:
            logger.info(f"[Assistant MCP] 对话 {conversation_id} 删除成功")
            return f"✅ 对话已成功删除。{message}"
        else:
            logger.warning(f"[Assistant MCP] 删除对话失败: {message}")
            return f"❌ 删除失败: {message}"
        
    except Exception as e:
        logger.error(f"[Assistant MCP] 删除对话异常: {e}")
        return f"删除失败: {str(e)}"


@assistant_conversation_mcp.tool(
    name="conversation_rename",
    description="""修改对话标题。

使用场景：
- 用户要求重命名对话时
- 整理对话时给对话一个更有意义的名称

⚠️ 重要：修改前建议向用户确认新标题！

参数说明：
- conversation_id: 对话ID（必填）
- new_title: 新标题（必填）
- confirmed: 是否已确认修改（默认False，建议先询问用户）

返回：修改结果消息
"""
)
async def conversation_rename(
    conversation_id: str,
    new_title: str,
    user_id: str,
    confirmed: bool = False
) -> str:
    """
    重命名对话
    """
    try:
        from src.db.conversation import update_conversation_title
        
        # 验证标题
        if not new_title or len(new_title.strip()) == 0:
            return "错误：新标题不能为空"
        
        if len(new_title) > 100:
            return "错误：标题长度不能超过100个字符"
        
        logger.info(f"[Assistant MCP] 用户 {user_id} 请求重命名对话: {conversation_id} -> '{new_title}', confirmed={confirmed}")
        
        # 如果未确认，返回确认提示
        if not confirmed:
            return f"即将把对话重命名为：「{new_title}」\n\n请向用户确认：是否使用此标题？如果用户确认，请再次调用此工具并设置 confirmed=true"
        
        # 执行修改
        success, message = update_conversation_title(
            conversation_id=conversation_id,
            user_id=int(user_id) if user_id.isdigit() else 0,
            new_title=new_title.strip()
        )
        
        if success:
            logger.info(f"[Assistant MCP] 对话 {conversation_id} 重命名成功")
            return f"✅ 对话已重命名为「{new_title}」"
        else:
            logger.warning(f"[Assistant MCP] 重命名对话失败: {message}")
            return f"❌ 重命名失败: {message}"
        
    except Exception as e:
        logger.error(f"[Assistant MCP] 重命名对话异常: {e}")
        return f"重命名失败: {str(e)}"


if __name__ == "__main__":
    assistant_conversation_mcp.run(transport="sse")

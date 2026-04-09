"""
Token统计API
提供token消耗的增删改查接口
用于监控和统计系统API使用情况
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date, timedelta
from src.auth.middleware import get_current_active_user
from src.api.admin import get_current_admin
from src.db.token_stats import (
    create_token_consumption,
    get_token_consumption_by_uuid,
    get_user_token_stats,
    get_daily_token_stats,
    get_token_stats_range,
    update_token_consumption,
    delete_token_consumption,
    delete_daily_stats,
    is_user_active_today,
    get_user_activity_history,
    get_all_users_daily_activity
)
from loguru import logger

router = APIRouter(tags=["token-stats"])


# ============ 请求/响应模型 ============

class TokenConsumptionCreate(BaseModel):
    """创建token消耗记录请求"""
    prompt_tokens: int = Field(..., ge=0, description="输入token数")
    completion_tokens: int = Field(..., ge=0, description="输出token数")
    total_tokens: int = Field(..., ge=0, description="总token数")
    conversation_id: Optional[str] = Field(None, description="对话ID")
    message_id: Optional[str] = Field(None, description="消息ID")
    model_name: Optional[str] = Field(None, description="模型名称")


class TokenConsumptionUpdate(BaseModel):
    """更新token消耗记录请求"""
    prompt_tokens: Optional[int] = Field(None, ge=0, description="输入token数")
    completion_tokens: Optional[int] = Field(None, ge=0, description="输出token数")
    total_tokens: Optional[int] = Field(None, ge=0, description="总token数")
    model_name: Optional[str] = Field(None, description="模型名称")


class TokenConsumptionResponse(BaseModel):
    """token消耗记录响应"""
    uuid: str
    user_id: int
    conversation_id: Optional[str]
    message_id: Optional[str]
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    model_name: Optional[str]
    created_at: str


class UserTokenStatsResponse(BaseModel):
    """用户token统计响应"""
    user_id: int
    total_prompt_tokens: int
    total_completion_tokens: int
    total_tokens: int
    total_chats: int
    start_date: Optional[str]
    end_date: Optional[str]


class DailyTokenStatsResponse(BaseModel):
    """每日token统计响应"""
    uuid: str
    stats_date: str
    total_prompt_tokens: int
    total_completion_tokens: int
    total_tokens: int
    chat_count: int
    unique_users: int
    created_at: str
    updated_at: str


class UserActivityResponse(BaseModel):
    """用户活跃响应"""
    activity_date: str
    chat_count: int
    total_tokens: int
    is_active: bool


class UserActivityStatusResponse(BaseModel):
    """用户活跃状态响应"""
    user_id: int
    username: str
    is_active_today: bool
    today_chat_count: int
    today_token_count: int


# ============ Token消耗记录CRUD接口 ============

@router.post("/api/token-consumption", response_model=dict)
async def create_token_consumption_record(
    request: TokenConsumptionCreate,
    current_user: dict = Depends(get_current_active_user)
):
    """
    创建token消耗记录
    普通用户只能为自己创建记录
    """
    try:
        # 如果没有提供total_tokens，自动计算
        total_tokens = request.total_tokens
        if total_tokens == 0 and (request.prompt_tokens > 0 or request.completion_tokens > 0):
            total_tokens = request.prompt_tokens + request.completion_tokens

        uuid = create_token_consumption(
            user_id=current_user['id'],
            prompt_tokens=request.prompt_tokens,
            completion_tokens=request.completion_tokens,
            total_tokens=total_tokens,
            conversation_id=request.conversation_id,
            message_id=request.message_id,
            model_name=request.model_name
        )

        return {
            "success": True,
            "uuid": uuid,
            "message": "Token消耗记录已创建"
        }
    except Exception as e:
        logger.error(f"创建token消耗记录失败: {e}")
        raise HTTPException(status_code=500, detail=f"创建记录失败: {str(e)}")


@router.get("/api/token-consumption/{record_uuid}", response_model=dict)
async def get_token_consumption_record(
    record_uuid: str,
    current_user: dict = Depends(get_current_active_user)
):
    """
    获取单条token消耗记录
    普通用户只能查看自己的记录
    """
    record = get_token_consumption_by_uuid(record_uuid)

    if not record:
        raise HTTPException(status_code=404, detail="记录不存在")

    # 检查权限（普通用户只能查看自己的记录）
    if current_user.get('role') != 'admin' and record['user_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="无权查看此记录")

    return {
        "success": True,
        "data": record
    }


@router.put("/api/token-consumption/{record_uuid}", response_model=dict)
async def update_token_consumption_record(
    record_uuid: str,
    request: TokenConsumptionUpdate,
    current_user: dict = Depends(get_current_admin)
):
    """
    更新token消耗记录
    仅管理员可操作
    """
    update_data = {}
    if request.prompt_tokens is not None:
        update_data['prompt_tokens'] = request.prompt_tokens
    if request.completion_tokens is not None:
        update_data['completion_tokens'] = request.completion_tokens
    if request.total_tokens is not None:
        update_data['total_tokens'] = request.total_tokens
    if request.model_name is not None:
        update_data['model_name'] = request.model_name

    if not update_data:
        raise HTTPException(status_code=400, detail="没有提供要更新的字段")

    success = update_token_consumption(record_uuid, update_data)

    if not success:
        raise HTTPException(status_code=404, detail="记录不存在或无需更新")

    return {
        "success": True,
        "message": "记录已更新"
    }


@router.delete("/api/token-consumption/{record_uuid}", response_model=dict)
async def delete_token_consumption_record(
    record_uuid: str,
    current_user: dict = Depends(get_current_admin)
):
    """
    删除token消耗记录
    仅管理员可操作
    """
    success = delete_token_consumption(record_uuid)

    if not success:
        raise HTTPException(status_code=404, detail="记录不存在")

    return {
        "success": True,
        "message": "记录已删除"
    }


# ============ 统计查询接口 ============

@router.get("/api/token-stats/my", response_model=dict)
async def get_my_token_stats(
    start_date: Optional[str] = Query(None, description="开始日期 (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="结束日期 (YYYY-MM-DD)"),
    current_user: dict = Depends(get_current_active_user)
):
    """
    获取当前用户的token统计
    """
    stats = get_user_token_stats(
        user_id=current_user['id'],
        start_date=start_date,
        end_date=end_date
    )

    return {
        "success": True,
        "data": stats
    }


@router.get("/api/token-stats/user/{user_id}", response_model=dict)
async def get_user_token_statistics(
    user_id: int,
    start_date: Optional[str] = Query(None, description="开始日期 (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="结束日期 (YYYY-MM-DD)"),
    current_user: dict = Depends(get_current_admin)
):
    """
    获取指定用户的token统计
    仅管理员可操作
    """
    stats = get_user_token_stats(
        user_id=user_id,
        start_date=start_date,
        end_date=end_date
    )

    return {
        "success": True,
        "data": stats
    }


@router.get("/api/token-stats/daily", response_model=dict)
async def get_daily_statistics(
    stats_date: Optional[str] = Query(None, description="日期 (YYYY-MM-DD)，为空则返回今天"),
    current_user: dict = Depends(get_current_admin)
):
    """
    获取每日token统计
    仅管理员可操作
    """
    stats = get_daily_token_stats(stats_date)

    if not stats:
        return {
            "success": True,
            "data": None,
            "message": "该日期暂无统计数据"
        }

    return {
        "success": True,
        "data": stats
    }


@router.get("/api/token-stats/daily-range", response_model=dict)
async def get_daily_statistics_range(
    start_date: str = Query(..., description="开始日期 (YYYY-MM-DD)"),
    end_date: str = Query(..., description="结束日期 (YYYY-MM-DD)"),
    current_user: dict = Depends(get_current_admin)
):
    """
    获取日期范围内的每日token统计
    仅管理员可操作
    """
    try:
        # 验证日期格式
        datetime.strptime(start_date, "%Y-%m-%d")
        datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="日期格式错误，请使用 YYYY-MM-DD 格式")

    stats = get_token_stats_range(start_date, end_date)

    return {
        "success": True,
        "data": stats,
        "count": len(stats)
    }


@router.delete("/api/token-stats/daily/{stats_date}", response_model=dict)
async def delete_daily_statistics(
    stats_date: str,
    current_user: dict = Depends(get_current_admin)
):
    """
    删除指定日期的统计记录
    仅管理员可操作
    """
    success = delete_daily_stats(stats_date)

    if not success:
        raise HTTPException(status_code=404, detail="该日期的统计记录不存在")

    return {
        "success": True,
        "message": f"{stats_date} 的统计记录已删除"
    }


# ============ 用户活跃相关接口 ============

@router.get("/api/token-stats/my-activity", response_model=dict)
async def get_my_activity_history(
    days: int = Query(30, ge=1, le=365, description="查询天数"),
    current_user: dict = Depends(get_current_active_user)
):
    """
    获取当前用户的活跃历史
    """
    history = get_user_activity_history(
        user_id=current_user['id'],
        days=days
    )

    # 检查今天是否活跃
    is_active_today = is_user_active_today(current_user['id'])

    return {
        "success": True,
        "data": {
            "history": history,
            "is_active_today": is_active_today,
            "total_days": len(history)
        }
    }


@router.get("/api/token-stats/user-activity/{user_id}", response_model=dict)
async def get_user_activity(
    user_id: int,
    days: int = Query(30, ge=1, le=365, description="查询天数"),
    current_user: dict = Depends(get_current_admin)
):
    """
    获取指定用户的活跃历史
    仅管理员可操作
    """
    from src.db.user import get_user_by_id

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    history = get_user_activity_history(user_id=user_id, days=days)
    is_active = is_user_active_today(user_id)

    return {
        "success": True,
        "data": {
            "user_id": user_id,
            "username": user['username'],
            "history": history,
            "is_active_today": is_active,
            "total_days": len(history)
        }
    }


@router.get("/api/token-stats/today-activity", response_model=dict)
async def get_today_all_users_activity(
    activity_date: Optional[str] = Query(None, description="日期 (YYYY-MM-DD)，为空则返回今天"),
    current_user: dict = Depends(get_current_admin)
):
    """
    获取所有用户指定日期的活跃情况
    仅管理员可操作
    """
    activity = get_all_users_daily_activity(activity_date)

    # 计算汇总数据
    total_active_users = len([u for u in activity if u['is_active']])
    total_chats = sum(u['chat_count'] for u in activity)
    total_tokens = sum(u['total_tokens'] for u in activity)

    return {
        "success": True,
        "data": {
            "date": activity_date or date.today().isoformat(),
            "users": activity,
            "summary": {
                "total_users": len(activity),
                "active_users": total_active_users,
                "total_chats": total_chats,
                "total_tokens": total_tokens
            }
        }
    }


@router.get("/api/token-stats/dashboard", response_model=dict)
async def get_token_stats_dashboard(
    current_user: dict = Depends(get_current_admin)
):
    """
    获取token统计仪表盘数据
    仅管理员可操作
    """
    today = date.today()
    week_ago = (today - timedelta(days=7)).isoformat()
    month_ago = (today - timedelta(days=30)).isoformat()
    today_str = today.isoformat()

    # 今日统计
    today_stats = get_daily_token_stats(today_str) or {
        "stats_date": today_str,
        "total_prompt_tokens": 0,
        "total_completion_tokens": 0,
        "total_tokens": 0,
        "chat_count": 0,
        "unique_users": 0
    }

    # 近7天统计
    week_stats = get_token_stats_range(week_ago, today_str)

    # 近30天统计
    month_stats = get_token_stats_range(month_ago, today_str)

    # 计算汇总
    week_total_tokens = sum(s['total_tokens'] for s in week_stats)
    week_total_chats = sum(s['chat_count'] for s in week_stats)
    month_total_tokens = sum(s['total_tokens'] for s in month_stats)
    month_total_chats = sum(s['chat_count'] for s in month_stats)

    return {
        "success": True,
        "data": {
            "today": today_stats,
            "last_7_days": {
                "total_tokens": week_total_tokens,
                "total_chats": week_total_chats,
                "daily_breakdown": week_stats
            },
            "last_30_days": {
                "total_tokens": month_total_tokens,
                "total_chats": month_total_chats,
                "daily_breakdown": month_stats
            }
        }
    }

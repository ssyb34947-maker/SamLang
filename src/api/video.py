"""
视频服务 API
提供视频文件访问和下载功能
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
from typing import Optional
from loguru import logger

from src.auth.middleware import get_current_user
from src.config import get_config
from src.db.video import get_video_by_id, check_video_ownership

video_router = APIRouter(prefix="/videos", tags=["videos"])


def get_video_storage():
    """获取视频存储实例"""
    config = get_config()
    from src.agent.mcp.tools.ppio_sandbox import create_storage
    return create_storage({
        "type": config.tool.ppio_sandbox.video_storage.type,
        "local_path": config.tool.ppio_sandbox.video_storage.local_path,
        "local_url": config.tool.ppio_sandbox.video_storage.local_url,
    })


@video_router.get("/{file_id}")
async def get_video(
    file_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    获取视频文件
    
    输入：
        file_id: 文件ID
        request: FastAPI请求对象
        current_user: 当前登录用户（通过JWT验证）
    
    输出：
        视频文件流
    """
    try:
        # 检查视频是否存在
        video_record = get_video_by_id(file_id)
        if not video_record:
            raise HTTPException(status_code=404, detail="视频不存在")
        
        # 检查权限（视频是否属于当前用户）
        user_id = str(current_user.get("id", ""))
        if video_record["user_id"] != user_id:
            logger.warning(f"[VideoAPI] 权限拒绝: user={user_id} 尝试访问 video={file_id}")
            raise HTTPException(status_code=403, detail="无权访问此视频")
        
        # 获取存储实例
        storage = get_video_storage()
        
        # 获取文件路径
        from ..agent.mcp.tools.ppio_sandbox.storage import LocalStorage
        if isinstance(storage, LocalStorage):
            # 本地存储：直接返回文件
            file_path = storage.get_path_by_user(user_id, file_id)
            if not file_path or not Path(file_path).exists():
                raise HTTPException(status_code=404, detail="视频文件不存在")
            
            return FileResponse(
                file_path,
                media_type="video/mp4",
                filename=video_record.get("filename", f"{file_id}.mp4")
            )
        else:
            # 云存储：返回重定向URL
            url = storage.get_url(file_id)
            return JSONResponse({"redirect_url": url})
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[VideoAPI] 获取视频失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取视频失败: {str(e)}")


@video_router.get("/{file_id}/info")
async def get_video_info(
    file_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    获取视频信息
    
    输入：
        file_id: 文件ID
        current_user: 当前登录用户
    
    输出：
        视频元数据
    """
    try:
        # 检查视频是否存在
        video_record = get_video_by_id(file_id)
        if not video_record:
            raise HTTPException(status_code=404, detail="视频不存在")
        
        # 检查权限
        user_id = str(current_user.get("id", ""))
        if video_record["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="无权访问此视频")
        
        # 返回视频信息（排除敏感字段）
        return {
            "id": video_record["id"],
            "filename": video_record["filename"],
            "duration": video_record["duration"],
            "width": video_record["width"],
            "height": video_record["height"],
            "file_size": video_record["file_size"],
            "format": video_record["format"],
            "created_at": video_record["created_at"],
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[VideoAPI] 获取视频信息失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取视频信息失败: {str(e)}")


@video_router.delete("/{file_id}")
async def delete_video(
    file_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    删除视频
    
    输入：
        file_id: 文件ID
        current_user: 当前登录用户
    
    输出：
        删除结果
    """
    try:
        # 检查视频是否存在
        video_record = get_video_by_id(file_id)
        if not video_record:
            raise HTTPException(status_code=404, detail="视频不存在")
        
        # 检查权限
        user_id = str(current_user.get("id", ""))
        if video_record["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="无权删除此视频")
        
        # 删除存储文件
        storage = get_video_storage()
        storage.delete(file_id)
        
        # 删除数据库记录
        from ..db.video import delete_video_record
        delete_video_record(file_id)
        
        logger.info(f"[VideoAPI] 视频已删除: file_id={file_id}, user={user_id}")
        
        return {"success": True, "message": "视频已删除"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[VideoAPI] 删除视频失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"删除视频失败: {str(e)}")


@video_router.get("/user/list")
async def list_user_videos(
    current_user: dict = Depends(get_current_user)
):
    """
    获取当前用户的所有视频
    
    输入：
        current_user: 当前登录用户
    
    输出：
        视频列表
    """
    try:
        user_id = str(current_user.get("id", ""))
        from ..db.video import get_videos_by_user
        videos = get_videos_by_user(user_id)
        
        # 格式化返回
        return {
            "videos": [
                {
                    "id": v["id"],
                    "filename": v["filename"],
                    "duration": v["duration"],
                    "width": v["width"],
                    "height": v["height"],
                    "file_size": v["file_size"],
                    "format": v["format"],
                    "created_at": v["created_at"],
                }
                for v in videos
            ]
        }
        
    except Exception as e:
        logger.error(f"[VideoAPI] 获取视频列表失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取视频列表失败: {str(e)}")

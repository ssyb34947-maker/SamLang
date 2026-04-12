"""
视频数据模型
用于存储视频元数据和关联用户
"""

import os
import json
from datetime import datetime
from typing import Optional, Dict, Any, List
from pathlib import Path
from loguru import logger

# 数据库文件路径
DB_DIR = Path("./data")
VIDEO_DB_FILE = DB_DIR / "videos.json"


def _ensure_db():
    """确保数据库文件存在"""
    DB_DIR.mkdir(parents=True, exist_ok=True)
    if not VIDEO_DB_FILE.exists():
        VIDEO_DB_FILE.write_text("[]", encoding="utf-8")


def _load_videos() -> List[Dict[str, Any]]:
    """加载所有视频记录"""
    _ensure_db()
    try:
        content = VIDEO_DB_FILE.read_text(encoding="utf-8")
        return json.loads(content)
    except Exception as e:
        logger.error(f"[VideoDB] 加载失败: {str(e)}")
        return []


def _save_videos(videos: List[Dict[str, Any]]):
    """保存视频记录"""
    _ensure_db()
    try:
        VIDEO_DB_FILE.write_text(
            json.dumps(videos, indent=2, ensure_ascii=False),
            encoding="utf-8"
        )
    except Exception as e:
        logger.error(f"[VideoDB] 保存失败: {str(e)}")


def create_video_record(
    file_id: str,
    user_id: str,
    filename: str,
    file_path: str,
    duration: float = 0.0,
    width: int = 0,
    height: int = 0,
    file_size: int = 0,
    video_format: str = "mp4",
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    创建视频记录
    
    输入：
        file_id: 文件ID
        user_id: 用户ID
        filename: 文件名
        file_path: 文件路径
        duration: 视频时长
        width: 视频宽度
        height: 视频高度
        file_size: 文件大小
        video_format: 视频格式
        metadata: 额外元数据
    
    输出：
        视频记录字典
    """
    video = {
        "id": file_id,
        "user_id": str(user_id),
        "filename": filename,
        "file_path": file_path,
        "duration": duration,
        "width": width,
        "height": height,
        "file_size": file_size,
        "format": video_format,
        "metadata": metadata or {},
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    videos = _load_videos()
    videos.append(video)
    _save_videos(videos)
    
    logger.info(f"[VideoDB] 创建记录: file_id={file_id}, user_id={user_id}")
    return video


def get_video_by_id(file_id: str) -> Optional[Dict[str, Any]]:
    """
    根据文件ID获取视频记录
    
    输入：
        file_id: 文件ID
    
    输出：
        视频记录字典，不存在返回 None
    """
    videos = _load_videos()
    for video in videos:
        if video["id"] == file_id:
            return video
    return None


def get_videos_by_user(user_id: str) -> List[Dict[str, Any]]:
    """
    获取用户的所有视频
    
    输入：
        user_id: 用户ID
    
    输出：
        视频记录列表
    """
    videos = _load_videos()
    return [v for v in videos if v["user_id"] == str(user_id)]


def delete_video_record(file_id: str) -> bool:
    """
    删除视频记录
    
    输入：
        file_id: 文件ID
    
    输出：
        是否成功
    """
    videos = _load_videos()
    original_len = len(videos)
    videos = [v for v in videos if v["id"] != file_id]
    
    if len(videos) < original_len:
        _save_videos(videos)
        logger.info(f"[VideoDB] 删除记录: file_id={file_id}")
        return True
    return False


def check_video_ownership(file_id: str, user_id: str) -> bool:
    """
    检查视频是否属于指定用户
    
    输入：
        file_id: 文件ID
        user_id: 用户ID
    
    输出：
        是否属于该用户
    """
    video = get_video_by_id(file_id)
    if video:
        return video["user_id"] == str(user_id)
    return False

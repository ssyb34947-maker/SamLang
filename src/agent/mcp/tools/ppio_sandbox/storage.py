"""
视频存储抽象层
支持本地存储和云存储
"""

import os
import hashlib
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, BinaryIO
from loguru import logger


class VideoStorage(ABC):
    """视频存储抽象基类"""
    
    @abstractmethod
    def save(self, user_id: str, filename: str, content: bytes) -> str:
        """
        保存视频
        
        输入：
            user_id: 用户ID
            filename: 文件名
            content: 文件内容
        
        输出：
            文件ID（用于后续访问）
        """
        pass
    
    @abstractmethod
    def get_url(self, file_id: str, expire_hours: int = 24) -> str:
        """
        获取视频访问URL
        
        输入：
            file_id: 文件ID
            expire_hours: URL过期时间（小时）
        
        输出：
            访问URL
        """
        pass
    
    @abstractmethod
    def get_path(self, file_id: str) -> Optional[str]:
        """
        获取文件本地路径（如果支持）
        
        输入：
            file_id: 文件ID
        
        输出：
            本地文件路径，如果不存在返回 None
        """
        pass
    
    @abstractmethod
    def delete(self, file_id: str) -> bool:
        """
        删除视频
        
        输入：
            file_id: 文件ID
        
        输出：
            是否成功
        """
        pass
    
    @abstractmethod
    def exists(self, file_id: str) -> bool:
        """
        检查文件是否存在
        
        输入：
            file_id: 文件ID
        
        输出：
            是否存在
        """
        pass


class LocalStorage(VideoStorage):
    """本地文件系统存储（开发环境）"""
    
    def __init__(self, base_path: str = "./temp/videos", base_url: str = "/videos"):
        """
        初始化本地存储
        
        输入：
            base_path: 文件存储基础路径
            base_url: URL访问基础路径
        """
        self.base_path = Path(base_path)
        self.base_url = base_url
        
        # 创建基础目录
        self.base_path.mkdir(parents=True, exist_ok=True)
        logger.info(f"[LocalStorage] 初始化: base_path={base_path}")
    
    def _get_user_dir(self, user_id: str) -> Path:
        """获取用户目录"""
        user_dir = self.base_path / str(user_id)
        user_dir.mkdir(exist_ok=True)
        return user_dir
    
    def _generate_file_id(self, user_id: str, filename: str) -> str:
        """生成文件ID"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_hash = hashlib.md5(f"{user_id}_{filename}_{timestamp}".encode()).hexdigest()[:8]
        name_part = Path(filename).stem[:20]  # 限制长度
        ext = Path(filename).suffix
        return f"{timestamp}_{file_hash}_{name_part}{ext}"
    
    def save(self, user_id: str, filename: str, content: bytes) -> str:
        """
        保存视频到本地
        
        存储结构: base_path/user_id/file_id
        """
        try:
            # 生成文件ID
            file_id = self._generate_file_id(user_id, filename)
            
            # 获取用户目录
            user_dir = self._get_user_dir(user_id)
            
            # 保存文件
            file_path = user_dir / file_id
            with open(file_path, "wb") as f:
                f.write(content)
            
            logger.info(f"[LocalStorage] 保存成功: user={user_id}, file={file_id}, size={len(content)} bytes")
            return file_id
            
        except Exception as e:
            logger.error(f"[LocalStorage] 保存失败: {str(e)}")
            raise
    
    def get_url(self, file_id: str, expire_hours: int = 24) -> str:
        """
        获取视频访问URL
        
        本地存储直接返回固定URL
        """
        return f"{self.base_url}/{file_id}"
    
    def get_path(self, file_id: str) -> Optional[str]:
        """
        获取文件本地路径
        
        需要遍历用户目录查找
        """
        try:
            # 遍历所有用户目录查找文件
            for user_dir in self.base_path.iterdir():
                if user_dir.is_dir():
                    file_path = user_dir / file_id
                    if file_path.exists():
                        return str(file_path)
            return None
        except Exception as e:
            logger.error(f"[LocalStorage] 获取路径失败: {str(e)}")
            return None
    
    def get_path_by_user(self, user_id: str, file_id: str) -> Optional[str]:
        """
        根据用户ID和文件ID获取路径
        
        输入：
            user_id: 用户ID
            file_id: 文件ID
        
        输出：
            本地文件路径
        """
        file_path = self.base_path / str(user_id) / file_id
        if file_path.exists():
            return str(file_path)
        return None
    
    def delete(self, file_id: str) -> bool:
        """删除视频文件"""
        try:
            file_path = self.get_path(file_id)
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"[LocalStorage] 删除成功: {file_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"[LocalStorage] 删除失败: {str(e)}")
            return False
    
    def exists(self, file_id: str) -> bool:
        """检查文件是否存在"""
        return self.get_path(file_id) is not None
    
    def cleanup_old_files(self, max_age_hours: int = 24) -> int:
        """
        清理过期文件
        
        输入：
            max_age_hours: 最大保留时间（小时）
        
        输出：
            删除的文件数量
        """
        deleted_count = 0
        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)
        
        try:
            for user_dir in self.base_path.iterdir():
                if not user_dir.is_dir():
                    continue
                
                for file_path in user_dir.iterdir():
                    if not file_path.is_file():
                        continue
                    
                    # 检查文件修改时间
                    mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                    if mtime < cutoff_time:
                        file_path.unlink()
                        deleted_count += 1
                        logger.info(f"[LocalStorage] 清理过期文件: {file_path.name}")
            
            logger.info(f"[LocalStorage] 清理完成: 删除 {deleted_count} 个文件")
            return deleted_count
            
        except Exception as e:
            logger.error(f"[LocalStorage] 清理失败: {str(e)}")
            return deleted_count


class AliyunOSSStorage(VideoStorage):
    """阿里云OSS存储（生产环境）"""
    
    def __init__(
        self,
        bucket: str,
        endpoint: str,
        access_key_id: str,
        access_key_secret: str
    ):
        """
        初始化阿里云OSS存储
        
        输入：
            bucket: Bucket名称
            endpoint: OSS端点
            access_key_id: AccessKey ID
            access_key_secret: AccessKey Secret
        """
        self.bucket_name = bucket
        self.endpoint = endpoint
        
        # 延迟导入，避免强制依赖
        try:
            import oss2
            self.auth = oss2.Auth(access_key_id, access_key_secret)
            self.bucket = oss2.Bucket(self.auth, endpoint, bucket)
            logger.info(f"[OSSStorage] 初始化: bucket={bucket}")
        except ImportError:
            logger.error("[OSSStorage] 请先安装 oss2: pip install oss2")
            raise
    
    def _get_object_key(self, user_id: str, file_id: str) -> str:
        """生成OSS对象键"""
        date_prefix = datetime.now().strftime("%Y/%m/%d")
        return f"videos/{user_id}/{date_prefix}/{file_id}"
    
    def save(self, user_id: str, filename: str, content: bytes) -> str:
        """保存视频到OSS"""
        try:
            # 生成文件ID
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_hash = hashlib.md5(content).hexdigest()[:8]
            file_id = f"{timestamp}_{file_hash}_{filename}"
            
            # 生成对象键
            object_key = self._get_object_key(user_id, file_id)
            
            # 上传文件
            self.bucket.put_object(object_key, content)
            
            logger.info(f"[OSSStorage] 上传成功: {object_key}")
            return file_id
            
        except Exception as e:
            logger.error(f"[OSSStorage] 上传失败: {str(e)}")
            raise
    
    def get_url(self, file_id: str, expire_hours: int = 24) -> str:
        """获取临时访问URL"""
        try:
            # 需要遍历查找对象键
            # 实际实现中应该在数据库中记录 object_key
            # 这里简化处理
            return self.bucket.sign_url('GET', file_id, expire_hours * 3600)
        except Exception as e:
            logger.error(f"[OSSStorage] 生成URL失败: {str(e)}")
            return ""
    
    def get_path(self, file_id: str) -> Optional[str]:
        """OSS不支持本地路径"""
        return None
    
    def delete(self, file_id: str) -> bool:
        """删除OSS对象"""
        try:
            self.bucket.delete_object(file_id)
            return True
        except Exception as e:
            logger.error(f"[OSSStorage] 删除失败: {str(e)}")
            return False
    
    def exists(self, file_id: str) -> bool:
        """检查对象是否存在"""
        try:
            return self.bucket.object_exists(file_id)
        except Exception:
            return False


def create_storage(config: dict) -> VideoStorage:
    """
    工厂函数：根据配置创建存储实例
    
    输入：
        config: 存储配置字典
    
    输出：
        VideoStorage 实例
    """
    storage_type = config.get("type", "local")
    
    if storage_type == "local":
        return LocalStorage(
            base_path=config.get("local_path", "./temp/videos"),
            base_url=config.get("local_url", "/videos")
        )
    elif storage_type == "oss":
        return AliyunOSSStorage(
            bucket=config.get("oss_bucket"),
            endpoint=config.get("oss_endpoint"),
            access_key_id=config.get("oss_access_key_id"),
            access_key_secret=config.get("oss_access_key_secret")
        )
    else:
        raise ValueError(f"不支持的存储类型: {storage_type}")

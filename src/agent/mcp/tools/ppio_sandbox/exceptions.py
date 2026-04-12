"""
PPIO 沙箱异常定义
"""


class PPIOError(Exception):
    """PPIO 沙箱基础异常"""
    pass


class PPIOAuthError(PPIOError):
    """API 认证失败"""
    pass


class PPIOQuotaError(PPIOError):
    """配额不足"""
    pass


class PPIORuntimeError(PPIOError):
    """运行时错误（代码执行失败）"""
    pass


class PPIOTimeoutError(PPIOError):
    """执行超时"""
    pass


class PPIOConnectionError(PPIOError):
    """连接错误"""
    pass


class PPIOFileError(PPIOError):
    """文件操作错误"""
    pass

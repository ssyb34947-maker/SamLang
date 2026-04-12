"""
工具调用计时器
用于测量和记录工具执行时间
"""

import time
from typing import Callable, TypeVar, ParamSpec
from dataclasses import dataclass
from loguru import logger

T = TypeVar('T')
P = ParamSpec('P')


@dataclass
class ToolTimingInfo:
    """工具计时信息"""
    tool_name: str
    start_time: float
    end_time: float = 0.0

    @property
    def duration_ms(self) -> int:
        """获取执行耗时（毫秒）"""
        if self.end_time == 0.0:
            return int((time.time() - self.start_time) * 1000)
        return int((self.end_time - self.start_time) * 1000)


class ToolTimer:
    """工具调用计时器"""

    def __init__(self, tool_name: str):
        self.tool_name = tool_name
        self.start_time = 0.0
        self.end_time = 0.0

    def __enter__(self) -> 'ToolTimer':
        self.start()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.stop()

    def start(self) -> None:
        """开始计时"""
        self.start_time = time.time()

    def stop(self) -> None:
        """停止计时"""
        self.end_time = time.time()

    @property
    def duration_ms(self) -> int:
        """获取执行耗时（毫秒）"""
        end = self.end_time if self.end_time > 0 else time.time()
        return int((end - self.start_time) * 1000)


def timed_tool_call(
    tool_name: str,
    callback: Callable[[str, dict, str, int], None] | None = None
) -> Callable[[Callable[P, T]], Callable[P, T]]:
    """
    工具调用计时装饰器

    Args:
        tool_name: 工具名称
        callback: 计时回调函数 (tool_name, arguments, result, duration_ms)

    Returns:
        装饰器函数
    """
    def decorator(func: Callable[P, T]) -> Callable[P, T]:
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            timer = ToolTimer(tool_name)
            try:
                timer.start()
                result = func(*args, **kwargs)
                timer.stop()

                if callback:
                    callback(
                        tool_name,
                        kwargs or (args[0] if args else {}),
                        str(result)[:200],
                        timer.duration_ms
                    )

                logger.debug(f"[ToolTimer] {tool_name} 执行完成，耗时 {timer.duration_ms}ms")
                return result

            except Exception as e:
                timer.stop()
                if callback:
                    callback(
                        tool_name,
                        kwargs or (args[0] if args else {}),
                        f"Error: {str(e)}",
                        timer.duration_ms
                    )
                raise

        return wrapper
    return decorator


def create_timing_callback(
    event_queue: list,
    iteration: int
) -> Callable[[str, dict, str, int], None]:
    """
    创建计时回调函数

    Args:
        event_queue: 事件队列
        iteration: 当前迭代次数

    Returns:
        回调函数
    """
    def callback(
        tool_name: str,
        arguments: dict,
        result: str,
        duration_ms: int
    ) -> None:
        event_queue.append({
            "type": "tool_result",
            "data": {
                "tool_name": tool_name,
                "arguments": arguments,
                "result": result[:100],
                "duration_ms": duration_ms,
                "step_index": iteration
            }
        })

    return callback

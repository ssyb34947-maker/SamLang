"""
SSE 事件处理器
用于处理 ReACT Agent 的思考过程事件
"""

import queue
from typing import Callable, Any
from loguru import logger


class SSEEventHandler:
    """SSE 事件处理器"""

    def __init__(self, event_queue: queue.Queue):
        self.event_queue = event_queue
        self.iteration = 0

    def create_thinking_callback(self) -> Callable[[str, dict], None]:
        """
        创建思考过程回调函数

        Returns:
            回调函数
        """
        def callback(event_type: str, data: dict) -> None:
            self._handle_thinking_event(event_type, data)

        return callback

    def _handle_thinking_event(
        self,
        event_type: str,
        data: dict
    ) -> None:
        """
        处理思考事件

        Args:
            event_type: 事件类型
            data: 事件数据
        """
        handlers = {
            "thinking_step": self._handle_thinking_step,
            "tool_call": self._handle_tool_call,
            "tool_result": self._handle_tool_result,
        }

        handler = handlers.get(event_type)
        if handler:
            handler(data)
        else:
            logger.warning(f"[SSEEventHandler] 未知事件类型: {event_type}")

    def _handle_thinking_step(self, data: dict) -> None:
        """处理思考步骤事件"""
        thought = data.get("thought", "")
        if not thought:
            return

        self._put_event("thinking_step", {
            "thought": thought[:200],
            "step_index": self.iteration
        })

        logger.debug(f"[SSEEventHandler] 思考步骤: {thought[:50]}...")

    def _handle_tool_call(self, data: dict) -> None:
        """处理工具调用事件"""
        tool_name = data.get("tool_name", "")
        arguments = data.get("arguments", {})

        self._put_event("tool_call", {
            "tool_name": tool_name,
            "arguments": arguments,
            "step_index": self.iteration
        })

        logger.debug(f"[SSEEventHandler] 工具调用: {tool_name}")

    def _handle_tool_result(self, data: dict) -> None:
        """处理工具结果事件"""
        tool_name = data.get("tool_name", "")
        result = data.get("result", "")
        duration_ms = data.get("duration_ms", 0)

        self._put_event("tool_result", {
            "tool_name": tool_name,
            "result": str(result)[:100],
            "duration_ms": duration_ms,
            "step_index": self.iteration
        })

        logger.debug(f"[SSEEventHandler] 工具结果: {tool_name}, 耗时 {duration_ms}ms")

    def _put_event(self, event_type: str, data: dict) -> None:
        """
        将事件放入队列

        Args:
            event_type: 事件类型
            data: 事件数据
        """
        try:
            self.event_queue.put({
                "type": event_type,
                "data": data
            }, block=False)
        except queue.Full:
            logger.warning(f"[SSEEventHandler] 事件队列已满，丢弃事件: {event_type}")

    def increment_iteration(self) -> None:
        """增加迭代计数"""
        self.iteration += 1

    def reset(self) -> None:
        """重置状态"""
        self.iteration = 0


def create_event_handler(
    event_queue: queue.Queue
) -> SSEEventHandler:
    """
    创建 SSE 事件处理器

    Args:
        event_queue: 事件队列

    Returns:
        SSE 事件处理器
    """
    return SSEEventHandler(event_queue)

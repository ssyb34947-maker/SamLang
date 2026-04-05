"""
OCR 工具实现
基于百度 AI Studio PaddleOCR API 实现图片和PDF的文本识别
API 文档: https://paddleocr.aistudio-app.com/api/v2/ocr/jobs
"""

import os
import json
import time
import requests
from typing import Union, Optional
from pathlib import Path

from src.config import get_config


class OCRClient:
    """
    OCR 客户端
    基于百度 AI Studio PaddleOCR API 提供图片和PDF的文本识别功能
    """

    # 默认 API 地址
    DEFAULT_JOB_URL = "https://paddleocr.aistudio-app.com/api/v2/ocr/jobs"
    DEFAULT_MODEL = "PaddleOCR-VL-1.5"
    DEFAULT_POLL_INTERVAL = 5  # 轮询间隔（秒）
    DEFAULT_TIMEOUT = 60  # 默认超时时间（秒）

    def __init__(
        self,
        api_url: Optional[str] = None,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        poll_interval: int = None
    ):
        """
        初始化 OCR 客户端

        Args:
            api_url: OCR API 地址（可选，默认使用百度 AI Studio API）
            api_key: API Token（可选，默认从环境变量 PADDLEOCR_API_KEY 读取）
            model: OCR 模型名称（可选，默认 PaddleOCR-VL-1.5）
            poll_interval: 轮询间隔（秒，可选，默认 5 秒）
        """
        config = get_config()
        self.api_url = api_url or self.DEFAULT_JOB_URL
        self.api_key = api_key or config.ocr.api_key or os.getenv("PADDLEOCR_API_KEY", "")
        self.model = model or config.ocr.model_name or self.DEFAULT_MODEL
        self.poll_interval = poll_interval or self.DEFAULT_POLL_INTERVAL
        self.enabled = bool(self.api_key)
        self.timeout = self.DEFAULT_TIMEOUT

        # 可选参数配置
        self.optional_payload = {
            "useDocOrientationClassify": False,
            "useDocUnwarping": False,
            "useChartRecognition": False,
        }

    def recognize(
        self,
        file_path: Union[str, Path],
        wait_for_result: bool = True,
        return_format: str = "markdown"
    ) -> Union[str, dict]:
        """
        识别文件（图片或PDF）中的文本

        Args:
            file_path: 文件路径或 URL
            wait_for_result: 是否等待并返回识别结果（默认 True）
            return_format: 返回格式，可选 "markdown" 或 "raw"（默认 "markdown"）

        Returns:
            识别出的文本内容（markdown 格式）或原始响应数据
        """
        if not self.enabled:
            return "OCR 工具未启用"

        if not self.api_key:
            return "OCR API Key 未配置，请设置 PADDLEOCR_API_KEY 环境变量"

        file_path = str(file_path)

        try:
            # 提交任务
            job_id = self._submit_job(file_path)
            if not job_id:
                return "OCR 任务提交失败"

            if not wait_for_result:
                return {"job_id": job_id, "status": "submitted"}

            # 轮询获取结果
            result = self._poll_result(job_id)

            if return_format == "raw":
                return result

            # 提取 markdown 文本
            return self._extract_markdown(result)

        except Exception as e:
            return f"OCR 识别错误：{str(e)}"

    def _submit_job(self, file_path: str) -> Optional[str]:
        """
        提交 OCR 任务

        Args:
            file_path: 文件路径或 URL

        Returns:
            任务 ID 或 None
        """
        headers = {
            "Authorization": f"bearer {self.api_key}",
        }

        # URL 模式
        if file_path.startswith("http"):
            headers["Content-Type"] = "application/json"
            payload = {
                "fileUrl": file_path,
                "model": self.model,
                "optionalPayload": self.optional_payload
            }
            response = requests.post(
                self.api_url,
                json=payload,
                headers=headers,
                timeout=self.timeout
            )
        else:
            # 本地文件模式
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"文件不存在：{file_path}")

            data = {
                "model": self.model,
                "optionalPayload": json.dumps(self.optional_payload)
            }

            with open(file_path, "rb") as f:
                files = {"file": f}
                response = requests.post(
                    self.api_url,
                    headers=headers,
                    data=data,
                    files=files,
                    timeout=self.timeout
                )

        if response.status_code != 200:
            raise Exception(f"任务提交失败：{response.status_code} - {response.text}")

        result = response.json()
        return result.get("data", {}).get("jobId")

    def _poll_result(self, job_id: str) -> dict:
        """
        轮询获取 OCR 任务结果

        Args:
            job_id: 任务 ID

        Returns:
            任务结果数据
        """
        while True:
            response = requests.get(
                f"{self.api_url}/{job_id}",
                headers={"Authorization": f"bearer {self.api_key}"},
                timeout=self.timeout
            )

            if response.status_code != 200:
                raise Exception(f"获取任务状态失败：{response.status_code}")

            result = response.json()
            data = result.get("data", {})
            state = data.get("state")

            if state == "pending":
                time.sleep(self.poll_interval)
                continue
            elif state == "running":
                progress = data.get("extractProgress", {})
                total_pages = progress.get("totalPages", 0)
                extracted_pages = progress.get("extractedPages", 0)
                print(f"OCR 处理中... {extracted_pages}/{total_pages} 页")
                time.sleep(self.poll_interval)
                continue
            elif state == "done":
                return data
            elif state == "failed":
                error_msg = data.get("errorMsg", "未知错误")
                raise Exception(f"OCR 任务失败：{error_msg}")
            else:
                raise Exception(f"未知任务状态：{state}")

    def _extract_markdown(self, data: dict) -> str:
        """
        从结果数据中提取 markdown 文本

        Args:
            data: 任务结果数据

        Returns:
            markdown 格式的文本
        """
        result_url = data.get("resultUrl", {})
        jsonl_url = result_url.get("jsonUrl")

        if not jsonl_url:
            return "未找到识别结果"

        # 下载结果文件
        response = requests.get(jsonl_url, timeout=self.timeout)
        response.raise_for_status()

        lines = response.text.strip().split("\n")
        markdown_texts = []

        for line in lines:
            line = line.strip()
            if not line:
                continue

            try:
                result = json.loads(line).get("result", {})
                layout_results = result.get("layoutParsingResults", [])

                for res in layout_results:
                    markdown_text = res.get("markdown", {}).get("text", "")
                    if markdown_text:
                        markdown_texts.append(markdown_text)
            except (json.JSONDecodeError, KeyError):
                continue

        return "\n\n".join(markdown_texts) if markdown_texts else "未识别到文本内容"

    def recognize_image(self, image_data: Union[str, bytes, Path]) -> str:
        """
        识别图片中的文本（兼容旧接口）

        Args:
            image_data: 图片数据，可以是文件路径、二进制数据或 base64 编码

        Returns:
            识别出的文本内容（markdown 格式）
        """
        # 处理不同类型的输入
        if isinstance(image_data, (str, Path)):
            image_data = str(image_data)
            if os.path.exists(image_data):
                return self.recognize(image_data)
            else:
                # 假设是 base64 字符串，保存为临时文件
                import tempfile
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
                temp_file.write(base64.b64decode(image_data))
                temp_file.close()
                try:
                    return self.recognize(temp_file.name)
                finally:
                    os.unlink(temp_file.name)
        elif isinstance(image_data, bytes):
            import tempfile
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
            temp_file.write(image_data)
            temp_file.close()
            try:
                return self.recognize(temp_file.name)
            finally:
                os.unlink(temp_file.name)
        else:
            return "不支持的图片数据类型"

    def recognize_pdf(self, pdf_data: Union[str, bytes, Path], page_num: Optional[int] = None) -> str:
        """
        识别 PDF 中的文本（兼容旧接口）

        Args:
            pdf_data: PDF 数据，可以是文件路径、二进制数据或 base64 编码
            page_num: 指定页码（可选，暂不支持单页识别）

        Returns:
            识别出的文本内容（markdown 格式）
        """
        # 处理不同类型的输入
        if isinstance(pdf_data, (str, Path)):
            pdf_data = str(pdf_data)
            if os.path.exists(pdf_data):
                return self.recognize(pdf_data)
            else:
                # 假设是 base64 字符串
                import tempfile
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
                temp_file.write(base64.b64decode(pdf_data))
                temp_file.close()
                try:
                    return self.recognize(temp_file.name)
                finally:
                    os.unlink(temp_file.name)
        elif isinstance(pdf_data, bytes):
            import tempfile
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
            temp_file.write(pdf_data)
            temp_file.close()
            try:
                return self.recognize(temp_file.name)
            finally:
                os.unlink(temp_file.name)
        else:
            return "不支持的 PDF 数据类型"


# 全局 OCR 客户端实例
_ocr_client_instance = None


def get_ocr_client() -> OCRClient:
    """
    获取全局 OCR 客户端实例（单例模式）

    Returns:
        OCRClient 实例
    """
    global _ocr_client_instance
    if _ocr_client_instance is None:
        _ocr_client_instance = OCRClient()
    return _ocr_client_instance

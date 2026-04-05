## OCR 模块

本模块完成OCR模型的调用，实现图片或PDF的文本识别。

基于百度 AI Studio PaddleOCR API 实现，支持异步任务提交和结果轮询。

API 地址: https://paddleocr.aistudio-app.com/api/v2/ocr/jobs

### 功能特性

- 支持图片文本识别（JPG、PNG、BMP 等格式）
- 支持 PDF 文档文本识别
- 支持文件 URL 或本地文件路径
- 异步任务处理，支持轮询获取结果
- 返回 Markdown 格式文本
- 基于 PaddleOCR-VL-1.5 模型

### 快速开始

```python
from src.ocr import get_ocr_client

# 获取 OCR 客户端
ocr = get_ocr_client()

# 识别本地文件
result = ocr.recognize("path/to/document.pdf")
print(result)

# 识别网络文件
result = ocr.recognize("https://example.com/document.pdf")
print(result)

# 获取原始结果数据
raw_result = ocr.recognize("path/to/file.jpg", return_format="raw")
```

### 配置说明

#### 1. 环境变量配置（.env）

```bash
# 百度 AI Studio PaddleOCR API Token（必填）
# 获取地址: https://aistudio.baidu.com
PADDLEOCR_API_KEY=your_api_token_here
```

#### 2. 配置文件（config.yaml）

```yaml
tool:
  # OCR 工具配置
  ocr:
    enabled: True  # 是否启用 OCR 工具
    api_url: ""  # API 地址（留空使用默认百度 AI Studio）
    timeout: 60  # 请求超时时间（秒）
    poll_interval: 5  # 轮询间隔（秒）
```

### API 接口

#### OCRClient 类

##### `recognize(file_path, wait_for_result=True, return_format="markdown")`

识别文件（图片或PDF）中的文本。

**参数：**
- `file_path`: 文件路径或 URL（str 或 Path）
- `wait_for_result`: 是否等待并返回识别结果（默认 True）
- `return_format`: 返回格式，可选 "markdown" 或 "raw"（默认 "markdown"）

**返回：**
- `str`: Markdown 格式的识别文本
- `dict`: 原始响应数据（return_format="raw" 时）

##### `recognize_image(image_data)`

识别图片中的文本（兼容旧接口）。

**参数：**
- `image_data`: 图片数据，支持：
  - 文件路径（str 或 Path）
  - 二进制数据（bytes）
  - base64 编码字符串（str）

**返回：**
- `str`: Markdown 格式的识别文本

##### `recognize_pdf(pdf_data, page_num=None)`

识别 PDF 中的文本（兼容旧接口）。

**参数：**
- `pdf_data`: PDF 数据，支持：
  - 文件路径（str 或 Path）
  - 二进制数据（bytes）
  - base64 编码字符串（str）
- `page_num`: 指定页码（可选，暂不支持单页识别）

**返回：**
- `str`: Markdown 格式的识别文本

### 工作流程

1. **提交任务**: 上传文件或提供 URL，获取 job_id
2. **轮询状态**: 定时查询任务状态（pending -> running -> done/failed）
3. **获取结果**: 任务完成后，下载并解析结果文件
4. **返回文本**: 提取 Markdown 格式文本返回

### 任务状态

- `pending`: 任务等待中
- `running`: 任务执行中，显示处理进度
- `done`: 任务完成，可获取结果
- `failed`: 任务失败，返回错误信息

### 可选参数

在 `optional_payload` 中可配置以下选项：

```python
ocr_client.optional_payload = {
    "useDocOrientationClassify": False,  # 文档方向分类
    "useDocUnwarping": False,            # 文档矫正
    "useChartRecognition": False,        # 图表识别
}
```

### 注意事项

1. **API Token**: 必须配置有效的百度 AI Studio API Token
2. **文件大小**: 建议文件大小不超过 50MB
3. **处理时间**: 大文件处理可能需要较长时间，请耐心等待
4. **网络要求**: 需要能够访问百度 AI Studio 服务
5. **结果格式**: 默认返回 Markdown 格式，保留文档结构

### 获取 API Token

1. 访问 [百度 AI Studio](https://aistudio.baidu.com)
2. 注册/登录账号
3. 进入 PaddleOCR 服务页面
4. 创建应用并获取 API Token

### 依赖

- requests

### 示例代码

```python
import os
from src.ocr import get_ocr_client

# 设置 API Key
os.environ["PADDLEOCR_API_KEY"] = "your_api_token"

# 获取客户端
ocr = get_ocr_client()

# 识别 PDF
result = ocr.recognize("./document.pdf")
print(result)

# 识别图片
result = ocr.recognize("./image.png")
print(result)

# 仅提交任务，不等待结果
job_info = ocr.recognize("./large_file.pdf", wait_for_result=False)
print(f"Job ID: {job_info['job_id']}")
```

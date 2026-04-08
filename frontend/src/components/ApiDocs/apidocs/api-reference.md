# API 参考

本文档提供了 Sam College API 的详细参考信息。

## 认证接口

### 注册

- **URL**：`/api/auth/register`
- **方法**：`POST`
- **内容类型**：`application/json`
- **描述**：创建新用户账号

**请求参数**：

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `username` | string | 是 | 用户名 |
| `email` | string | 是 | 电子邮箱 |
| `password` | string | 是 | 密码 |

**响应**：
- **200 OK**：返回访问令牌和刷新令牌
- **400 Bad Request**：请求参数错误
- **500 Internal Server Error**：服务器内部错误

### 登录

- **URL**：`/api/auth/login`
- **方法**：`POST`
- **内容类型**：`application/json`
- **描述**：获取访问令牌和刷新令牌

**请求参数**：

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `email` | string | 是 | 电子邮箱 |
| `password` | string | 是 | 密码 |

**响应**：
- **200 OK**：返回访问令牌和刷新令牌
- **401 Unauthorized**：邮箱或密码错误
- **400 Bad Request**：请求参数错误

### 获取当前用户信息

- **URL**：`/api/auth/me`
- **方法**：`GET`
- **内容类型**：`application/json`
- **描述**：获取当前登录用户的信息
- **认证**：需要访问令牌

**响应**：
- **200 OK**：返回用户信息
- **401 Unauthorized**：访问令牌无效或过期

### 更新当前用户信息

- **URL**：`/api/auth/me`
- **方法**：`PUT`
- **内容类型**：`application/json`
- **描述**：更新当前登录用户的信息
- **认证**：需要访问令牌

**请求参数**：

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `username` | string | 否 | 用户名 |
| `bio` | string | 否 | 个人简介 |
| `gender` | string | 否 | 性别 |
| `age` | integer | 否 | 年龄 |
| `is_student` | boolean | 否 | 是否学生 |
| `student_grade` | string | 否 | 学生年级 |
| `occupation` | string | 否 | 职业 |
| `persona` | string | 否 | 角色 |

**响应**：
- **200 OK**：返回更新后的用户信息
- **401 Unauthorized**：访问令牌无效或过期
- **400 Bad Request**：请求参数错误

### 上传头像

- **URL**：`/api/auth/avatar`
- **方法**：`POST`
- **内容类型**：`multipart/form-data`
- **描述**：上传用户头像
- **认证**：需要访问令牌

**请求参数**：

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `file` | file | 是 | 头像文件（支持 jpeg、png、gif、webp 格式，最大 5MB） |

**响应**：
- **200 OK**：返回更新后的用户信息
- **401 Unauthorized**：访问令牌无效或过期
- **400 Bad Request**：文件类型或大小错误

### 刷新令牌

- **URL**：`/api/auth/refresh`
- **方法**：`POST`
- **内容类型**：`application/json`
- **描述**：使用刷新令牌获取新的访问令牌

**请求参数**：

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `refresh_token` | string | 是 | 刷新令牌 |

**响应**：
- **200 OK**：返回新的访问令牌
- **401 Unauthorized**：刷新令牌无效或过期

### 登出

- **URL**：`/api/auth/logout`
- **方法**：`POST`
- **内容类型**：`application/json`
- **描述**：用户登出
- **认证**：需要访问令牌

**响应**：
- **200 OK**：登出成功
- **401 Unauthorized**：访问令牌无效或过期

## 聊天接口

### 发送消息

- **URL**：`/api/chat`
- **方法**：`POST`
- **内容类型**：`application/json`
- **描述**：向 AI 助手发送消息并获取回复
- **认证**：需要访问令牌

**请求参数**：

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `message` | string | 是 | 消息内容 |
| `conversation_id` | string | 否 | 对话 ID（用于继续已有的对话） |

**响应**：
- **200 OK**：返回 AI 助手的回复
- **401 Unauthorized**：访问令牌无效或过期
- **400 Bad Request**：请求参数错误

### 重置对话

- **URL**：`/api/reset`
- **方法**：`POST`
- **内容类型**：`application/json`
- **描述**：重置当前对话
- **认证**：需要访问令牌

**响应**：
- **200 OK**：重置成功
- **401 Unauthorized**：访问令牌无效或过期

## 会话接口

### 获取会话列表

- **URL**：`/api/conversations`
- **方法**：`GET`
- **内容类型**：`application/json`
- **描述**：获取用户的会话列表
- **认证**：需要访问令牌

**响应**：
- **200 OK**：返回会话列表
- **401 Unauthorized**：访问令牌无效或过期

### 获取会话详情

- **URL**：`/api/conversations/{conversation_id}`
- **方法**：`GET`
- **内容类型**：`application/json`
- **描述**：获取指定会话的详情
- **认证**：需要访问令牌

**响应**：
- **200 OK**：返回会话详情
- **401 Unauthorized**：访问令牌无效或过期
- **404 Not Found**：会话不存在

### 删除会话

- **URL**：`/api/conversations/{conversation_id}`
- **方法**：`DELETE`
- **内容类型**：`application/json`
- **描述**：删除指定会话
- **认证**：需要访问令牌

**响应**：
- **200 OK**：删除成功
- **401 Unauthorized**：访问令牌无效或过期
- **404 Not Found**：会话不存在

## 冷启动接口

### 冷启动预测

- **URL**：`/api/cold-start/predict`
- **方法**：`POST`
- **内容类型**：`application/json`
- **描述**：根据用户输入预测学习能力
- **认证**：需要访问令牌

**请求参数**：

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `age` | integer | 是 | 年龄 |
| `education` | string | 是 | 教育程度 |
| `learning_years` | integer | 是 | 学习年限 |
| `daily_time` | integer | 是 | 每日学习时间（分钟） |
| `learning_goal` | string | 是 | 学习目标 |

**响应**：
- **200 OK**：返回预测结果
- **401 Unauthorized**：访问令牌无效或过期
- **400 Bad Request**：请求参数错误

## 健康检查

### 健康检查

- **URL**：`/api/health`
- **方法**：`GET`
- **内容类型**：`application/json`
- **描述**：检查 API 服务是否正常运行

**响应**：
- **200 OK**：服务正常运行

## 响应格式

所有 API 响应都遵循以下格式：

### 成功响应

```json
{
  "status": "success",
  "data": {...}, // 具体数据
  "message": "操作成功"
}
```

### 错误响应

```json
{
  "status": "error",
  "detail": "错误信息",
  "code": 400 // HTTP 状态码
}
```
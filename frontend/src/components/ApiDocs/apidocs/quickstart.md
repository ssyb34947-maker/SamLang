# 快速接入

本文档将帮助您快速开始使用 Sam College API。

## 步骤 1：准备环境

1. **安装必要的依赖**：
   - Python 3.11+
   - 任何 HTTP 客户端（如 curl、Postman 或编程语言的 HTTP 库）

2. **获取 API 基础 URL**：
   - 本地开发：`http://localhost:8000`
   - 生产环境：请联系管理员获取

## 步骤 2：注册账号

使用 `/api/auth/register` 接口创建新账号：

### cURL 示例

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "your-password"}'
```

### 响应

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## 步骤 3：登录获取令牌

使用 `/api/auth/login` 接口获取访问令牌：

### cURL 示例

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "your-password"}'
```

### 响应

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## 步骤 4：使用 API

获取访问令牌后，您可以开始使用其他 API 接口。以下是一些常用接口的示例：

### 获取当前用户信息

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

### 发送聊天消息

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"message": "Hello, how are you?"}'
```

## 步骤 5：处理错误

API 可能会返回以下错误码：

- **401 Unauthorized**：访问令牌无效或过期
- **400 Bad Request**：请求参数错误
- **500 Internal Server Error**：服务器内部错误

## 步骤 6：集成到您的应用

### Python 示例

```python
import requests

# 登录获取令牌
def get_token():
    response = requests.post(
        "http://localhost:8000/api/auth/login",
        json={"email": "test@example.com", "password": "your-password"}
    )
    return response.json()

# 使用令牌调用 API
def get_user_info(token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get("http://localhost:8000/api/auth/me", headers=headers)
    return response.json()

# 示例用法
token_data = get_token()
user_info = get_user_info(token_data["access_token"])
print(user_info)
```

### JavaScript 示例

```javascript
// 登录获取令牌
async function getToken() {
  const response = await fetch("http://localhost:8000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: "test@example.com", password: "your-password" })
  });
  return response.json();
}

// 使用令牌调用 API
async function getUserInfo(token) {
  const response = await fetch("http://localhost:8000/api/auth/me", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return response.json();
}

// 示例用法
getToken().then(tokenData => {
  return getUserInfo(tokenData.access_token);
}).then(userInfo => {
  console.log(userInfo);
});
```

## 下一步

- 查看 [API 参考](#api-reference) 了解更多接口
- 阅读 [最佳实践](#best-practices) 优化您的 API 使用
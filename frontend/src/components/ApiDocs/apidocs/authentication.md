# 认证授权

Sam College API 使用 JWT (JSON Web Tokens) 进行认证和授权。本文档将详细介绍如何获取和使用访问令牌。

## 认证流程

1. **注册**：创建新用户账号
2. **登录**：获取访问令牌和刷新令牌
3. **使用令牌**：在 API 请求中包含访问令牌
4. **刷新令牌**：当访问令牌过期时使用刷新令牌获取新的访问令牌

## 注册

### 接口信息

- **URL**：`/api/auth/register`
- **方法**：`POST`
- **内容类型**：`application/json`

### 请求参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `username` | string | 是 | 用户名 |
| `email` | string | 是 | 电子邮箱 |
| `password` | string | 是 | 密码 |

### 响应示例

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## 登录

### 接口信息

- **URL**：`/api/auth/login`
- **方法**：`POST`
- **内容类型**：`application/json`

### 请求参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `email` | string | 是 | 电子邮箱 |
| `password` | string | 是 | 密码 |

### 响应示例

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## 使用令牌

获取访问令牌后，您需要在每个 API 请求的 `Authorization` 头中包含它：

```
Authorization: Bearer <access_token>
```

## 刷新令牌

当访问令牌过期时，您可以使用刷新令牌获取新的访问令牌：

### 接口信息

- **URL**：`/api/auth/refresh`
- **方法**：`POST`
- **内容类型**：`application/json`

### 请求参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `refresh_token` | string | 是 | 刷新令牌 |

### 响应示例

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## 令牌有效期

- **访问令牌**：默认有效期为 1 小时
- **刷新令牌**：默认有效期为 7 天

## 安全注意事项

- 不要在客户端存储访问令牌和刷新令牌
- 不要在公共网络上传输令牌
- 定期轮换令牌
- 当用户登出时，清除令牌

## 错误处理

| 状态码 | 描述 |
|--------|------|
| 401 | 未授权：无效的访问令牌 |
| 403 | 禁止访问：权限不足 |
| 400 | 请求错误：参数无效 |
| 500 | 服务器错误 |
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.tsx'
import { LoadingProvider, useLoading } from './hooks/useLoading.tsx'
import { apiService } from './services/api.ts'
import ProtectedRoute from './components/ProtectedRoute'
import AuthRoute from './components/AuthRoute'
import App from './App.tsx'
import { Profile } from './components/Profile/Profile.tsx'
import { ChatHome } from './components/Chat/ChatHome.tsx'
import { HomePage } from './components/Home/HomePage.tsx'
import { UserOnboarding } from './components/Onboarding/UserOnboarding.tsx'
import { ApiDocs } from './components/ApiDocs/ApiDocs.tsx'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import './index.css'

// 设置API请求回调的组件
const ApiCallbackSetup = ({ children }: { children: React.ReactNode }) => {
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    // 设置API请求回调
    apiService.setRequestCallbacks({
      onRequestStart: showLoading,
      onRequestEnd: hideLoading
    });
  }, [showLoading, hideLoading]);

  return children;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoadingProvider>
      <ApiCallbackSetup>
        <Router>
          <AuthProvider>
            <Routes>
              {/* 根路径 / 重定向到 /home */}
              <Route
                path="/"
                element={
                  <AuthRoute>
                    <Navigate to="/home" replace />
                  </AuthRoute>
                }
              />

              {/* 首页 /home - 公开访问 */}
              <Route
                path="/home"
                element={
                  <AuthRoute>
                    <HomePage />
                  </AuthRoute>
                }
              />

              {/* API 文档页面 - 公开访问 */}
              <Route
                path="/docs"
                element={
                  <AuthRoute>
                    <ApiDocs />
                  </AuthRoute>
                }
              />

              {/* 登录页 - 已登录用户会被重定向到 /home */}
              <Route
                path="/login"
                element={
                  <AuthRoute>
                    <Login />
                  </AuthRoute>
                }
              />

              {/* 注册页 - 已登录用户会被重定向到 /home */}
              <Route
                path="/register"
                element={
                  <AuthRoute>
                    <Register />
                  </AuthRoute>
                }
              />

              {/* 用户引导页 - 注册后信息收集 */}
              <Route
                path="/welcome"
                element={
                  <AuthRoute requireAuth>
                    <UserOnboarding />
                  </AuthRoute>
                }
              />

              {/* 受保护的路由 - 必须登录才能访问 */}
              <Route
                path="/chat"
                element={
                  <AuthRoute requireAuth>
                    <ChatHome />
                  </AuthRoute>
                }
              />
              <Route
                path="/chat/:userUuid/:conversationId"
                element={
                  <AuthRoute requireAuth>
                    <ChatHome />
                  </AuthRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <AuthRoute requireAuth>
                    <Profile />
                  </AuthRoute>
                }
              />
              <Route
                path="/profile/:userUuid"
                element={
                  <AuthRoute requireAuth>
                    <Profile />
                  </AuthRoute>
                }
              />

              {/* 未匹配的路由 - 未登录用户重定向到登录页 */}
              <Route
                path="*"
                element={
                  <AuthRoute>
                    <Navigate to="/login" replace />
                  </AuthRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </Router>
      </ApiCallbackSetup>
    </LoadingProvider>
  </StrictMode>,
)

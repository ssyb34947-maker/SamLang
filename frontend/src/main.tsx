import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.tsx'
import { LoadingProvider, useLoading } from './hooks/useLoading.tsx'
import { apiService } from './services/api.ts'
import ProtectedRoute from './components/ProtectedRoute'
import App from './App.tsx'
import { Profile } from './components/Profile/Profile.tsx'
import { ChatHome } from './components/Chat/ChatHome.tsx'
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
              {/* 根路径重定向到 /chat */}
              <Route path="/" element={<Navigate to="/chat" replace />} />

              {/* 受保护的路由 */}
              {/* 支持 /:userUuid/:conversationId 格式的对话路由 */}
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:userUuid/:conversationId"
                element={
                  <ProtectedRoute>
                    <ChatHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:userUuid"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* 公开路由 */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* 重定向所有其他路由到登录页 */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </AuthProvider>
        </Router>
      </ApiCallbackSetup>
    </LoadingProvider>
  </StrictMode>,
)

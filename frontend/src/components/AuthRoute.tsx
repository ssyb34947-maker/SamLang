/**
 * 认证路由守卫组件
 * 实现路由规则：
 * 1. 未登录用户访问 / 重定向到 /home
 * 2. 未登录用户只能访问 /home, /login, /register
 * 3. 已登录新用户必须先去 /welcome 填写信息
 * 4. 已登录用户访问 /, /home, /login, /register 重定向到 /chat
 * 5. 其他路由根据登录状态决定
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';

// 公开路由列表（未登录可访问）
const PUBLIC_ROUTES = ['/home', '/login', '/register', '/docs'];

// 游客路由列表（登录后访问会重定向）
const GUEST_ROUTES = ['/', '/home', '/login', '/register'];

interface AuthRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthRoute: React.FC<AuthRouteProps> = ({
  children,
  requireAuth = false
}) => {
  const { isAuthenticated, isLoading, isNewUser } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // 加载中显示空白或加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--sketch-bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 border-4 rounded-full animate-spin"
            style={{
              borderColor: 'var(--sketch-border)',
              borderTopColor: 'var(--sketch-accent)'
            }}
          />
          <p style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-text)' }}>
            加载中...
          </p>
        </div>
      </div>
    );
  }

  // 规则1: 未登录用户访问 / 重定向到 /home
  if (!isAuthenticated && currentPath === '/') {
    return <Navigate to="/home" replace />;
  }

  // 规则2: 未登录用户只能访问公开路由
  if (!isAuthenticated) {
    // 检查当前路径是否是公开路由（支持子路径匹配）
    const isPublicRoute = PUBLIC_ROUTES.some(route =>
      currentPath === route || currentPath.startsWith(route + '/')
    );

    if (!isPublicRoute) {
      // 未登录访问非公开路由，重定向到登录页，并记录目标路径
      return <Navigate to="/login" state={{ from: currentPath }} replace />;
    }
  }

  // 规则3: 已登录新用户必须先去 /welcome 填写信息
  if (isAuthenticated && isNewUser && currentPath !== '/welcome') {
    return <Navigate to="/welcome" replace />;
  }

  // 规则4: 已登录用户（非新用户）访问游客路由重定向到 /chat
  if (isAuthenticated && !isNewUser && GUEST_ROUTES.includes(currentPath)) {
    return <Navigate to="/chat" replace />;
  }

  // 规则5: 需要认证的路由
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: currentPath }} replace />;
  }

  return <>{children}</>;
};

export default AuthRoute;

/**
 * 受保护的路由组件
 * 只有登录用户才能访问
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';
import { useLoading } from '../hooks/useLoading.tsx';
import { useEffect, useRef } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireOnboarding = true }) => {
  const { isAuthenticated, isLoading, isNewUser } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const location = useLocation();
  const prevPathname = useRef(location.pathname);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 当路由切换时，显示加载动画
  useEffect(() => {
    // 只在 pathname 真正变化时显示 loading
    if (prevPathname.current !== location.pathname) {
      showLoading();
      prevPathname.current = location.pathname;

      // 清除之前的定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // 模拟页面加载时间
      timerRef.current = setTimeout(() => {
        hideLoading();
        timerRef.current = null;
      }, 500);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [location.pathname]);

  // 当检查认证状态时，显示加载动画
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
            检查登录状态...
          </p>
        </div>
      </div>
    );
  }

  // 未登录时重定向到登录页，并记录当前路径以便登录后跳转回来
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 如果是新用户且需要完成信息填写，且当前不在 /welcome 页面，则重定向到 /welcome
  if (requireOnboarding && isNewUser && location.pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

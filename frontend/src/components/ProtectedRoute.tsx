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
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
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
      <div className="min-h-screen flex items-center justify-center bg-pixel-bg">
        <div className="pixel-loading"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

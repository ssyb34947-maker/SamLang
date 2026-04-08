/**
 * 管理员路由保护组件
 * 验证管理员登录状态，未登录则重定向到登录页
 */

import { Navigate, useParams } from 'react-router-dom';
import { ReactNode, useEffect, useState } from 'react';
import { apiService } from '../services/api';

interface AdminInfo {
  id: number;
  uuid: string;
  username: string;
  nickname: string | null;
  role: string;
}

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { adminUuid } = useParams<{ adminUuid: string }>();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateAdmin = async () => {
      const token = localStorage.getItem('admin_access_token');
      const adminInfoStr = localStorage.getItem('admin_info');

      // 检查token是否存在
      if (!token || !adminInfoStr) {
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }

      try {
        const adminInfo: AdminInfo = JSON.parse(adminInfoStr);

        // 验证URL中的UUID是否与登录的管理员匹配
        if (adminUuid && adminInfo.uuid !== adminUuid) {
          setIsAuthenticated(false);
          setIsValidating(false);
          return;
        }

// 可选：调用后端验证token有效性
        // const response = await apiService.getCurrentAdmin();
        // if (!response.ok) {
        //   setIsAuthenticated(false);
        //   setIsValidating(false);
        //   return;
        // }

        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateAdmin();
  }, [adminUuid]);

  // 验证中显示加载状态
  if (isValidating) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--sketch-bg)' }}
      >
        <div
          className="p-8 text-center"
          style={{
            backgroundColor: 'white',
            border: '3px solid var(--sketch-border)',
            borderRadius: 'var(--wobbly)',
            boxShadow: 'var(--shadow-hard)',
          }}
        >
          <div className="animate-spin w-8 h-8 mx-auto mb-4 border-4 border-t-transparent rounded-full" style={{ borderColor: 'var(--sketch-secondary)', borderTopColor: 'transparent' }} />
          <p style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}>
            验证中...
          </p>
        </div>
      </div>
    );
  }

  // 未认证重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // 已认证显示子组件
  return <>{children}</>;
};

export default AdminRoute;

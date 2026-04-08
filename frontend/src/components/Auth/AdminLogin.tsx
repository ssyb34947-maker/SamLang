/**
 * 管理员登录页面组件
 * 手绘草稿本风格
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock } from 'lucide-react';
import { apiService } from '../../services/api.ts';

interface AdminLoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  admin: {
    id: number;
    uuid: string;
    username: string;
    nickname: string | null;
    role: string;
    status: string;
    last_login_at: string | null;
    created_at: string;
  };
}

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 表单验证
    if (!username || !password) {
      setError('请填写所有字段');
      return;
    }

    if (password.length < 6 || password.length > 50) {
      setError('密码长度必须在6-50位之间');
      return;
    }

    try {
      setIsLoading(true);

      const response = await apiService.adminLogin(username, password);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `登录失败: ${response.status}`);
      }

      const data: AdminLoginResponse = await response.json();

      // 保存管理员token
      localStorage.setItem('admin_access_token', data.access_token);
      localStorage.setItem('admin_refresh_token', data.refresh_token);
      localStorage.setItem('admin_info', JSON.stringify(data.admin));

      // 登录成功后跳转到包含管理员UUID的控制台
      navigate(`/admin/dashboard/${data.admin.uuid}`, { replace: true });

    } catch (err: any) {
      let errorMessage = '登录失败，请检查账号和密码';

      if (err.message) {
        if (err.message.includes('401') || err.message.includes('账号或密码')) {
          errorMessage = '账号或密码错误';
        } else if (err.message.includes('锁定')) {
          errorMessage = err.message;
        } else if (err.message.includes('禁用')) {
          errorMessage = '账号已禁用';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--sketch-bg)' }}
    >
      <div className="w-full max-w-md">
        {/* 返回按钮 */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 mb-6 transition-all hover:translate-x-[-4px]"
          style={{
            fontFamily: 'var(--font-hand-body)',
            color: 'var(--sketch-secondary)'
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回用户登录</span>
        </Link>

        {/* 登录表单卡片 - 手绘风格 */}
        <div
          className="p-6 md:p-8 relative"
          style={{
            backgroundColor: 'white',
            border: '4px solid var(--sketch-border)',
            borderRadius: 'var(--wobbly)',
            boxShadow: 'var(--shadow-hard-lg)'
          }}
        >
          {/* 胶带装饰 */}
          <div
            className="absolute -top-3 left-1/2 transform -translate-x-1/2 -rotate-2"
            style={{
              width: '100px',
              height: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '2px solid var(--sketch-border)',
              borderRadius: '4px'
            }}
          />

          <div className="text-center mb-8">
            <div
              className="w-20 h-20 mx-auto mb-4 flex items-center justify-center"
              style={{
                backgroundColor: 'var(--sketch-paper)',
                border: '3px solid var(--sketch-border)',
                borderRadius: 'var(--wobbly-sm)',
                boxShadow: 'var(--shadow-hard)',
                transform: 'rotate(-3deg)'
              }}
            >
              <Shield className="w-10 h-10" style={{ color: 'var(--sketch-accent)' }} />
            </div>
            <h2
              className="text-2xl mb-2"
              style={{ fontFamily: 'var(--font-hand-heading)', fontWeight: 700, color: 'var(--sketch-text)' }}
            >
              管理员登录
            </h2>
            <p style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}>
              系统管理后台
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div
              className="p-4 mb-6"
              style={{
                backgroundColor: 'rgba(255, 77, 77, 0.1)',
                border: '3px solid var(--sketch-accent)',
                borderRadius: 'var(--wobbly-sm)'
              }}
            >
              <p style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-accent)' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 管理员账号 */}
            <div className="mb-4">
              <label
                className="block mb-2"
                style={{ fontFamily: 'var(--font-hand-heading)', fontWeight: 600 }}
              >
                管理员账号
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入管理员账号"
                disabled={isLoading}
                className="sketch-input"
              />
            </div>

            {/* 密码 */}
            <div className="mb-6">
              <label
                className="block mb-2"
                style={{ fontFamily: 'var(--font-hand-heading)', fontWeight: 600 }}
              >
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                disabled={isLoading}
                className="sketch-input"
              />
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="sketch-btn w-full flex items-center justify-center gap-2"
              style={{
                backgroundColor: isLoading ? 'var(--sketch-muted)' : 'var(--sketch-accent)',
                color: 'white'
              }}
            >
              <Lock className="w-4 h-4" />
              {isLoading ? (
                <span style={{ fontFamily: 'var(--font-hand-body)' }}>登录中...</span>
              ) : (
                <span style={{ fontFamily: 'var(--font-hand-heading)' }}>管理员登录</span>
              )}
            </button>
          </form>

          {/* 提示信息 */}
          <div className="mt-6 text-center">
            <p
              className="text-xs"
              style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
            >
              此入口仅限系统管理员使用
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

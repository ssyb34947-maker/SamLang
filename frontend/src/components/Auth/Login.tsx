/**
 * 登录页面组件 - 手绘草稿本风格
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.tsx';
import { ArrowLeft } from 'lucide-react';

const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 如果已经登录，直接跳转到首页
  if (isAuthenticated) {
    navigate('/chat', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 表单验证
    if (!usernameOrEmail || !password) {
      setError('请填写所有字段');
      return;
    }

    // 密码验证
    if (password.length < 6 || password.length > 18) {
      setError('密码长度必须在6-18位之间');
      return;
    }

    try {
      setIsLoading(true);
      await login(usernameOrEmail, password);
      // 登录成功后跳转到之前访问的页面或首页
      const from = (location.state as any)?.from || '/chat';
      navigate(from, { replace: true });
    } catch (err: any) {
      let errorMessage = '登录失败，请检查账号和密码';

      if (err.message) {
        if (err.message.includes('401')) {
          errorMessage = '账号或密码错误，请重新输入';
        } else if (err.message.includes('404')) {
          errorMessage = '用户不存在，请先注册';
        } else if (err.message.includes('网络')) {
          errorMessage = '网络连接失败，请检查网络设置';
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
          to="/"
          className="inline-flex items-center gap-2 mb-6 transition-all hover:translate-x-[-4px]"
          style={{
            fontFamily: 'var(--font-hand-body)',
            color: 'var(--sketch-secondary)'
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回首页</span>
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
              <img src="/logo.png" className="w-12 h-12" alt="Logo" />
            </div>
            <h2
              className="text-2xl mb-2"
              style={{ fontFamily: 'var(--font-hand-heading)', fontWeight: 700, color: 'var(--sketch-text)' }}
            >
              登录账号
            </h2>
            <p style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}>
              欢迎回来，继续你的语言学习之旅
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
            {/* 用户名或邮箱 */}
            <div className="mb-4">
              <label
                className="block mb-2"
                style={{ fontFamily: 'var(--font-hand-heading)', fontWeight: 600 }}
              >
                用户名或邮箱
              </label>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="请输入用户名或邮箱"
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
              className="sketch-btn w-full"
              style={{
                backgroundColor: isLoading ? 'var(--sketch-muted)' : 'var(--sketch-secondary)',
                color: 'white'
              }}
            >
              {isLoading ? (
                <span style={{ fontFamily: 'var(--font-hand-body)' }}>登录中...</span>
              ) : (
                <span style={{ fontFamily: 'var(--font-hand-heading)' }}>登录</span>
              )}
            </button>
          </form>

          {/* 注册链接 */}
          <div className="mt-6 text-center">
            <p style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}>
              还没有账号？{' '}
              <Link
                to="/register"
                style={{
                  color: 'var(--sketch-secondary)',
                  textDecoration: 'underline',
                  fontWeight: 600
                }}
              >
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

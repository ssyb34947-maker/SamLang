/**
 * 登录页面组件
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.tsx';
import { ArrowLeft } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 表单验证
    if (!email || !password) {
      setError('请填写所有字段');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      // 登录成功后提示并跳转到首页
      alert('登录成功！');
      navigate('/');
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱和密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pixel-bg">
      <div className="w-full max-w-md">
        {/* 返回按钮 */}
        <Link
          to="/"
          className="flex items-center gap-2 text-pixel-secondary hover:text-pixel-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回首页</span>
        </Link>

        {/* 登录表单卡片 */}
        <div className="pixel-border p-6 md:p-8 rounded-lg">
          <div className="text-center mb-8">
            <img src="/logo.png" className="w-16 h-16 mx-auto mb-4" alt="Logo" />
            <h2 className="text-2xl font-bold text-pixel-primary mb-2">
              登录账号
            </h2>
            <p className="text-gray-400">
              欢迎回来，继续你的语言学习之旅
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="pixel-border-error p-4 mb-6 rounded">
              <p className="text-pixel-error text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 邮箱 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                邮箱地址
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱地址"
                disabled={isLoading}
                className="pixel-input w-full"
              />
            </div>

            {/* 密码 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                disabled={isLoading}
                className="pixel-input w-full"
              />
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="pixel-btn w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="pixel-loading-sm"></div>
                  <span>登录中...</span>
                </>
              ) : (
                <span>登录</span>
              )}
            </button>
          </form>

          {/* 注册链接 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              还没有账号？{' '}
              <Link
                to="/register"
                className="text-pixel-primary hover:text-pixel-accent underline"
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

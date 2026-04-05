/**
 * 登录页面组件
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.tsx';
import { ArrowLeft } from 'lucide-react';

const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

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
      // 登录成功后跳转到首页
      navigate('/');
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
            {/* 用户名或邮箱 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                用户名或邮箱
              </label>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="请输入用户名或邮箱"
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

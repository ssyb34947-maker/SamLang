/**
 * 注册页面组件
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.tsx';
import { ArrowLeft } from 'lucide-react';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 表单验证
    if (!username || !email || !password || !confirmPassword) {
      setError('请填写所有字段');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    try {
      setIsLoading(true);
      await register(username, email, password);
      // 注册成功后提示并跳转到首页
      alert('注册成功！');
      navigate('/');
    } catch (err: any) {
      setError(err.message || '注册失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pixel-bg">
      <div className="w-full max-w-md">
        {/* 返回按钮 */}
        <Link
          to="/login"
          className="flex items-center gap-2 text-pixel-secondary hover:text-pixel-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回登录</span>
        </Link>

        {/* 注册表单卡片 */}
        <div className="pixel-border p-6 md:p-8 rounded-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-pixel-primary mb-2">
              创建账号
            </h2>
            <p className="text-gray-400">
              加入山姆外语，开始你的语言学习之旅
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="pixel-border-error p-4 mb-6 rounded">
              <p className="text-pixel-error text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 用户名 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                disabled={isLoading}
                className="pixel-input w-full"
              />
            </div>

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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码（至少6位）"
                disabled={isLoading}
                className="pixel-input w-full"
              />
            </div>

            {/* 确认密码 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                确认密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                disabled={isLoading}
                className="pixel-input w-full"
              />
            </div>

            {/* 注册按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="pixel-btn w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="pixel-loading-sm"></div>
                  <span>注册中...</span>
                </>
              ) : (
                <span>创建账号</span>
              )}
            </button>
          </form>

          {/* 登录链接 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              已有账号？{' '}
              <Link
                to="/login"
                className="text-pixel-primary hover:text-pixel-accent underline"
              >
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

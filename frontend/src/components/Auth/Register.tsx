/**
 * 注册页面组件 - 手绘草稿本风格
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

  const { register, isAuthenticated, isNewUser } = useAuth();
  const navigate = useNavigate();

  // 如果已经登录且不是新用户，直接跳转到 /chat
  // 如果是新用户，AuthRoute 会自动重定向到 /welcome
  if (isAuthenticated && !isNewUser) {
    navigate('/chat', { replace: true });
    return null;
  }

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

    // 用户名验证：只可以是大小写英文字母和数字
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
      setError('用户名只能包含大小写英文字母和数字');
      return;
    }

    // 密码验证：长度6-18位，至少包含两种字符类型（数字、大写字母、小写字母）
    if (password.length < 6 || password.length > 18) {
      setError('密码长度必须在6-18位之间');
      return;
    }

    let charTypes = 0;
    if (/[0-9]/.test(password)) charTypes++;
    if (/[A-Z]/.test(password)) charTypes++;
    if (/[a-z]/.test(password)) charTypes++;

    if (charTypes < 2) {
      setError('密码必须包含数字、大写字母、小写字母中的至少两种');
      return;
    }

    try {
      setIsLoading(true);
      await register(username, email, password);
      // 注册成功后，isNewUser 会被设置为 true
      // AuthRoute 会自动将新用户重定向到 /welcome
      // 不需要手动跳转
    } catch (err: any) {
      let errorMessage = '注册失败，请稍后重试';

      if (err.message) {
        if (err.message.includes('409') || err.message.includes('用户名已存在') || err.message.includes('邮箱已存在')) {
          errorMessage = '用户名或邮箱已被注册，请使用其他账号';
        } else if (err.message.includes('密码')) {
          errorMessage = '密码格式不正确，请检查密码要求';
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
          to="/login"
          className="inline-flex items-center gap-2 mb-6 transition-all hover:translate-x-[-4px]"
          style={{
            fontFamily: 'var(--font-hand-body)',
            color: 'var(--sketch-secondary)'
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回登录</span>
        </Link>

        {/* 注册表单卡片 - 手绘风格 */}
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
            className="absolute -top-3 left-1/2 transform -translate-x-1/2 rotate-1"
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
                transform: 'rotate(2deg)'
              }}
            >
              <span
                className="text-3xl"
                style={{ fontFamily: 'var(--font-hand-heading)' }}
              >
                ✏️
              </span>
            </div>
            <h2
              className="text-2xl mb-2"
              style={{ fontFamily: 'var(--font-hand-heading)', fontWeight: 700, color: 'var(--sketch-text)' }}
            >
              创建账号
            </h2>
            <p style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}>
              加入山姆学院，开始你的学习之旅
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
            {/* 用户名 */}
            <div className="mb-4">
              <label
                className="block mb-2"
                style={{ fontFamily: 'var(--font-hand-heading)', fontWeight: 600 }}
              >
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名（字母和数字）"
                disabled={isLoading}
                className="sketch-input"
              />
            </div>

            {/* 邮箱 */}
            <div className="mb-4">
              <label
                className="block mb-2"
                style={{ fontFamily: 'var(--font-hand-heading)', fontWeight: 600 }}
              >
                邮箱地址
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱地址"
                disabled={isLoading}
                className="sketch-input"
              />
            </div>

            {/* 密码 */}
            <div className="mb-4">
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
                placeholder="6-18位，至少包含两种字符类型"
                disabled={isLoading}
                onCopy={(e) => e.preventDefault()}
                className="sketch-input"
              />
            </div>

            {/* 确认密码 */}
            <div className="mb-6">
              <label
                className="block mb-2"
                style={{ fontFamily: 'var(--font-hand-heading)', fontWeight: 600 }}
              >
                确认密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                disabled={isLoading}
                onCopy={(e) => e.preventDefault()}
                className="sketch-input"
              />
            </div>

            {/* 注册按钮 */}
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
                <span style={{ fontFamily: 'var(--font-hand-body)' }}>注册中...</span>
              ) : (
                <span style={{ fontFamily: 'var(--font-hand-heading)' }}>创建账号</span>
              )}
            </button>
          </form>

          {/* 登录链接 */}
          <div className="mt-6 text-center">
            <p style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}>
              已有账号？{' '}
              <Link
                to="/login"
                style={{
                  color: 'var(--sketch-secondary)',
                  textDecoration: 'underline',
                  fontWeight: 600
                }}
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

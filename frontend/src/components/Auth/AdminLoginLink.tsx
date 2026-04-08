/**
 * 管理员登录跳转链接组件
 * 链接风格，非按钮样式
 */

import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

interface AdminLoginLinkProps {
  className?: string;
}

const AdminLoginLink: React.FC<AdminLoginLinkProps> = ({ className = '' }) => {
  return (
    <Link
      to="/admin/login"
      className={`inline-flex items-center gap-1.5 text-sm transition-all hover:opacity-80 ${className}`}
      style={{
        fontFamily: 'var(--font-hand-body)',
        color: 'var(--sketch-pencil)'
      }}
    >
      <Shield className="w-3.5 h-3.5" />
      <span>管理员登录</span>
    </Link>
  );
};

export default AdminLoginLink;

import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../../services/api';
import { Pencil, Save, X, User, FileText, Calendar, Camera } from 'lucide-react';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  is_active: boolean;
  created_at: string;
}

/**
 * 个人信息组件 - 手绘草稿本风格
 * 显示和编辑用户的基本信息
 */
export const PersonalInfo: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 编辑表单数据
  const [editForm, setEditForm] = useState({
    username: '',
    bio: ''
  });

  // 获取用户信息
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getCurrentUser();
      setUserInfo(data);
      setEditForm({
        username: data.username || '',
        bio: data.bio || ''
      });
    } catch (err: any) {
      setError(err.message || '获取用户信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 进入编辑模式
  const handleEdit = () => {
    if (userInfo) {
      setEditForm({
        username: userInfo.username || '',
        bio: userInfo.bio || ''
      });
    }
    setIsEditing(true);
  };

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  // 保存修改
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const updatedUser = await apiService.updateCurrentUser({
        username: editForm.username,
        bio: editForm.bio
      });

      setUserInfo(updatedUser);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || '保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  // 处理表单变化
  const handleChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // 点击更换头像按钮
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // 处理文件选择
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('请选择图片文件（JPG、PNG、GIF、WebP）');
      return;
    }

    // 验证文件大小（最大 5MB）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('图片大小不能超过 5MB');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setError(null);

      const updatedUser = await apiService.uploadAvatar(file);
      setUserInfo(updatedUser);
    } catch (err: any) {
      setError(err.message || '上传头像失败');
    } finally {
      setIsUploadingAvatar(false);
      // 清空 input 值，允许重复选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 构建完整的头像 URL
  const getAvatarUrl = (avatarPath?: string) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${API_BASE_URL}${avatarPath}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto" style={{ position: 'relative' }}>
      {/* 手绘风格卡片 */}
      <div
        style={{
          backgroundColor: 'white',
          border: '3px solid var(--sketch-border)',
          borderRadius: 'var(--wobbly-md)',
          boxShadow: 'var(--shadow-hard)',
          transform: 'rotate(-0.5deg)',
          padding: '2rem',
          position: 'relative',
          marginTop: '20px'
        }}
      >
        {/* 图钉 */}
        <div
          style={{
            position: 'absolute',
            top: '-14px',
            left: '50%',
            transform: 'translateX(-80%) rotate(-46deg)',
            zIndex: 10,
            transformOrigin: 'bottom center'
          }}
        >
          {/* 图钉头部 */}
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #ff6b6b, #c92a2a)',
              boxShadow: '3px 3px 6px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.3)',
              position: 'relative'
            }}
          >
            {/* 图钉高光 */}
            <div
              style={{
                position: 'absolute',
                top: '5px',
                left: '6px',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.4))'
              }}
            />
          </div>
          {/* 图钉针 */}
          <div
            style={{
              width: '3px',
              height: '14px',
              background: 'linear-gradient(to bottom, #adb5bd, #495057)',
              margin: '-3px auto 0',
              boxShadow: '2px 0 3px rgba(0,0,0,0.4)',
              borderRadius: '0 0 1px 1px'
            }}
          />
        </div>

        {/* 胶带装饰 */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%) rotate(-2deg)',
            backgroundColor: 'rgba(255, 193, 7, 0.6)',
            padding: '8px 40px',
            fontFamily: 'var(--font-hand-heading)',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#5d4037',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          个人档案
        </div>

        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-8" style={{ marginTop: '1rem' }}>
          <h2
            style={{
              fontFamily: 'var(--font-hand-heading)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--sketch-text)',
              transform: 'rotate(-1deg)'
            }}
          >
            ✏️ 我的资料
          </h2>
          {!isEditing && (
            <button
              onClick={handleEdit}
              style={{
                fontFamily: 'var(--font-hand)',
                padding: '8px 16px',
                backgroundColor: 'var(--sketch-paper)',
                border: '2px solid var(--sketch-border)',
                borderRadius: 'var(--wobbly-sm)',
                boxShadow: 'var(--shadow-soft)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.95rem',
                color: 'var(--sketch-text)',
                transform: 'rotate(1deg)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'rotate(1deg) scale(1.05)';
                e.currentTarget.style.boxShadow = 'var(--shadow-hard)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'rotate(1deg)';
                e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
              }}
            >
              <Pencil className="w-4 h-4" />
              修改信息
            </button>
          )}
        </div>

        {error && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '12px 16px',
              backgroundColor: '#fee2e2',
              border: '2px solid #ef4444',
              borderRadius: 'var(--wobbly-sm)',
              color: '#dc2626',
              fontFamily: 'var(--font-hand)',
              transform: 'rotate(0.5deg)'
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* 头像区域 */}
          <div className="flex flex-col items-center">
            <div
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                border: '4px solid var(--sketch-border)',
                boxShadow: 'var(--shadow-hard)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'rotate(-2deg)',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {userInfo?.avatar ? (
                <img
                  src={getAvatarUrl(userInfo.avatar)}
                  alt={userInfo.username}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span
                  style={{
                    fontSize: '3.5rem',
                    fontWeight: 700,
                    color: 'white',
                    fontFamily: 'var(--font-hand-heading)'
                  }}
                >
                  {userInfo?.username?.charAt(0).toUpperCase() || 'S'}
                </span>
              )}

              {/* 上传中遮罩 */}
              {isUploadingAvatar && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* 更换头像按钮 */}
            <button
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              style={{
                marginTop: '1rem',
                padding: '6px 14px',
                fontFamily: 'var(--font-hand)',
                fontSize: '0.9rem',
                backgroundColor: '#fff9c4',
                border: '2px dashed var(--sketch-border)',
                borderRadius: 'var(--wobbly-sm)',
                cursor: isUploadingAvatar ? 'not-allowed' : 'pointer',
                color: 'var(--sketch-text)',
                transform: 'rotate(1deg)',
                opacity: isUploadingAvatar ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Camera className="w-4 h-4" />
              {isUploadingAvatar ? '上传中...' : '更换头像'}
            </button>

            {/* 隐藏的文件输入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {/* 注册时间 */}
            <div
              style={{
                marginTop: '1.5rem',
                padding: '8px 16px',
                backgroundColor: '#e3f2fd',
                border: '2px solid #90caf9',
                borderRadius: 'var(--wobbly-sm)',
                fontFamily: 'var(--font-hand)',
                fontSize: '0.85rem',
                color: '#1565c0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transform: 'rotate(-1deg)'
              }}
            >
              <Calendar className="w-4 h-4" />
              注册于 {userInfo?.created_at ? new Date(userInfo.created_at).toLocaleDateString('zh-CN') : '-'}
            </div>
          </div>

          {/* 个人资料区域 */}
          <div className="flex-1">
            {isEditing ? (
              // 编辑模式
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* 用户名输入 */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: 'var(--font-hand-heading)',
                      fontSize: '1.1rem',
                      color: 'var(--sketch-text)',
                      marginBottom: '8px',
                      transform: 'rotate(-0.5deg)'
                    }}
                  >
                    <User className="w-5 h-5" />
                    昵称
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontFamily: 'var(--font-hand)',
                      fontSize: '1rem',
                      border: '3px solid var(--sketch-border)',
                      borderRadius: 'var(--wobbly-sm)',
                      backgroundColor: '#fffde7',
                      outline: 'none',
                      transform: 'rotate(0.5deg)'
                    }}
                    placeholder="给自己起个酷酷的昵称吧"
                  />
                </div>

                {/* 个人简介输入 */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: 'var(--font-hand-heading)',
                      fontSize: '1.1rem',
                      color: 'var(--sketch-text)',
                      marginBottom: '8px',
                      transform: 'rotate(-0.5deg)'
                    }}
                  >
                    <FileText className="w-5 h-5" />
                    个人简介
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    style={{
                      width: '100%',
                      height: '120px',
                      padding: '12px 16px',
                      fontFamily: 'var(--font-hand)',
                      fontSize: '1rem',
                      border: '3px solid var(--sketch-border)',
                      borderRadius: 'var(--wobbly-sm)',
                      backgroundColor: '#fffde7',
                      outline: 'none',
                      resize: 'none',
                      transform: 'rotate(-0.5deg)',
                      lineHeight: '1.6'
                    }}
                    placeholder="写点什么介绍自己吧..."
                    maxLength={500}
                  />
                  <div
                    style={{
                      textAlign: 'right',
                      fontFamily: 'var(--font-hand)',
                      fontSize: '0.85rem',
                      color: '#666',
                      marginTop: '4px',
                      transform: 'rotate(0.5deg)'
                    }}
                  >
                    {editForm.bio.length}/500
                  </div>
                </div>

                {/* 按钮组 */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                      padding: '10px 24px',
                      fontFamily: 'var(--font-hand-heading)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      backgroundColor: '#a5d6a7',
                      border: '3px solid var(--sketch-border)',
                      borderRadius: 'var(--wobbly-sm)',
                      boxShadow: 'var(--shadow-soft)',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      opacity: isSaving ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#2e7d32',
                      transform: 'rotate(-1deg)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSaving) {
                        e.currentTarget.style.transform = 'rotate(-1deg) scale(1.05)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-hard)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'rotate(-1deg)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                    }}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        保存
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    style={{
                      padding: '10px 24px',
                      fontFamily: 'var(--font-hand-heading)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      backgroundColor: '#ffcdd2',
                      border: '3px solid var(--sketch-border)',
                      borderRadius: 'var(--wobbly-sm)',
                      boxShadow: 'var(--shadow-soft)',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      opacity: isSaving ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#c62828',
                      transform: 'rotate(1deg)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSaving) {
                        e.currentTarget.style.transform = 'rotate(1deg) scale(1.05)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-hard)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'rotate(1deg)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                    }}
                  >
                    <X className="w-4 h-4" />
                    取消
                  </button>
                </div>
              </div>
            ) : (
              // 查看模式
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* 用户名展示 */}
                <div
                  style={{
                    padding: '16px 20px',
                    backgroundColor: '#fff9c4',
                    border: '3px solid var(--sketch-border)',
                    borderRadius: 'var(--wobbly-sm)',
                    transform: 'rotate(-1deg)',
                    boxShadow: 'var(--shadow-soft)'
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: 'var(--font-hand-heading)',
                      fontSize: '0.95rem',
                      color: '#666',
                      marginBottom: '6px'
                    }}
                  >
                    <User className="w-4 h-4" />
                    昵称
                  </label>
                  <p
                    style={{
                      fontFamily: 'var(--font-hand-heading)',
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      color: 'var(--sketch-text)'
                    }}
                  >
                    {userInfo?.username || '未设置昵称'}
                  </p>
                </div>

                {/* 邮箱展示 - 只读 */}
                <div
                  style={{
                    padding: '16px 20px',
                    backgroundColor: '#e8f5e9',
                    border: '3px solid var(--sketch-border)',
                    borderRadius: 'var(--wobbly-sm)',
                    transform: 'rotate(0.5deg)',
                    boxShadow: 'var(--shadow-soft)',
                    opacity: 0.9
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: 'var(--font-hand-heading)',
                      fontSize: '0.95rem',
                      color: '#666',
                      marginBottom: '6px'
                    }}
                  >
                    ✉️ 邮箱
                  </label>
                  <p
                    style={{
                      fontFamily: 'var(--font-hand)',
                      fontSize: '1.1rem',
                      color: '#555'
                    }}
                  >
                    {userInfo?.email || '未设置邮箱'}
                  </p>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: '#999',
                      marginTop: '4px',
                      fontFamily: 'var(--font-hand)'
                    }}
                  >
                    * 邮箱不可修改
                  </p>
                </div>

                {/* 个人简介展示 */}
                <div
                  style={{
                    padding: '20px',
                    backgroundColor: '#f3e5f5',
                    border: '3px solid var(--sketch-border)',
                    borderRadius: 'var(--wobbly-sm)',
                    transform: 'rotate(-0.5deg)',
                    boxShadow: 'var(--shadow-soft)',
                    minHeight: '120px'
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: 'var(--font-hand-heading)',
                      fontSize: '0.95rem',
                      color: '#666',
                      marginBottom: '10px'
                    }}
                  >
                    <FileText className="w-4 h-4" />
                    个人简介
                  </label>
                  <p
                    style={{
                      fontFamily: 'var(--font-hand)',
                      fontSize: '1.05rem',
                      color: 'var(--sketch-text)',
                      lineHeight: '1.7',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {userInfo?.bio || '✨ 还没有填写个人简介，点击"修改信息"来介绍一下自己吧！'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 装饰元素 */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '30px',
          fontSize: '3rem',
          opacity: 0.15,
          transform: 'rotate(15deg)',
          pointerEvents: 'none'
        }}
      >
        📝
      </div>
    </div>
  );
};

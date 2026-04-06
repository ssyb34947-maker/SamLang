import React from 'react';
import { Camera, Calendar } from 'lucide-react';
import { STYLES } from '../constants';
import type { UserInfo } from '../types';

interface AvatarSectionProps {
  userInfo: UserInfo | null;
  isUploadingAvatar: boolean;
  getAvatarUrl: (avatarPath?: string) => string | null;
  onAvatarClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const AvatarSection: React.FC<AvatarSectionProps> = ({
  userInfo,
  isUploadingAvatar,
  getAvatarUrl,
  onAvatarClick,
  onFileChange,
  fileInputRef,
}) => {
  const avatarUrl = getAvatarUrl(userInfo?.avatar);

  return (
    <div className="flex flex-col items-center">
      {/* 头像 */}
      <div
        style={{
          ...STYLES.AVATAR,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userInfo?.username}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span
            style={{
              fontSize: '3.5rem',
              fontWeight: 700,
              color: 'white',
              fontFamily: 'var(--font-hand-heading)',
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
              justifyContent: 'center',
            }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          </div>
        )}
      </div>

      {/* 更换头像按钮 */}
      <button
        onClick={onAvatarClick}
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
          gap: '6px',
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
        onChange={onFileChange}
        style={{ display: 'none' }}
      />

      {/* 注册时间 */}
      <div
        style={{
          marginTop: '1.5rem',
          padding: '8px 16px',
          ...STYLES.DISPLAY_CARD.blue,
          borderRadius: 'var(--wobbly-sm)',
          fontFamily: 'var(--font-hand)',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transform: 'rotate(-1deg)',
        }}
      >
        <Calendar className="w-4 h-4" />
        注册于 {userInfo?.created_at ? new Date(userInfo.created_at).toLocaleDateString('zh-CN') : '-'}
      </div>
    </div>
  );
};

export default AvatarSection;

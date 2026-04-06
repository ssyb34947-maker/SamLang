import React from 'react';
import { usePersonalInfo } from './usePersonalInfo';
import { ProfileCard, AvatarSection, EditForm, InfoDisplay } from './components';
import type { UserInfo, EditForm as EditFormType } from './types';

export const PersonalInfo: React.FC = () => {
  const {
    userInfo,
    isEditing,
    isLoading,
    isSaving,
    isUploadingAvatar,
    error,
    editForm,
    handleEdit,
    handleCancel,
    handleSave,
    handleChange,
    handleAvatarClick,
    handleFileChange,
    getAvatarUrl,
    fileInputRef,
  } = usePersonalInfo();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  return (
    <ProfileCard isEditing={isEditing} error={error} onEdit={handleEdit}>
      <div className="flex flex-col md:flex-row gap-8">
        {/* 头像区域 */}
        <AvatarSection
          userInfo={userInfo}
          isUploadingAvatar={isUploadingAvatar}
          getAvatarUrl={getAvatarUrl}
          onAvatarClick={handleAvatarClick}
          onFileChange={handleFileSelect}
          fileInputRef={fileInputRef}
        />

        {/* 个人资料区域 */}
        <div className="flex-1">
          {isEditing ? (
            <EditForm
              form={editForm}
              isSaving={isSaving}
              onChange={handleChange}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <InfoDisplay userInfo={userInfo} />
          )}
        </div>
      </div>
    </ProfileCard>
  );
};

export default PersonalInfo;
export type { UserInfo, EditFormType };

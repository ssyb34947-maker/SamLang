import { useState, useEffect, useRef, useCallback } from 'react';
import { apiService } from '../../../services/api';
import type { UserInfo, EditForm } from './types';
import { UPLOAD_CONFIG, ERROR_MESSAGES } from './constants';

export const usePersonalInfo = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editForm, setEditForm] = useState<EditForm>({
    username: '',
    bio: '',
  });

  // 获取用户信息
  const fetchUserInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getCurrentUser();
      setUserInfo(data);
      setEditForm({
        username: data.username || '',
        bio: data.bio || '',
      });
    } catch (err: any) {
      setError(err.message || ERROR_MESSAGES.FETCH_FAILED);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // 进入编辑模式
  const handleEdit = useCallback(() => {
    if (userInfo) {
      setEditForm({
        username: userInfo.username || '',
        bio: userInfo.bio || '',
      });
    }
    setIsEditing(true);
  }, [userInfo]);

  // 取消编辑
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setError(null);
  }, []);

  // 保存修改
  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);

      const updatedUser = await apiService.updateCurrentUser({
        username: editForm.username,
        bio: editForm.bio,
      });

      setUserInfo(updatedUser);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || ERROR_MESSAGES.SAVE_FAILED);
    } finally {
      setIsSaving(false);
    }
  }, [editForm]);

  // 处理表单变化
  const handleChange = useCallback((field: keyof EditForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // 点击更换头像按钮
  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 处理文件选择
  const handleFileChange = useCallback(async (file: File) => {
    // 验证文件类型
    if (!UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      setError(ERROR_MESSAGES.INVALID_FILE_TYPE);
      return;
    }

    // 验证文件大小
    if (file.size > UPLOAD_CONFIG.MAX_SIZE) {
      setError(ERROR_MESSAGES.FILE_TOO_LARGE);
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setError(null);

      const updatedUser = await apiService.uploadAvatar(file);
      setUserInfo(updatedUser);
    } catch (err: any) {
      setError(err.message || ERROR_MESSAGES.UPLOAD_FAILED);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  // 构建完整的头像 URL
  const getAvatarUrl = useCallback((avatarPath?: string): string | null => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${API_BASE_URL}${avatarPath}`;
  }, []);

  return {
    userInfo,
    isEditing,
    isLoading,
    isSaving,
    isUploadingAvatar,
    error,
    editForm,
    setIsEditing,
    setEditForm,
    fetchUserInfo,
    handleEdit,
    handleCancel,
    handleSave,
    handleChange,
    handleAvatarClick,
    handleFileChange,
    getAvatarUrl,
    fileInputRef,
  };
};

export default usePersonalInfo;

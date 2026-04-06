export interface UserInfo {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  is_active: boolean;
  created_at: string;
}

export interface EditForm {
  username: string;
  bio: string;
}

export interface UsePersonalInfoReturn {
  userInfo: UserInfo | null;
  isEditing: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isUploadingAvatar: boolean;
  error: string | null;
  editForm: EditForm;
  setIsEditing: (value: boolean) => void;
  setEditForm: (form: EditForm) => void;
  fetchUserInfo: () => Promise<void>;
  handleEdit: () => void;
  handleCancel: () => void;
  handleSave: () => Promise<void>;
  handleChange: (field: keyof EditForm, value: string) => void;
  handleAvatarClick: () => void;
  handleFileChange: (file: File) => Promise<void>;
  getAvatarUrl: (avatarPath?: string) => string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

import React from 'react';
import { User, FileText, Save, X, Users, Hash } from 'lucide-react';
import { STYLES, UPLOAD_CONFIG } from '../constants';
import type { EditForm as EditFormType } from '../types';

interface EditFormProps {
  form: EditFormType;
  isSaving: boolean;
  onChange: (field: keyof EditFormType, value: string | number) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const EditForm: React.FC<EditFormProps> = ({
  form,
  isSaving,
  onChange,
  onSave,
  onCancel,
}) => {
  const inputStyle = {
    ...STYLES.INPUT,
    transform: 'rotate(0.5deg)',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'var(--font-hand-heading)',
    fontSize: '1.1rem',
    color: 'var(--sketch-text)',
    marginBottom: '8px',
    transform: 'rotate(-0.5deg)',
  };

  const buttonBaseStyle = {
    padding: '10px 24px',
    fontFamily: 'var(--font-hand-heading)',
    fontSize: '1rem',
    fontWeight: 600,
    border: '3px solid var(--sketch-border)',
    borderRadius: 'var(--wobbly-sm)',
    boxShadow: 'var(--shadow-soft)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 用户名输入 */}
      <div>
        <label style={labelStyle}>
          <User className="w-5 h-5" />
          昵称
        </label>
        <input
          type="text"
          value={form.username}
          onChange={(e) => onChange('username', e.target.value)}
          style={inputStyle}
          placeholder="给自己起个酷酷的昵称吧"
        />
      </div>

      {/* 性别选择 */}
      <div>
        <label style={labelStyle}>
          <Users className="w-5 h-5" />
          性别
        </label>
        <div style={{ display: 'flex', gap: '1rem', transform: 'rotate(0.5deg)' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: form.gender === '男' ? '#e3f2fd' : '#f5f5f5',
              border: `3px solid ${form.gender === '男' ? '#2196f3' : 'var(--sketch-border)'}`,
              borderRadius: 'var(--wobbly-sm)',
              cursor: 'pointer',
              fontFamily: 'var(--font-hand)',
              fontSize: '1rem',
              transform: 'rotate(-1deg)',
            }}
          >
            <input
              type="radio"
              name="gender"
              value="男"
              checked={form.gender === '男'}
              onChange={(e) => onChange('gender', e.target.value)}
              style={{ display: 'none' }}
            />
            👦 男
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: form.gender === '女' ? '#fce4ec' : '#f5f5f5',
              border: `3px solid ${form.gender === '女' ? '#e91e63' : 'var(--sketch-border)'}`,
              borderRadius: 'var(--wobbly-sm)',
              cursor: 'pointer',
              fontFamily: 'var(--font-hand)',
              fontSize: '1rem',
              transform: 'rotate(1deg)',
            }}
          >
            <input
              type="radio"
              name="gender"
              value="女"
              checked={form.gender === '女'}
              onChange={(e) => onChange('gender', e.target.value)}
              style={{ display: 'none' }}
            />
            👧 女
          </label>
        </div>
      </div>

      {/* 年级输入 */}
      <div>
        <label style={labelStyle}>
          <Hash className="w-5 h-5" />
          年级
        </label>
        <input
          type="number"
          value={form.age}
          onChange={(e) => onChange('age', e.target.value === '' ? '' : parseInt(e.target.value))}
          style={{
            ...inputStyle,
            width: '120px',
          }}
          placeholder="如: 7"
          min={1}
          max={100}
        />
      </div>

      {/* 个人简介输入 */}
      <div>
        <label style={labelStyle}>
          <FileText className="w-5 h-5" />
          个人简介
        </label>
        <textarea
          value={form.bio}
          onChange={(e) => onChange('bio', e.target.value)}
          style={{
            ...inputStyle,
            height: '120px',
            resize: 'none',
            lineHeight: '1.6',
          }}
          placeholder="写点什么介绍自己吧..."
          maxLength={UPLOAD_CONFIG.MAX_BIO_LENGTH}
        />
        <div
          style={{
            textAlign: 'right',
            fontFamily: 'var(--font-hand)',
            fontSize: '0.85rem',
            color: '#666',
            marginTop: '4px',
            transform: 'rotate(0.5deg)',
          }}
        >
          {form.bio.length}/{UPLOAD_CONFIG.MAX_BIO_LENGTH}
        </div>
      </div>

      {/* 按钮组 */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        <button
          onClick={onSave}
          disabled={isSaving}
          style={{
            ...buttonBaseStyle,
            ...STYLES.BUTTON.primary,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.7 : 1,
            transform: 'rotate(-1deg)',
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
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
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
          onClick={onCancel}
          disabled={isSaving}
          style={{
            ...buttonBaseStyle,
            ...STYLES.BUTTON.secondary,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.7 : 1,
            transform: 'rotate(1deg)',
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
  );
};

export default EditForm;

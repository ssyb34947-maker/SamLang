import React from 'react';

/**
 * 学习偏好组件
 * 设置系统提示词、学习目标和学习风格
 */
export const StudyPreferences: React.FC = () => {
  return (
    <div className="pixel-border p-6">
      <h2 className="text-xl font-bold mb-6 text-cyan-400 neon-text-primary">个人学习偏好</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-gray-400 mb-2">系统提示词</label>
          <textarea
            className="pixel-input w-full h-48"
            placeholder="请输入系统提示词，指导AI如何与您交互"
            defaultValue="你是一个专业的学习助手，帮助用户解决学习中遇到的问题，提供详细的解答和建议。"
          ></textarea>
        </div>
        <div>
          <label className="block text-gray-400 mb-2">学习目标</label>
          <input
            type="text"
            className="pixel-input w-full"
            placeholder="请输入您的学习目标"
            defaultValue="成为前端开发专家"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">学习风格</label>
          <select className="pixel-input w-full">
            <option>视觉型学习者</option>
            <option>听觉型学习者</option>
            <option>动手型学习者</option>
            <option>综合型学习者</option>
          </select>
        </div>
        <button className="pixel-btn">
          保存偏好
        </button>
      </div>
    </div>
  );
};

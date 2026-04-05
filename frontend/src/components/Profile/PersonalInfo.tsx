import React from 'react';

/**
 * 个人信息组件
 * 显示和编辑用户的基本信息
 */
export const PersonalInfo: React.FC = () => {
  return (
    <div className="pixel-border p-6">
      <h2 className="text-xl font-bold mb-6 text-cyan-400 neon-text-primary">个人信息</h2>
      <div className="flex flex-col md:flex-row gap-8">
        {/* 头像 */}
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-pink-500 flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-white">S</span>
          </div>
          <button className="pixel-btn mt-2">
            更换头像
          </button>
        </div>
        {/* 个人资料 */}
        <div className="flex-1">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-2">用户名</label>
                <input
                  type="text"
                  className="pixel-input w-full"
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">邮箱</label>
                <input
                  type="email"
                  className="pixel-input w-full"
                  placeholder="请输入邮箱"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 mb-2">个人简介</label>
              <textarea
                className="pixel-input w-full h-32"
                placeholder="请输入个人简介"
              ></textarea>
            </div>
            <button className="pixel-btn">
              保存修改
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

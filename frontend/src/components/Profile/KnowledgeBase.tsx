import React from 'react';

/**
 * 知识库管理组件
 * 文件上传和已上传资料管理
 */
export const KnowledgeBase: React.FC = () => {
  const files = [
    { id: 1, name: '学习资料 #1' },
    { id: 2, name: '学习资料 #2' },
    { id: 3, name: '学习资料 #3' },
  ];

  return (
    <div className="pixel-border p-6">
      <h2 className="text-xl font-bold mb-6 text-cyan-400 neon-text-primary">知识库管理</h2>
      <div className="space-y-6">
        {/* 上传区域 */}
        <div className="border-2 border-dashed border-cyan-400 p-8 text-center">
          <p className="text-gray-400 mb-4">点击或拖拽文件到此处上传</p>
          <button className="pixel-btn">
            选择文件
          </button>
          <p className="text-gray-500 text-sm mt-2">支持PDF、Word、Excel等格式</p>
        </div>
        {/* 已上传文件 */}
        <div>
          <h3 className="font-bold text-white mb-3">已上传资料</h3>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex justify-between items-center border border-cyan-400 p-3 bg-black bg-opacity-50">
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400">📄</span>
                  <span className="text-white">{file.name}</span>
                </div>
                <div className="flex gap-2">
                  <button className="text-cyan-400 hover:text-pink-500">查看</button>
                  <button className="text-red-400 hover:text-red-500">删除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

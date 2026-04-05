import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PersonalInfo } from './PersonalInfo';
import { StudyRecords } from './StudyRecords';
import { StudyPreferences } from './StudyPreferences';
import { AgentCLI } from './AgentCLI';
import { KnowledgeBase } from './KnowledgeBase';

/**
 * 个人主页组件
 * SamLang Studio - 包含个人信息、学习记录、学习偏好、助教Agent和知识库管理
 */
export const Profile: React.FC = () => {
  // 当前选中的导航项
  const [activeTab, setActiveTab] = useState('info');
  const navigate = useNavigate();

  // 导航项配置
  const tabs = [
    { id: 'info', label: '个人信息' },
    { id: 'records', label: '学习记录' },
    { id: 'preferences', label: '学习偏好' },
    { id: 'agent', label: '助教Agent' },
    { id: 'knowledge', label: '知识库管理' }
  ];

  // 渲染当前选中的内容
  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return <PersonalInfo />;
      case 'records':
        return <StudyRecords />;
      case 'preferences':
        return <StudyPreferences />;
      case 'agent':
        return <AgentCLI />;
      case 'knowledge':
        return <KnowledgeBase />;
      default:
        return <PersonalInfo />;
    }
  };

  return (
    <div className="min-h-screen pixel-container">
      {/* 顶部导航栏 - 包含logo和五个选项 */}
      <div className="pixel-header">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* 返回按钮 */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 flex items-center justify-center pixel-border bg-pink-500 hover:bg-pink-600 transition-colors"
                title="返回"
              >
                <span className="text-white font-bold text-lg">←</span>
              </button>
              {/* 标题 */}
              <h1 className="text-2xl font-bold text-white neon-text-primary">
                SamLang Studio
              </h1>
            </div>

            {/* 功能导航栏 */}
            <div className="flex space-x-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-2 py-1 text-lg font-bold transition-all duration-200 ${activeTab === tab.id
                      ? 'text-cyan-400 neon-text-primary'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {tab.label}
                  {/* 下划线动画 */}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-1 transition-all duration-300 ease-in-out ${activeTab === tab.id
                        ? 'bg-pink-500 scale-x-100'
                        : 'bg-cyan-400 scale-x-0'
                      }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="container mx-auto px-4 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PersonalInfo } from './PersonalInfo';
import { StudyRecords } from './StudyRecords';
import { StudyPreferences } from './StudyPreferences';
import { AgentCLI } from './AgentCLI';
import { KnowledgeBase } from './KnowledgeBase';
import { ArrowLeft } from 'lucide-react';

/**
 * 个人主页组件 - 手绘草稿本风格
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
    <div 
      className="min-h-screen"
      style={{ backgroundColor: 'var(--sketch-bg)' }}
    >
      {/* 顶部导航栏 - 手绘风格 */}
      <div 
        style={{ 
          backgroundColor: 'white',
          borderBottom: '3px solid var(--sketch-border)',
          boxShadow: 'var(--shadow-hard)'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* 返回按钮和标题 */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="sketch-btn"
                style={{ padding: '8px 12px' }}
                title="返回"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 
                className="text-2xl"
                style={{ fontFamily: 'var(--font-hand-heading)', fontWeight: 700, color: 'var(--sketch-text)' }}
              >
                SamLang Studio
              </h1>
            </div>

            {/* 功能导航栏 */}
            <div className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative px-4 py-2 transition-all duration-200"
                  style={{
                    fontFamily: 'var(--font-hand-heading)',
                    fontWeight: activeTab === tab.id ? 700 : 400,
                    color: activeTab === tab.id ? 'var(--sketch-text)' : 'var(--sketch-pencil)',
                    backgroundColor: activeTab === tab.id ? 'var(--sketch-paper)' : 'transparent',
                    border: activeTab === tab.id ? '3px solid var(--sketch-border)' : '2px solid transparent',
                    borderRadius: 'var(--wobbly-sm)',
                    boxShadow: activeTab === tab.id ? 'var(--shadow-hard)' : 'none',
                    transform: activeTab === tab.id ? 'rotate(-1deg)' : 'none'
                  }}
                >
                  {tab.label}
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

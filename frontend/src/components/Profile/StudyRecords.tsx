import React from 'react';

/**
 * 学习记录组件
 * 显示用户的学习历史记录
 */
export const StudyRecords: React.FC = () => {
  const records = [
    {
      id: 1,
      title: '学习记录 #1',
      date: '2026-04-01',
      content: '今天学习了React hooks的使用，包括useState、useEffect和useContext等核心概念。'
    },
    {
      id: 2,
      title: '学习记录 #2',
      date: '2026-04-02',
      content: '完成了TypeScript基础语法的学习，了解了类型系统和接口定义。'
    },
    {
      id: 3,
      title: '学习记录 #3',
      date: '2026-04-03',
      content: '学习了如何使用Tailwind CSS进行响应式设计。'
    },
    {
      id: 4,
      title: '学习记录 #4',
      date: '2026-04-04',
      content: '实践了React组件的封装和复用。'
    },
    {
      id: 5,
      title: '学习记录 #5',
      date: '2026-04-05',
      content: '学习了如何优化React应用的性能。'
    }
  ];

  return (
    <div className="pixel-border p-6">
      <h2 className="text-xl font-bold mb-6 text-cyan-400 neon-text-primary">学习记录库</h2>
      <div className="space-y-4">
        {records.map((record) => (
          <div key={record.id} className="border border-cyan-400 p-4 bg-black bg-opacity-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-white">{record.title}</h3>
              <span className="text-gray-400 text-sm">{record.date}</span>
            </div>
            <p className="text-gray-300 mb-2">{record.content}</p>
            <button className="text-cyan-400 hover:text-pink-500 text-sm">
              查看详情
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

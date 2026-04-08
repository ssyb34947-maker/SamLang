/**
 * 管理员仪表盘页面
 */

import { useState } from 'react';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { STAT_CARDS } from './constants';
import {
  useUserStatsOverview,
  useUserTrend,
  useUserPersonaRadar,
  useGeoDistribution,
} from './hooks/useAdminStats';
import StatCard from './components/StatCard';
import UserTrendChart from './components/UserTrendChart';
import TokenConsumptionChart from './components/TokenConsumptionChart';
import UserPersonaRadar from './components/UserPersonaRadar';
import ChinaMap from './components/ChinaMapECharts';
import AIAssistant from './components/AIAssistant';

const AdminDashboard: React.FC = () => {
  const [aiOpen, setAiOpen] = useState(true);
  const [trendDays, setTrendDays] = useState(30);
  const [tokenDays, setTokenDays] = useState(30);

  const { data: overview } = useUserStatsOverview();
  const { data: trend } = useUserTrend(trendDays);
  const { data: personaData } = useUserPersonaRadar();
  const { data: geoData } = useGeoDistribution();

  const handleLogout = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_info');
    window.location.href = '/admin/login';
  };

  return (
    <div style={{ backgroundColor: 'var(--sketch-bg)', minHeight: '100vh' }}>
      {/* AI助手侧边栏 */}
      <AIAssistant isOpen={aiOpen} onToggle={() => setAiOpen(!aiOpen)} />

      {/* 主内容区域 */}
      <div
        className="transition-all duration-300"
        style={{
          marginLeft: aiOpen ? 320 : 0,
          padding: 24,
        }}
      >
        {/* 顶部导航 */}
        <header
          className="flex items-center justify-between mb-6 p-4"
          style={{
            backgroundColor: 'white',
            border: '3px solid var(--sketch-border)',
            borderRadius: 'var(--wobbly)',
            boxShadow: 'var(--shadow-hard)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center"
              style={{
                backgroundColor: 'var(--sketch-secondary)',
                border: '3px solid var(--sketch-border)',
                borderRadius: 'var(--wobbly-sm)',
                transform: 'rotate(-3deg)',
              }}
            >
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-hand-heading)',
                fontWeight: 700,
                fontSize: 20,
                color: 'var(--sketch-text)',
              }}
            >
              管理员控制台
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 transition-all hover:opacity-80"
              style={{
                fontFamily: 'var(--font-hand-body)',
                backgroundColor: 'var(--sketch-accent)',
                color: 'white',
                border: '2px solid var(--sketch-border)',
                borderRadius: 'var(--wobbly-sm)',
              }}
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        </header>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {overview &&
            STAT_CARDS.map((card) => (
              <StatCard
                key={card.key}
                config={card}
                value={overview[card.key as keyof typeof overview]}
                trend={Math.floor(Math.random() * 20) - 10}
              />
            ))}
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 用户趋势 */}
          <UserTrendChart
            data={trend}
            days={trendDays}
            onDaysChange={setTrendDays}
          />

          {/* Token消耗统计 */}
          <TokenConsumptionChart
            data={{
              dates: trend?.dates || [],
              inputTokens: trend?.newUsers.map(v => v * 150) || [],
              outputTokens: trend?.newUsers.map(v => v * 80) || [],
              totalTokens: trend?.newUsers.map(v => v * 230) || [],
            }}
            days={tokenDays}
            onDaysChange={setTokenDays}
          />

          {/* 用户画像雷达图 */}
          <UserPersonaRadar data={personaData} />

          {/* 中国地图 */}
          <ChinaMap data={geoData} />
        </div>

        {/* 流量控制面板占位 */}
        <div
          className="mt-6 p-5"
          style={{
            backgroundColor: 'white',
            border: '3px solid var(--sketch-border)',
            borderRadius: 'var(--wobbly)',
            boxShadow: 'var(--shadow-hard)',
          }}
        >
          <h3
            className="mb-4"
            style={{
              fontFamily: 'var(--font-hand-heading)',
              fontWeight: 700,
              color: 'var(--sketch-text)',
            }}
          >
            系统流量监控
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['当前QPS', '平均响应时间', '总请求数', '错误率', '入带宽', '出带宽'].map(
              (label) => (
                <div
                  key={label}
                  className="p-4 text-center"
                  style={{
                    backgroundColor: 'var(--sketch-paper)',
                    border: '2px solid var(--sketch-border)',
                    borderRadius: 'var(--wobbly-sm)',
                  }}
                >
                  <p
                    className="text-xs mb-1"
                    style={{
                      fontFamily: 'var(--font-hand-body)',
                      color: 'var(--sketch-pencil)',
                    }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-xl font-bold"
                    style={{
                      fontFamily: 'var(--font-hand-heading)',
                      color: 'var(--sketch-text)',
                    }}
                  >
                    --
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

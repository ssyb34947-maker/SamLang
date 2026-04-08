/**
 * 用户画像雷达图组件
 */

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Target } from 'lucide-react';
import { RADAR_DIMENSIONS } from '../constants';

interface RadarData {
  dimensions: string[];
  averages: number[];
  topUsers: number[];
}

interface UserPersonaRadarProps {
  data: RadarData | null;
}

const UserPersonaRadar: React.FC<UserPersonaRadarProps> = ({ data }) => {
  if (!data) return null;

  // 构建雷达图数据
  const radarData = data.dimensions.map((dimension, index) => ({
    dimension,
    平均值: data.averages[index],
    高价值用户: data.topUsers[index],
    fullMark: 100,
  }));

  return (
    <div
      className="p-5"
      style={{
        backgroundColor: 'white',
        border: '3px solid var(--sketch-border)',
        borderRadius: 'var(--wobbly)',
        boxShadow: 'var(--shadow-hard)',
      }}
    >
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5" style={{ color: '#BD10E0' }} />
        <h3
          style={{
            fontFamily: 'var(--font-hand-heading)',
            fontWeight: 700,
            color: 'var(--sketch-text)',
          }}
        >
          用户画像分析
        </h3>
      </div>

      {/* 图表 */}
      <div style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="55%" outerRadius="90%" data={radarData}>
            <PolarGrid stroke="#e0e0e0" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{
                fontSize: 11,
                fontFamily: 'var(--font-hand-body)',
                fill: 'var(--sketch-text)',
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{
                fontSize: 10,
                fontFamily: 'var(--font-hand-body)',
                fill: 'var(--sketch-pencil)',
              }}
            />
            <Radar
              name="平台平均值"
              dataKey="平均值"
              stroke="#4A90E2"
              fill="#4A90E2"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="高价值用户"
              dataKey="高价值用户"
              stroke="#F5A623"
              fill="#F5A623"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Legend
              wrapperStyle={{
                fontFamily: 'var(--font-hand-body)',
                fontSize: 12,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '2px solid var(--sketch-border)',
                borderRadius: 'var(--wobbly-sm)',
                fontFamily: 'var(--font-hand-body)',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 说明 */}
      <div className="mt-3 text-center">
        <p
          className="text-xs"
          style={{
            fontFamily: 'var(--font-hand-body)',
            color: 'var(--sketch-pencil)',
          }}
        >
          基于用户学习行为数据分析
        </p>
      </div>
    </div>
  );
};

export default UserPersonaRadar;

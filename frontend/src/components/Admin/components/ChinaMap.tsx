/**
 * 中国地图热力图组件
 */

import { useState, useMemo } from 'react';
import { MapPin, Users } from 'lucide-react';
import type { GeoDistribution } from '../types';

interface ChinaMapProps {
  data: GeoDistribution | null;
}

// 省份颜色映射
const getColorByValue = (value: number, max: number): string => {
  const ratio = value / max;
  if (ratio > 0.8) return '#D0021B';
  if (ratio > 0.6) return '#F5A623';
  if (ratio > 0.4) return '#7ED321';
  if (ratio > 0.2) return '#4A90E2';
  return '#B8B8B8';
};

// 简化版省份数据（位置用网格表示）
const PROVINCE_GRID: Record<string, { row: number; col: number; name: string }> = {
  '黑龙江': { row: 0, col: 4, name: '黑龙江' },
  '吉林': { row: 1, col: 4, name: '吉林' },
  '辽宁': { row: 2, col: 4, name: '辽宁' },
  '内蒙古': { row: 1, col: 2, name: '内蒙古' },
  '北京': { row: 2, col: 3, name: '北京' },
  '天津': { row: 2, col: 3, name: '天津' },
  '河北': { row: 3, col: 3, name: '河北' },
  '山西': { row: 3, col: 2, name: '山西' },
  '山东': { row: 3, col: 4, name: '山东' },
  '河南': { row: 4, col: 3, name: '河南' },
  '陕西': { row: 4, col: 2, name: '陕西' },
  '宁夏': { row: 3, col: 1, name: '宁夏' },
  '甘肃': { row: 3, col: 0, name: '甘肃' },
  '青海': { row: 4, col: 0, name: '青海' },
  '新疆': { row: 2, col: 0, name: '新疆' },
  '西藏': { row: 5, col: 0, name: '西藏' },
  '四川': { row: 5, col: 1, name: '四川' },
  '重庆': { row: 5, col: 2, name: '重庆' },
  '湖北': { row: 5, col: 3, name: '湖北' },
  '安徽': { row: 4, col: 4, name: '安徽' },
  '江苏': { row: 4, col: 5, name: '江苏' },
  '上海': { row: 4, col: 5, name: '上海' },
  '浙江': { row: 5, col: 5, name: '浙江' },
  '湖南': { row: 6, col: 3, name: '湖南' },
  '江西': { row: 6, col: 4, name: '江西' },
  '福建': { row: 6, col: 5, name: '福建' },
  '贵州': { row: 6, col: 2, name: '贵州' },
  '云南': { row: 7, col: 1, name: '云南' },
  '广西': { row: 7, col: 3, name: '广西' },
  '广东': { row: 7, col: 4, name: '广东' },
  '海南': { row: 8, col: 4, name: '海南' },
  '台湾': { row: 7, col: 6, name: '台湾' },
};

const ChinaMap: React.FC<ChinaMapProps> = ({ data }) => {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  const { maxValue, provinceData, topProvinces } = useMemo(() => {
    if (!data) return { maxValue: 0, provinceData: {}, topProvinces: [] };

    const pdata: Record<string, number> = {};
    data.provinces.forEach((p) => {
      pdata[p.name] = p.value;
    });

    const max = Math.max(...data.provinces.map((p) => p.value), 1);
    const top = [...data.provinces]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return { maxValue: max, provinceData: pdata, topProvinces: top };
  }, [data]);

  if (!data) return null;

  // 构建网格
  const grid: (JSX.Element | null)[][] = Array(9)
    .fill(null)
    .map(() => Array(7).fill(null));

  Object.entries(PROVINCE_GRID).forEach(([name, pos]) => {
    const value = provinceData[name] || 0;
    const color = getColorByValue(value, maxValue);
    const isSelected = selectedProvince === name;

    grid[pos.row][pos.col] = (
      <button
        key={name}
        onClick={() => setSelectedProvince(name)}
        className="w-full h-full flex flex-col items-center justify-center transition-all hover:scale-110"
        style={{
          backgroundColor: color,
          border: `2px solid ${isSelected ? '#333' : 'transparent'}`,
          borderRadius: 'var(--wobbly-sm)',
          minHeight: 28,
        }}
        title={`${name}: ${value}人`}
      >
        <span
          className="text-[8px] font-bold truncate px-1"
          style={{
            color: value > maxValue * 0.4 ? 'white' : '#333',
            fontFamily: 'var(--font-hand-body)',
          }}
        >
          {name}
        </span>
        {value > 0 && (
          <span
            className="text-[6px]"
            style={{
              color: value > maxValue * 0.4 ? 'rgba(255,255,255,0.8)' : '#666',
            }}
          >
            {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
          </span>
        )}
      </button>
    );
  });

  const selectedData = data.provinces.find((p) => p.name === selectedProvince);

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
        <MapPin className="w-5 h-5" style={{ color: '#50C878' }} />
        <h3
          style={{
            fontFamily: 'var(--font-hand-heading)',
            fontWeight: 700,
            color: 'var(--sketch-text)',
          }}
        >
          用户地理分布
        </h3>
      </div>

      <div className="flex gap-4">
        {/* 地图网格 */}
        <div className="flex-1">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: 'repeat(7, 1fr)',
              gridTemplateRows: 'repeat(9, 1fr)',
            }}
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div key={`${rowIndex}-${colIndex}`} className="aspect-square">
                  {cell || (
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: 'transparent' }}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* 图例 */}
          <div className="flex items-center justify-center gap-4 mt-3">
            {[
              { color: '#D0021B', label: '>80%' },
              { color: '#F5A623', label: '60-80%' },
              { color: '#7ED321', label: '40-60%' },
              { color: '#4A90E2', label: '20-40%' },
              { color: '#B8B8B8', label: '<20%' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <div
                  className="w-3 h-3"
                  style={{
                    backgroundColor: item.color,
                    borderRadius: 2,
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    fontFamily: 'var(--font-hand-body)',
                    color: 'var(--sketch-pencil)',
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 侧边信息 */}
        <div className="w-40">
          {/* TOP5 省份 */}
          <div
            className="p-3 mb-3"
            style={{
              backgroundColor: 'var(--sketch-paper)',
              border: '2px solid var(--sketch-border)',
              borderRadius: 'var(--wobbly-sm)',
            }}
          >
            <h4
              className="text-sm font-bold mb-2"
              style={{
                fontFamily: 'var(--font-hand-heading)',
                color: 'var(--sketch-text)',
              }}
            >
              TOP5 省份
            </h4>
            <div className="space-y-1">
              {topProvinces.map((p, index) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between text-xs"
                  style={{ fontFamily: 'var(--font-hand-body)' }}
                >
                  <span className="flex items-center gap-1">
                    <span
                      className="w-4 h-4 flex items-center justify-center rounded-full text-white text-[8px]"
                      style={{
                        backgroundColor:
                          index === 0
                            ? '#FFD700'
                            : index === 1
                            ? '#C0C0C0'
                            : index === 2
                            ? '#CD7F32'
                            : '#999',
                      }}
                    >
                      {index + 1}
                    </span>
                    {p.name}
                  </span>
                  <span style={{ color: 'var(--sketch-pencil)' }}>
                    {p.value >= 1000
                      ? `${(p.value / 1000).toFixed(1)}k`
                      : p.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 选中省份详情 */}
          {selectedData && (
            <div
              className="p-3"
              style={{
                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                border: '2px solid #4A90E2',
                borderRadius: 'var(--wobbly-sm)',
              }}
            >
              <h4
                className="text-sm font-bold mb-2"
                style={{
                  fontFamily: 'var(--font-hand-heading)',
                  color: '#4A90E2',
                }}
              >
                {selectedData.name}
              </h4>
              <div className="space-y-1">
                <div
                  className="flex items-center justify-between text-xs"
                  style={{ fontFamily: 'var(--font-hand-body)' }}
                >
                  <span style={{ color: 'var(--sketch-pencil)' }}>用户数</span>
                  <span className="font-bold">{selectedData.value}</span>
                </div>
                <div
                  className="flex items-center justify-between text-xs"
                  style={{ fontFamily: 'var(--font-hand-body)' }}
                >
                  <span style={{ color: 'var(--sketch-pencil)' }}>占比</span>
                  <span className="font-bold">
                    {((selectedData.value / maxValue) * 100).toFixed(1)}%
                  </span>
                </div>
                <div
                  className="text-xs mt-2 pt-2 border-t"
                  style={{
                    borderColor: 'rgba(74, 144, 226, 0.3)',
                    fontFamily: 'var(--font-hand-body)',
                    color: 'var(--sketch-pencil)',
                  }}
                >
                  主要城市:
                  <div className="mt-1 space-y-0.5">
                    {selectedData.cities.slice(0, 3).map((city) => (
                      <div
                        key={city.name}
                        className="flex justify-between"
                      >
                        <span>{city.name}</span>
                        <span>{city.value}人</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChinaMap;

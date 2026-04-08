/**
 * 真实中国地图组件 (ECharts)
 * 需要中国地图 GeoJSON 数据
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import { MapPin, Users } from 'lucide-react';
import type { GeoDistribution } from '../types';

interface ChinaMapEChartsProps {
  data: GeoDistribution | null;
}

// 中国地图 GeoJSON URL
const CHINA_MAP_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';

const ChinaMapECharts: React.FC<ChinaMapEChartsProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  // 准备地图数据
  const mapData = useMemo(() => {
    if (!data) return [];
    return data.provinces.map((p) => ({
      name: p.name,
      value: p.value,
      itemStyle: {
        areaColor: getColorByValue(p.value),
      },
    }));
  }, [data]);

  const topProvinces = useMemo(() => {
    if (!data) return [];
    return [...data.provinces].sort((a, b) => b.value - a.value).slice(0, 5);
  }, [data]);

  const maxValue = useMemo(() => {
    if (!data) return 1;
    return Math.max(...data.provinces.map((p) => p.value), 1);
  }, [data]);

  useEffect(() => {
    let isMounted = true;

    const initChart = async () => {
      if (!chartRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        // 动态导入 echarts
        const echarts = await import('echarts');

        if (!isMounted) return;

        // 获取中国地图 GeoJSON
        const response = await fetch(CHINA_MAP_URL);
        if (!response.ok) {
          throw new Error('无法加载地图数据');
        }

        const chinaJson = await response.json();

        if (!isMounted) return;

        // 注册地图
        echarts.registerMap('china', chinaJson);

        // 初始化图表
        const chart = echarts.init(chartRef.current);
        chartInstanceRef.current = chart;

        // 设置配置
        const option = {
          tooltip: {
            trigger: 'item',
            backgroundColor: 'white',
            borderColor: 'var(--sketch-border)',
            borderWidth: 2,
            textStyle: {
              fontFamily: 'var(--font-hand-body)',
              color: 'var(--sketch-text)',
            },
            formatter: (params: any) => {
              if (params.value) {
                return `${params.name}<br/>用户数: ${params.value}`;
              }
              return params.name;
            },
          },

          series: [
            {
              name: '用户分布',
              type: 'map',
              map: 'china',
              roam: true,
              zoom: 1.5,
              label: {
                show: true,
                fontSize: 11,
                fontFamily: 'var(--font-hand-body)',
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 12,
                  fontWeight: 'bold',
                },
                itemStyle: {
                  areaColor: '#F5A623',
                },
              },
              data: mapData,
            },
          ],
        };

        chart.setOption(option);

        // 点击事件
        chart.on('click', (params: any) => {
          setSelectedProvince(params.name);
        });

        // 响应式
        const handleResize = () => {
          chart.resize();
        };
        window.addEventListener('resize', handleResize);

        setIsLoading(false);

        return () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || '地图加载失败');
          setIsLoading(false);
        }
      }
    };

    initChart();

    return () => {
      isMounted = false;
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [mapData, maxValue]);

  // 更新数据
  useEffect(() => {
    if (chartInstanceRef.current && mapData.length > 0) {
      chartInstanceRef.current.setOption({
        series: [
          {
            data: mapData,
          },
        ],
      });
    }
  }, [mapData]);

  const selectedData = data?.provinces.find((p) => p.name === selectedProvince);

  if (!data) return null;

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
        {/* 地图区域 */}
        <div className="flex-1 relative">
          {isLoading && (
            <div
              className="absolute inset-0 flex items-center justify-center z-10"
              style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
            >
              <div className="text-center">
                <div
                  className="w-8 h-8 mx-auto mb-2 border-4 rounded-full animate-spin"
                  style={{
                    borderColor: 'var(--sketch-secondary)',
                    borderTopColor: 'transparent',
                  }}
                />
                <p
                  style={{
                    fontFamily: 'var(--font-hand-body)',
                    color: 'var(--sketch-pencil)',
                  }}
                >
                  加载地图...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div
              className="absolute inset-0 flex items-center justify-center z-10"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
            >
              <div className="text-center p-4">
                <p
                  style={{
                    fontFamily: 'var(--font-hand-body)',
                    color: 'var(--sketch-accent)',
                  }}
                >
                  {error}
                </p>
                <p
                  className="text-xs mt-2"
                  style={{
                    fontFamily: 'var(--font-hand-body)',
                    color: 'var(--sketch-pencil)',
                  }}
                >
                  请检查网络连接
                </p>
              </div>
            </div>
          )}

          <div ref={chartRef} style={{ height: 450, width: '100%' }} />

          {/* 自定义图例 */}
          <div
            className="absolute bottom-4 left-4 p-3"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid var(--sketch-border)',
              borderRadius: 'var(--wobbly-sm)',
              boxShadow: 'var(--shadow-hard)',
            }}
          >
            <p
              className="text-xs font-bold mb-2"
              style={{
                fontFamily: 'var(--font-hand-heading)',
                color: 'var(--sketch-text)',
              }}
            >
              用户数分档
            </p>
            <div className="space-y-1">
              {[
                { color: '#313695', label: '500人以上' },
                { color: '#4575b4', label: '50-500人' },
                { color: '#74add1', label: '10-50人' },
                { color: '#abd9e9', label: '1-10人' },
                { color: '#e0f3f8', label: '0人' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4"
                    style={{
                      backgroundColor: item.color,
                      border: '1px solid var(--sketch-border)',
                      borderRadius: 2,
                    }}
                  />
                  <span
                    className="text-xs"
                    style={{
                      fontFamily: 'var(--font-hand-body)',
                      color: 'var(--sketch-text)',
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 侧边信息 */}
        <div className="w-44">
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
                      <div key={city.name} className="flex justify-between">
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

// 根据数值获取颜色（按绝对值分档）
function getColorByValue(value: number): string {
  if (value >= 500) return '#313695';  // 500人以上 - 深蓝
  if (value >= 50) return '#4575b4';   // 50-500人 - 蓝色
  if (value >= 10) return '#74add1';   // 10-50人 - 浅蓝
  if (value >= 1) return '#abd9e9';    // 1-10人 - 更浅蓝
  return '#e0f3f8';                    // 0人 - 最浅
}

export default ChinaMapECharts;

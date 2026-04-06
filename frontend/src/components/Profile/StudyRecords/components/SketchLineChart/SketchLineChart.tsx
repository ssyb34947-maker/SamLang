// 手绘风格折线图组件 - 带动态动画

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSketchAnimation } from './hooks';
import { calculatePoints, generateSketchPath, generateAreaPath, generateSketchGrid } from './utils';

interface SketchLineChartProps {
  data: number[];
  labels?: string[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
  showGrid?: boolean;
  animationDuration?: number;
  strokeWidth?: number;
  roughness?: number;
}

const PADDING = { top: 20, right: 20, bottom: 30, left: 40 };

export const SketchLineChart: React.FC<SketchLineChartProps> = ({
  data,
  labels,
  width = 400,
  height = 200,
  color = '#ff4d4d',
  showArea = true,
  showGrid = true,
  animationDuration = 2000,
  strokeWidth = 2.5,
  roughness = 1.5,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  const { progress, startAnimation } = useSketchAnimation({
    duration: animationDuration,
    delay: 300,
  });

  const points = useMemo(() => 
    calculatePoints(data, width, height, PADDING),
    [data, width, height]
  );

  const pathD = useMemo(() => 
    generateSketchPath(points, roughness),
    [points, roughness]
  );

  const areaPathD = useMemo(() => {
    if (!showArea) return '';
    const baselineY = height - PADDING.bottom;
    return generateAreaPath(points, baselineY, roughness);
  }, [points, showArea, height, roughness]);

  const gridPaths = useMemo(() => 
    showGrid ? generateSketchGrid(width, height, PADDING, 5) : [],
    [showGrid, width, height]
  );

  useEffect(() => {
    if (svgRef.current && pathD) {
      const pathElement = svgRef.current.querySelector('.sketch-line') as SVGPathElement;
      if (pathElement) {
        const length = pathElement.getTotalLength();
        setPathLength(length);
        setIsReady(true);
        startAnimation();
      }
    }
  }, [pathD, startAnimation]);

  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const yLabels = [maxValue, (maxValue + minValue) / 2, minValue];

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="sketch-line-chart"
      style={{ overflow: 'visible' }}
    >
      {/* 网格线 */}
      {showGrid && gridPaths.map((d, i) => (
        <path
          key={`grid-${i}`}
          d={d}
          fill="none"
          stroke="#e5e0d8"
          strokeWidth={1}
          strokeDasharray="4,4"
          opacity={0.6}
        />
      ))}

      {/* Y轴标签 */}
      {yLabels.map((value, i) => {
        const y = PADDING.top + (i / 2) * (height - PADDING.top - PADDING.bottom);
        return (
          <text
            key={`y-label-${i}`}
            x={PADDING.left - 8}
            y={y + 4}
            textAnchor="end"
            fontSize={10}
            fill="#666"
            style={{ fontFamily: 'var(--font-hand-body)' }}
          >
            {value.toFixed(1)}
          </text>
        );
      })}

      {/* X轴标签 */}
      {labels && points.map((point, i) => {
        if (i % Math.ceil(points.length / 6) !== 0) return null;
        return (
          <text
            key={`x-label-${i}`}
            x={point.x}
            y={height - 8}
            textAnchor="middle"
            fontSize={10}
            fill="#666"
            style={{ fontFamily: 'var(--font-hand-body)' }}
          >
            {labels[i]}
          </text>
        );
      })}

      {/* 填充区域 */}
      {showArea && areaPathD && (
        <path
          d={areaPathD}
          fill={color}
          fillOpacity={0.15}
          style={{
            opacity: progress,
            transition: 'opacity 0.3s ease-out',
          }}
        />
      )}

      {/* 主线条 */}
      <path
        className="sketch-line"
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: isReady ? pathLength * (1 - progress) : pathLength,
          transition: 'stroke-dashoffset 0.1s linear',
          filter: 'url(#sketch-filter)',
        }}
      />

      {/* 数据点 */}
      {isReady && points.map((point, i) => {
        const pointProgress = Math.min(progress * points.length, i + 1) - i;
        if (pointProgress <= 0) return null;
        
        return (
          <g key={`point-${i}`} style={{ opacity: Math.min(pointProgress, 1) }}>
            <circle
              cx={point.x + (Math.random() - 0.5) * 0.5}
              cy={point.y + (Math.random() - 0.5) * 0.5}
              r={4}
              fill="white"
              stroke={color}
              strokeWidth={2}
            />
          </g>
        );
      })}

      {/* 手绘滤镜 */}
      <defs>
        <filter id="sketch-filter" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
};

export default SketchLineChart;

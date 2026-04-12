import React from 'react';

interface OrbitRingProps {
  isActive: boolean;
  size?: number;
}

export const OrbitRing: React.FC<OrbitRingProps> = ({ isActive, size = 280 }) => {
  const radiusX = size / 2;
  const radiusY = size / 4;
  const tilt = -15;

  return (
    <div
      className="absolute left-1/2 top-1/2 pointer-events-none"
      style={{
        width: size,
        height: size / 2,
        transform: `translate(-50%, -50%) rotateX(${tilt}deg)`,
        perspective: '800px',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size / 2}`}
        className={`transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-30'}`}
      >
        {/* 外环 */}
        <ellipse
          cx={radiusX}
          cy={radiusY}
          rx={radiusX - 15}
          ry={radiusY - 15}
          fill="none"
          stroke="var(--sketch-border)"
          strokeWidth="2"
          strokeDasharray="12 6"
          opacity={0.5}
        />

        {/* 内环 - 动态 */}
        <ellipse
          cx={radiusX}
          cy={radiusY}
          rx={radiusX - 25}
          ry={radiusY - 25}
          fill="none"
          stroke="var(--sketch-accent)"
          strokeWidth="1.5"
          strokeDasharray="8 16"
          opacity={isActive ? 0.6 : 0}
          className={isActive ? 'animate-spin' : ''}
          style={{ transformOrigin: 'center', animationDuration: '25s' }}
        />

        {/* 装饰点 */}
        {isActive && [0, 90, 180, 270].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = radiusX + Math.cos(rad) * (radiusX - 15);
          const y = radiusY + Math.sin(rad) * (radiusY - 15);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="var(--sketch-accent)"
              opacity="0.4"
              className="animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          );
        })}
      </svg>
    </div>
  );
};

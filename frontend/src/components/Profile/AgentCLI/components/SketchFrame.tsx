import React from 'react';

interface SketchFrameProps {
  children: React.ReactNode;
}

export const SketchFrame: React.FC<SketchFrameProps> = ({ children }) => {
  return (
    <div className="relative">
      {/* 书卷外框 - 参考资料卡样式 */}
      <div
        style={{
          backgroundColor: '#f5f0e6',
          border: '4px solid var(--sketch-border)',
          borderRadius: 'var(--wobbly-md)',
          boxShadow: 'var(--shadow-hard-lg), inset 0 0 60px rgba(139, 69, 19, 0.08)',
          transform: 'rotate(-0.5deg)',
          padding: '24px',
          position: 'relative',
          backgroundImage: `
            linear-gradient(90deg, transparent 98%, rgba(139, 69, 19, 0.03) 98%),
            linear-gradient(rgba(139, 69, 19, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '40px 100%, 100% 24px',
        }}
      >
        {/* 书卷卷轴装饰 - 左侧 */}
        <div
          style={{
            position: 'absolute',
            left: '-12px',
            top: '20px',
            bottom: '20px',
            width: '24px',
            background: 'linear-gradient(to right, #8b4513, #a0522d, #8b4513)',
            borderRadius: '12px',
            boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.3), 2px 0 4px rgba(0,0,0,0.2)',
            zIndex: 5,
          }}
        />
        {/* 书卷卷轴装饰 - 右侧 */}
        <div
          style={{
            position: 'absolute',
            right: '-12px',
            top: '20px',
            bottom: '20px',
            width: '24px',
            background: 'linear-gradient(to left, #8b4513, #a0522d, #8b4513)',
            borderRadius: '12px',
            boxShadow: 'inset 2px 0 4px rgba(0,0,0,0.3), -2px 0 4px rgba(0,0,0,0.2)',
            zIndex: 5,
          }}
        />

        {/* 顶部装饰带 */}
        <div
          style={{
            position: 'absolute',
            top: '-14px',
            left: '50%',
            transform: 'translateX(-50%) rotate(-2deg)',
            backgroundColor: 'rgba(255, 77, 77, 0.85)',
            padding: '8px 40px',
            fontFamily: 'var(--font-hand-heading)',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#fff',
            boxShadow: '0 3px 6px rgba(0,0,0,0.2), var(--shadow-hard)',
            zIndex: 10,
            border: '2px solid var(--sketch-border)',
            borderRadius: '4px',
          }}
        >
          🖥️ Agent CLI
        </div>

        {/* 图钉装饰 - 左上角 */}
        <div
          style={{
            position: 'absolute',
            top: '-8px',
            left: '20px',
            transform: 'rotate(-15deg)',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #ff6b6b, #c92a2a)',
              boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          />
        </div>

        {/* 图钉装饰 - 右上角 */}
        <div
          style={{
            position: 'absolute',
            top: '-8px',
            right: '20px',
            transform: 'rotate(15deg)',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #4ecdc4, #2a9d8f)',
              boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          />
        </div>

        {/* 内部内容区域 */}
        <div
          style={{
            backgroundColor: 'var(--sketch-paper)',
            border: '2px dashed var(--sketch-border)',
            borderRadius: '8px',
            padding: '16px',
            position: 'relative',
            marginLeft: '8px',
            marginRight: '8px',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default SketchFrame;

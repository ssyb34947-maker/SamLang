/**
 * 齿轮动画组件
 */

import React from 'react';
import { gearContainerStyle, gearStyle, gearToothStyle } from '../styles';

interface GearAnimationProps {
  rotation: number;
}

export const GearAnimation: React.FC<GearAnimationProps> = ({ rotation }) => {
  const gears = [
    { size: 60, top: 10, left: 10, teeth: 8 },
    { size: 40, top: 50, left: 60, teeth: 6 },
    { size: 30, top: 20, left: 80, teeth: 5 },
  ];

  return (
    <div style={gearContainerStyle}>
      {gears.map((gear, index) => (
        <div
          key={index}
          style={{
            ...gearStyle(gear.size, rotation * (index % 2 === 0 ? 1 : -1)),
            top: `${gear.top}px`,
            left: `${gear.left}px`,
          }}
        >
          {Array.from({ length: gear.teeth }).map((_, i) => (
            <div
              key={i}
              style={gearToothStyle((360 / gear.teeth) * i)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default GearAnimation;

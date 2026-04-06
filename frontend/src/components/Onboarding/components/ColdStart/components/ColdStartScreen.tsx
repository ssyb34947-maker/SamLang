/**
 * 冷启动屏幕组件
 */

import React, { useEffect } from 'react';
import { useColdStart, useColdStartAnimation } from '../hooks';
import { GearAnimation } from './GearAnimation';
import { ProgressBar } from './ProgressBar';
import { StatusText } from './StatusText';
import { containerStyle, completeIconStyle } from '../styles';

interface ColdStartScreenProps {
  onComplete: () => void;
}

export const ColdStartScreen: React.FC<ColdStartScreenProps> = ({ onComplete }) => {
  const { executeColdStart } = useColdStart();
  const {
    progress,
    currentStage,
    gearRotation,
    isComplete,
  } = useColdStartAnimation(true);

  // 执行冷启动 API
  useEffect(() => {
    executeColdStart();
  }, [executeColdStart]);

  // 动画完成后调用 onComplete
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onComplete]);

  return (
    <div style={containerStyle}>
      {isComplete ? (
        <div style={completeIconStyle}>✓</div>
      ) : (
        <GearAnimation rotation={gearRotation} />
      )}
      <ProgressBar progress={progress} />
      <StatusText currentStage={currentStage} progress={progress} />
    </div>
  );
};

export default ColdStartScreen;

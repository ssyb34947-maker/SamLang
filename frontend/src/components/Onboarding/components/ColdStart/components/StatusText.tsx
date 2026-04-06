/**
 * 状态文本组件
 */

import React from 'react';
import { STATUS_TEMPLATES } from '../constants';
import { statusTextStyle, percentageStyle } from '../styles';

interface StatusTextProps {
  currentStage: string;
  progress: number;
}

export const StatusText: React.FC<StatusTextProps> = ({ currentStage, progress }) => {
  const statusText = STATUS_TEMPLATES[currentStage as keyof typeof STATUS_TEMPLATES] || '处理中...';

  return (
    <>
      <div style={statusTextStyle}>{statusText}</div>
      <div style={percentageStyle}>{Math.round(progress)}%</div>
    </>
  );
};

export default StatusText;

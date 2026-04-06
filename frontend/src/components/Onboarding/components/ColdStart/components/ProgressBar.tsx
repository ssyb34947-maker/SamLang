/**
 * 进度条组件
 */

import React from 'react';
import { progressContainerStyle, progressFillStyle, progressStripeStyle } from '../styles';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div style={progressContainerStyle}>
      <div style={progressFillStyle(progress)} />
      <div style={progressStripeStyle} />
    </div>
  );
};

export default ProgressBar;

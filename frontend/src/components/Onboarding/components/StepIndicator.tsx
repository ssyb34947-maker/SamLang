/**
 * 步骤指示器组件
 */

import React from 'react';
import { STEPS, STEP_TITLES } from '../constants';

interface StepIndicatorProps {
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '2rem',
      }}
    >
      {STEP_TITLES.map((title, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <React.Fragment key={index}>
            {/* 步骤圆点 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-hand-heading)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  border: '3px solid var(--sketch-border)',
                  backgroundColor: isActive
                    ? '#a5d6a7'
                    : isCompleted
                    ? '#e8f5e9'
                    : '#f5f5f5',
                  color: isActive
                    ? '#2e7d32'
                    : isCompleted
                    ? '#4caf50'
                    : '#999',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? 'var(--shadow-soft)' : 'none',
                }}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-hand)',
                  fontSize: '0.75rem',
                  color: isActive ? 'var(--sketch-text)' : '#999',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {title}
              </span>
            </div>

            {/* 连接线 */}
            {index < STEP_TITLES.length - 1 && (
              <div
                style={{
                  width: '40px',
                  height: '3px',
                  backgroundColor: isCompleted ? '#4caf50' : '#ddd',
                  borderRadius: '2px',
                  marginTop: '-16px',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;

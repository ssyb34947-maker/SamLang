/**
 * 学习特征步骤组件
 */

import React from 'react';
import {
  Clock,
  Calculator,
  Target,
  Mountain,
  Lightbulb,
  Flag,
} from 'lucide-react';
import {
  STUDY_TIME_OPTIONS,
  MATH_RECOGNITION_OPTIONS,
  LEARNING_AUTONOMY_OPTIONS,
  LEARNING_PERSISTENCE_OPTIONS,
  LEARNING_CURIOSITY_OPTIONS,
  LEARNING_GOAL_OPTIONS,
} from '../constants';
import {
  formContainerStyle,
  labelStyle,
  optionCardBaseStyle,
  optionCardSelectedStyle,
} from '../styles';
import type { OnboardingData } from '../hooks/useOnboarding';

interface LearningTraitsStepProps {
  data: OnboardingData;
  onUpdate: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  onToggleGoal: (goal: string) => void;
}

interface SelectFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  color: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  icon,
  label,
  value,
  options,
  onChange,
  color,
}) => (
  <div>
    <label style={labelStyle}>{icon} {label}</label>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {options.map((option) => (
        <label
          key={option}
          style={{
            ...optionCardBaseStyle,
            ...optionCardSelectedStyle(value === option, color),
          }}
        >
          <input
            type="radio"
            name={label}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
            style={{ display: 'none' }}
          />
          <span style={{ fontSize: '0.9rem' }}>{option}</span>
        </label>
      ))}
    </div>
  </div>
);

export const LearningTraitsStep: React.FC<LearningTraitsStepProps> = ({
  data,
  onUpdate,
  onToggleGoal,
}) => {
  return (
    <div style={{ ...formContainerStyle, maxHeight: '400px', overflowY: 'auto' }}>
      {/* 每天学习时长 */}
      <SelectField
        icon={<Clock className="w-5 h-5" />}
        label="每天学习时长"
        value={data.dailyStudyTime}
        options={STUDY_TIME_OPTIONS}
        onChange={(value) => onUpdate('dailyStudyTime', value)}
        color="#ff9800"
      />

      {/* 数学认可 */}
      <SelectField
        icon={<Calculator className="w-5 h-5" />}
        label="数学认可"
        value={data.mathRecognition}
        options={MATH_RECOGNITION_OPTIONS}
        onChange={(value) => onUpdate('mathRecognition', value)}
        color="#2196f3"
      />

      {/* 学习自主性 */}
      <SelectField
        icon={<Target className="w-5 h-5" />}
        label="学习自主性"
        value={data.learningAutonomy}
        options={LEARNING_AUTONOMY_OPTIONS}
        onChange={(value) => onUpdate('learningAutonomy', value)}
        color="#4caf50"
      />

      {/* 学习坚持性 */}
      <SelectField
        icon={<Mountain className="w-5 h-5" />}
        label="学习坚持性"
        value={data.learningPersistence}
        options={LEARNING_PERSISTENCE_OPTIONS}
        onChange={(value) => onUpdate('learningPersistence', value)}
        color="#9c27b0"
      />

      {/* 学习好奇心 */}
      <SelectField
        icon={<Lightbulb className="w-5 h-5" />}
        label="学习好奇心"
        value={data.learningCuriosity}
        options={LEARNING_CURIOSITY_OPTIONS}
        onChange={(value) => onUpdate('learningCuriosity', value)}
        color="#ff5722"
      />

      {/* 学习目标 */}
      <div>
        <label style={labelStyle}>
          <Flag className="w-5 h-5" />
          学习目标（可多选）
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {LEARNING_GOAL_OPTIONS.map((goal) => (
            <label
              key={goal}
              style={{
                ...optionCardBaseStyle,
                ...optionCardSelectedStyle(
                  data.learningGoals.includes(goal),
                  '#607d8b'
                ),
                padding: '8px 12px',
              }}
            >
              <input
                type="checkbox"
                checked={data.learningGoals.includes(goal)}
                onChange={() => onToggleGoal(goal)}
                style={{ display: 'none' }}
              />
              <span style={{ fontSize: '0.85rem' }}>
                {data.learningGoals.includes(goal) ? '✓ ' : '+ '}
                {goal}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningTraitsStep;

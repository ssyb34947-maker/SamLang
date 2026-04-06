/**
 * 基本信息步骤组件
 */

import React from 'react';
import { Users, GraduationCap, Briefcase } from 'lucide-react';
import {
  GENDER_OPTIONS,
  IS_STUDENT_OPTIONS,
  STUDENT_GRADE_OPTIONS,
  OCCUPATION_OPTIONS,
} from '../constants';
import {
  formContainerStyle,
  labelStyle,
  optionCardBaseStyle,
  optionCardSelectedStyle,
} from '../styles';
import type { OnboardingData } from '../hooks/useOnboarding';

interface BasicInfoStepProps {
  data: OnboardingData;
  onUpdate: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, onUpdate }) => {
  return (
    <div style={formContainerStyle}>
      {/* 性别选择 */}
      <div>
        <label style={labelStyle}>
          <Users className="w-5 h-5" />
          性别 *
        </label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {GENDER_OPTIONS.map((option) => (
            <label
              key={option.value}
              style={{
                ...optionCardBaseStyle,
                ...optionCardSelectedStyle(
                  data.gender === option.value,
                  option.value === '男' ? '#2196f3' : '#e91e63'
                ),
                flex: 1,
                justifyContent: 'center',
              }}
            >
              <input
                type="radio"
                name="gender"
                value={option.value}
                checked={data.gender === option.value}
                onChange={(e) => onUpdate('gender', e.target.value)}
                style={{ display: 'none' }}
              />
              <span style={{ fontSize: '1.5rem' }}>{option.icon}</span>
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 学生身份选择 */}
      <div>
        <label style={labelStyle}>
          <GraduationCap className="w-5 h-5" />
          是否为学生 *
        </label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {IS_STUDENT_OPTIONS.map((option) => (
            <label
              key={String(option.value)}
              style={{
                ...optionCardBaseStyle,
                ...optionCardSelectedStyle(
                  data.isStudent === option.value,
                  option.value ? '#4caf50' : '#ff9800'
                ),
                flex: 1,
                justifyContent: 'center',
              }}
            >
              <input
                type="radio"
                name="isStudent"
                checked={data.isStudent === option.value}
                onChange={() => onUpdate('isStudent', option.value)}
                style={{ display: 'none' }}
              />
              <span style={{ fontSize: '1.5rem' }}>{option.icon}</span>
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 学生年级选择 */}
      {data.isStudent === true && (
        <div>
          <label style={labelStyle}>
            <GraduationCap className="w-5 h-5" />
            学生年级 *
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {STUDENT_GRADE_OPTIONS.map((level) => (
              <div key={level.level}>
                <div
                  style={{
                    fontFamily: 'var(--font-hand-heading)',
                    fontSize: '0.9rem',
                    color: '#666',
                    marginBottom: '6px',
                  }}
                >
                  {level.level}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {level.grades.map((grade) => {
                    const value = `${level.level}${grade}`;
                    const isSelected = data.studentGrade === value;
                    return (
                      <label
                        key={value}
                        style={{
                          ...optionCardBaseStyle,
                          ...optionCardSelectedStyle(isSelected, '#4caf50'),
                          padding: '8px 12px',
                        }}
                      >
                        <input
                          type="radio"
                          name="studentGrade"
                          checked={isSelected}
                          onChange={() => onUpdate('studentGrade', value)}
                          style={{ display: 'none' }}
                        />
                        <span style={{ fontSize: '0.85rem' }}>{grade}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 职业选择 */}
      {data.isStudent === false && (
        <div>
          <label style={labelStyle}>
            <Briefcase className="w-5 h-5" />
            职业 *
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {OCCUPATION_OPTIONS.map((occupation) => (
              <label
                key={occupation}
                style={{
                  ...optionCardBaseStyle,
                  ...optionCardSelectedStyle(
                    data.occupation === occupation,
                    '#ff9800'
                  ),
                  padding: '8px 16px',
                }}
              >
                <input
                  type="radio"
                  name="occupation"
                  checked={data.occupation === occupation}
                  onChange={() => onUpdate('occupation', occupation)}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '0.9rem' }}>{occupation}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicInfoStep;

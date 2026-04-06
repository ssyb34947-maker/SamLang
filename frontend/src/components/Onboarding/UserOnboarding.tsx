/**
 * 用户引导页面 - 注册后信息收集
 */

import React from 'react';
import { ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { STEPS, STEP_TITLES } from './constants';
import { useOnboarding } from './hooks/useOnboarding';
import { useOnboardingAnimation } from './hooks/useOnboardingAnimation';
import {
  StepIndicator,
  BasicInfoStep,
  LearningTraitsStep,
  CompleteStep,
} from './components';
import {
  pageContainerStyle,
  cardStyle,
  tapeStyle,
  titleStyle,
  subtitleStyle,
  buttonBaseStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  skipButtonStyle,
  buttonGroupStyle,
  errorStyle,
} from './styles';

export const UserOnboarding: React.FC = () => {
  const {
    currentStep,
    data,
    isLoading,
    error,
    updateField,
    toggleGoal,
    goToNextStep,
    goToPrevStep,
    skipStep,
    complete,
  } = useOnboarding();

  const { getContentStyle } = useOnboardingAnimation(currentStep);

  // 渲染当前步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.BASIC_INFO:
        return <BasicInfoStep data={data} onUpdate={updateField} />;
      case STEPS.LEARNING_TRAITS:
        return (
          <LearningTraitsStep
            data={data}
            onUpdate={updateField}
            onToggleGoal={toggleGoal}
          />
        );
      case STEPS.COMPLETE:
        return <CompleteStep onComplete={complete} />;
      default:
        return null;
    }
  };

  // 是否显示按钮组
  const showButtons = currentStep !== STEPS.COMPLETE;

  return (
    <div style={pageContainerStyle}>
      <div style={cardStyle}>
        {/* 胶带装饰 */}
        <div style={tapeStyle}>欢迎加入</div>

        {/* 步骤指示器 */}
        <StepIndicator currentStep={currentStep} />

        {/* 标题 */}
        {currentStep !== STEPS.COMPLETE && (
          <>
            <h1 style={titleStyle}>
              {STEP_TITLES[currentStep]}
            </h1>
            <p style={subtitleStyle}>
              {currentStep === STEPS.BASIC_INFO
                ? '请填写你的基本信息，带 * 的为必填项'
                : '选择符合你的选项，帮助我们更好地了解你（可选）'}
            </p>
          </>
        )}

        {/* 错误提示 */}
        {error && (
          <div style={{ ...errorStyle, marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* 步骤内容 */}
        <div style={getContentStyle()}>
          {renderStepContent()}
        </div>

        {/* 按钮组 */}
        {showButtons && (
          <div style={buttonGroupStyle}>
            {/* 返回按钮 */}
            {currentStep > STEPS.BASIC_INFO && (
              <button
                onClick={goToPrevStep}
                disabled={isLoading}
                style={{
                  ...buttonBaseStyle,
                  ...secondaryButtonStyle,
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <ChevronLeft className="w-4 h-4" />
                返回
              </button>
            )}

            {/* 跳过按钮 */}
            {currentStep === STEPS.LEARNING_TRAITS && (
              <button
                onClick={skipStep}
                disabled={isLoading}
                style={{
                  ...buttonBaseStyle,
                  ...skipButtonStyle,
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <SkipForward className="w-4 h-4" />
                跳过
              </button>
            )}

            {/* 下一步按钮 */}
            <button
              onClick={goToNextStep}
              disabled={isLoading}
              style={{
                ...buttonBaseStyle,
                ...primaryButtonStyle,
                marginLeft: 'auto',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  保存中...
                </>
              ) : (
                <>
                  {currentStep === STEPS.LEARNING_TRAITS ? '完成' : '下一步'}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOnboarding;

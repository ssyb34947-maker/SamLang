/**
 * 用户引导页面逻辑 Hook
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import {
  STEPS,
  ERROR_MESSAGES,
} from '../constants';

export interface OnboardingData {
  gender: string;
  isStudent: boolean | null;
  studentGrade: string;
  occupation: string;
  dailyStudyTime: string;
  mathRecognition: string;
  learningAutonomy: string;
  learningPersistence: string;
  learningCuriosity: string;
  learningGoals: string[];
}

export const useOnboarding = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(STEPS.BASIC_INFO);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<OnboardingData>({
    gender: '',
    isStudent: null,
    studentGrade: '',
    occupation: '',
    dailyStudyTime: '',
    mathRecognition: '',
    learningAutonomy: '',
    learningPersistence: '',
    learningCuriosity: '',
    learningGoals: [],
  });

  // 更新字段
  const updateField = useCallback(<K extends keyof OnboardingData>(
    field: K,
    value: OnboardingData[K]
  ) => {
    setData((prev) => {
      const newData = { ...prev, [field]: value };
      // 切换学生身份时清空相关字段
      if (field === 'isStudent') {
        newData.studentGrade = '';
        newData.occupation = '';
      }
      return newData;
    });
    setError(null);
  }, []);

  // 切换学习目标
  const toggleGoal = useCallback((goal: string) => {
    setData((prev) => {
      const goals = prev.learningGoals.includes(goal)
        ? prev.learningGoals.filter((g) => g !== goal)
        : [...prev.learningGoals, goal];
      return { ...prev, learningGoals: goals };
    });
    setError(null);
  }, []);

  // 验证基本信息
  const validateBasicInfo = useCallback((): boolean => {
    if (!data.gender) {
      setError(ERROR_MESSAGES.GENDER_REQUIRED);
      return false;
    }
    if (data.isStudent === null) {
      setError(ERROR_MESSAGES.STUDENT_STATUS_REQUIRED);
      return false;
    }
    if (data.isStudent && !data.studentGrade) {
      setError(ERROR_MESSAGES.STUDENT_GRADE_REQUIRED);
      return false;
    }
    if (!data.isStudent && !data.occupation) {
      setError(ERROR_MESSAGES.OCCUPATION_REQUIRED);
      return false;
    }
    return true;
  }, [data.gender, data.isStudent, data.studentGrade, data.occupation]);

  // 保存基本信息
  const saveBasicInfo = useCallback(async (): Promise<boolean> => {
    if (!validateBasicInfo()) return false;

    setIsLoading(true);
    setError(null);

    try {
      const updateData: Record<string, unknown> = {
        gender: data.gender,
        is_student: data.isStudent,
      };

      if (data.isStudent) {
        updateData.student_grade = data.studentGrade;
        updateData.occupation = null;
      } else {
        updateData.occupation = data.occupation;
        updateData.student_grade = null;
      }

      await apiService.updateCurrentUser(updateData);
      return true;
    } catch (err: any) {
      setError(err.message || ERROR_MESSAGES.SAVE_FAILED);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [data, validateBasicInfo]);

  // 保存学习特征
  const saveLearningTraits = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const profileData: Record<string, unknown> = {};

      if (data.dailyStudyTime) profileData.daily_study_time = data.dailyStudyTime;
      if (data.mathRecognition) profileData.math_recognition = data.mathRecognition;
      if (data.learningAutonomy) profileData.learning_autonomy = data.learningAutonomy;
      if (data.learningPersistence) profileData.learning_persistence = data.learningPersistence;
      if (data.learningCuriosity) profileData.learning_curiosity = data.learningCuriosity;
      if (data.learningGoals.length > 0) profileData.learning_goals = data.learningGoals;

      if (Object.keys(profileData).length > 0) {
        await apiService.updateUserProfile(profileData);
      }
      return true;
    } catch (err: any) {
      setError(err.message || ERROR_MESSAGES.SAVE_FAILED);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  // 进入下一步
  const goToNextStep = useCallback(async (): Promise<void> => {
    if (currentStep === STEPS.BASIC_INFO) {
      const success = await saveBasicInfo();
      if (success) {
        setCurrentStep(STEPS.LEARNING_TRAITS);
      }
    } else if (currentStep === STEPS.LEARNING_TRAITS) {
      await saveLearningTraits();
      setCurrentStep(STEPS.COMPLETE);
    }
  }, [currentStep, saveBasicInfo, saveLearningTraits]);

  // 返回上一步
  const goToPrevStep = useCallback(() => {
    if (currentStep > STEPS.BASIC_INFO) {
      setCurrentStep((prev) => prev - 1);
      setError(null);
    }
  }, [currentStep]);

  // 跳过当前步骤
  const skipStep = useCallback(() => {
    if (currentStep === STEPS.BASIC_INFO) {
      setError(ERROR_MESSAGES.GENDER_REQUIRED);
      return;
    }
    if (currentStep === STEPS.LEARNING_TRAITS) {
      setCurrentStep(STEPS.COMPLETE);
    }
  }, [currentStep]);

  // 完成引导
  const complete = useCallback(() => {
    completeOnboarding();
    navigate('/chat', { replace: true });
  }, [navigate, completeOnboarding]);

  return {
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
  };
};

export default useOnboarding;

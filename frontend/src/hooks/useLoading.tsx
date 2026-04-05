import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Loading } from '../components/Loading/Loading';

// 定义LoadingContext的类型
interface LoadingContextType {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

// 创建LoadingContext
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// 定义LoadingProvider的Props类型
interface LoadingProviderProps {
  children: ReactNode;
}

/**
 * LoadingProvider组件，提供全局加载状态管理
 * 应该包裹在应用的最顶层
 */
export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  // 加载状态
  const [isLoading, setIsLoading] = useState(false);

  // 显示加载动画
  const showLoading = () => {
    setIsLoading(true);
  };

  // 隐藏加载动画
  const hideLoading = () => {
    setIsLoading(false);
  };

  // 提供上下文值
  const contextValue: LoadingContextType = {
    isLoading,
    showLoading,
    hideLoading
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      <Loading isVisible={isLoading} />
    </LoadingContext.Provider>
  );
};

/**
 * useLoading自定义钩子，用于在组件中控制加载动画
 * @returns 加载状态和控制方法
 */
export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  
  return context;
};

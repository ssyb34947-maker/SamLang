/**
 * Auth Hook
 * 管理用户认证状态
 */

import { useState, useEffect, createContext, useContext } from 'react';
import { apiService } from '../services/api';

interface User {
  id: number;
  uuid: string;
  username: string;
  email: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // 初始化时检查用户认证状态
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // 如果没有 token，直接标记为未登录
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          setIsAuthenticated(false);
          setIsNewUser(false);
          setIsLoading(false);
          return;
        }
        
        const userData = await apiService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        // 检查是否为新用户（根据是否有基本信息判断）
        const isNew = !userData.gender || userData.is_student === null || userData.is_student === undefined;
        setIsNewUser(isNew);
      } catch (error) {
        console.log('User not authenticated');
        setUser(null);
        setIsAuthenticated(false);
        setIsNewUser(false);
        // 清除无效的 token
        apiService.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      apiService.setToken(response.access_token);
      
      // 获取用户信息
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      // 检查是否为新用户
      const isNew = !userData.gender || userData.is_student === null || userData.is_student === undefined;
      setIsNewUser(isNew);
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await apiService.register(username, email, password);
      apiService.setToken(response.access_token);
      
      // 获取用户信息
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      // 标记为新用户，需要填写信息
      setIsNewUser(true);
    } catch (error) {
      throw error;
    }
  };

  const completeOnboarding = () => {
    setIsNewUser(false);
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      apiService.clearToken();
      setUser(null);
      setIsAuthenticated(false);
      setIsNewUser(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isNewUser,
    login,
    register,
    logout,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, LoginForm, RegisterForm, User } from '../types';
import { authApi } from '../services/api';
import { Navigate } from 'react-router-dom';
const jwt_decode = require('jwt-decode'); // jwt-decode 라이브러리 사용

// 기본 상태
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

// 컨텍스트 인터페이스
interface AuthContextProps extends AuthState {
  login: (data: LoginForm) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => void;
}

// 컨텍스트 생성
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// 컨텍스트 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 인증 컨텍스트 제공자
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // 초기화: 로컬 스토리지에서 토큰 확인
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwt_decode(token);
        const user: User = {
          id: parseInt(decodedToken.sub),
          username: decodedToken.unique_name,
          email: decodedToken.email,
        };

        // 토큰 만료 체크
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          localStorage.removeItem('token');
          setState(initialState);
        } else {
          setState({
            isAuthenticated: true,
            user,
            token,
          });
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        setState(initialState);
      }
    }
  }, []);

  // 로그인 함수
  const login = async (data: LoginForm) => {
    try {
      const response = await authApi.login(data);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setState({
        isAuthenticated: true,
        user,
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // 회원가입 함수
  const register = async (data: RegisterForm) => {
    try {
      const response = await authApi.register(data);
      const { token } = response.data;
      const decodedToken: any = jwt_decode(token);

      const user = {
        id: parseInt(decodedToken.sub),
        username: decodedToken.unique_name,
        email: decodedToken.email,
      };

      localStorage.setItem('token', token);
      setState({
        isAuthenticated: true,
        user,
        token,
      });
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('token');
    setState(initialState);
  };

  const value = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Protected Route 컴포넌트
export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
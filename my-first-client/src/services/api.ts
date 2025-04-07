import axios from 'axios';
import { LoginForm, RegisterForm, PostForm } from '../types';

const API_URL = 'http://localhost:5119/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰이 있으면 헤더에 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 인증 관련 API
export const authApi = {
  login: (data: LoginForm) => api.post('/auth/login', data),
  register: (data: RegisterForm) => api.post('/auth/register', data),
};

// 게시글 관련 API
export const postsApi = {
  getPosts: () => api.get('/posts'),
  getPost: (id: number) => api.get(`/posts/${id}`),
  createPost: (data: PostForm) => api.post('/posts', data),
  updatePost: (id: number, data: PostForm) => api.put(`/posts/${id}`, data),
  deletePost: (id: number) => api.delete(`/posts/${id}`),
};

export default api;
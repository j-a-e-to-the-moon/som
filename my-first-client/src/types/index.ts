export interface User {
    id: number;
    username: string;
    email: string;
  }
  
  export interface Post {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: {
      id: number;
      username: string;
    };
  }
  
  export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
  }
  
  export interface LoginForm {
    username: string;
    password: string;
  }
  
  export interface RegisterForm {
    username: string;
    email: string;
    password: string;
  }
  
  export interface PostForm {
    title: string;
    content: string;
  }
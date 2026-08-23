// Request Models
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword?: string;
}

// Response Models
export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Error Response
export interface ErrorResponse {
  message: string;
  errors?: {
    [key: string]: string[];
  };
  statusCode?: number;
}

// State untuk Auth
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

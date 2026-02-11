import { UserDTO } from "./user.model";

export interface LoginDTO {
  email: string;
  password: string;
}

export interface SignupDTO {
  email: string;
  password: string;
  fullName: string;
}

export interface VerifyOtpDTO {
  email: string;
  otp: string;
}

export interface AuthStatus {
  isAuthenticated: boolean;
  userId?: string;
}

export interface AuthState {
  status: AuthStatus;
  currentUser: UserDTO | null;
  initialized: boolean;
  loading: boolean;
}


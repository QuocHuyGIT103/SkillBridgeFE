import axiosClient from "../api/axiosClient";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
  role: string;
}

export interface VerifyOTPCredentials {
  email: string;
  otp_code: string;
}

export interface ForgotPasswordCredentials {
  email: string;
}

export interface ResetPasswordCredentials {
  email: string;
  otp_code: string;
  new_password: string;
}

export interface UserResponse {
  _id: string;
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TokensResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthResponse {
  user: UserResponse;
  tokens: TokensResponse;
}

export interface RegisterResponse {
  email: string;
  otpSent: boolean;
}

export interface VerifyOTPResponse {
  user: UserResponse;
  token: string;
}

export interface ForgotPasswordResponse {
  email: string;
  otpSent: boolean;
}

export interface OTPStatusResponse {
  email: string;
  remainingSeconds: number;
  expiresAt: string;
  canResend: boolean;
}

export interface ResetPasswordResponse {
  message: string;
}

const AuthService = {
  register: async (credentials: RegisterCredentials) => {
    try {
      const response = await axiosClient.post<RegisterResponse>(
        "/auth/register",
        credentials
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  verifyOTP: async (credentials: VerifyOTPCredentials) => {
    try {
      const response = await axiosClient.post<VerifyOTPResponse>(
        "/auth/verify-otp",
        credentials
      );

      // Store token in localStorage if verification successful
      if (response.success && response.data.token) {
        localStorage.setItem("access_token", response.data.token);
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  resendOTP: async (email: string) => {
    try {
      const response = await axiosClient.post<RegisterResponse>(
        "/auth/resend-otp",
        { email }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  getOTPStatus: async (email: string, otpType: string = "REGISTRATION") => {
    try {
      const response = await axiosClient.post<OTPStatusResponse>(
        "/auth/otp-status",
        { email, otp_type: otpType }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  forgotPassword: async (credentials: ForgotPasswordCredentials) => {
    try {
      const response = await axiosClient.post<ForgotPasswordResponse>(
        "/auth/forgot-password",
        credentials
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (credentials: ResetPasswordCredentials) => {
    try {
      const response = await axiosClient.post<ResetPasswordResponse>(
        "/auth/reset-password",
        credentials
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials: LoginCredentials) => {
    try {
      const response = await axiosClient.post<AuthResponse>(
        "/auth/login",
        credentials
      );

      // Store tokens in localStorage
      if (response.success && response.data.tokens) {
        localStorage.setItem("access_token", response.data.tokens.access_token);
        localStorage.setItem(
          "refresh_token",
          response.data.tokens.refresh_token
        );
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    // Remove tokens from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  refreshToken: async () => {
    const refresh_token = localStorage.getItem("refresh_token");
    if (!refresh_token) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await axiosClient.post<TokensResponse>(
        "/auth/refresh-token",
        { refresh_token }
      );

      if (response.success && response.data) {
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);
      }

      return response;
    } catch (error) {
      // If refresh fails, force logout
      AuthService.logout();
      throw error;
    }
  },
};

export default AuthService;

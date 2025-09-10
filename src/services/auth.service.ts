import axiosClient from "../api/axiosClient";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  full_name: string;
  email: string;
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

const AuthService = {
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

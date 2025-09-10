import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import AuthService from "../services/auth.service";
import type { LoginCredentials, UserResponse } from "../services/auth.service";

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        try {
          const response = await AuthService.login(credentials);

          if (response.success && response.data.user) {
            set({
              user: response.data.user,
              isAuthenticated: true,
            });

            toast.success(response.message || "Đăng nhập thành công");
          } else {
            toast.error(response.message || "Đăng nhập thất bại");
            throw new Error(response.message || "Đăng nhập thất bại");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi đăng nhập");
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        AuthService.logout();
        set({
          user: null,
          isAuthenticated: false,
        });
        toast.success("Đã đăng xuất thành công");
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

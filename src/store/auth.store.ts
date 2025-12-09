import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import AuthService from "../services/auth.service";
import type {
  LoginCredentials,
  RegisterCredentials,
  VerifyOTPCredentials,
  ForgotPasswordCredentials,
  ResetPasswordCredentials,
  UserResponse,
} from "../services/auth.service";

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingVerificationEmail: string | null;
  pendingResetEmail: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  verifyOTP: (credentials: VerifyOTPCredentials) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  getOTPStatus: (
    email: string
  ) => Promise<{ remainingSeconds: number; canResend: boolean }>;
  getResetPasswordOTPStatus: (
    email: string
  ) => Promise<{ remainingSeconds: number; canResend: boolean }>;
  forgotPassword: (credentials: ForgotPasswordCredentials) => Promise<void>;
  resetPassword: (credentials: ResetPasswordCredentials) => Promise<void>;
  logout: () => void;
  clearPendingVerification: () => void;
  clearPendingReset: () => void;
  updateUser: (userData: Partial<UserResponse>) => void;
}

// Helper function để điều hướng theo role
const navigateByRole = (role: string) => {
  switch (role?.toUpperCase()) {
    case "ADMIN":
      window.location.href = "/admin/dashboard";
      break;
    case "TUTOR":
      window.location.href = "/tutor/dashboard";
      break;
    case "STUDENT":
      window.location.href = "/student/dashboard";
      break;
    case "PARENT":
      window.location.href = "/parent/dashboard";
      break;
    default:
      window.location.href = "/";
      break;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      pendingVerificationEmail: null,
      pendingResetEmail: null,

      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true });
        try {
          const response = await AuthService.register(credentials);

          if (response.success && response.data) {
            set({ pendingVerificationEmail: response.data.email });
            toast.success(
              response.message ||
                "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
            );
          } else {
            toast.error(response.message || "Đăng ký thất bại");
            throw new Error(response.message || "Đăng ký thất bại");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi đăng ký");
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOTP: async (credentials: VerifyOTPCredentials) => {
        set({ isLoading: true });
        try {
          const response = await AuthService.verifyOTP(credentials);

          if (response.success && response.data.user) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              pendingVerificationEmail: null,
            });
            toast.success(response.message || "Xác thực thành công!");

            // Điều hướng theo role sau khi verify OTP thành công
            setTimeout(() => {
              navigateByRole(response.data.user.role);
            }, 1000);
          } else {
            toast.error(response.message || "Xác thực thất bại");
            throw new Error(response.message || "Xác thực thất bại");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi xác thực");
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      resendOTP: async (email: string) => {
        set({ isLoading: true });
        try {
          const response = await AuthService.resendOTP(email);

          if (response.success) {
            toast.success(response.message || "Mã OTP đã được gửi lại!");
          } else {
            toast.error(response.message || "Gửi lại OTP thất bại");
            throw new Error(response.message || "Gửi lại OTP thất bại");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi gửi lại OTP");
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      getOTPStatus: async (email: string) => {
        try {
          const response = await AuthService.getOTPStatus(
            email,
            "REGISTRATION"
          );

          if (response.success && response.data) {
            return {
              remainingSeconds: response.data.remainingSeconds,
              canResend: response.data.canResend,
            };
          } else {
            throw new Error(response.message || "Không thể lấy trạng thái OTP");
          }
        } catch (error: any) {
          // Don't show toast for this as it's called frequently
          throw error;
        }
      },

      getResetPasswordOTPStatus: async (email: string) => {
        try {
          const response = await AuthService.getOTPStatus(
            email,
            "PASSWORD_RESET"
          );

          if (response.success && response.data) {
            return {
              remainingSeconds: response.data.remainingSeconds,
              canResend: response.data.canResend,
            };
          } else {
            throw new Error(response.message || "Không thể lấy trạng thái OTP");
          }
        } catch (error: any) {
          // Don't show toast for this as it's called frequently
          throw error;
        }
      },

      clearPendingVerification: () => {
        set({ pendingVerificationEmail: null });
      },

      forgotPassword: async (credentials: ForgotPasswordCredentials) => {
        set({ isLoading: true });
        try {
          const response = await AuthService.forgotPassword(credentials);

          if (response.success && response.data) {
            set({ pendingResetEmail: response.data.email });
            toast.success(
              response.message ||
                "Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn."
            );
          } else {
            toast.error(response.message || "Gửi OTP thất bại");
            throw new Error(response.message || "Gửi OTP thất bại");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi gửi OTP");
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      resetPassword: async (credentials: ResetPasswordCredentials) => {
        set({ isLoading: true });
        try {
          const response = await AuthService.resetPassword(credentials);

          if (response.success) {
            set({ pendingResetEmail: null });
            toast.success(response.message || "Đặt lại mật khẩu thành công!");
          } else {
            toast.error(response.message || "Đặt lại mật khẩu thất bại");
            throw new Error(response.message || "Đặt lại mật khẩu thất bại");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi đặt lại mật khẩu");
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      clearPendingReset: () => {
        set({ pendingResetEmail: null });
      },

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

            // Điều hướng theo role sau khi đăng nhập thành công
            setTimeout(() => {
              navigateByRole(response.data.user.role);
            }, 1000);
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

      updateUser: (userData: Partial<UserResponse>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              ...userData,
            },
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        pendingVerificationEmail: state.pendingVerificationEmail,
        pendingResetEmail: state.pendingResetEmail,
      }),
    }
  )
);

import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "../../store/auth.store";
import {
  validateResetPasswordForm,
  showValidationErrors,
} from "../../utils/validation";

const ResetPasswordPage: React.FC = () => {
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  const navigate = useNavigate();
  const {
    resetPassword,
    forgotPassword,
    getResetPasswordOTPStatus,
    pendingResetEmail,
    isLoading,
    clearPendingReset,
  } = useAuthStore();

  // Redirect if no pending reset
  useEffect(() => {
    if (!pendingResetEmail) {
      navigate("/forgot-password");
    }
  }, [pendingResetEmail, navigate]);

  // Fetch initial OTP status and sync countdown
  useEffect(() => {
    const fetchOTPStatus = async () => {
      if (!pendingResetEmail) return;

      try {
        setIsLoadingStatus(true);
        const status = await getResetPasswordOTPStatus(pendingResetEmail);
        setCountdown(status.remainingSeconds);
        setCanResend(status.canResend);
      } catch (error) {
        console.error("Failed to fetch OTP status:", error);
        // Default to allowing resend if we can't fetch status
        setCountdown(0);
        setCanResend(true);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    fetchOTPStatus();

    // Refresh status every 30 seconds to stay in sync
    const intervalId = setInterval(fetchOTPStatus, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [pendingResetEmail, getResetPasswordOTPStatus]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: number;

    if (countdown > 0) {
      timer = window.setTimeout(() => {
        setCountdown((prev) => {
          const newCount = prev - 1;
          if (newCount <= 0) {
            setCanResend(true);
            return 0;
          }
          return newCount;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} giây`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only digits
    if (value.length <= 6) {
      setOtpCode(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const validationErrors = validateResetPasswordForm({
      otp_code: otpCode,
      new_password: newPassword,
      confirmPassword: confirmPassword,
    });

    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      return;
    }

    try {
      await resetPassword({
        email: pendingResetEmail!,
        otp_code: otpCode,
        new_password: newPassword,
      });

      // Navigate to login page after successful reset
      navigate("/login");
    } catch (error) {
      console.error("Reset password failed:", error);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || isLoadingStatus) return;

    try {
      await forgotPassword({ email: pendingResetEmail! });

      // Refresh OTP status after successful resend
      const status = await getResetPasswordOTPStatus(pendingResetEmail!);
      setCountdown(status.remainingSeconds);
      setCanResend(status.canResend);
    } catch (error) {
      console.error("Resend OTP failed:", error);
      // Keep current countdown if resend fails
    }
  };

  const handleBackToForgotPassword = () => {
    clearPendingReset();
    navigate("/forgot-password");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <NavLink
            to="/"
            className="inline-flex items-center bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 rounded-2xl shadow-lg text-xl font-bold gap-3 hover:shadow-xl transition-shadow duration-200"
          >
            <div className="bg-white/20 p-1 rounded-lg">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            SkillBridge
          </NavLink>
        </div>

        {/* Reset Password Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border-0 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Đặt lại mật khẩu
            </h2>
            <p className="text-gray-600 text-base">
              Nhập mã OTP đã được gửi đến
            </p>
            <p className="text-orange-600 font-medium">{pendingResetEmail}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-2 text-center"
              >
                Mã OTP
              </label>
              <div className="relative">
                <input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otpCode}
                  onChange={handleOTPChange}
                  required
                  className="block w-full px-4 py-3 text-xl text-center letter-spacing-wider border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white shadow-sm transition-all duration-200 placeholder:text-gray-300"
                  style={{ letterSpacing: "0.3em" }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Vui lòng nhập đầy đủ 6 chữ số
              </p>
            </div>

            {/* New Password Input */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mật khẩu mới
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white shadow-sm transition-all duration-200 text-base placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-80 transition-opacity focus:outline-none"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white shadow-sm transition-all duration-200 text-base placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-80 transition-opacity focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Reset Password Button */}
            <button
              type="submit"
              disabled={
                isLoading ||
                otpCode.length !== 6 ||
                !newPassword ||
                !confirmPassword
              }
              className={`w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                isLoading ? "opacity-70" : ""
              }`}
            >
              {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 mb-3">Không nhận được mã?</p>
            {isLoadingStatus ? (
              <p className="text-sm text-gray-500">
                Đang kiểm tra trạng thái...
              </p>
            ) : !canResend && countdown > 0 ? (
              <p className="text-sm text-gray-500">
                Gửi lại mã sau {formatTime(countdown)}
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={isLoading || !canResend}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors disabled:opacity-50"
              >
                Gửi lại mã OTP
              </button>
            )}
          </div>

          {/* Back to Forgot Password */}
          <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleBackToForgotPassword}
              className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
            >
              ← Quay lại nhập email
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-6">
          © 2024 SkillBridge. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

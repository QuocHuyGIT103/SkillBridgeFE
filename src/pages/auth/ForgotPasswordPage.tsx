import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import {
  validateEmailForm,
  showValidationErrors,
} from "../../utils/validation";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { forgotPassword, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const validationErrors = validateEmailForm(email);
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      return;
    }

    try {
      await forgotPassword({ email });

      // Navigate to reset password page
      navigate("/reset-password");
    } catch (error) {
      console.error("Forgot password failed:", error);
    }
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

        {/* Forgot Password Card */}
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
              Quên mật khẩu?
            </h2>
            <p className="text-gray-600 text-base">
              Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi mã OTP để đặt
              lại mật khẩu.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
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
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white shadow-sm transition-all duration-200 text-base placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Send OTP Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
            </button>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <span className="text-gray-600">Nhớ mật khẩu? </span>
            <NavLink
              to="/login"
              className="text-orange-600 hover:text-orange-700 font-semibold text-base transition-colors"
            >
              Quay lại đăng nhập
            </NavLink>
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

export default ForgotPasswordPage;

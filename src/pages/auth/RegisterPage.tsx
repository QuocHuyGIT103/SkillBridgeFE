import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BookOpen, User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import {
  validateRegistrationForm,
  showValidationErrors,
} from "../../utils/validation";

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    role: "STUDENT",
    password: "",
    confirmPassword: "",
  });
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: true,
  });
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAgreementChange = (type: "terms" | "privacy") => {
    setAgreements((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const validationErrors = validateRegistrationForm(formData);
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      return;
    }

    if (!agreements.terms || !agreements.privacy) {
      showValidationErrors([
        {
          field: "Điều khoản",
          message: "Vui lòng đồng ý với điều khoản và chính sách bảo mật!",
        },
      ]);
      return;
    }

    try {
      await register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number || undefined,
        role: formData.role,
      });

      // Navigate to OTP verification page
      navigate("/verify-otp");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  // Role descriptions for better UX
  const getRoleDescription = (role: string) => {
    switch (role) {
      case "STUDENT":
        return "Tìm kiếm gia sư phù hợp, đặt lịch học và theo dõi tiến độ học tập";
      case "TUTOR":
        return "Chia sẻ kiến thức, dạy học và kiếm thu nhập từ khả năng của bạn";
      case "PARENT":
        return "Quản lý việc học của con em, tìm gia sư và theo dõi tiến độ";
      default:
        return "";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "STUDENT":
        return <User className="w-4 h-4" />;
      case "TUTOR":
        return <BookOpen className="w-4 h-4" />;
      case "PARENT":
        return <Users className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
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
              <BookOpen className="w-6 h-6" />
            </div>
            SkillBridge
          </NavLink>
        </div>

        {/* Register Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border-0 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Đăng ký tài khoản
            </h2>
            <p className="text-gray-600 text-lg">
              Tạo tài khoản để bắt đầu hành trình học tập
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ và Tên */}
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Họ và tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Nhập họ và tên đầy đủ"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white shadow-sm transition-all duration-200 text-sm placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white shadow-sm transition-all duration-200 text-sm placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label
                htmlFor="phone_number"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Số điện thoại
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white shadow-sm transition-all duration-200 text-sm placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Vai trò */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Bạn muốn trở thành
              </label>
              <div className="space-y-3">
                {/* Role Selection Cards */}
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: "STUDENT", label: "Học viên", icon: "👨‍🎓" },
                    { value: "TUTOR", label: "Gia sư", icon: "👨‍🏫" },
                    { value: "PARENT", label: "Phụ huynh", icon: "👨‍👩‍👧‍👦" },
                  ].map((role) => (
                    <label
                      key={role.value}
                      className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formData.role === role.value
                          ? "border-teal-500 bg-teal-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="flex items-center flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-teal-100 to-teal-200 mr-3">
                          <span className="text-lg">{role.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3
                              className={`text-sm font-medium ${
                                formData.role === role.value
                                  ? "text-teal-900"
                                  : "text-gray-900"
                              }`}
                            >
                              {role.label}
                            </h3>
                          </div>
                          <p
                            className={`text-xs mt-1 ${
                              formData.role === role.value
                                ? "text-teal-700"
                                : "text-gray-500"
                            }`}
                          >
                            {getRoleDescription(role.value)}
                          </p>
                        </div>
                      </div>
                      {formData.role === role.value && (
                        <div className="flex items-center justify-center w-5 h-5 bg-teal-500 rounded-full">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-9 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white shadow-sm transition-all duration-200 text-sm placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-80 transition-opacity focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-9 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white shadow-sm transition-all duration-200 text-sm placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-80 transition-opacity focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Agreements */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={agreements.terms}
                  onChange={() => handleAgreementChange("terms")}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mt-0.5"
                />
                <span className="text-sm text-gray-600 leading-tight">
                  Tôi đồng ý với{" "}
                  <NavLink
                    to="/terms"
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Điều khoản sử dụng
                  </NavLink>{" "}
                  và{" "}
                  <NavLink
                    to="/privacy"
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Chính sách bảo mật
                  </NavLink>
                </span>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={!agreements.terms || isLoading}
              className={`w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                isLoading ? "opacity-70" : ""
              }`}
            >
              {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500 font-medium">
                HOẶC
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285f4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34a853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#fbbc04"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#ea4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm">Google</span>
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="w-4 h-4 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm">Facebook</span>
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <span className="text-gray-600 text-sm">Đã có tài khoản? </span>
            <NavLink
              to="/login"
              className="text-teal-600 hover:text-teal-700 font-semibold text-sm transition-colors"
            >
              Đăng nhập
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

export default RegisterPage;

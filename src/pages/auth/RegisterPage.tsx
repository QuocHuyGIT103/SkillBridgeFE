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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Info */}
          <div className="hidden lg:flex flex-col justify-center space-y-8 px-12">
            <NavLink
              to="/"
              className="inline-flex items-center bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 rounded-2xl shadow-lg text-xl font-bold gap-3 hover:shadow-xl transition-shadow duration-200 w-fit"
            >
              <div className="bg-white/20 p-1 rounded-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              SkillBridge
            </NavLink>

            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-gray-900">
                Chào mừng đến với SkillBridge
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Nền tảng kết nối học viên và gia sư với công nghệ AI hiện đại,
                hợp đồng điện tử minh bạch và trải nghiệm học tập tối ưu.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-100 p-2 rounded-lg">
                    <User className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      AI Gợi ý thông minh
                    </h3>
                    <p className="text-sm text-gray-600">
                      Tìm gia sư phù hợp với bạn
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-teal-100 p-2 rounded-lg">
                    <BookOpen className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Hợp đồng minh bạch
                    </h3>
                    <p className="text-sm text-gray-600">
                      An toàn và đáng tin cậy
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-teal-100 p-2 rounded-lg">
                    <Mail className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Hỗ trợ 24/7</h3>
                    <p className="text-sm text-gray-600">
                      Luôn sẵn sàng hỗ trợ bạn
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border-0 p-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6">
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

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Đăng ký tài khoản
              </h2>
              <p className="text-gray-600 text-sm">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bạn muốn trở thành
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="STUDENT"
                      checked={formData.role === "STUDENT"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      👨‍🎓 Học viên
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="TUTOR"
                      checked={formData.role === "TUTOR"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      👨‍🏫 Gia sư
                    </span>
                  </label>
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
              <div className="pt-2">
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

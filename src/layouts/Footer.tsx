import React from "react";
import { NavLink } from "react-router-dom";
import {
  BookOpen,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <NavLink to="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-teal-600">
                SkillBridge
              </span>
            </NavLink>
            <p className="text-sm text-gray-600 leading-relaxed">
              Nền tảng kết nối gia sư và học viên hàng đầu Việt Nam với công
              nghệ AI và Blockchain tiên tiến.
            </p>
            <div className="flex space-x-2">
              <a
                href="#"
                className="p-2 text-gray-400 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 text-gray-400 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 text-gray-400 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 text-gray-400 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Liên kết nhanh
            </h3>
            <nav className="space-y-2">
              <NavLink
                to="/about"
                className="block text-sm text-gray-600 hover:text-teal-600 transition-colors"
              >
                Về chúng tôi
              </NavLink>
              <NavLink
                to="/tutors"
                className="block text-sm text-gray-600 hover:text-teal-600 transition-colors"
              >
                Tìm gia sư
              </NavLink>
              <NavLink
                to="/become-tutor"
                className="block text-sm text-gray-600 hover:text-teal-600 transition-colors"
              >
                Trở thành gia sư
              </NavLink>
              <NavLink
                to="/pricing"
                className="block text-sm text-gray-600 hover:text-teal-600 transition-colors"
              >
                Bảng giá
              </NavLink>
              <NavLink
                to="/blog"
                className="block text-sm text-gray-600 hover:text-teal-600 transition-colors"
              >
                Blog
              </NavLink>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Hỗ trợ</h3>
            <nav className="space-y-2">
              <NavLink
                to="/help"
                className="block text-sm text-gray-600 hover:text-teal-600 transition-colors"
              >
                Trung tâm trợ giúp
              </NavLink>
              <NavLink
                to="/contact"
                className="block text-sm text-gray-600 hover:text-teal-600 transition-colors"
              >
                Liên hệ
              </NavLink>
              <NavLink
                to="/privacy"
                className="block text-sm text-gray-600 hover:text-teal-600 transition-colors"
              >
                Chính sách bảo mật
              </NavLink>
              <NavLink
                to="/terms"
                className="block text-sm text-gray-600 hover:text-teal-600 transition-colors"
              >
                Điều khoản sử dụng
              </NavLink>
              <NavLink
                to="/faq"
                className="block text-sm text-gray-600 hover:text-teal-600 transition-colors"
              >
                FAQ
              </NavLink>
            </nav>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>support@skillbridge.vn</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>1900 1234</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>Hà Nội, Việt Nam</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">
                Đăng ký nhận tin
              </h4>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <button className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors cursor-pointer">
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 text-center">
          <p className="text-sm text-gray-600">
            © 2024 SkillBridge. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

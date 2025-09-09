import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Play, Star, Users, BookOpen, Shield } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50/50 py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium mb-8 shadow-sm">
            <Shield className="mr-2 h-4 w-4 text-teal-600" />
            Nền tảng giáo dục với công nghệ Blockchain & AI
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
            <span className="text-teal-600">SkillBridge</span> - Cầu nối tri thức
            <br />
            <span className="text-gray-600">thông minh và minh bạch</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-lg text-gray-600 mb-10 leading-relaxed">
            Kết nối học viên và gia sư thông qua nền tảng hiện đại với AI gợi ý thông minh, thanh toán minh bạch qua
            Blockchain và trải nghiệm học tập trực tuyến tối ưu.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <NavLink
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white text-base font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              Bắt đầu ngay
              <ArrowRight className="ml-2 h-5 w-5" />
            </NavLink>
            <button className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-gray-200 hover:border-gray-300 text-gray-700 text-base font-medium rounded-xl transition-all duration-200 hover:bg-gray-50">
              <Play className="mr-2 h-5 w-5" />
              Xem demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-teal-600 mr-2" />
                <span className="text-3xl font-bold text-teal-600">1000+</span>
              </div>
              <p className="text-sm text-gray-600">Gia sư chất lượng</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-6 w-6 text-teal-600 mr-2" />
                <span className="text-3xl font-bold text-teal-600">50+</span>
              </div>
              <p className="text-sm text-gray-600">Môn học đa dạng</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-teal-600 mr-2" />
                <span className="text-3xl font-bold text-teal-600">4.9</span>
              </div>
              <p className="text-sm text-gray-600">Đánh giá trung bình</p>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl opacity-20">
          <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-teal-400 to-blue-400" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
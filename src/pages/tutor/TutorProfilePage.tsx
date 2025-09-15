import React from "react";
import { motion } from "framer-motion";
import {
  UserIcon,
  CameraIcon,
  AcademicCapIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const TutorProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý hồ sơ</h1>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Chỉnh sửa hồ sơ
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <UserIcon className="w-12 h-12 text-primary" />
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors">
              <CameraIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">John Smith</h2>
            <p className="text-gray-600 mb-2">Gia sư Toán & Vật lý</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <StarIcon className="w-4 h-4 mr-1 text-yellow-500" />
                <span>4.9 (127 đánh giá)</span>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1" />
                <span>Thành phố Hồ Chí Minh</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                <span>3 năm kinh nghiệm</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin cơ bản
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Họ và tên
              </label>
              <p className="text-gray-900">Nguyễn Văn A</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <p className="text-gray-900">nguyenvana@skillbridge.com</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Số điện thoại
              </label>
              <p className="text-gray-900">+84 (0) 901 234 567</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tiểu sử
              </label>
              <p className="text-gray-700">
                Gia sư Toán và Vật lý đầy đam mê với hơn 3 năm kinh nghiệm giúp
                học sinh đạt được mục tiêu học tập của mình.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Specializations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Chuyên môn
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              "Toán học",
              "Vật lý",
              "Giải tích",
              "Đại số",
              "Hình học",
              "Lượng giác",
            ].map((subject) => (
              <span
                key={subject}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
              >
                {subject}
              </span>
            ))}
          </div>
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-2">Học vấn</h4>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <AcademicCapIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">
                    Thạc sĩ Khoa học Toán học
                  </p>
                  <p className="text-gray-600 text-sm">
                    Đại học Bách Khoa TP.HCM • 2019-2021
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AcademicCapIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">
                    Cử nhân Khoa học Vật lý
                  </p>
                  <p className="text-gray-600 text-sm">
                    Đại học Khoa học Tự nhiên TP.HCM • 2015-2019
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Coming Soon Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "Cài đặt lịch rảnh",
            desc: "Thiết lập giờ dạy và lịch có sẵn của bạn",
          },
          {
            title: "Trạng thái xác thực",
            desc: "Hoàn thành xác minh danh tính và chứng chỉ",
          },
          {
            title: "Hồ sơ năng lực & Tài liệu",
            desc: "Tải lên chứng chỉ và tài liệu giảng dạy",
          },
        ].map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center"
          >
            <div className="w-12 h-12 bg-accent/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <AcademicCapIcon className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {section.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">{section.desc}</p>
            <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
              Sắp ra mắt
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TutorProfilePage;

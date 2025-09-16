import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  BookOpenIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

const StudentTutorSearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [location, setLocation] = useState("");

  // Mock data
  const subjects = [
    "Toán học", "Tiếng Anh", "Vật lý", "Hóa học", "Sinh học", 
    "Lịch sử", "Địa lý", "Ngữ văn", "Tin học", "IELTS", "TOEIC"
  ];

  const tutors = [
    {
      id: 1,
      name: "Thầy Nguyễn Văn A",
      avatar: "https://via.placeholder.com/80",
      rating: 4.9,
      reviewCount: 156,
      subjects: ["Toán học", "Vật lý"],
      experience: "5 năm kinh nghiệm",
      price: "300,000 VNĐ/giờ",
      location: "Quận 1, TP.HCM",
      isOnline: true,
      description: "Giáo viên Toán học tại trường THPT chuyên, có nhiều năm kinh nghiệm dạy học sinh giỏi.",
      achievements: ["Top 1% gia sư Toán", "100+ học sinh đậu đại học"],
      verified: true,
      responseTime: "Phản hồi trong 1 giờ",
    },
    {
      id: 2,
      name: "Cô Sarah Johnson",
      avatar: "https://via.placeholder.com/80",
      rating: 4.8,
      reviewCount: 89,
      subjects: ["Tiếng Anh", "IELTS"],
      experience: "3 năm kinh nghiệm",
      price: "400,000 VNĐ/giờ",
      location: "Quận 3, TP.HCM",
      isOnline: true,
      description: "Người nước ngoài, chuyên gia IELTS với chứng chỉ TESOL.",
      achievements: ["IELTS 8.5", "TESOL Certified"],
      verified: true,
      responseTime: "Phản hồi trong 30 phút",
    },
    {
      id: 3,
      name: "Cô Trần Thị B",
      avatar: "https://via.placeholder.com/80",
      rating: 4.7,
      reviewCount: 234,
      subjects: ["Vật lý", "Hóa học"],
      experience: "7 năm kinh nghiệm",
      price: "250,000 VNĐ/giờ",
      location: "Quận 5, TP.HCM",
      isOnline: false,
      description: "Thạc sĩ Vật lý, giảng viên đại học với phương pháp dạy độc đáo.",
      achievements: ["Thạc sĩ Vật lý", "500+ học sinh đã dạy"],
      verified: true,
      responseTime: "Phản hồi trong 2 giờ",
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarSolidIcon
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-blue-50 hover:shadow-md transition-shadow"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tìm gia sư</h1>
            <p className="text-gray-600">Tìm kiếm gia sư phù hợp với nhu cầu học tập của bạn</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-sm text-gray-500">
              Tìm thấy {tutors.length} gia sư
            </span>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-blue-50 hover:shadow-md transition-shadow"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm gia sư..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50/50"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50/50"
          >
            <option value="">Tất cả môn học</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>

          {/* Price Range */}
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50/50"
          >
            <option value="">Mức giá</option>
            <option value="0-200">Dưới 200,000 VNĐ</option>
            <option value="200-400">200,000 - 400,000 VNĐ</option>
            <option value="400-600">400,000 - 600,000 VNĐ</option>
            <option value="600+">Trên 600,000 VNĐ</option>
          </select>

          {/* Location */}
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50/50"
          >
            <option value="">Khu vực</option>
            <option value="district1">Quận 1</option>
            <option value="district3">Quận 3</option>
            <option value="district5">Quận 5</option>
            <option value="district7">Quận 7</option>
            <option value="online">Online</option>
          </select>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button className="flex items-center space-x-2 px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 bg-blue-50/50 transition-colors">
            <FunnelIcon className="w-5 h-5 text-blue-500" />
            <span className="text-blue-700">Bộ lọc nâng cao</span>
          </button>
          <button className="text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
            Xóa bộ lọc
          </button>
        </div>
      </motion.div>

      {/* Tutor List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tutors.map((tutor, index) => (
          <motion.div
            key={tutor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-gradient-to-r from-white to-blue-50 rounded-xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start space-x-4">
              <div className="relative">
                <img
                  src={tutor.avatar}
                  alt={tutor.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                {tutor.verified && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{tutor.name}</h3>
                  <div className="flex items-center space-x-1">
                    {renderStars(tutor.rating)}
                    <span className="text-sm text-gray-600 ml-1">
                      {tutor.rating} ({tutor.reviewCount})
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <BookOpenIcon className="w-4 h-4 mr-1" />
                      {tutor.subjects.join(", ")}
                    </span>
                    <span className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-1" />
                      {tutor.experience}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                      {tutor.price}
                    </span>
                    <span className="flex items-center">
                      {tutor.isOnline ? (
                        <VideoCameraIcon className="w-4 h-4 mr-1" />
                      ) : (
                        <MapPinIcon className="w-4 h-4 mr-1" />
                      )}
                      {tutor.isOnline ? "Online" : tutor.location}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {tutor.responseTime}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {tutor.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {tutor.achievements.map((achievement, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {achievement}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Xem hồ sơ
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <StarIcon className="w-5 h-5 text-gray-600" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Xem thêm gia sư
        </motion.button>
      </motion.div>
    </div>
  );
};

export default StudentTutorSearchPage;
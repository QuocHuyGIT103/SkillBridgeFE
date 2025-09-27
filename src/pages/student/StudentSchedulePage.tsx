import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  ClockIcon,
  VideoCameraIcon,
  MapPinIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const StudentSchedulePage: React.FC = () => {
  const [view, setView] = useState<"week" | "month">("week");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const upcomingLessons = [
    {
      id: 1,
      title: "Toán học - Đại số",
      tutor: "Thầy Nguyễn Văn A",
      date: "2024-09-16",
      time: "14:00 - 16:00",
      type: "online",
      status: "confirmed",
      avatar: "https://via.placeholder.com/40",
    },
    {
      id: 2,
      title: "Tiếng Anh - Grammar",
      tutor: "Cô Sarah Johnson",
      date: "2024-09-16",
      time: "19:00 - 21:00",
      type: "offline",
      location: "123 Đường ABC, Quận 1",
      status: "pending",
      avatar: "https://via.placeholder.com/40",
    },
    {
      id: 3,
      title: "Vật lý - Cơ học",
      tutor: "Thầy Trần Văn B",
      date: "2024-09-17",
      time: "16:00 - 18:00",
      type: "online",
      status: "confirmed",
      avatar: "https://via.placeholder.com/40",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận";
      case "pending":
        return "Chờ xác nhận";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Lịch học</h1>
            <p className="text-gray-600">Quản lý và theo dõi lịch học của bạn</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg"
            >
              Đặt lịch học mới
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filter and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm buổi học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <span>Bộ lọc</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView("week")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === "week"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => setView("month")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === "month"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tháng
            </button>
          </div>
        </div>
      </motion.div>

      {/* Calendar Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-blue-50 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-blue-50 transition-colors">
              <ChevronLeftIcon className="w-5 h-5 text-blue-600" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              Tháng 9, 2024
            </h2>
            <button className="p-2 rounded-lg hover:bg-blue-50 transition-colors">
              <ChevronRightIcon className="w-5 h-5 text-blue-600" />
            </button>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
            Hôm nay
          </button>
        </div>

        {/* Simple Calendar View */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-blue-600 py-3 bg-blue-50 rounded-lg">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 6; // Start from Monday
            const isToday = day === 16;
            const hasLesson = [16, 17, 20].includes(day);
            
            return (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 ${
                  day > 0 && day <= 30
                    ? isToday
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                      : hasLesson
                      ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 hover:from-blue-200 hover:to-indigo-200 shadow-sm"
                      : "hover:bg-blue-50 text-gray-700"
                    : "text-gray-300"
                }`}
              >
                {day > 0 && day <= 30 && (
                  <span className="text-sm font-medium">{day}</span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Upcoming Lessons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <CalendarDaysIcon className="w-6 h-6 mr-2" />
          Buổi học sắp tới
        </h2>

        <div className="space-y-4">
          {upcomingLessons.map((lesson) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-white to-blue-50 border border-blue-100 rounded-lg p-4 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={lesson.avatar}
                    alt={lesson.tutor}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-1" />
                        {lesson.tutor}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {lesson.time}
                      </span>
                      <span className="flex items-center">
                        {lesson.type === "online" ? (
                          <>
                            <VideoCameraIcon className="w-4 h-4 mr-1" />
                            Online
                          </>
                        ) : (
                          <>
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {lesson.location || "Offline"}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      lesson.status
                    )}`}
                  >
                    {getStatusText(lesson.status)}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Chi tiết
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default StudentSchedulePage;

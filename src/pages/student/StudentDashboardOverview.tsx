import React from "react";
import { motion } from "framer-motion";
import {
  ClockIcon,
  ChartBarIcon,
  BookOpenIcon,
  TrophyIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  UserIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const StudentDashboardOverview: React.FC = () => {
  // Mock data - thay thế bằng data thực từ API
  const studentStats = {
    weeklyLessons: 8,
    totalStudyHours: 124,
    subjects: 5,
    averageGrade: 8.5,
  };

  const upcomingLessons = [
    {
      id: 1,
      subject: "Toán học - Đại số",
      tutor: "Thầy Nguyễn Văn A",
      time: "14:00 - 16:00",
      mode: "Online",
      action: "Tham gia",
    },
    {
      id: 2,
      subject: "Tiếng Anh - Grammar",
      tutor: "Cô Sarah Johnson",
      time: "19:00 - 21:00", 
      mode: "Offline",
      action: "Chi tiết",
    },
  ];

  const quickActions = [
    {
      id: 1,
      title: "Tin nhắn với gia sư",
      description: "Liên hệ trực tiếp với giáo viên",
      icon: ChatBubbleLeftRightIcon,
      color: "bg-blue-500",
      path: "/student/messages",
    },
    {
      id: 2,
      title: "Nộp bài tập",
      description: "Hoàn thành và nộp bài tập đã giao",
      icon: DocumentTextIcon,
      color: "bg-green-500",
      path: "/student/assignments",
    },
    {
      id: 3,
      title: "Đặt lịch học mới",
      description: "Lên lịch buổi học với gia sư",
      icon: CalendarDaysIcon,
      color: "bg-purple-500",
      path: "/student/schedule",
    },
    {
      id: 4,
      title: "Đánh giá buổi học",
      description: "Đánh giá và phản hồi về buổi học",
      icon: TrophyIcon,
      color: "bg-yellow-500",
      path: "/student/ratings",
    },
  ];

  const aiSuggestions = [
    {
      id: 1,
      title: "Gia sư Toán nâng cao",
      description: "Dựa trên điểm số gần đây, bạn nên tìm gia sư chuyên về Toán nâng cao để cải thiện kết quả.",
      priority: "high",
    },
    {
      id: 2,
      title: "Luyện thi IELTS",
      description: "Với trình độ Tiếng Anh hiện tại, bạn có thể bắt đầu luyện thi IELTS để đạt mục tiêu 7.0.",
      priority: "medium",
    },
    {
      id: 3,
      title: "Ôn tập Vật lý",
      description: "Bạn cần tăng cường ôn tập Vật lý, đặc biệt là phần Cơ học và Điện học.",
      priority: "medium",
    },
  ];

  const tutorProgress = [
    { subject: "Toán học", progress: 85, color: "bg-blue-500" },
    { subject: "Tiếng Anh", progress: 72, color: "bg-green-500" },
    { subject: "Vật lý", progress: 68, color: "bg-purple-500" },
    { subject: "Hóa học", progress: 91, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Chào mừng trở lại, Minh Anh!</h1>
            <p className="text-blue-50">
              Hôm nay bạn có 2 buổi học và 3 bài tập cần hoàn thành
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-lg"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>Gợi ý AI</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-blue-50 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Buổi học tuần này</p>
              <p className="text-3xl font-bold text-gray-900">{studentStats.weeklyLessons}</p>
              <p className="text-sm text-green-600 mt-1">+2 so với tuần trước</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center shadow-sm">
              <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Giờ học tích lũy</p>
              <p className="text-3xl font-bold text-gray-900">{studentStats.totalStudyHours}</p>
              <p className="text-sm text-blue-600 mt-1">Tổng thời gian học</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-lg flex items-center justify-center shadow-sm">
              <ClockIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Môn học</p>
              <p className="text-3xl font-bold text-gray-900">{studentStats.subjects}</p>
              <p className="text-sm text-purple-600 mt-1">Đang theo học</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg flex items-center justify-center shadow-sm">
              <BookOpenIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Điểm trung bình</p>
              <p className="text-3xl font-bold text-gray-900">{studentStats.averageGrade}</p>
              <p className="text-sm text-yellow-600 mt-1">+0.3 điểm</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center shadow-sm">
              <TrophyIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-blue-50 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <CalendarDaysIcon className="w-6 h-6 mr-2 text-blue-600" />
              Lịch học hôm nay
            </h2>
          </div>

          <div className="space-y-4">
            {upcomingLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-100 rounded-lg hover:shadow-md transition-all duration-200"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {lesson.subject}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-1" />
                      {lesson.tutor}
                    </span>
                    <span>{lesson.time}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        lesson.mode === "Online"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {lesson.mode}
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm ${
                    lesson.action === "Tham gia"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg"
                      : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300"
                  }`}
                >
                  {lesson.action}
                </motion.button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Thao tác nhanh</h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <motion.div
                key={action.id}
                whileHover={{ scale: 1.02 }}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mr-3 shadow-sm`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <ChartBarIcon className="w-6 h-6 mr-2" />
            Tiến độ theo môn học
          </h2>
          <div className="space-y-4">
            {tutorProgress.map((subject, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{subject.subject}</span>
                  <span className="text-sm text-gray-600">{subject.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${subject.progress}%` }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                    className={`h-2 rounded-full ${subject.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Xem chi tiết →
            </motion.button>
          </div>
        </motion.div>

        {/* AI Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <SparklesIcon className="w-6 h-6 mr-2 text-purple-600" />
            Gợi ý AI cho bạn
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Dựa trên tiến độ học tập và mục tiêu của bạn
          </p>
          <div className="space-y-3">
            {aiSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {suggestion.title}
                  </h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      suggestion.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {suggestion.priority === "high" ? "Ưu tiên cao" : "Ưu tiên trung bình"}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{suggestion.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboardOverview;

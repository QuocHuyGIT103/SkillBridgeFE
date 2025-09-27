import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserGroupIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  BookOpenIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  BellAlertIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  UserGroupIcon as UserGroupSolidIcon,
  CalendarIcon as CalendarSolidIcon,
  CurrencyDollarIcon as CurrencySolidIcon,
  StarIcon as StarSolidIcon,
} from "@heroicons/react/24/solid";
import { useQualificationStore } from "../../store/qualification.store";
import type {
  DashboardStats,
  RecentActivity,
  UpcomingSession,
} from "../../types/tutor.types.ts";

const TutorDashboardOverview: React.FC = () => {
  // Qualification store
  const { qualificationInfo, fetchQualifications } = useQualificationStore();

  // Load qualification data on mount
  useEffect(() => {
    fetchQualifications();
  }, [fetchQualifications]);

  // Mock data - replace with actual API calls
  const stats: DashboardStats = {
    total_students: 24,
    active_lessons: 8,
    completed_lessons: 156,
    total_earnings: 3450.75,
    pending_payments: 245.5,
    avg_rating: 4.8,
    upcoming_sessions: 5,
    new_messages: 12,
  };

  const recentActivities: RecentActivity[] = [
    {
      id: "1",
      type: "lesson_completed",
      title: "Bài học hoàn thành",
      description: "Bài học Toán với Sarah Johnson - Cơ bản về Đại số",
      timestamp: "2025-01-15T14:30:00Z",
      student_name: "Sarah Johnson",
    },
    {
      id: "2",
      type: "payment_received",
      title: "Đã nhận thanh toán",
      description: "Thanh toán cho buổi học Hóa học",
      timestamp: "2025-01-15T13:15:00Z",
      amount: 45,
    },
    {
      id: "3",
      type: "new_student",
      title: "Học sinh mới đăng ký",
      description: "Mike Chen đã tham gia lớp Vật lý của bạn",
      timestamp: "2025-01-15T11:45:00Z",
      student_name: "Mike Chen",
    },
    {
      id: "4",
      type: "lesson_scheduled",
      title: "Bài học đã lên lịch",
      description: "Bài học Sinh học đã được lên lịch cho ngày mai",
      timestamp: "2025-01-15T10:20:00Z",
      student_name: "Emma Davis",
    },
  ];

  const upcomingSessions: UpcomingSession[] = [
    {
      id: "1",
      student_name: "Sarah Johnson",
      subject: "Toán học",
      scheduled_at: "2025-01-16T15:00:00Z",
      duration_minutes: 60,
      status: "confirmed",
      meeting_link: "https://meet.example.com/abc123",
    },
    {
      id: "2",
      student_name: "Mike Chen",
      subject: "Vật lý",
      scheduled_at: "2025-01-16T16:30:00Z",
      duration_minutes: 90,
      status: "confirmed",
    },
    {
      id: "3",
      student_name: "Emma Davis",
      subject: "Sinh học",
      scheduled_at: "2025-01-17T14:00:00Z",
      duration_minutes: 60,
      status: "pending",
    },
  ];

  const quickActions = [
    {
      id: "schedule-lesson",
      title: "Lên lịch bài học mới",
      description: "Đặt lịch học mới với học sinh của bạn",
      icon: CalendarIcon,
      color: "primary",
      href: "/tutor/schedule/lessons",
    },
    {
      id: "manage-students",
      title: "Quản lý học sinh",
      description: "Xem và quản lý danh sách học sinh",
      icon: UserGroupIcon,
      color: "secondary",
      href: "/tutor/academics/students",
    },
    {
      id: "create-material",
      title: "Tải lên tài liệu",
      description: "Chia sẻ tài liệu học tập",
      icon: DocumentTextIcon,
      color: "accent",
      href: "/tutor/academics/materials",
    },
    {
      id: "view-earnings",
      title: "Xem thu nhập",
      description: "Kiểm tra tổng quan tài chính",
      icon: CurrencyDollarIcon,
      color: "primary",
      href: "/tutor/finance/earnings",
    },
  ];

  const getActivityIcon = (type: RecentActivity["type"]) => {
    const className = "w-5 h-5";
    switch (type) {
      case "lesson_completed":
        return <BookOpenIcon className={className} />;
      case "payment_received":
        return <CurrencyDollarIcon className={className} />;
      case "new_student":
        return <UserGroupIcon className={className} />;
      case "lesson_scheduled":
        return <CalendarIcon className={className} />;
      case "message_received":
        return <ChatBubbleLeftRightIcon className={className} />;
      default:
        return <BellAlertIcon className={className} />;
    }
  };

  const getActivityColor = (type: RecentActivity["type"]) => {
    switch (type) {
      case "lesson_completed":
        return "text-green-600 bg-green-100";
      case "payment_received":
        return "text-primary bg-primary/10";
      case "new_student":
        return "text-blue-600 bg-blue-100";
      case "lesson_scheduled":
        return "text-purple-600 bg-purple-100";
      case "message_received":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatSessionTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString("vi-VN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("vi-VN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount * 25000); // Convert USD to VND approximately
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 bg-primary"
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white/80">
          Chào mừng bạn trở lại! 👋
        </h1>
        <p className="text-white/80 text-lg">
          Bạn có {stats.upcoming_sessions} buổi học sắp tới hôm nay và{" "}
          {stats.new_messages} tin nhắn mới.
        </p>
      </motion.div>

      {/* Qualification Status */}
      {qualificationInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
        >
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <AcademicCapIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Trạng thái trình độ
              </h3>
              <p className="text-gray-700 mb-3">
                {qualificationInfo.suggestion}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Đủ điều kiện:</span>
                  <span
                    className={
                      qualificationInfo.isQualified
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {qualificationInfo.isQualified ? "Có" : "Chưa"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Có thể gửi yêu cầu:</span>
                  <span
                    className={
                      qualificationInfo.canSubmitVerification
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {qualificationInfo.canSubmitVerification ? "Có" : "Không"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Đang chờ xác thực:</span>
                  <span className="text-blue-600">
                    {qualificationInfo.pendingVerificationCount}
                  </span>
                </div>
              </div>
              {qualificationInfo.canSubmitVerification && (
                <div className="mt-4">
                  <Link
                    to="/tutor/profile/education"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Quản lý trình độ</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tổng số học sinh
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total_students}
              </p>
              <p className="text-sm text-green-600 mt-2">+3 tháng này</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <UserGroupSolidIcon className="w-6 h-6 text-primary" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Bài học đang diễn ra
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.active_lessons}
              </p>
              <p className="text-sm text-blue-600 mt-2">
                {stats.upcoming_sessions} sắp tới
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CalendarSolidIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng thu nhập</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.total_earnings)}
              </p>
              <p className="text-sm text-green-600 mt-2">+12% tháng này</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CurrencySolidIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Điểm đánh giá trung bình
              </p>
              <div className="flex items-center mt-1">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.avg_rating}
                </p>
                <div className="flex ml-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarSolidIcon
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.floor(stats.avg_rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Dựa trên 48 đánh giá</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <StarSolidIcon className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <motion.div key={action.id} variants={itemVariants}>
              <Link
                to={action.href}
                className="block p-4 rounded-lg border-2 border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg bg-${action.color}/10 group-hover:bg-${action.color}/20 transition-colors`}
                  >
                    <action.icon className={`w-5 h-5 text-${action.color}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Buổi học sắp tới
            </h2>
            <Link
              to="/tutor/schedule/calendar"
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingSessions.map((session) => {
              const timeInfo = formatSessionTime(session.scheduled_at);
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <AcademicCapIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {session.student_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {session.subject} • {session.duration_minutes} phút
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {timeInfo.time}
                    </p>
                    <p className="text-xs text-gray-500">{timeInfo.date}</p>
                    {session.status === "confirmed" && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        Đã xác nhận
                      </span>
                    )}
                    {session.status === "pending" && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        Đang chờ
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Hoạt động gần đây
            </h2>
            <Link
              to="/tutor/activities"
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-lg ${getActivityColor(
                    activity.type
                  )}`}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.timestamp).toLocaleTimeString("vi-VN", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </p>
                </div>
                {activity.amount && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      +{formatCurrency(activity.amount)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Tổng quan hiệu suất
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
              <ArrowTrendingUpIcon className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.completed_lessons}
            </p>
            <p className="text-sm text-gray-600">Bài học hoàn thành</p>
            <p className="text-xs text-green-600 mt-1">+8% tháng này</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
              <ClockIcon className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">124</p>
            <p className="text-sm text-gray-600">Giờ dạy</p>
            <p className="text-xs text-blue-600 mt-1">Tháng này</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-3">
              <VideoCameraIcon className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">98%</p>
            <p className="text-sm text-gray-600">Tỷ lệ tham dự</p>
            <p className="text-xs text-purple-600 mt-1">Tuyệt vời!</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TutorDashboardOverview;

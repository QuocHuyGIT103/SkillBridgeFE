import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
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
  BellAlertIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  CalendarIcon as CalendarSolidIcon,
  CurrencyDollarIcon as CurrencySolidIcon,
  StarIcon as StarSolidIcon,
} from "@heroicons/react/24/solid";
import { useTutorProfileStore } from "../../store/tutorProfile.store";
import TutorProfileStatusCard from "../../components/tutor/TutorProfileStatusCard";
import TutorDashboardService from "../../services/tutor/tutorDashboard.service";
import TutorFinanceService from "../../services/tutor/tutorFinance.service";
import type {
  DashboardStats,
  RecentActivity,
  UpcomingSession,
} from "../../types/tutor.types.ts";

const TutorDashboardOverview: React.FC = () => {
  // TutorProfile store
  const { profileStatusData, profileData, checkOperationStatus, fetchProfile } =
    useTutorProfileStore();

  // Dashboard data state
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    total_students: 0,
    active_lessons: 0,
    completed_lessons: 0,
    total_earnings: 0,
    pending_payments: 0,
    avg_rating: 0,
    upcoming_sessions: 0,
    new_messages: 0,
  });
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>(
    []
  );
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);

  // Load profile and dashboard data on mount (guard against double-invoke in StrictMode)
  const fetchedRef = useRef(false);
  useEffect(() => {
    // Prevent duplicate API calls (especially in React StrictMode)
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // Load profile status
    checkOperationStatus();
    fetchProfile();

    // Load dashboard data
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - run only once on mount

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardResponse, financeStats] = await Promise.all([
        TutorDashboardService.getDashboardOverview(),
        TutorFinanceService.calculateEarningsStats(),
      ]);

      // Use finance stats for accurate earnings calculation (80/20 split)
      setStats({
        ...dashboardResponse.stats,
        total_earnings: financeStats.totalEarnings,
        pending_payments: financeStats.pendingEarnings,
      });
      setUpcomingSessions(dashboardResponse.upcomingSessions);
      // Load recent activities in background after main data loads
      loadRecentActivities();
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      setError(error.message || "Đã xảy ra lỗi khi tải dữ liệu");
      toast.error(error.message || "Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivities = async () => {
    setLoadingActivities(true);
    try {
      const activities = await TutorDashboardService.getRecentActivitiesOnly();
      setRecentActivities(activities);
    } catch (error: any) {
      console.error("Error loading recent activities:", error);
      // Silent fail - activities are not critical
    } finally {
      setLoadingActivities(false);
    }
  };

  const quickActions = [
    {
      id: "schedule-lesson",
      title: "Xem lịch giảng dạy",
      description: "Quản lý các buổi học của bạn",
      icon: CalendarIcon,
      color: "primary",
      href: "/tutor/schedule",
    },
    {
      id: "create-post",
      title: "Tạo bài đăng",
      description: "Đăng tin tuyển học viên mới",
      icon: PlusCircleIcon,
      color: "secondary",
      href: "/tutor/posts/create",
    },
    {
      id: "find-students",
      title: "Tìm học viên",
      description: "Xem các yêu cầu học từ học viên",
      icon: MagnifyingGlassIcon,
      color: "accent",
      href: "/tutor/posts/student",
    },
    {
      id: "view-earnings",
      title: "Xem thu nhập",
      description: "Kiểm tra tổng quan tài chính",
      icon: CurrencyDollarIcon,
      color: "primary",
      href: "/tutor/finance",
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
    }).format(amount);
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
      {/* Profile Verification Alert removed; using Status Card only */}

      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 bg-primary"
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white/80">
          Chào mừng bạn trở lại! 👋
        </h1>
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <p className="text-white/80 text-lg">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <p className="text-white/80 text-lg">
            Bạn có {stats.upcoming_sessions} buổi học sắp tới và{" "}
            {stats.new_messages} tin nhắn mới.
          </p>
        )}
      </motion.div>

      {/* TutorProfile Status */}
      {profileStatusData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TutorProfileStatusCard
            statusData={profileStatusData}
            profileData={profileData?.profile}
            showActions={true}
          />
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Bài học đang diễn ra
              </p>
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.active_lessons}
                </p>
              )}
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
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-24 rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.total_earnings)}
                </p>
              )}
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
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-20 rounded mt-1"></div>
              ) : (
                <div className="flex items-center mt-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.avg_rating > 0 ? stats.avg_rating.toFixed(1) : "--"}
                  </p>
                  {stats.avg_rating > 0 && (
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
                  )}
                </div>
              )}
              <p className="text-sm text-gray-400 mt-2">
                {stats.avg_rating > 0
                  ? "Từ học sinh của bạn"
                  : "Chưa có đánh giá"}
              </p>
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
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Không có buổi học sắp tới</p>
              </div>
            ) : (
              upcomingSessions.map((session) => {
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
              })
            )}
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
            {loadingActivities ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex items-start space-x-3"
                  >
                    <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <BellAlertIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Chưa có hoạt động gần đây</p>
              </div>
            ) : (
              recentActivities.map((activity) => (
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
                      {new Date(activity.timestamp).toLocaleTimeString(
                        "vi-VN",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: false,
                        }
                      )}
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
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TutorDashboardOverview;

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ClockIcon,
  ChartBarIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  UserIcon,
  StarIcon,
  BellIcon,
  ExclamationCircleIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import {
  getStudentProfile,
  getStudentClasses,
  getWeeklySchedule,
  getPendingContracts,
  getConversations,
  getUnreadNotificationCount,
  calculateDashboardStats,
  getTodaySessions,
  countUnreadMessages,
  type DashboardStats,
  type WeeklyScheduleResponse,
  type ConversationItem,
} from "../../api/studentDashboard.api";
import type { StudentProfileData } from "../../types/student.types";
import type { LearningClass } from "../../types/LearningClass";
import type { Contract } from "../../types/contract.types";

const StudentDashboardOverview: React.FC = () => {
  const navigate = useNavigate();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<StudentProfileData | null>(
    null
  );
  const [classes, setClasses] = useState<LearningClass[]>([]);
  const [weeklySchedule, setWeeklySchedule] =
    useState<WeeklyScheduleResponse | null>(null);
  const [pendingContracts, setPendingContracts] = useState<Contract[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    weeklyLessons: 0,
    totalStudyHours: 0,
    activeClasses: 0,
    pendingContracts: 0,
  });

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch all data in parallel
        const [
          profileRes,
          classesRes,
          weeklyRes,
          contractsRes,
          conversationsRes,
          notificationsRes,
        ] = await Promise.all([
          getStudentProfile(),
          getStudentClasses(),
          getWeeklySchedule(),
          getPendingContracts(),
          getConversations(),
          getUnreadNotificationCount(),
        ]);

        // Set data
        if (profileRes.success) setProfileData(profileRes.data);
        if (classesRes.success) setClasses(classesRes.data);
        if (weeklyRes.success) setWeeklySchedule(weeklyRes.data);
        if (contractsRes.success) setPendingContracts(contractsRes.data);
        if (conversationsRes.success) setConversations(conversationsRes.data);
        if (notificationsRes.success)
          setUnreadNotifications(notificationsRes.data.unreadCount);

        // Calculate statistics
        if (classesRes.success && weeklyRes.success && contractsRes.success) {
          const calculatedStats = calculateDashboardStats(
            classesRes.data,
            weeklyRes.data,
            contractsRes.data
          );
          setStats(calculatedStats);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Get today's sessions
  const todaySessions = weeklySchedule ? getTodaySessions(weeklySchedule) : [];

  // Count unread messages
  const unreadMessages = profileData?.user
    ? countUnreadMessages(conversations, profileData.user._id)
    : 0;

  // Get active classes
  const activeClasses = classes.filter((cls) => cls.status === "ACTIVE");

  // Quick actions configuration - only show pending contracts if exists
  const quickActions = [
    {
      id: 1,
      title: "Tin nhắn với gia sư",
      description: "Liên hệ trực tiếp với gia sư",
      icon: ChatBubbleLeftRightIcon,
      color: "bg-blue-500",
      path: "/student/messages",
      badge: unreadMessages,
    },
    ...(stats.pendingContracts > 0
      ? [
          {
            id: 2,
            title: "Hợp đồng chờ ký",
            description: "Xem và ký các hợp đồng đang chờ",
            icon: DocumentTextIcon,
            color: "bg-orange-500",
            path: "/student/contracts",
            badge: stats.pendingContracts,
          },
        ]
      : []),
    {
      id: 3,
      title: "Tạo bài đăng",
      description: "Đăng yêu cầu tìm gia sư",
      icon: StarIcon,
      color: "bg-yellow-500",
      path: "/student/posts/create",
    },
    {
      id: 4,
      title: "Yêu cầu tìm gia sư",
      description: "Quản lý yêu cầu tìm gia sư",
      icon: UserIcon,
      color: "bg-purple-500",
      path: "/student/contact-requests",
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl p-6 h-32 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-xl p-6 h-32 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold mb-2">
              Chào mừng trở lại, {profileData?.user?.full_name || "Bạn"}!
            </h1>
            <p className="text-blue-50">
              {todaySessions.length > 0
                ? `Hôm nay bạn có ${todaySessions.length} buổi học`
                : "Hôm nay bạn không có buổi học nào"}
            </p>
          </div>
          {unreadNotifications > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/student/notifications")}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-lg"
            >
              <BellIcon className="w-5 h-5" />
              <span>Thông báo ({unreadNotifications})</span>
            </motion.button>
          )}
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
              <p className="text-3xl font-bold text-gray-900">
                {stats.weeklyLessons}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {stats.weeklyLessons > 0 ? "Đã lên lịch" : "Chưa có lịch"}
              </p>
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
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalStudyHours}
              </p>
              <p className="text-sm text-green-600 mt-1">Tổng thời gian học</p>
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
          whileHover={stats.activeClasses > 0 ? { scale: 1.02 } : {}}
          onClick={() =>
            stats.activeClasses > 0 && navigate("/student/classes")
          }
          className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${
            stats.activeClasses > 0
              ? "cursor-pointer hover:shadow-md transition-all"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Lớp học đang diễn ra</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.activeClasses}
              </p>
              <p className="text-sm text-purple-600 mt-1">
                {stats.activeClasses > 0
                  ? "Nhấn để xem chi tiết"
                  : "Chưa có lớp"}
              </p>
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
              <p className="text-sm text-gray-600 mb-1">Hợp đồng chờ ký</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.pendingContracts}
              </p>
              <p className="text-sm text-orange-600 mt-1">
                {stats.pendingContracts > 0 ? "Cần xử lý" : "Đã xử lý hết"}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg flex items-center justify-center shadow-sm">
              <DocumentTextIcon className="w-6 h-6 text-orange-600" />
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
            {todaySessions.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDaysIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">
                  Bạn chưa có buổi học nào hôm nay
                </p>
              </div>
            ) : (
              todaySessions.map((session) => (
                <div
                  key={`${session.classId}-${session.sessionNumber}`}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-100 rounded-lg hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {session.className}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-1" />
                        {session.tutor.full_name}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {new Date(session.scheduledDate).toLocaleTimeString(
                          "vi-VN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}{" "}
                        ({session.duration} phút)
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          session.learningMode === "ONLINE"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {session.learningMode === "ONLINE"
                          ? "Online"
                          : "Offline"}
                      </span>
                    </div>
                  </div>
                  {session.learningMode === "ONLINE" && session.meetingLink ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        window.open(session.meetingLink!, "_blank")
                      }
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg"
                    >
                      Tham gia
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        navigate(`/student/classes/${session.classId}`)
                      }
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300"
                    >
                      Chi tiết
                    </motion.button>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Thao tác nhanh
          </h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <motion.div
                key={action.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(action.path)}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div
                  className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mr-3 shadow-sm relative`}
                >
                  <action.icon className="w-5 h-5 text-white" />
                  {action.badge !== undefined && action.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {action.badge > 9 ? "9+" : action.badge}
                    </span>
                  )}
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

        {/* Recent Activity - Moved here from bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <BellIcon className="w-6 h-6 mr-2 text-purple-600" />
            Hoạt động gần đây
          </h2>

          <div className="space-y-4">
            {/* Pending Contracts */}
            <div className="pb-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <DocumentTextIcon className="w-4 h-4 mr-2 text-orange-600" />
                Hợp đồng chờ ký
              </h3>
              {pendingContracts.length === 0 ? (
                <p className="text-sm text-gray-500 ml-6">
                  Không có hợp đồng nào chờ ký
                </p>
              ) : (
                <div className="space-y-2">
                  {pendingContracts.slice(0, 2).map((contract) => (
                    <div
                      key={contract.id}
                      className="ml-6 p-3 bg-orange-50 border border-orange-100 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer"
                      onClick={() =>
                        navigate(`/student/contracts/${contract.id}`)
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {contract.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            Tạo ngày:{" "}
                            {new Date(contract.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                        <ExclamationCircleIcon className="w-5 h-5 text-orange-600 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                  {pendingContracts.length > 2 && (
                    <button
                      onClick={() => navigate("/student/contracts")}
                      className="text-orange-600 hover:text-orange-700 font-medium text-xs ml-6"
                    >
                      Xem thêm {pendingContracts.length - 2} hợp đồng →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Unread Messages */}
            <div className="pb-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2 text-blue-600" />
                Tin nhắn chưa đọc
              </h3>
              <p className="text-sm text-gray-600 ml-6">
                {unreadMessages > 0 ? (
                  <span>
                    Bạn có{" "}
                    <span className="font-semibold text-blue-600">
                      {unreadMessages}
                    </span>{" "}
                    tin nhắn chưa đọc
                  </span>
                ) : (
                  "Không có tin nhắn mới"
                )}
              </p>
              {unreadMessages > 0 && (
                <button
                  onClick={() => navigate("/student/messages")}
                  className="text-blue-600 hover:text-blue-700 font-medium text-xs ml-6 mt-2"
                >
                  Xem tin nhắn →
                </button>
              )}
            </div>

            {/* Unread Notifications */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <BellIcon className="w-4 h-4 mr-2 text-purple-600" />
                Thông báo
              </h3>
              <p className="text-sm text-gray-600 ml-6">
                {unreadNotifications > 0 ? (
                  <span>
                    Bạn có{" "}
                    <span className="font-semibold text-purple-600">
                      {unreadNotifications}
                    </span>{" "}
                    thông báo chưa đọc
                  </span>
                ) : (
                  "Không có thông báo mới"
                )}
              </p>
              {unreadNotifications > 0 && (
                <button
                  onClick={() => navigate("/student/notifications")}
                  className="text-purple-600 hover:text-purple-700 font-medium text-xs ml-6 mt-2"
                >
                  Xem thông báo →
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Classes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <ChartBarIcon className="w-6 h-6 mr-2" />
            Lớp học của tôi
          </h2>
          <div className="space-y-4">
            {activeClasses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpenIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 mb-2">Bạn chưa có lớp học nào</p>
                <button
                  onClick={() => navigate("/student/find-tutors")}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Tìm gia sư ngay →
                </button>
              </div>
            ) : (
              activeClasses.map((cls) => {
                const progress =
                  cls.totalSessions > 0
                    ? (cls.completedSessions / cls.totalSessions) * 100
                    : 0;
                const remainingSessions =
                  cls.totalSessions - cls.completedSessions;

                return (
                  <div
                    key={cls._id}
                    className="space-y-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate("/student/schedule")}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          {cls.subject.name}
                        </span>
                        <p className="text-xs text-gray-500">
                          Gia sư: {cls.tutorId.full_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {Math.round(progress)}%
                        </span>
                        <p className="text-xs text-gray-500">
                          Còn {remainingSessions} buổi
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {activeClasses.length > 0 && (
            <div className="mt-4 text-right">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/student/classes")}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Xem tất cả →
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Payment & Finance - New section replacing old Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <CreditCardIcon className="w-6 h-6 mr-2 text-green-600" />
            Thanh toán & Tài chính
          </h2>

          <div className="space-y-4">
            {/* Payment Status by Class */}
            <div className="pb-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <DocumentTextIcon className="w-4 h-4 mr-2 text-blue-600" />
                Trạng thái thanh toán
              </h3>
              {activeClasses.length === 0 ? (
                <p className="text-sm text-gray-500 ml-6">
                  Chưa có lớp học nào
                </p>
              ) : (
                <div className="ml-6 space-y-2">
                  {activeClasses.slice(0, 3).map((cls) => {
                    const paymentProgress =
                      cls.totalAmount > 0
                        ? (cls.paidAmount / cls.totalAmount) * 100
                        : 0;
                    return (
                      <div
                        key={cls._id}
                        className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-900">
                            {cls.subject.name}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              cls.paymentStatus === "COMPLETED"
                                ? "bg-green-100 text-green-700"
                                : cls.paymentStatus === "PARTIAL"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {cls.paymentStatus === "COMPLETED"
                              ? "Hoàn thành"
                              : cls.paymentStatus === "PARTIAL"
                              ? "Một phần"
                              : "Chưa trả"}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-green-600"
                            style={{ width: `${paymentProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {cls.paidAmount.toLocaleString("vi-VN")} /{" "}
                          {cls.totalAmount.toLocaleString("vi-VN")} VNĐ
                        </p>
                      </div>
                    );
                  })}
                  {activeClasses.length > 3 && (
                    <button
                      onClick={() => navigate("/student/classes")}
                      className="text-blue-600 hover:text-blue-700 font-medium text-xs"
                    >
                      Xem tất cả →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Payment Actions */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <CreditCardIcon className="w-4 h-4 mr-2 text-purple-600" />
                Hành động nhanh
              </h3>
              <div className="ml-6 space-y-2">
                {activeClasses.some(
                  (cls) => cls.paymentStatus !== "COMPLETED"
                ) && (
                  <button
                    onClick={() => navigate("/student/finance/payment")}
                    className="w-full text-left p-2 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                  >
                    <p className="text-sm font-medium text-orange-700">
                      Thanh toán học phí
                    </p>
                    <p className="text-xs text-orange-600">
                      Có{" "}
                      {
                        activeClasses.filter(
                          (cls) => cls.paymentStatus !== "COMPLETED"
                        ).length
                      }{" "}
                      lớp cần thanh toán
                    </p>
                  </button>
                )}
                <button
                  onClick={() => navigate("/student/finance/overview")}
                  className="w-full text-left p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <p className="text-sm font-medium text-blue-700">
                    Xem lịch thanh toán
                  </p>
                  <p className="text-xs text-blue-600">
                    Theo dõi tất cả lịch trình thanh toán
                  </p>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboardOverview;

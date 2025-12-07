import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  DocumentTextIcon,
  SparklesIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentListIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import usePostStore from "../../store/post.store";
import { useSurveyStore } from "../../store/survey.store";
import toast from "react-hot-toast";

interface DashboardStats {
  totalPosts: number;
  approvedPosts: number;
  pendingPosts: number;
  rejectedPosts: number;
  totalClasses: number;
  activeContracts: number;
  completedLessons: number;
  upcomingLessons: number;
}

const NewStudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { posts, fetchMyPosts } = usePostStore();
  const { surveyResults, hasCompletedSurvey, getSurvey } = useSurveyStore();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    approvedPosts: 0,
    pendingPosts: 0,
    rejectedPosts: 0,
    totalClasses: 0,
    activeContracts: 0,
    completedLessons: 0,
    upcomingLessons: 0,
  });

  useEffect(() => {
    fetchMyPosts();
    if (hasCompletedSurvey && !surveyResults) {
      getSurvey();
    }
  }, []);

  useEffect(() => {
    if (posts && posts.length > 0) {
      const approved = posts.filter((p: any) => p.status === 'approved').length;
      const pending = posts.filter((p: any) => p.status === 'pending').length;
      const rejected = posts.filter((p: any) => p.status === 'rejected').length;
      
      setStats(prev => ({
        ...prev,
        totalPosts: posts.length,
        approvedPosts: approved,
        pendingPosts: pending,
        rejectedPosts: rejected,
      }));
    }
  }, [posts]);

  const statCards = [
    {
      title: "Bài đăng",
      value: stats.totalPosts,
      icon: DocumentTextIcon,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      link: "/student/posts",
      subtitle: `${stats.approvedPosts} đã duyệt, ${stats.pendingPosts} chờ duyệt`,
    },
    {
      title: "Lớp học",
      value: stats.totalClasses,
      icon: AcademicCapIcon,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      link: "/student/classes",
      subtitle: `${stats.activeContracts} hợp đồng đang hoạt động`,
    },
    {
      title: "Buổi học",
      value: stats.completedLessons,
      icon: BookOpenIcon,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      link: "/student/schedule",
      subtitle: `${stats.upcomingLessons} buổi sắp tới`,
    },
    {
      title: "Yêu cầu liên hệ",
      value: posts?.filter((p: any) => p.status === 'approved').length || 0,
      icon: UserGroupIcon,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      link: "/student/contact-requests",
      subtitle: "Đã gửi cho gia sư",
    },
  ];

  const quickActions = [
    {
      title: "Tìm gia sư phù hợp",
      description: "Tìm kiếm gia sư phù hợp với yêu cầu",
      icon: SparklesIcon,
      color: "from-purple-500 to-pink-500",
      link: "/student/smart-search",
      badge: "AI Smart",
    },
    {
      title: "Tạo bài đăng mới",
      description: "Đăng yêu cầu tìm gia sư",
      icon: DocumentTextIcon,
      color: "from-blue-500 to-indigo-500",
      link: "/student/posts/create",
    },
    {
      title: "Làm khảo sát AI",
      description: "Nhận gợi ý gia sư phù hợp",
      icon: ClipboardDocumentListIcon,
      color: "from-green-500 to-teal-500",
      link: "/student/ai-survey",
      badge: hasCompletedSurvey ? "Đã hoàn thành" : "Mới",
    },
    {
      title: "Tin nhắn",
      description: "Liên hệ với gia sư",
      icon: ChatBubbleLeftRightIcon,
      color: "from-yellow-500 to-orange-500",
      link: "/student/messages",
      badge: "3", // Mock notification count
    },
  ];

  const recentPosts = posts?.slice(0, 3) || [];
  const aiRecommendations = surveyResults?.recommendations?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Chào mừng trở lại, {user?.full_name || 'Minh Anh'}! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            Hôm nay bạn có {stats.approvedPosts} bài đăng và {stats.pendingPosts} bài tập cần hoàn thành
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={stat.link}>
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                    <div className={`bg-gradient-to-r ${stat.color} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                      {stat.value}
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Actions & Recent Posts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Thao tác nhanh</h2>
                <SparklesIcon className="w-5 h-5 text-purple-500" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Link key={action.title} to={action.link}>
                    <div className="group relative bg-gradient-to-r from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all cursor-pointer">
                      {action.badge && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {action.badge}
                        </span>
                      )}
                      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${action.color} mb-3`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Recent Posts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Bài đăng gần đây</h2>
                <Link to="/student/posts" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Xem tất cả →
                </Link>
              </div>
              {recentPosts.length > 0 ? (
                <div className="space-y-3">
                  {recentPosts.map((post: any) => (
                    <div
                      key={post.id || post._id}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${
                        post.status === 'approved' ? 'bg-green-50' :
                        post.status === 'pending' ? 'bg-yellow-50' :
                        'bg-red-50'
                      }`}>
                        {post.status === 'approved' ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        ) : post.status === 'pending' ? (
                          <ClockIcon className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {post.subjects?.map((s: any) => s.name).join(', ')}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(post.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        post.status === 'approved' ? 'bg-green-100 text-green-700' :
                        post.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {post.status === 'approved' ? 'Đã duyệt' :
                         post.status === 'pending' ? 'Chờ duyệt' :
                         'Từ chối'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Bạn chưa có bài đăng nào</p>
                  <Link
                    to="/student/posts/create"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Tạo bài đăng đầu tiên
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - AI Recommendations & Schedule */}
          <div className="space-y-6">
            {/* AI Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-xl shadow-sm p-6 border border-purple-200"
            >
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-purple-900">Gợi ý AI cho bạn</h2>
              </div>
              {hasCompletedSurvey && aiRecommendations.length > 0 ? (
                <div className="space-y-3">
                  {aiRecommendations.map((rec: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white rounded-lg p-3 border border-purple-100 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">
                            {rec.tutor?.name}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            Độ phù hợp: {Math.round(rec.matchScore)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link
                    to="/student/smart-search"
                    className="block text-center text-sm text-purple-600 hover:text-purple-700 font-medium mt-3"
                  >
                    Xem tất cả gợi ý →
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <ClipboardDocumentListIcon className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                  <p className="text-purple-700 text-sm mb-3">
                    Làm khảo sát để nhận gợi ý gia sư phù hợp
                  </p>
                  <Link
                    to="/student/ai-survey"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    Làm khảo sát ngay
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Upcoming Schedule */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-4">
                <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Lịch học hôm nay</h2>
              </div>
              <div className="text-center py-8">
                <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Chưa có lịch học nào
                </p>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-4">
                <BellAlertIcon className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-bold text-gray-900">Thông báo</h2>
              </div>
              <div className="text-center py-8">
                <BellAlertIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Không có thông báo mới
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewStudentDashboard;

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import AdminDashboardService, {
  type DashboardOverviewData,
} from "../../services/admin/adminDashboard.service";
import toast from "react-hot-toast";

interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const AdminDashboardOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [dashboardData, setDashboardData] =
    useState<Partial<DashboardOverviewData> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const fetchedRef = useRef(false); // useRef persists across re-renders and survives StrictMode

  useEffect(() => {
    // Prevent duplicate API calls (especially in React StrictMode)
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const now = Date.now();
    const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

    if (!dashboardData || now - lastFetch > CACHE_DURATION) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, []); // Empty deps - only run once on mount

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AdminDashboardService.getDashboardOverview();
      if (response.success && response.data) {
        setDashboardData(response.data);
        setLastFetch(Date.now());
        // Load recent activities in background after main data loads
        loadRecentActivities();
      } else {
        setError("Không thể tải dữ liệu dashboard");
        toast.error("Không thể tải dữ liệu dashboard");
      }
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
      const response = await AdminDashboardService.getRecentActivities();
      if (response.success && response.data) {
        setDashboardData((prev) => ({
          ...prev,
          ...response.data,
        }));
      }
    } catch (error: any) {
      console.error("Error loading recent activities:", error);
      // Silent fail - activities are not critical
    } finally {
      setLoadingActivities(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const getSuccessRate = () => {
    if (!dashboardData?.paymentStats?.successRate) return 0;
    return Math.round(dashboardData.paymentStats.successRate * 100) / 100;
  };

  const getActiveContracts = () => {
    if (!dashboardData?.contractStats?.statusStats) return 0;
    const activeStatus = dashboardData.contractStats.statusStats.find(
      (stat) => stat._id === "ACTIVE" || stat._id === "ONGOING"
    );
    return activeStatus?.count || 0;
  };

  const getRecentUsersThisWeek = () => {
    if (!dashboardData?.recentUsers) return 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return dashboardData.recentUsers.filter(
      (user) => new Date(user.created_at) >= oneWeekAgo
    ).length;
  };

  const stats: StatCard[] = [
    {
      title: "Tổng số người dùng",
      value: dashboardData?.userStats?.total_users
        ? formatNumber(dashboardData.userStats.total_users)
        : "0",
      icon: <UserGroupIcon className="w-8 h-8" />,
      color: "blue",
      loading: loading,
    },
    {
      title: "Doanh thu tổng",
      value: dashboardData?.paymentStats?.revenue?.total
        ? formatCurrency(dashboardData.paymentStats.revenue.total)
        : "₫0",
      icon: <CurrencyDollarIcon className="w-8 h-8" />,
      color: "emerald",
      loading: loading,
    },
    {
      title: "Khiếu nại chờ xử lý",
      value: dashboardData?.pendingReports
        ? formatNumber(dashboardData.pendingReports)
        : "0",
      icon: <ExclamationTriangleIcon className="w-8 h-8" />,
      color: "red",
      loading: loading,
    },
    {
      title: "Chờ duyệt gia sư",
      value: dashboardData?.pendingVerifications
        ? formatNumber(dashboardData.pendingVerifications)
        : "0",
      icon: <ClipboardDocumentCheckIcon className="w-8 h-8" />,
      color: "orange",
      loading: loading,
    },
    {
      title: "Hợp đồng đang hoạt động",
      value: formatNumber(getActiveContracts()),
      icon: <DocumentTextIcon className="w-8 h-8" />,
      color: "purple",
      loading: loading,
    },
    {
      title: "Tổng vi phạm",
      value: dashboardData?.userStats?.total_violations
        ? formatNumber(dashboardData.userStats.total_violations)
        : "0",
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      color: "yellow",
      loading: loading,
    },
    {
      title: "Tỷ lệ thanh toán thành công",
      value: `${getSuccessRate()}%`,
      icon: <ChartBarIcon className="w-8 h-8" />,
      color: "teal",
      loading: loading,
    },
    {
      title: "Người dùng mới tuần này",
      value: formatNumber(getRecentUsersThisWeek()),
      icon: <UserPlusIcon className="w-8 h-8" />,
      color: "indigo",
      loading: loading,
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<
      string,
      { bg: string; text: string; border: string }
    > = {
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      green: {
        bg: "bg-green-50",
        text: "text-green-600",
        border: "border-green-200",
      },
      emerald: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-200",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-200",
      },
      red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
      orange: {
        bg: "bg-orange-50",
        text: "text-orange-600",
        border: "border-orange-200",
      },
      indigo: {
        bg: "bg-indigo-50",
        text: "text-indigo-600",
        border: "border-indigo-200",
      },
      teal: {
        bg: "bg-teal-50",
        text: "text-teal-600",
        border: "border-teal-200",
      },
      yellow: {
        bg: "bg-yellow-50",
        text: "text-yellow-600",
        border: "border-yellow-200",
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  const getChangeColor = (changeType?: string) => {
    switch (changeType) {
      case "increase":
        return "text-green-600";
      case "decrease":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getRecentActivities = () => {
    const activities: Array<{
      action: string;
      user: string;
      time: string;
      type: "user" | "verification" | "complaint" | "payment";
    }> = [];

    // Add recent users
    if (
      dashboardData?.recentUsers &&
      Array.isArray(dashboardData.recentUsers)
    ) {
      dashboardData.recentUsers.slice(0, 2).forEach((user) => {
        if (user?.full_name && user?.email && user?.created_at) {
          activities.push({
            action: "Người dùng mới đăng ký",
            user: `${user.full_name} (${user.email})`,
            time: formatRelativeTime(user.created_at),
            type: "user",
          });
        }
      });
    }

    // Add recent verifications
    if (
      dashboardData?.recentVerifications &&
      Array.isArray(dashboardData.recentVerifications)
    ) {
      dashboardData.recentVerifications.slice(0, 1).forEach((verification) => {
        if (verification?.user_id && verification?.submitted_at) {
          activities.push({
            action: "Gia sư nộp hồ sơ xác thực",
            user: `User ID: ${verification.user_id}`,
            time: formatRelativeTime(verification.submitted_at),
            type: "verification",
          });
        }
      });
    }

    // Add recent reports
    if (
      dashboardData?.recentReports &&
      Array.isArray(dashboardData.recentReports)
    ) {
      dashboardData.recentReports.slice(0, 1).forEach((report) => {
        if (
          report?.reporter?.full_name &&
          report?.reported_user?.full_name &&
          report?.created_at
        ) {
          activities.push({
            action: "Khiếu nại mới được tạo",
            user: `${report.reporter.full_name} về ${report.reported_user.full_name}`,
            time: formatRelativeTime(report.created_at),
            type: "complaint",
          });
        }
      });
    }

    // Add recent payments
    if (
      dashboardData?.recentPayments &&
      Array.isArray(dashboardData.recentPayments)
    ) {
      dashboardData.recentPayments.slice(0, 1).forEach((payment) => {
        if (payment?.order_id && payment?.amount && payment?.created_at) {
          activities.push({
            action: "Thanh toán hoàn thành",
            user: `${payment.order_id} - ${formatCurrency(payment.amount)}`,
            time: formatRelativeTime(payment.created_at),
            type: "payment",
          });
        }
      });
    }

    // Sort by most recent and limit to 5
    return activities.slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">
            Vui lòng đợi trong giây lát
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không thể tải dữ liệu
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const recentActivities = getRecentActivities();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tổng quan quản trị
            </h1>
            <p className="text-gray-600 mt-2">
              Xin chào! Đây là bảng điều khiển quản trị hệ thống SkillBridge.
            </p>
          </div>
          {loadingActivities && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              <span>Đang tải hoạt động...</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => {
          const colorClasses = getColorClasses(stat.color);
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              className={`p-6 rounded-xl border ${colorClasses.border} ${colorClasses.bg} hover:shadow-lg transition-all duration-200`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  {stat.loading ? (
                    <div className="mt-2 h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  )}
                  {stat.change && (
                    <p
                      className={`text-sm mt-2 ${getChangeColor(
                        stat.changeType
                      )}`}
                    >
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`${colorClasses.text}`}>{stat.icon}</div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <ClipboardDocumentCheckIcon className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-medium text-gray-900">Duyệt gia sư</h3>
                <p className="text-sm text-gray-600">
                  {dashboardData?.pendingVerifications || 0} hồ sơ chờ duyệt
                </p>
              </div>
            </div>
          </button>

          <button className="p-4 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg border border-yellow-200 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-medium text-gray-900">Xử lý khiếu nại</h3>
                <p className="text-sm text-gray-600">
                  {dashboardData?.pendingReports || 0} khiếu nại chờ xử lý
                </p>
              </div>
            </div>
          </button>

          <button className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-medium text-gray-900">Quản lý hợp đồng</h3>
                <p className="text-sm text-gray-600">
                  {getActiveContracts()} hợp đồng đang hoạt động
                </p>
              </div>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Hoạt động gần đây
        </h2>
        <div className="space-y-4">
          {loadingActivities ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "user"
                      ? "bg-green-500"
                      : activity.type === "verification"
                      ? "bg-blue-500"
                      : activity.type === "complaint"
                      ? "bg-red-500"
                      : "bg-purple-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-600">{activity.user}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có hoạt động gần đây</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboardOverview;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserGroupIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  icon: React.ReactNode;
  color: string;
}

const AdminDashboardOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const stats: StatCard[] = [
    {
      title: "Tổng số người dùng",
      value: "2,847",
      change: "+12.5%",
      changeType: "increase",
      icon: <UserGroupIcon className="w-8 h-8" />,
      color: "blue",
    },
    {
      title: "Gia sư hoạt động",
      value: "384",
      change: "+8.2%",
      changeType: "increase",
      icon: <AcademicCapIcon className="w-8 h-8" />,
      color: "green",
    },
    {
      title: "Doanh thu tháng này",
      value: "₫142,500,000",
      change: "+15.3%",
      changeType: "increase",
      icon: <CurrencyDollarIcon className="w-8 h-8" />,
      color: "emerald",
    },
    {
      title: "Buổi học hoàn thành",
      value: "1,926",
      change: "+23.1%",
      changeType: "increase",
      icon: <CalendarDaysIcon className="w-8 h-8" />,
      color: "purple",
    },
    {
      title: "Khiếu nại chờ xử lý",
      value: "15",
      change: "-5",
      changeType: "decrease",
      icon: <ExclamationTriangleIcon className="w-8 h-8" />,
      color: "red",
    },
    {
      title: "Chờ duyệt gia sư",
      value: "12",
      change: "+3",
      changeType: "increase",
      icon: <ClipboardDocumentCheckIcon className="w-8 h-8" />,
      color: "orange",
    },
    {
      title: "Yêu cầu rút tiền",
      value: "7",
      change: "-2",
      changeType: "decrease",
      icon: <BanknotesIcon className="w-8 h-8" />,
      color: "indigo",
    },
    {
      title: "Tỷ lệ tăng trưởng",
      value: "18.7%",
      change: "+2.4%",
      changeType: "increase",
      icon: <ChartBarIcon className="w-8 h-8" />,
      color: "teal",
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
    };
    return colorMap[color] || colorMap.blue;
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case "increase":
        return "text-green-600";
      case "decrease":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Tổng quan quản trị</h1>
        <p className="text-gray-600 mt-2">
          Xin chào! Đây là bảng điều khiển quản trị hệ thống SkillBridge.
        </p>
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
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm mt-2 ${getChangeColor(
                      stat.changeType
                    )}`}
                  >
                    {stat.change} từ tháng trước
                  </p>
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
          <button className="p-4 text-left bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors">
            <div className="flex items-center space-x-3">
              <ClipboardDocumentCheckIcon className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-medium text-gray-900">Duyệt gia sư</h3>
                <p className="text-sm text-gray-600">12 hồ sơ chờ duyệt</p>
              </div>
            </div>
          </button>

          <button className="p-4 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg border border-yellow-200 transition-colors">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-medium text-gray-900">Xử lý khiếu nại</h3>
                <p className="text-sm text-gray-600">15 khiếu nại chờ xử lý</p>
              </div>
            </div>
          </button>

          <button className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
            <div className="flex items-center space-x-3">
              <BanknotesIcon className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-medium text-gray-900">Xử lý rút tiền</h3>
                <p className="text-sm text-gray-600">7 yêu cầu chờ xử lý</p>
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
          {[
            {
              action: "Người dùng mới đăng ký",
              user: "Nguyễn Văn A (nguyenvana@email.com)",
              time: "5 phút trước",
              type: "user",
            },
            {
              action: "Gia sư nộp hồ sơ xác thực",
              user: "Trần Thị B (tranthib@email.com)",
              time: "12 phút trước",
              type: "verification",
            },
            {
              action: "Khiếu nại mới được tạo",
              user: "Lê Văn C về gia sư Phạm Thị D",
              time: "25 phút trước",
              type: "complaint",
            },
            {
              action: "Thanh toán hoàn thành",
              user: "Buổi học #1234 - ₫500,000",
              time: "1 giờ trước",
              type: "payment",
            },
          ].map((activity, index) => (
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
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboardOverview;

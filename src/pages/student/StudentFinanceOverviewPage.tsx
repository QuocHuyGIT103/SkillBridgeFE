import React from "react";
import { motion } from "framer-motion";
import {
  BanknotesIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import DashboardStats from "../../components/dashboard/DashboardStats";

const StudentFinanceOverviewPage: React.FC = () => {
  // Mock data - sẽ được thay thế bằng API call
  const financialStats = {
    totalPaid: 1500000,
    totalUnpaid: 450000,
    totalAmount: 1950000,
    upcomingPayments: 2,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-blue-50"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <ChartBarIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tổng quan tài chính
            </h1>
            <p className="text-gray-600">
              Quản lý chi phí học tập và thanh toán
            </p>
          </div>
        </div>
      </motion.div>

      {/* Financial Stats */}
      <DashboardStats
        title="Thống kê tài chính"
        description="Tổng quan về các khoản thanh toán học phí"
        stats={[
          {
            label: "Tổng đã thanh toán",
            value: `${financialStats.totalPaid.toLocaleString("vi-VN")} VNĐ`,
            icon: CheckCircleIcon,
            color: "green",
            description: "Đã hoàn tất",
          },
          {
            label: "Còn phải thanh toán",
            value: `${financialStats.totalUnpaid.toLocaleString("vi-VN")} VNĐ`,
            icon: ClockIcon,
            color: "red",
            description: "Chưa thanh toán",
          },
          {
            label: "Tổng học phí",
            value: `${financialStats.totalAmount.toLocaleString("vi-VN")} VNĐ`,
            icon: BanknotesIcon,
            color: "blue",
            description: "Toàn bộ khóa học",
          },
          {
            label: "Thanh toán sắp tới",
            value: financialStats.upcomingPayments,
            icon: ClockIcon,
            color: "yellow",
            description: "Cần thanh toán sớm",
          },
        ]}
      />

      {/* Coming Soon Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100 text-center"
      >
        <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <ChartBarIcon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Tính năng đang phát triển
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Trang thống kê tài chính chi tiết với biểu đồ, lịch sử giao dịch và
          báo cáo sẽ được cập nhật sớm!
        </p>
      </motion.div>
    </div>
  );
};

export default StudentFinanceOverviewPage;

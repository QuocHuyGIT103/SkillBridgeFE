import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BanknotesIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import DashboardStats from "../../components/dashboard/DashboardStats";
import PaymentByClassChart from "../../components/finance/PaymentByClassChart";
import MonthlyPaymentTrend from "../../components/finance/MonthlyPaymentTrend";
import UpcomingPaymentsTable from "../../components/finance/UpcomingPaymentsTable";
import RecentPaymentsTable from "../../components/finance/RecentPaymentsTable";
import PaymentService from "../../services/payment.service";
import { toast } from "react-hot-toast";

const StudentFinanceOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState<any>(null);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        const response = await PaymentService.getFinancialSummary();

        if (response.success) {
          setFinancialData(response.data);
        }
      } catch (error: any) {
        console.error("Error fetching financial data:", error);
        toast.error("Không thể tải dữ liệu tài chính. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-50 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg" />
            <div>
              <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-64 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse"
            >
              <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-8 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
            <div className="h-64 bg-gray-100 rounded" />
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
            <div className="h-64 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (
    !financialData ||
    (!financialData.totalAmount && financialData.totalAmount !== 0)
  ) {
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

        {/* Empty state */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100 text-center"
        >
          <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <BanknotesIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Chưa có dữ liệu tài chính
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Bạn chưa có hợp đồng hoặc lớp học nào. Hãy bắt đầu bằng cách tìm gia
            sư phù hợp!
          </p>
          <button
            onClick={() => navigate("/student/find-tutors")}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tìm gia sư ngay
          </button>
        </motion.div>
      </div>
    );
  }

  const financialStats = {
    totalPaid: financialData.totalPaid || 0,
    totalUnpaid: financialData.totalUnpaid || 0,
    totalAmount: financialData.totalAmount || 0,
    upcomingPayments: financialData.upcomingPaymentsCount || 0,
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
            description: "Trong 30 ngày tới",
          },
        ]}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentByClassChart
          data={financialData.paymentsByClass || []}
          onClassClick={(classId) =>
            navigate(`/student/classes/${classId}/payment`)
          }
        />
        <MonthlyPaymentTrend data={financialData.monthlyTrend || []} />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingPaymentsTable
          payments={financialData.upcomingPayments || []}
        />
        <RecentPaymentsTable payments={financialData.recentPayments || []} />
      </div>
    </div>
  );
};

export default StudentFinanceOverviewPage;

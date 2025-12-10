import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useTutorFinanceStore } from "../../store/tutorFinance.store";
import DashboardStats from "../../components/dashboard/DashboardStats";
import type { StatItem } from "../../components/dashboard/DashboardStats";
import MonthlyPaymentTrend from "../../components/finance/MonthlyPaymentTrend";

const TutorFinancePage: React.FC = () => {
  const {
    earningsStats,
    isLoading,
    isLoadingStats,
    error,
    fetchAllFinanceData,
  } = useTutorFinanceStore();

  useEffect(() => {
    // Fetch all finance data on mount
    fetchAllFinanceData();
  }, []);

  const handleRefresh = () => {
    fetchAllFinanceData();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Prepare stats for DashboardStats component
  const stats: StatItem[] = earningsStats
    ? [
        {
          label: "Tổng thu nhập",
          value: formatCurrency(earningsStats.totalEarnings),
          icon: BanknotesIcon,
          color: "green",
          description: "Thu nhập đã nhận được (80%)",
        },
        {
          label: "Số tiền chờ thanh toán",
          value: formatCurrency(earningsStats.pendingEarnings),
          icon: ClockIcon,
          color: "yellow",
          description: `${earningsStats.pendingPayments} khoản đang chờ`,
        },
        {
          label: "Số tiền có thể rút",
          value: formatCurrency(earningsStats.totalEarnings),
          icon: CurrencyDollarIcon,
          color: "purple",
          description: "Có thể yêu cầu rút tiền",
        },
      ]
    : [];

  // Prepare monthly trend data for chart
  const monthlyTrendData =
    earningsStats?.monthlyTrend.map((item) => ({
      month: item.month,
      amount: item.tutorEarnings,
    })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <CurrencyDollarIcon className="w-8 h-8 text-primary" />
                Quản lý tài chính
              </h1>
              <p className="mt-2 text-gray-600">
                Theo dõi thu nhập và lịch thanh toán của bạn
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading || isLoadingStats}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon
                className={`w-5 h-5 ${
                  isLoading || isLoadingStats ? "animate-spin" : ""
                }`}
              />
              Làm mới
            </button>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {(isLoading || isLoadingStats) && !earningsStats ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <ArrowPathIcon className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Đang tải dữ liệu tài chính...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <DashboardStats stats={stats} className="mb-8" />
            </motion.div>

            {/* Monthly Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <MonthlyPaymentTrend data={monthlyTrendData} />
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default TutorFinancePage;

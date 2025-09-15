import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  CheckIcon,
  ClockIcon,
  XMarkIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface Transaction {
  id: string;
  type: "payment" | "withdrawal" | "refund" | "commission";
  userName: string;
  userEmail: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "processing";
  createdAt: string;
  description: string;
  sessionId?: string;
}

const TransactionManagement: React.FC = () => {
  const [filterType, setFilterType] = useState<
    "all" | "payment" | "withdrawal" | "refund" | "commission"
  >("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "completed" | "failed" | "processing"
  >("all");

  // Mock data
  const transactions: Transaction[] = [
    {
      id: "TXN-001",
      type: "payment",
      userName: "Nguyễn Văn An",
      userEmail: "nguyenvana@email.com",
      amount: 500000,
      status: "completed",
      createdAt: "2024-03-10 14:30:00",
      description: "Thanh toán buổi học Toán lớp 10",
      sessionId: "SES-001",
    },
    {
      id: "TXN-002",
      type: "withdrawal",
      userName: "Trần Thị Bình",
      userEmail: "tranthib@email.com",
      amount: 2000000,
      status: "pending",
      createdAt: "2024-03-10 10:15:00",
      description: "Rút tiền về tài khoản ngân hàng",
    },
    {
      id: "TXN-003",
      type: "commission",
      userName: "Hệ thống",
      userEmail: "system@skillbridge.com",
      amount: 100000,
      status: "completed",
      createdAt: "2024-03-10 14:30:00",
      description: "Hoa hồng từ buổi học SES-001 (20%)",
      sessionId: "SES-001",
    },
    {
      id: "TXN-004",
      type: "refund",
      userName: "Lê Văn Cường",
      userEmail: "levanc@email.com",
      amount: 300000,
      status: "processing",
      createdAt: "2024-03-09 16:45:00",
      description: "Hoàn tiền buổi học bị hủy",
      sessionId: "SES-002",
    },
    {
      id: "TXN-005",
      type: "payment",
      userName: "Phạm Thị Dung",
      userEmail: "phamthid@email.com",
      amount: 750000,
      status: "failed",
      createdAt: "2024-03-09 09:20:00",
      description: "Thanh toán buổi học Tiếng Anh",
      sessionId: "SES-003",
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesStatus =
      filterStatus === "all" || transaction.status === filterStatus;
    return matchesType && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <ArrowDownIcon className="w-5 h-5 text-green-600" />;
      case "withdrawal":
        return <ArrowUpIcon className="w-5 h-5 text-red-600" />;
      case "refund":
        return <ArrowPathIcon className="w-5 h-5 text-orange-600" />;
      case "commission":
        return <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />;
      default:
        return <CurrencyDollarIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "payment":
        return "Thanh toán";
      case "withdrawal":
        return "Rút tiền";
      case "refund":
        return "Hoàn tiền";
      case "commission":
        return "Hoa hồng";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "payment":
        return "bg-green-100 text-green-800";
      case "withdrawal":
        return "bg-red-100 text-red-800";
      case "refund":
        return "bg-orange-100 text-orange-800";
      case "commission":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckIcon className="w-4 h-4 text-green-600" />;
      case "pending":
        return <ClockIcon className="w-4 h-4 text-yellow-600" />;
      case "processing":
        return <ArrowPathIcon className="w-4 h-4 text-blue-600 animate-spin" />;
      case "failed":
        return <XMarkIcon className="w-4 h-4 text-red-600" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "pending":
        return "Chờ xử lý";
      case "processing":
        return "Đang xử lý";
      case "failed":
        return "Thất bại";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleAction = (transactionId: string, action: string) => {
    console.log(`Performing ${action} on transaction ${transactionId}`);
    // Implement action logic here
  };

  // Calculate summary stats
  const totalRevenue = transactions
    .filter((t) => t.type === "payment" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCommission = transactions
    .filter((t) => t.type === "commission" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingWithdrawals = transactions
    .filter((t) => t.type === "withdrawal" && t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingRefunds = transactions
    .filter(
      (t) =>
        t.type === "refund" &&
        (t.status === "pending" || t.status === "processing")
    )
    .reduce((sum, t) => sum + t.amount, 0);

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
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <CurrencyDollarIcon className="w-8 h-8 mr-3 text-green-600" />
              Quản lý giao dịch
            </h1>
            <p className="text-gray-600 mt-1">
              Theo dõi và quản lý tất cả giao dịch tài chính
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowDownIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Tổng doanh thu
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hoa hồng</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalCommission)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ArrowUpIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chờ rút tiền</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(pendingWithdrawals)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ArrowPathIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chờ hoàn tiền</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(pendingRefunds)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="all">Tất cả loại giao dịch</option>
              <option value="payment">Thanh toán</option>
              <option value="withdrawal">Rút tiền</option>
              <option value="refund">Hoàn tiền</option>
              <option value="commission">Hoa hồng</option>
            </select>
          </div>

          <div>
            <select
              className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Hoàn thành</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giao dịch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(transaction.type)}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.description}
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                            transaction.type
                          )}`}
                        >
                          {getTypeText(transaction.type)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.userName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.userEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(transaction.status)}
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {getStatusText(transaction.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {transaction.status === "pending" &&
                        transaction.type === "withdrawal" && (
                          <>
                            <button
                              onClick={() =>
                                handleAction(transaction.id, "approve")
                              }
                              className="text-green-600 hover:text-green-900"
                              title="Chấp nhận"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleAction(transaction.id, "reject")
                              }
                              className="text-red-600 hover:text-red-900"
                              title="Từ chối"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      {transaction.status === "failed" && (
                        <button
                          onClick={() => handleAction(transaction.id, "retry")}
                          className="text-blue-600 hover:text-blue-900"
                          title="Thử lại"
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <CurrencyDollarIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Không tìm thấy giao dịch nào</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TransactionManagement;

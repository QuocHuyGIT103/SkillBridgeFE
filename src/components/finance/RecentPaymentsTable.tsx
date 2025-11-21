import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  ClockIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { Payment } from "../../services/payment.service";

interface RecentPaymentsTableProps {
  payments: Payment[];
}

const RecentPaymentsTable: React.FC<RecentPaymentsTableProps> = ({
  payments,
}) => {
  if (!payments || payments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💳 Lịch sử thanh toán gần đây
        </h3>
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có lịch sử thanh toán</p>
        </div>
      </motion.div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <CheckCircleIcon className="w-3 h-3" />
            Thành công
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
            <ClockIcon className="w-3 h-3" />
            Đang xử lý
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            ✕ Thất bại
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            {status}
          </span>
        );
    }
  };

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            💳 Lịch sử thanh toán gần đây
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {payments.length} giao dịch -{" "}
            <span className="font-medium text-green-600">
              {totalAmount.toLocaleString("vi-VN")} VNĐ
            </span>
          </p>
        </div>
      </div>

      {/* Desktop view - Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Ngày
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Mã GD
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Buổi học
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                Số tiền
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <motion.tr
                key={payment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-gray-600">
                  {payment.paidAt
                    ? format(new Date(payment.paidAt), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })
                    : format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })}
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm font-mono text-gray-700">
                    {payment.orderId}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {payment.sessionNumbers.length === 1
                    ? `Buổi ${payment.sessionNumbers[0]}`
                    : `${payment.sessionNumbers.length} buổi`}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-sm font-semibold text-gray-900">
                    {payment.amount.toLocaleString("vi-VN")} VNĐ
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  {getStatusBadge(payment.status)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view - Cards */}
      <div className="md:hidden space-y-3">
        {payments.map((payment, index) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * index }}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <BanknotesIcon className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-mono text-gray-600">
                    {payment.orderId}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {payment.sessionNumbers.length === 1
                    ? `Buổi ${payment.sessionNumbers[0]}`
                    : `${payment.sessionNumbers.length} buổi học`}
                </p>
              </div>
              {getStatusBadge(payment.status)}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-500">
                {payment.paidAt
                  ? format(new Date(payment.paidAt), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })
                  : format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {payment.amount.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentPaymentsTable;

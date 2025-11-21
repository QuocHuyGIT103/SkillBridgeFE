import React from "react";
import { motion } from "framer-motion";
import {
  ClockIcon,
  ExclamationCircleIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";

interface UpcomingPayment {
  dueDate: string;
  amount: number;
  className: string;
  tutorName?: string;
  classId: string;
  sessionNumber: number;
  status: "UNPAID" | "OVERDUE";
}

interface UpcomingPaymentsTableProps {
  payments: UpcomingPayment[];
}

const UpcomingPaymentsTable: React.FC<UpcomingPaymentsTableProps> = ({
  payments,
}) => {
  const navigate = useNavigate();

  if (!payments || payments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ⏰ Thanh toán sắp tới
        </h3>
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Không có khoản thanh toán sắp tới</p>
          <p className="text-sm text-gray-400 mt-1">
            Bạn đã hoàn tất tất cả các khoản thanh toán trong 30 ngày tới
          </p>
        </div>
      </motion.div>
    );
  }

  const getDaysUntilDue = (dueDate: string) => {
    const days = differenceInDays(new Date(dueDate), new Date());
    return days;
  };

  const getUrgencyColor = (daysUntil: number, status: string) => {
    if (status === "OVERDUE" || daysUntil < 0) {
      return "bg-red-50 border-red-200 text-red-700";
    } else if (daysUntil <= 7) {
      return "bg-yellow-50 border-yellow-200 text-yellow-700";
    } else {
      return "bg-blue-50 border-blue-200 text-blue-700";
    }
  };

  const getUrgencyBadge = (daysUntil: number, status: string) => {
    if (status === "OVERDUE" || daysUntil < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          <ExclamationCircleIcon className="w-3 h-3" />
          Quá hạn
        </span>
      );
    } else if (daysUntil === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
          <ExclamationCircleIcon className="w-3 h-3" />
          Hôm nay
        </span>
      );
    } else if (daysUntil <= 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
          <ClockIcon className="w-3 h-3" />
          {daysUntil} ngày
        </span>
      );
    } else if (daysUntil <= 7) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
          <ClockIcon className="w-3 h-3" />
          {daysUntil} ngày
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
          <ClockIcon className="w-3 h-3" />
          {daysUntil} ngày
        </span>
      );
    }
  };

  const totalUpcoming = payments.reduce((sum, p) => sum + p.amount, 0);
  const overdueCount = payments.filter(
    (p) => p.status === "OVERDUE" || getDaysUntilDue(p.dueDate) < 0
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            ⏰ Thanh toán sắp tới (30 ngày)
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {payments.length} khoản thanh toán -{" "}
            <span className="font-medium text-blue-600">
              {totalUpcoming.toLocaleString("vi-VN")} VNĐ
            </span>
            {overdueCount > 0 && (
              <span className="ml-2 text-red-600 font-medium">
                ({overdueCount} quá hạn)
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {payments.map((payment, index) => {
          const daysUntil = getDaysUntilDue(payment.dueDate);
          return (
            <motion.div
              key={`${payment.classId}-${payment.sessionNumber}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className={`p-4 rounded-lg border-2 ${getUrgencyColor(
                daysUntil,
                payment.status
              )} hover:shadow-md transition-all cursor-pointer`}
              onClick={() =>
                navigate(`/student/classes/${payment.classId}/payment`)
              }
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <BanknotesIcon className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {payment.className}
                      </h4>
                      {payment.tutorName && (
                        <p className="text-xs text-gray-500">
                          Gia sư: {payment.tutorName}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Buổi học số {payment.sessionNumber}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      Hạn:{" "}
                      {format(new Date(payment.dueDate), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </span>
                    {getUrgencyBadge(daysUntil, payment.status)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {payment.amount.toLocaleString("vi-VN")}
                  </p>
                  <p className="text-xs text-gray-500">VNĐ</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/student/classes/${payment.classId}/payment`);
                    }}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Thanh toán
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default UpcomingPaymentsTable;

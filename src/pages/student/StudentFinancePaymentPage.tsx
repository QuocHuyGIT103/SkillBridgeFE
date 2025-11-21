import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BanknotesIcon,
  AcademicCapIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useClassStore } from "../../store/class.store";

const StudentFinancePaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { studentClasses, loading, fetchStudentClasses } = useClassStore();

  // Fetch student classes on mount and refresh when coming back to this page
  useEffect(() => {
    fetchStudentClasses();
  }, [fetchStudentClasses]);

  // Filter classes that need payment
  const unpaidClasses = studentClasses.filter(
    (cls) => cls.paymentStatus === "PENDING" || cls.paymentStatus === "PARTIAL"
  );

  // Loading skeleton
  if (loading && studentClasses.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-50 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
        </div>

        {/* Classes Skeleton */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-lg p-4 border border-gray-200"
              >
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="h-10 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-blue-50"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
            <BanknotesIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Thanh toán học phí
            </h1>
            <p className="text-gray-600">Chọn lớp học để thanh toán học phí</p>
          </div>
        </div>
      </motion.div>

      {/* Classes Need Payment */}
      {unpaidClasses.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Lớp học cần thanh toán ({unpaidClasses.length})
          </h2>

          <div className="space-y-4">
            {unpaidClasses.map((cls) => (
              <div
                key={cls._id}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">
                      {cls.subject.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <AcademicCapIcon className="w-4 h-4" />
                      <span>{cls.tutorId.full_name}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {cls.paymentStatus === "PENDING" && (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium">
                        Chưa thanh toán
                      </span>
                    )}
                    {cls.paymentStatus === "PARTIAL" && (
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                        Thanh toán 1 phần
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                  <div>
                    <p className="text-sm text-gray-600">Số tiền còn lại</p>
                    <p className="text-xl font-bold text-blue-600">
                      {(cls.totalAmount - cls.paidAmount).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      VNĐ
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/student/classes/${cls._id}/payment`)
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Thanh toán
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-12 border border-green-100 text-center"
        >
          <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <BanknotesIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Bạn không có khoản thanh toán nào chưa hoàn tất
          </h3>
          <p className="text-gray-600">
            Tất cả các lớp học của bạn đã được thanh toán đầy đủ
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default StudentFinancePaymentPage;

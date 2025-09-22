import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import useVerificationStore from "../../store/verification.store";
import { VerificationStatus } from "../../types/verification.types";

const VerificationHistory: React.FC = () => {
  const { verificationHistory, isLoading, fetchVerificationHistory } =
    useVerificationStore();

  useEffect(() => {
    fetchVerificationHistory();
  }, [fetchVerificationHistory]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case VerificationStatus.PENDING:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case VerificationStatus.APPROVED:
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case VerificationStatus.REJECTED:
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case VerificationStatus.PENDING:
        return "Đang chờ xét duyệt";
      case VerificationStatus.APPROVED:
        return "Đã phê duyệt";
      case VerificationStatus.REJECTED:
        return "Đã từ chối";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case VerificationStatus.PENDING:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case VerificationStatus.APPROVED:
        return "text-green-600 bg-green-50 border-green-200";
      case VerificationStatus.REJECTED:
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-secondary">Đang tải lịch sử...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Lịch sử xác thực ({verificationHistory.length})
          </h2>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {verificationHistory.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-secondary">Chưa có lịch sử xác thực nào</p>
          </div>
        ) : (
          verificationHistory.map((request, index) => (
            <div
              key={request._id}
              className={`border rounded-lg p-4 ${getStatusColor(
                request.status
              )} border-l-4`}
            >
              {/* Request Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <h3 className="font-semibold">
                      Yêu cầu xác thực #{index + 1}
                    </h3>
                    <p className="text-sm font-medium">
                      {getStatusText(request.status)}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="flex items-center space-x-1 mb-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      Gửi:{" "}
                      {new Date(request.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  {request.reviewed_at && (
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        Xét duyệt:{" "}
                        {new Date(request.reviewed_at).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Request Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-sm">
                <div>
                  <span className="font-medium">Học vấn:</span>{" "}
                  {request.education_id ? "✓" : "—"}
                </div>
                <div>
                  <span className="font-medium">Chứng chỉ:</span>{" "}
                  {request.certificate_ids.length} chứng chỉ
                </div>
                <div>
                  <span className="font-medium">Thành tích:</span>{" "}
                  {request.achievement_ids.length} thành tích
                </div>
              </div>

              {/* Admin Feedback */}
              {request.admin_feedback && (
                <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-3 mt-3">
                  <div className="flex items-start space-x-2">
                    <UserIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium mb-1">
                        Phản hồi từ admin:
                      </p>
                      <p className="text-sm">{request.admin_feedback}</p>
                    </div>
                  </div>
                  {request.reviewed_by && (
                    <p className="text-xs mt-2 text-right">
                      — {request.reviewed_by.full_name}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default VerificationHistory;

import React from "react";
import { motion } from "framer-motion";
import {
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  TrophyIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import type { VerificationDetail } from "../../../types/qualification.types";

interface VerificationHistoryCardProps {
  detail: VerificationDetail;
}

const VerificationHistoryCard: React.FC<VerificationHistoryCardProps> = ({
  detail,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "Đã duyệt";
      case "REJECTED":
        return "Đã từ chối";
      case "PENDING":
        return "Chờ duyệt";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case "REJECTED":
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getTargetTypeIcon = (type: string) => {
    switch (type) {
      case "EDUCATION":
        return <AcademicCapIcon className="w-5 h-5 text-blue-600" />;
      case "CERTIFICATE":
        return <DocumentTextIcon className="w-5 h-5 text-green-600" />;
      case "ACHIEVEMENT":
        return <TrophyIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTargetTypeText = (type: string) => {
    switch (type) {
      case "EDUCATION":
        return "Học vấn";
      case "CERTIFICATE":
        return "Chứng chỉ";
      case "ACHIEVEMENT":
        return "Thành tích";
      default:
        return type;
    }
  };

  const getRequestTypeText = (type: string) => {
    switch (type) {
      case "NEW":
        return "Mới";
      case "UPDATE":
        return "Cập nhật";
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex-shrink-0">{getStatusIcon(detail.status)}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {getTargetTypeIcon(detail.targetType)}
                <h3 className="text-lg font-semibold text-gray-900">
                  {getTargetTypeText(detail.targetType)} -{" "}
                  {getRequestTypeText(detail.requestType)}
                </h3>
              </div>
              <p className="text-sm text-gray-600">ID: {detail.id}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                detail.status
              )}`}
            >
              {getStatusText(detail.status)}
            </span>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Thông tin xử lý
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>Tạo lúc: {formatDate(detail.createdAt)}</span>
                </div>
                {detail.reviewedAt && (
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>Xử lý lúc: {formatDate(detail.reviewedAt)}</span>
                  </div>
                )}
                {detail.reviewedBy && (
                  <div className="flex items-center space-x-1">
                    <UserIcon className="w-4 h-4" />
                    <span>Xử lý bởi: {detail.reviewedBy}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Dữ liệu</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-hidden">
                  {JSON.stringify(detail.dataSnapshot, null, 2).substring(
                    0,
                    200
                  )}
                  {JSON.stringify(detail.dataSnapshot, null, 2).length > 200 &&
                    "..."}
                </pre>
              </div>
            </div>
          </div>

          {/* Rejection reason if exists */}
          {detail.status === "REJECTED" && detail.rejectionReason && (
            <div className="mb-4">
              <h4 className="font-medium text-red-700 mb-2">Lý do từ chối</h4>
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {detail.rejectionReason}
              </p>
            </div>
          )}

          {/* Current target data if exists */}
          {detail.target && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Dữ liệu hiện tại
              </h4>
              <div className="bg-blue-50 p-3 rounded-lg">
                <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-hidden">
                  {JSON.stringify(detail.target, null, 2).substring(0, 200)}
                  {JSON.stringify(detail.target, null, 2).length > 200 && "..."}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VerificationHistoryCard;

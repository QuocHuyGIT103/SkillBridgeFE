import React from "react";
import { motion } from "framer-motion";
import {
  EyeIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import type {
  VerificationRequest,
  RequestStatus,
} from "../../../types/qualification.types";

interface VerificationRequestCardProps {
  request: VerificationRequest;
  onViewDetails: (request: VerificationRequest) => void;
}

const VerificationRequestCard: React.FC<VerificationRequestCardProps> = ({
  request,
  onViewDetails,
}) => {
  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "PARTIALLY_APPROVED":
        return "bg-blue-100 text-blue-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: RequestStatus) => {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";
      case "APPROVED":
        return "Đã duyệt";
      case "PARTIALLY_APPROVED":
        return "Duyệt một phần";
      case "REJECTED":
        return "Đã từ chối";
      default:
        return status;
    }
  };

  const getTargetTypeIcon = (type: string) => {
    switch (type) {
      case "EDUCATION":
        return <AcademicCapIcon className="w-4 h-4 text-blue-600" />;
      case "CERTIFICATE":
        return <DocumentTextIcon className="w-4 h-4 text-green-600" />;
      case "ACHIEVEMENT":
        return <TrophyIcon className="w-4 h-4 text-yellow-600" />;
      default:
        return <DocumentTextIcon className="w-4 h-4 text-gray-600" />;
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
          {/* Header with tutor info */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {request.tutor?.fullName || "Gia sư"}
              </h3>
              <p className="text-sm text-gray-600">
                {request.tutor?.email || "Email không có"}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                request.status
              )}`}
            >
              {getStatusText(request.status)}
            </span>
          </div>

          {/* Request details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Chi tiết yêu cầu ({request.details?.length || 0})
              </h4>
              <div className="space-y-2">
                {request.details?.slice(0, 3).map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg"
                  >
                    {getTargetTypeIcon(detail.targetType)}
                    <span className="text-sm text-gray-700">
                      {getTargetTypeText(detail.targetType)} -{" "}
                      {detail.requestType}
                    </span>
                  </div>
                ))}
                {request.details && request.details.length > 3 && (
                  <div className="text-sm text-gray-500">
                    +{request.details.length - 3} mục khác
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Thông tin xử lý
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>Nộp lúc: {formatDate(request.submittedAt)}</span>
                </div>
                {request.reviewedAt && (
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>Xử lý lúc: {formatDate(request.reviewedAt)}</span>
                  </div>
                )}
                {request.reviewedBy && (
                  <div className="flex items-center space-x-1">
                    <UserIcon className="w-4 h-4" />
                    <span>Xử lý bởi: {request.reviewedBy.fullName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Admin note if exists */}
          {request.adminNote && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Ghi chú admin</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {request.adminNote}
              </p>
            </div>
          )}

          {/* Result if exists */}
          {request.result && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Kết quả</h4>
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                {request.result}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {request.status === "PENDING" && (
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => onViewDetails(request)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1"
            >
              <EyeIcon className="w-4 h-4" />
              <span>Xem chi tiết & Xử lý</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VerificationRequestCard;

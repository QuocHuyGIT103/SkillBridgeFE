import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { useContactRequestStore } from "../../store/contactRequest.store";
import { REQUEST_STATUS_LABELS } from "../../types/contactRequest.types";
import type { ContactRequest } from "../../types/contactRequest.types";
import { ChatButton } from "../chat";

const StudentRequestsList: React.FC = () => {
  const {
    requests,
    isLoading,
    pagination,
    filters,
    getStudentRequests,
    cancelRequest,
    setFilters,
  } = useContactRequestStore();

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showCancelDialog, setShowCancelDialog] = useState<string | null>(null);

  useEffect(() => {
    getStudentRequests();
  }, []);

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setFilters({ ...filters, status: status || undefined, page: 1 });
    getStudentRequests({ ...filters, status: status || undefined, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    getStudentRequests({ ...filters, page });
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelRequest(requestId);
      setShowCancelDialog(null);
    } catch (error) {
      // Error handled in store
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case "ACCEPTED":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "REJECTED":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case "CANCELLED":
        return <TrashIcon className="w-5 h-5 text-gray-500" />;
      case "EXPIRED":
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ACCEPTED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "EXPIRED":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Yêu cầu học tập của tôi
          </h2>
          <div className="text-sm text-gray-500">
            Tổng: {pagination.count} yêu cầu
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusFilter("")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === ""
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tất cả
          </button>
          {Object.entries(REQUEST_STATUS_LABELS).map(([status, label]) => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <ClockIcon className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có yêu cầu nào
            </h3>
            <p className="text-gray-600">
              Bạn chưa gửi yêu cầu học tập nào. Hãy tìm kiếm gia sư phù hợp và
              gửi yêu cầu!
            </p>
          </div>
        ) : (
          requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onCancel={setShowCancelDialog}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.total > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.current - 1)}
            disabled={pagination.current === 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>

          {Array.from({ length: pagination.total }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 text-sm border rounded-lg ${
                  pagination.current === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => handlePageChange(pagination.current + 1)}
            disabled={pagination.current === pagination.total}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      )}

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Xác nhận hủy yêu cầu
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn hủy yêu cầu này không? Hành động này không
              thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelDialog(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Không
              </button>
              <button
                onClick={() => handleCancelRequest(showCancelDialog)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Hủy yêu cầu
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

// Request Card Component
interface RequestCardProps {
  request: ContactRequest;
  onCancel: (id: string) => void;
  getStatusIcon: (status: string) => React.ReactElement;
  getStatusColor: (status: string) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onCancel,
  getStatusIcon,
  getStatusColor,
  formatCurrency,
  formatDate,
}) => {
  const canCancel = request.status
    ? ["PENDING", "ACCEPTED"].includes(request.status)
    : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            {getStatusIcon(request.status || "PENDING")}
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                request.status || "PENDING"
              )}`}
            >
              {
                REQUEST_STATUS_LABELS[
                  request.status as keyof typeof REQUEST_STATUS_LABELS
                ]
              }
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(request.createdAt)}
            </span>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {request.tutorPost?.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Gia sư:{" "}
                <span className="font-medium">{request.tutor?.full_name}</span>
              </p>
              <p className="text-sm text-gray-600">
                Môn:{" "}
                <span className="font-medium">{request.subjectInfo?.name}</span>
              </p>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Hình thức:</span>
                <span className="font-medium">{request.learningMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thời lượng:</span>
                <span className="font-medium">
                  {request.sessionDuration} phút
                </span>
              </div>
              {request.expectedPrice && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá mong muốn:</span>
                  <span className="font-medium">
                    {formatCurrency(request.expectedPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="mb-4">
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
              "{request.message.substring(0, 150)}
              {request.message.length > 150 ? "..." : ""}"
            </p>
          </div>

          {/* Tutor Response */}
          {request.tutorResponse && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">
                Phản hồi từ gia sư:
              </h4>
              <p className="text-sm text-blue-800 mb-2">
                {request.tutorResponse.message}
              </p>

              {request.tutorResponse.counterOffer && (
                <div className="text-xs text-blue-700 space-y-1">
                  <div className="font-medium">Đề xuất:</div>
                  {request.tutorResponse.counterOffer.pricePerSession && (
                    <div>
                      Giá:{" "}
                      {formatCurrency(
                        request.tutorResponse.counterOffer.pricePerSession
                      )}
                    </div>
                  )}
                  {request.tutorResponse.counterOffer.schedule && (
                    <div>
                      Lịch: {request.tutorResponse.counterOffer.schedule}
                    </div>
                  )}
                  {request.tutorResponse.counterOffer.conditions && (
                    <div>
                      Điều kiện: {request.tutorResponse.counterOffer.conditions}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 ml-4">
          <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
            <EyeIcon className="w-5 h-5" />
          </button>

          {request.status === "ACCEPTED" && (
            <ChatButton
              contactRequestId={request.id}
              currentUserId={
                typeof request.studentId === "string"
                  ? request.studentId
                  : request.studentId?.id || ""
              }
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Nhắn tin
            </ChatButton>
          )}

          {canCancel && (
            <button
              onClick={() => onCancel(request.id)}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StudentRequestsList;

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  XMarkIcon,
  CheckIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import type {
  VerificationRequest,
  VerificationStatus,
} from "../../../types/qualification.types";
import DataDisplay from "./DataDisplay";

interface VerificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: VerificationRequest | null;
  onProcess: (
    decisions: Array<{
      detailId: string;
      status: VerificationStatus;
      rejectionReason?: string;
    }>,
    adminNote?: string
  ) => Promise<void>;
  isProcessing: boolean;
}

const VerificationDetailModal: React.FC<VerificationDetailModalProps> = ({
  isOpen,
  onClose,
  request,
  onProcess,
  isProcessing,
}) => {
  const [decisions, setDecisions] = useState<
    Array<{
      detailId: string;
      status: VerificationStatus;
      rejectionReason?: string;
    }>
  >([]);
  const [adminNote, setAdminNote] = useState("");

  React.useEffect(() => {
    if (request && isOpen) {
      // Initialize decisions for all pending details
      const initialDecisions =
        request.details
          ?.filter((detail) => detail.status === "PENDING")
          .map((detail) => ({
            detailId: detail.id,
            status: "PENDING" as VerificationStatus,
          })) || [];
      setDecisions(initialDecisions);
      setAdminNote("");
    }
  }, [request, isOpen]);

  const handleDecisionChange = (
    detailId: string,
    status: VerificationStatus,
    rejectionReason?: string
  ) => {
    setDecisions((prev) => {
      const existing = prev.find((d) => d.detailId === detailId);
      if (existing) {
        return prev.map((d) =>
          d.detailId === detailId ? { ...d, status, rejectionReason } : d
        );
      } else {
        return [...prev, { detailId, status, rejectionReason }];
      }
    });
  };

  const handleSubmit = async () => {
    if (!request) return;

    const validDecisions = decisions.filter((d) => d.status !== "PENDING");

    if (validDecisions.length === 0) {
      alert("Vui lòng xử lý ít nhất một mục");
      return;
    }

    try {
      await onProcess(validDecisions, adminNote);
      onClose();
    } catch (error) {
      console.error("Error processing verification request:", error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "VERIFIED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const getRequestTypeText = (type: string) => {
    switch (type) {
      case "NEW":
        return "Đăng ký mới";
      case "UPDATE":
        return "Cập nhật";
      default:
        return type;
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Chi tiết yêu cầu xác thực
            </h3>
            <p className="text-sm text-gray-600">
              Gia sư: {request.tutor?.fullName} ({request.tutor?.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Request Info */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">
              Thông tin yêu cầu
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">ID yêu cầu:</span> {request.id}
                </div>
                <div>
                  <span className="font-medium">Trạng thái:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Nộp lúc:</span>{" "}
                  {formatDate(request.submittedAt)}
                </div>
                {request.reviewedAt && (
                  <div>
                    <span className="font-medium">Xử lý lúc:</span>{" "}
                    {formatDate(request.reviewedAt)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">
              Chi tiết cần xác thực ({request.details?.length || 0})
            </h4>
            <div className="space-y-4">
              {request.details?.map((detail) => {
                const currentDecision = decisions.find(
                  (d) => d.detailId === detail.id
                );
                const isPending = detail.status === "PENDING";

                return (
                  <div
                    key={detail.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getTargetTypeIcon(detail.targetType)}
                        <span className="font-medium text-gray-900">
                          {getTargetTypeText(detail.targetType)} -{" "}
                          {getRequestTypeText(detail.requestType)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            detail.status
                          )}`}
                        >
                          {detail.status}
                        </span>
                      </div>
                    </div>

                    {/* Data Display */}
                    {detail.requestType === "NEW" ? (
                      // For NEW requests, only show the submitted data
                      <div className="mb-4">
                        <DataDisplay
                          data={detail.dataSnapshot}
                          type={
                            detail.targetType as
                              | "EDUCATION"
                              | "CERTIFICATE"
                              | "ACHIEVEMENT"
                          }
                          title="Thông tin đăng ký mới"
                          className="bg-blue-50 p-4 rounded-lg"
                        />
                      </div>
                    ) : (
                      // For UPDATE requests, show both current and submitted data
                      <>
                        <div className="mb-4">
                          <DataDisplay
                            data={detail.dataSnapshot}
                            type={
                              detail.targetType as
                                | "EDUCATION"
                                | "CERTIFICATE"
                                | "ACHIEVEMENT"
                            }
                            title="Thông tin cập nhật"
                            className="bg-yellow-50 p-4 rounded-lg"
                          />
                        </div>
                        {detail.target && (
                          <div className="mb-4">
                            <DataDisplay
                              data={detail.target}
                              type={
                                detail.targetType as
                                  | "EDUCATION"
                                  | "CERTIFICATE"
                                  | "ACHIEVEMENT"
                              }
                              title="Thông tin hiện tại"
                              className="bg-gray-50 p-4 rounded-lg"
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* Decision for pending items */}
                    {isPending && (
                      <div className="border-t border-gray-200 pt-4">
                        <h5 className="font-medium text-gray-700 mb-3">
                          Quyết định xử lý:
                        </h5>
                        <div className="space-y-3">
                          <div className="flex space-x-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`decision-${detail.id}`}
                                value="VERIFIED"
                                checked={currentDecision?.status === "VERIFIED"}
                                onChange={() =>
                                  handleDecisionChange(detail.id, "VERIFIED")
                                }
                                className="mr-2"
                              />
                              <span className="text-green-700 font-medium">
                                Duyệt
                              </span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`decision-${detail.id}`}
                                value="REJECTED"
                                checked={currentDecision?.status === "REJECTED"}
                                onChange={() =>
                                  handleDecisionChange(detail.id, "REJECTED")
                                }
                                className="mr-2"
                              />
                              <span className="text-red-700 font-medium">
                                Từ chối
                              </span>
                            </label>
                          </div>

                          {currentDecision?.status === "REJECTED" && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lý do từ chối (bắt buộc):
                              </label>
                              <textarea
                                value={currentDecision.rejectionReason || ""}
                                onChange={(e) =>
                                  handleDecisionChange(
                                    detail.id,
                                    "REJECTED",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                rows={2}
                                placeholder="Nhập lý do từ chối..."
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Existing rejection reason */}
                    {detail.status === "REJECTED" && detail.rejectionReason && (
                      <div className="border-t border-gray-200 pt-4">
                        <h5 className="font-medium text-red-700 mb-2">
                          Lý do từ chối:
                        </h5>
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                          {detail.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin Note */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú admin (tùy chọn):
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Nhập ghi chú cho gia sư..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isProcessing}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isProcessing ||
              decisions.filter((d) => d.status !== "PENDING").length === 0
            }
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                <span>Xử lý yêu cầu</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerificationDetailModal;

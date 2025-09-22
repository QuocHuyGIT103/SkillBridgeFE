import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  TrophyIcon,
  UserIcon,
  CalendarIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import useVerificationStore from "../../../store/verification.store";
import { VerificationStatus } from "../../../types/verification.types";
import type { VerificationRequestWithPopulatedData } from "../../../types/verification.types";

const VerificationApprovalPage: React.FC = () => {
  const {
    pendingRequests,
    isLoading,
    isSubmitting,
    fetchPendingRequests,
    approveVerificationRequest,
    rejectVerificationRequest,
  } = useVerificationStore();

  const [selectedRequest, setSelectedRequest] =
    useState<VerificationRequestWithPopulatedData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "view" | null
  >(null);
  const [adminFeedback, setAdminFeedback] = useState("");

  console.log("Pending Requests:", selectedRequest);
  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const handleViewDetails = (request: VerificationRequestWithPopulatedData) => {
    setSelectedRequest(request);
    setActionType("view");
    setShowModal(true);
  };

  const handleAction = (
    request: VerificationRequestWithPopulatedData,
    action: "approve" | "reject"
  ) => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminFeedback("");
    setShowModal(true);
  };

  const handleSubmitAction = async () => {
    if (selectedRequest && actionType && actionType !== "view") {
      try {
        if (actionType === "approve") {
          await approveVerificationRequest(selectedRequest._id, {
            feedback: adminFeedback || undefined,
          });
        } else if (actionType === "reject") {
          if (!adminFeedback.trim()) {
            alert("Vui lòng nhập lý do từ chối");
            return;
          }
          await rejectVerificationRequest(selectedRequest._id, {
            feedback: adminFeedback,
          });
        }
        // Refresh the pending requests list
        await fetchPendingRequests();

        setShowModal(false);
        setSelectedRequest(null);
        setActionType(null);
        setAdminFeedback("");
      } catch (error) {
        console.error("Error processing verification request:", error);
      }
    }
  };

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case VerificationStatus.APPROVED:
        return "bg-green-100 text-green-800";
      case VerificationStatus.REJECTED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.PENDING:
        return "Chờ duyệt";
      case VerificationStatus.APPROVED:
        return "Đã duyệt";
      case VerificationStatus.REJECTED:
        return "Đã từ chối";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-secondary">Đang tải...</span>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Xác thực bằng cấp
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Xem xét và phê duyệt các yêu cầu xác thực học vấn, chứng chỉ và
              thành tích của gia sư
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Chờ duyệt:
              </span>
              <span className="ml-2 font-semibold text-yellow-600">
                {pendingRequests.length}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Verification Requests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {pendingRequests.map((request) => (
            <div key={request._id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Tutor Info */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {request.tutor_id.full_name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {getStatusText(request.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {request.tutor_id.email}
                      </p>

                      {/* Request Summary */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <AcademicCapIcon className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Học vấn: {request.education_id ? "✓" : "—"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DocumentTextIcon className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Chứng chỉ: {request.certificate_ids.length}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrophyIcon className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Thành tích: {request.achievement_ids.length}
                          </span>
                        </div>
                      </div>

                      {/* Request Date */}
                      <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          Gửi yêu cầu:{" "}
                          {new Date(request.created_at).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleViewDetails(request)}
                    className="flex items-center space-x-2 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span className="text-sm">Xem chi tiết</span>
                  </button>
                  <button
                    onClick={() => handleAction(request, "approve")}
                    className="flex items-center space-x-2 px-3 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span className="text-sm">Phê duyệt</span>
                  </button>
                  <button
                    onClick={() => handleAction(request, "reject")}
                    className="flex items-center space-x-2 px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    <XCircleIcon className="w-4 h-4" />
                    <span className="text-sm">Từ chối</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {pendingRequests.length === 0 && (
          <div className="text-center py-12">
            <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Không có yêu cầu xác thực nào đang chờ duyệt
            </p>
          </div>
        )}
      </motion.div>

      {/* Modal for action confirmation or details view */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {actionType === "view" ? (
              // Details View Modal
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Chi tiết yêu cầu xác thực
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Tutor Information */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Thông tin gia sư
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Họ tên:
                        </span>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedRequest.tutor_id.full_name}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email:
                        </span>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedRequest.tutor_id.email}
                        </p>
                      </div>
                      {selectedRequest.tutor_id.phone_number && (
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Số điện thoại:
                          </span>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {selectedRequest.tutor_id.phone_number}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Education Information */}
                {selectedRequest.education_id && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Thông tin học vấn
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Trường:
                          </span>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {selectedRequest.education_id.school}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Bậc học:
                          </span>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {selectedRequest.education_id.level}
                          </p>
                        </div>
                        {selectedRequest.education_id.major && (
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Chuyên ngành:
                            </span>
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                              {selectedRequest.education_id.major}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Thời gian học:
                          </span>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {selectedRequest.education_id.start_year} -{" "}
                            {selectedRequest.education_id.end_year}
                          </p>
                        </div>
                        {selectedRequest.education_id.degree_image_url && (
                          <div className="md:col-span-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Hình ảnh bằng cấp:
                            </span>
                            <div className="mt-2">
                              <img
                                src={
                                  selectedRequest.education_id.degree_image_url
                                }
                                alt="Bằng cấp"
                                className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Certificates */}
                {selectedRequest.certificate_ids.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Chứng chỉ ({selectedRequest.certificate_ids.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedRequest.certificate_ids.map((cert) => (
                        <div
                          key={cert._id}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                {cert.name}
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {cert.description}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Được cấp bởi: {cert.issued_by}
                              </p>
                              {cert.issue_date && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Ngày cấp:{" "}
                                  {new Date(cert.issue_date).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </p>
                              )}
                              {cert.expiry_date && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Ngày hết hạn:{" "}
                                  {new Date(
                                    cert.expiry_date
                                  ).toLocaleDateString("vi-VN")}
                                </p>
                              )}
                            </div>
                            {cert.certificate_image_url && (
                              <img
                                src={cert.certificate_image_url}
                                alt={cert.name}
                                className="w-20 h-20 object-cover rounded-lg ml-4"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {selectedRequest.achievement_ids.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Thành tích ({selectedRequest.achievement_ids.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedRequest.achievement_ids.map((achievement) => (
                        <div
                          key={achievement._id}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                {achievement.name}
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm">
                                <p className="text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">Cấp độ:</span>{" "}
                                  {achievement.level}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">Loại:</span>{" "}
                                  {achievement.type}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">Tổ chức:</span>{" "}
                                  {achievement.organization}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">Ngày đạt:</span>{" "}
                                  {new Date(
                                    achievement.date_achieved
                                  ).toLocaleDateString("vi-VN")}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 md:col-span-2">
                                  <span className="font-medium">Lĩnh vực:</span>{" "}
                                  {achievement.field}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {achievement.description}
                              </p>
                            </div>
                            {achievement.achievement_image_url && (
                              <img
                                src={achievement.achievement_image_url}
                                alt={achievement.name}
                                className="w-20 h-20 object-cover rounded-lg ml-4"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      setActionType("approve");
                      setAdminFeedback("");
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Phê duyệt
                  </button>
                  <button
                    onClick={() => {
                      setActionType("reject");
                      setAdminFeedback("");
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            ) : (
              // Action Confirmation Modal
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {actionType === "approve"
                      ? "Phê duyệt yêu cầu xác thực"
                      : "Từ chối yêu cầu xác thực"}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Gia sư:{" "}
                    <span className="font-medium">
                      {selectedRequest.tutor_id.full_name}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bạn có chắc chắn muốn{" "}
                    {actionType === "approve" ? "phê duyệt" : "từ chối"} yêu cầu
                    xác thực này?
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {actionType === "approve"
                      ? "Ghi chú (tùy chọn)"
                      : "Lý do từ chối *"}
                  </label>
                  <textarea
                    value={adminFeedback}
                    onChange={(e) => setAdminFeedback(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    placeholder={
                      actionType === "approve"
                        ? "Thêm ghi chú cho gia sư..."
                        : "Nhập lý do từ chối yêu cầu xác thực..."
                    }
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmitAction}
                    disabled={isSubmitting}
                    className={`px-4 py-2 text-white rounded-lg transition-colors ${
                      actionType === "approve"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    } disabled:opacity-50`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
                        Đang xử lý...
                      </>
                    ) : actionType === "approve" ? (
                      "Phê duyệt"
                    ) : (
                      "Từ chối"
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VerificationApprovalPage;

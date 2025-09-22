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
  FunnelIcon,
} from "@heroicons/react/24/outline";
import useVerificationStore from "../../../store/verification.store";
import { VerificationStatus } from "../../../types/verification.types";
import type { VerificationRequestWithPopulatedData } from "../../../types/verification.types";
import ImagePreview from "../../../components/common/ImagePreview";

const VerificationHistoryPage: React.FC = () => {
  const { allRequests, isLoading, fetchAllRequests } = useVerificationStore();

  const [selectedRequest, setSelectedRequest] =
    useState<VerificationRequestWithPopulatedData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<VerificationStatus | "all">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  const handleViewDetails = (request: VerificationRequestWithPopulatedData) => {
    setSelectedRequest(request);
    setShowModal(true);
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

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.PENDING:
        return <ClockIcon className="w-4 h-4" />;
      case VerificationStatus.APPROVED:
        return <CheckCircleIcon className="w-4 h-4" />;
      case VerificationStatus.REJECTED:
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  // Filter and search logic
  const filteredRequests = allRequests.filter((request) => {
    const matchesStatus =
      filterStatus === "all" || request.status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      request.tutor_id.full_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.tutor_id.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // Statistics
  const stats = {
    total: allRequests.length,
    pending: allRequests.filter((r) => r.status === VerificationStatus.PENDING)
      .length,
    approved: allRequests.filter(
      (r) => r.status === VerificationStatus.APPROVED
    ).length,
    rejected: allRequests.filter(
      (r) => r.status === VerificationStatus.REJECTED
    ).length,
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
              Lịch sử xác thực bằng cấp
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Xem lịch sử tất cả các yêu cầu xác thực học vấn, chứng chỉ và
              thành tích
            </p>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tổng số
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.total}
              </p>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Chờ duyệt
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <ClockIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Đã duyệt
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.approved}
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Đã từ chối
              </p>
              <p className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </p>
            </div>
            <XCircleIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as VerificationStatus | "all");
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value={VerificationStatus.PENDING}>Chờ duyệt</option>
              <option value={VerificationStatus.APPROVED}>Đã duyệt</option>
              <option value={VerificationStatus.REJECTED}>Đã từ chối</option>
            </select>
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên gia sư hoặc email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredRequests.length} kết quả
          </div>
        </div>
      </motion.div>

      {/* Verification Requests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {paginatedRequests.map((request) => (
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
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {getStatusIcon(request.status)}
                          <span>{getStatusText(request.status)}</span>
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

                      {/* Request Dates */}
                      <div className="mt-3 flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-6 text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>
                            Tạo:{" "}
                            {new Date(request.created_at).toLocaleString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                        {request.updated_at !== request.created_at && (
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span>
                              Cập nhật:{" "}
                              {new Date(request.updated_at).toLocaleString(
                                "vi-VN"
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Admin Feedback */}
                      {request.admin_feedback && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Phản hồi từ admin:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {request.admin_feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center">
                  <button
                    onClick={() => handleViewDetails(request)}
                    className="flex items-center space-x-2 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span className="text-sm">Xem chi tiết</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {paginatedRequests.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {filteredRequests.length === 0
                ? "Không tìm thấy yêu cầu xác thực nào phù hợp với bộ lọc"
                : "Không có yêu cầu xác thực nào"}
            </p>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center justify-center space-x-2"
        >
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Trước
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            const isCurrentPage = page === currentPage;

            // Show first page, last page, current page, and pages around current page
            const shouldShow =
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1);

            if (!shouldShow) {
              // Show ellipsis for gaps
              if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-2 text-gray-500">
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isCurrentPage
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sau
          </button>
        </motion.div>
      )}

      {/* Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
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

              {/* Status and Dates */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(selectedRequest.status)}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedRequest.status
                      )}`}
                    >
                      {getStatusText(selectedRequest.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tạo:{" "}
                    {new Date(selectedRequest.created_at).toLocaleString(
                      "vi-VN"
                    )}
                  </p>
                  {selectedRequest.updated_at !==
                    selectedRequest.created_at && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Cập nhật:{" "}
                      {new Date(selectedRequest.updated_at).toLocaleString(
                        "vi-VN"
                      )}
                    </p>
                  )}
                </div>

                {selectedRequest.admin_feedback && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Phản hồi từ admin:
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {selectedRequest.admin_feedback}
                    </p>
                  </div>
                )}
              </div>

              {/* Rest of the modal content is the same as VerificationApprovalPage */}
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
                            <ImagePreview
                              src={
                                selectedRequest.education_id.degree_image_url
                              }
                              alt="Bằng cấp"
                              thumbnailClassName="w-48 h-48 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity shadow-md"
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
                    {selectedRequest.certificate_ids.map((cert: any) => (
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
                          </div>
                          {cert.certificate_image_url && (
                            <ImagePreview
                              src={cert.certificate_image_url}
                              alt={cert.name}
                              className="ml-4"
                              thumbnailClassName="w-32 h-32 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity shadow-md"
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
                    {selectedRequest.achievement_ids.map((achievement: any) => (
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
                            <ImagePreview
                              src={achievement.achievement_image_url}
                              alt={achievement.name}
                              className="ml-4"
                              thumbnailClassName="w-32 h-32 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity shadow-md"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VerificationHistoryPage;

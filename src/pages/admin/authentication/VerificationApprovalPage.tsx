import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ClipboardDocumentCheckIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useVerificationStore } from "../../../store/verification.store";
import type {
  VerificationRequest,
  VerificationStatus,
} from "../../../types/qualification.types";
import VerificationRequestCard from "../../../components/admin/verification/VerificationRequestCard";
import VerificationDetailModal from "../../../components/admin/verification/VerificationDetailModal";

const VerificationApprovalPage: React.FC = () => {
  // Store
  const {
    adminRequests,
    adminPagination,
    isFetchingAdminRequests,
    isProcessingRequest,
    fetchAdminVerificationRequests,
    processVerificationRequest,
    fetchVerificationRequestDetail,
    currentRequest,
  } = useVerificationStore();

  // Local state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    tutorId: "",
    search: "",
    requestType: "", // New filter for request type
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState<"priority" | "date">("priority"); // New sort option

  // Load data on mount and when filters change
  useEffect(() => {
    fetchAdminVerificationRequests({
      page: currentPage,
      limit: pageSize,
      status: filters.status || undefined,
      tutorId: filters.tutorId || undefined,
    });
  }, [
    currentPage,
    filters.status,
    filters.tutorId,
    fetchAdminVerificationRequests,
  ]);

  // Handlers
  const handleViewDetails = async (request: VerificationRequest) => {
    if (!request.id) {
      console.error("Request ID is missing:", request);
      return;
    }

    try {
      // Fetch chi tiết từ API
      await fetchVerificationRequestDetail(request.id);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching verification details:", error);
    }
  };

  const handleProcessRequest = async (
    decisions: Array<{
      detailId: string;
      status: VerificationStatus;
      rejectionReason?: string;
    }>,
    adminNote?: string
  ) => {
    if (!currentRequest || !currentRequest.id) {
      console.error(
        "No current request or request ID is missing",
        currentRequest
      );
      return;
    }

    try {
      await processVerificationRequest(currentRequest.id, {
        decisions,
        adminNote,
      });

      // Refresh the list
      fetchAdminVerificationRequests({
        page: currentPage,
        limit: pageSize,
        status: filters.status || undefined,
        tutorId: filters.tutorId || undefined,
      });
    } catch (error) {
      console.error("Error processing verification request:", error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({ status: "", tutorId: "", search: "", requestType: "" });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Helper function to check if request contains TUTOR_PROFILE
  const hasTutorProfile = (request: VerificationRequest): boolean => {
    return (
      request.details?.some(
        (detail) => detail.targetType === "TUTOR_PROFILE"
      ) || false
    );
  };

  // Filter and sort requests
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = adminRequests.filter((request) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          request.tutorId?.fullName?.toLowerCase().includes(searchLower) ||
          request.tutorId?.email?.toLowerCase().includes(searchLower) ||
          request.id.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Request type filter
      if (filters.requestType) {
        if (
          filters.requestType === "TUTOR_PROFILE" &&
          !hasTutorProfile(request)
        ) {
          return false;
        }
        if (
          filters.requestType === "QUALIFICATIONS" &&
          hasTutorProfile(request)
        ) {
          return false;
        }
      }

      return true;
    });

    // Sort requests
    if (sortBy === "priority") {
      filtered.sort((a, b) => {
        const aHasTutorProfile = hasTutorProfile(a);
        const bHasTutorProfile = hasTutorProfile(b);

        // TUTOR_PROFILE requests first
        if (aHasTutorProfile && !bHasTutorProfile) return -1;
        if (!aHasTutorProfile && bHasTutorProfile) return 1;

        // Then by submission date (newest first)
        return (
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
      });
    } else {
      // Sort by date only
      filtered.sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
    }

    return filtered;
  }, [adminRequests, filters.search, filters.requestType, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = adminRequests.length;
    const pending = adminRequests.filter(
      (req) => req.status === "PENDING"
    ).length;
    const tutorProfilePending = adminRequests.filter(
      (req) => req.status === "PENDING" && hasTutorProfile(req)
    ).length;
    const qualificationsPending = pending - tutorProfilePending;

    return { total, pending, tutorProfilePending, qualificationsPending };
  }, [adminRequests]);

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
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ClipboardDocumentCheckIcon className="w-8 h-8 mr-3 text-orange-600" />
              Duyệt xác thực thông tin gia sư
            </h1>
            <p className="text-gray-600 mt-1">
              Xem xét và phê duyệt các yêu cầu xác thực thông tin cá nhân và
              bằng cấp gia sư
            </p>
          </div>
          <div className="text-right">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <p className="text-xs text-purple-600 font-medium">
                  Thông tin gia sư
                </p>
                <p className="text-lg font-bold text-purple-600">
                  {stats.tutorProfilePending}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 font-medium">Bằng cấp</p>
                <p className="text-lg font-bold text-blue-600">
                  {stats.qualificationsPending}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Tổng: {stats.pending} yêu cầu chờ duyệt
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FunnelIcon className="w-5 h-5 mr-2" />
            Bộ lọc
          </h3>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
          >
            <XMarkIcon className="w-4 h-4 mr-1" />
            Xóa bộ lọc
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tên gia sư, email, ID..."
              />
            </div>
          </div>

          {/* Request Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại yêu cầu
            </label>
            <select
              value={filters.requestType}
              onChange={(e) =>
                handleFilterChange("requestType", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả</option>
              <option value="TUTOR_PROFILE">Thông tin gia sư</option>
              <option value="QUALIFICATIONS">Bằng cấp</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="PARTIALLY_APPROVED">Duyệt một phần</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sắp xếp
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "priority" | "date")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="priority">Ưu tiên</option>
              <option value="date">Ngày gửi</option>
            </select>
          </div>

          {/* Results count */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Hiển thị {filteredAndSortedRequests.length} kết quả
            </div>
          </div>
        </div>
      </motion.div>

      {/* Requests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        {isFetchingAdminRequests ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : filteredAndSortedRequests.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredAndSortedRequests.map((request) => (
              <VerificationRequestCard
                key={request.id}
                request={request}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ClipboardDocumentCheckIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Không có yêu cầu xác thực nào</p>
          </div>
        )}

        {/* Pagination */}
        {adminPagination && adminPagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {(currentPage - 1) * pageSize + 1} đến{" "}
                {Math.min(currentPage * pageSize, adminPagination.total)} trong
                tổng số {adminPagination.total} kết quả
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {Array.from(
                  { length: adminPagination.totalPages },
                  (_, i) => i + 1
                )
                  .filter((page) => {
                    // Show first, last, current, and pages around current
                    return (
                      page === 1 ||
                      page === adminPagination.totalPages ||
                      Math.abs(page - currentPage) <= 2
                    );
                  })
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 text-sm rounded-lg ${
                          page === currentPage
                            ? "bg-orange-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === adminPagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <VerificationDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
        }}
        request={currentRequest}
        onProcess={handleProcessRequest}
        isProcessing={isProcessingRequest}
      />
    </div>
  );
};

export default VerificationApprovalPage;

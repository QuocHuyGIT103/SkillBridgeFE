import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useVerificationStore } from "../../../store/verification.store";
// import type { VerificationDetail } from "../../../types/qualification.types";
import VerificationHistoryCard from "../../../components/admin/verification/VerificationHistoryCard";

const VerificationHistoryPage: React.FC = () => {
  // Store
  const {
    verificationHistory,
    historyPagination,
    isFetchingHistory,
    fetchVerificationHistory,
  } = useVerificationStore();

  // Local state
  const [filters, setFilters] = useState({
    tutorId: "",
    targetType: "",
    status: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Load data on mount and when filters change
  useEffect(() => {
    fetchVerificationHistory({
      page: currentPage,
      limit: pageSize,
      tutorId: filters.tutorId || undefined,
      targetType: filters.targetType || undefined,
      status: filters.status || undefined,
    });
  }, [
    currentPage,
    filters.tutorId,
    filters.targetType,
    filters.status,
    fetchVerificationHistory,
  ]);

  // Handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({ tutorId: "", targetType: "", status: "", search: "" });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Filter history based on search
  const filteredHistory = verificationHistory.filter((detail) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      detail.id.toLowerCase().includes(searchLower) ||
      detail.targetType.toLowerCase().includes(searchLower) ||
      JSON.stringify(detail.dataSnapshot).toLowerCase().includes(searchLower)
    );
  });

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
              <ClockIcon className="w-8 h-8 mr-3 text-orange-600" />
              Lịch sử xác thực bằng cấp
            </h1>
            <p className="text-gray-600 mt-1">
              Xem lịch sử các yêu cầu xác thực đã được xử lý
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Tổng số bản ghi</p>
            <p className="text-2xl font-bold text-orange-600">
              {historyPagination?.total || 0}
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
                placeholder="ID, loại, nội dung..."
              />
            </div>
          </div>

          {/* Tutor ID Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Gia sư
            </label>
            <input
              type="text"
              value={filters.tutorId}
              onChange={(e) => handleFilterChange("tutorId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập ID gia sư..."
            />
          </div>

          {/* Target Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại thông tin
            </label>
            <select
              value={filters.targetType}
              onChange={(e) => handleFilterChange("targetType", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả</option>
              <option value="EDUCATION">Học vấn</option>
              <option value="CERTIFICATE">Chứng chỉ</option>
              <option value="ACHIEVEMENT">Thành tích</option>
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
              <option value="VERIFIED">Đã duyệt</option>
              <option value="REJECTED">Đã từ chối</option>
              <option value="PENDING">Chờ duyệt</option>
            </select>
          </div>

          {/* Results count */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Hiển thị {filteredHistory.length} kết quả
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
              <p className="text-2xl font-bold text-green-600">
                {
                  verificationHistory.filter((h) => h.status === "VERIFIED")
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã từ chối</p>
              <p className="text-2xl font-bold text-red-600">
                {
                  verificationHistory.filter((h) => h.status === "REJECTED")
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Học vấn</p>
              <p className="text-2xl font-bold text-blue-600">
                {
                  verificationHistory.filter(
                    (h) => h.targetType === "EDUCATION"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chứng chỉ</p>
              <p className="text-2xl font-bold text-yellow-600">
                {
                  verificationHistory.filter(
                    (h) => h.targetType === "CERTIFICATE"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* History List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        {isFetchingHistory ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : filteredHistory.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredHistory.map((detail) => (
              <VerificationHistoryCard key={detail.id} detail={detail} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ClockIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Không có lịch sử xác thực nào</p>
          </div>
        )}

        {/* Pagination */}
        {historyPagination && historyPagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {(currentPage - 1) * pageSize + 1} đến{" "}
                {Math.min(currentPage * pageSize, historyPagination.total)}{" "}
                trong tổng số {historyPagination.total} kết quả
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
                  { length: historyPagination.totalPages },
                  (_, i) => i + 1
                )
                  .filter((page) => {
                    // Show first, last, current, and pages around current
                    return (
                      page === 1 ||
                      page === historyPagination.totalPages ||
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
                  disabled={currentPage === historyPagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerificationHistoryPage;

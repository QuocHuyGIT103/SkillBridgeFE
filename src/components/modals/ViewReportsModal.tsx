import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  FunnelIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  ArrowLeftIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";
import sessionReportService from "../../services/sessionReport.service";
import type {
  SessionReport,
  ReportStatus,
  ReportPriority,
  ReportFilters,
} from "../../types/sessionReport.types";

interface ViewReportsModalProps {
  classId?: string;
  onClose: () => void;
}

const ViewReportsModal: React.FC<ViewReportsModalProps> = ({
  classId,
  onClose,
}) => {
  const [reports, setReports] = useState<SessionReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SessionReport | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFilters>({
    classId,
    page: 1,
    limit: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await sessionReportService.getMyReports(filters);
      setReports(response.reports);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      console.error("Fetch reports error:", error);
      toast.error("Không thể tải danh sách báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (report: SessionReport) => {
    setSelectedReport(report);
  };

  const handleBackToList = () => {
    setSelectedReport(null);
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "UNDER_REVIEW":
        return "bg-blue-100 text-blue-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "DISMISSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: ReportStatus) => {
    switch (status) {
      case "PENDING":
        return "Chờ xử lý";
      case "UNDER_REVIEW":
        return "Đang xem xét";
      case "RESOLVED":
        return "Đã giải quyết";
      case "DISMISSED":
        return "Đã bỏ qua";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case "PENDING":
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case "UNDER_REVIEW":
        return <ExclamationCircleIcon className="w-5 h-5 text-blue-600" />;
      case "RESOLVED":
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case "DISMISSED":
        return <XMarkIcon className="w-5 h-5 text-gray-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: ReportPriority) => {
    switch (priority) {
      case "LOW":
        return "text-gray-600";
      case "MEDIUM":
        return "text-yellow-600";
      case "HIGH":
        return "text-orange-600";
      case "CRITICAL":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityText = (priority: ReportPriority) => {
    switch (priority) {
      case "LOW":
        return "Thấp";
      case "MEDIUM":
        return "Trung bình";
      case "HIGH":
        return "Cao";
      case "CRITICAL":
        return "Khẩn cấp";
      default:
        return priority;
    }
  };

  const getDecisionText = (decision: string) => {
    switch (decision) {
      case "STUDENT_FAULT":
        return "Lỗi của học viên";
      case "TUTOR_FAULT":
        return "Lỗi của gia sư";
      case "BOTH_FAULT":
        return "Lỗi của cả hai";
      case "NO_FAULT":
        return "Không có lỗi";
      case "DISMISSED":
        return "Bỏ qua";
      default:
        return decision;
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case "STUDENT_FAULT":
        return "text-red-700 bg-red-50";
      case "TUTOR_FAULT":
        return "text-orange-700 bg-orange-50";
      case "BOTH_FAULT":
        return "text-purple-700 bg-purple-50";
      case "NO_FAULT":
        return "text-green-700 bg-green-50";
      case "DISMISSED":
        return "text-gray-700 bg-gray-50";
      default:
        return "text-gray-700 bg-gray-50";
    }
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case "IMAGE":
        return <PhotoIcon className="w-5 h-5 text-blue-500" />;
      case "VIDEO":
        return <VideoCameraIcon className="w-5 h-5 text-purple-500" />;
      case "DOCUMENT":
        return <DocumentIcon className="w-5 h-5 text-gray-500" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  if (selectedReport) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackToList}
                  className="text-white hover:text-gray-200 transition-colors cursor-pointer"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-white">
                  Chi tiết báo cáo - Buổi #{selectedReport.sessionNumber}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Status & Priority */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(selectedReport.status)}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedReport.status
                    )}`}
                  >
                    {getStatusText(selectedReport.status)}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold ${getPriorityColor(
                    selectedReport.priority
                  )}`}
                >
                  Ưu tiên: {getPriorityText(selectedReport.priority)}
                </span>
              </div>

              {/* Metadata */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo:</span>
                  <span className="font-medium text-gray-900">
                    {format(
                      new Date(selectedReport.createdAt),
                      "dd/MM/yyyy HH:mm",
                      { locale: vi }
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Người báo cáo:</span>
                  <span className="font-medium text-gray-900">
                    {selectedReport.reportedBy.userName}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Nội dung báo cáo
                </h3>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {selectedReport.description}
                  </p>
                </div>
              </div>

              {/* Evidence */}
              {selectedReport.evidence.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Bằng chứng ({selectedReport.evidence.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedReport.evidence.map((evidence, index) => (
                      <a
                        key={index}
                        href={evidence.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        {getEvidenceIcon(evidence.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {evidence.fileName || `Evidence ${index + 1}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(
                              new Date(evidence.uploadedAt),
                              "dd/MM/yyyy HH:mm",
                              { locale: vi }
                            )}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution */}
              {selectedReport.resolution && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Kết quả xử lý
                  </h3>
                  <div className="space-y-3">
                    <div
                      className={`rounded-lg p-4 border-2 ${getDecisionColor(
                        selectedReport.resolution.decision
                      )}`}
                    >
                      <p className="font-semibold mb-1">
                        Quyết định:{" "}
                        {getDecisionText(selectedReport.resolution.decision)}
                      </p>
                      <p className="text-sm">
                        Người xử lý: {selectedReport.resolution.resolverName}
                      </p>
                      <p className="text-sm">
                        Thời gian:{" "}
                        {format(
                          new Date(selectedReport.resolution.resolvedAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: vi }
                        )}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Thông báo từ Admin:
                      </p>
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {selectedReport.resolution.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedReport.adminNotes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Ghi chú từ Admin ({selectedReport.adminNotes.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedReport.adminNotes.map((note) => (
                      <div
                        key={note._id}
                        className="bg-yellow-50 rounded-lg p-3 border border-yellow-200"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {note.adminName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(note.createdAt), "dd/MM HH:mm", {
                              locale: vi,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{note.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Báo cáo của tôi</h2>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-white hover:text-gray-200 transition-colors cursor-pointer p-2"
              >
                <FunnelIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={filters.status || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      status: (e.target.value as ReportStatus) || undefined,
                      page: 1,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="UNDER_REVIEW">Đang xem xét</option>
                  <option value="RESOLVED">Đã giải quyết</option>
                  <option value="DISMISSED">Đã bỏ qua</option>
                </select>

                <select
                  value={filters.priority || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      priority: (e.target.value as ReportPriority) || undefined,
                      page: 1,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả mức độ</option>
                  <option value="LOW">Thấp</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HIGH">Cao</option>
                  <option value="CRITICAL">Khẩn cấp</option>
                </select>

                <button
                  onClick={() => setFilters({ classId, page: 1, limit: 10 })}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Chưa có báo cáo nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            Buổi học #{report.sessionNumber}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              report.status
                            )}`}
                          >
                            {getStatusText(report.status)}
                          </span>
                          <span
                            className={`text-xs font-semibold ${getPriorityColor(
                              report.priority
                            )}`}
                          >
                            {getPriorityText(report.priority)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {report.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {format(
                            new Date(report.createdAt),
                            "dd/MM/yyyy HH:mm",
                            { locale: vi }
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewDetail(report)}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span className="text-sm">Xem</span>
                      </button>
                    </div>

                    {report.evidence.length > 0 && (
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>{report.evidence.length} bằng chứng</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && reports.length > 0 && totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
              <button
                onClick={() =>
                  setFilters({
                    ...filters,
                    page: Math.max(1, (filters.page || 1) - 1),
                  })
                }
                disabled={filters.page === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="text-sm text-gray-600">
                Trang {filters.page} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setFilters({
                    ...filters,
                    page: Math.min(totalPages, (filters.page || 1) + 1),
                  })
                }
                disabled={filters.page === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ViewReportsModal;

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ShieldExclamationIcon,
  MapPinIcon,
  CakeIcon,
} from "@heroicons/react/24/outline";
import type {
  AdminUserListItem,
  UserDetailedInfo,
  UserViolationSummary,
} from "../../../types/admin.types";
import adminUserService from "../../../services/admin/user.admin.service";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface UserDetailModalProps {
  user: AdminUserListItem;
  onClose: () => void;
  onRefresh: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  onClose,
  onRefresh,
}) => {
  const [loading, setLoading] = useState(true);
  const [detailedUser, setDetailedUser] = useState<UserDetailedInfo | null>(
    null
  );
  const [violationSummary, setViolationSummary] =
    useState<UserViolationSummary | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "violations">("info");

  useEffect(() => {
    loadUserDetails();
  }, [user.id]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      const response = await adminUserService.getUserDetails(user.id);
      setDetailedUser(response.user);
      setViolationSummary(response.violation_summary);
    } catch (error: any) {
      console.error("Error loading user details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
            Hoạt động
          </span>
        );
      case "locked":
        return (
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
            Bị khóa
          </span>
        );
      case "pending_verification":
        return (
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
            Chờ xác thực
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-red-50 to-white">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar_url || "/default-avatar.png"}
                alt={user.full_name}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.full_name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(user.status)}
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      user.role === "TUTOR"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {user.role === "TUTOR" ? "Gia sư" : "Học viên"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "info"
                  ? "text-red-600 border-b-2 border-red-600 bg-red-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab("violations")}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "violations"
                  ? "text-red-600 border-b-2 border-red-600 bg-red-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Lịch sử vi phạm ({user.violation_count})
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : activeTab === "info" ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">
                          {detailedUser?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <PhoneIcon className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Số điện thoại</p>
                        <p className="font-medium text-gray-900">
                          {detailedUser?.phone_number || "Chưa cập nhật"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CalendarIcon className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Ngày tham gia</p>
                        <p className="font-medium text-gray-900">
                          {detailedUser?.created_at
                            ? format(
                                new Date(detailedUser.created_at),
                                "dd/MM/yyyy",
                                {
                                  locale: vi,
                                }
                              )
                            : "Không có dữ liệu"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {detailedUser?.date_of_birth && (
                      <div className="flex items-start gap-3">
                        <CakeIcon className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Ngày sinh</p>
                          <p className="font-medium text-gray-900">
                            {format(
                              new Date(detailedUser.date_of_birth),
                              "dd/MM/yyyy",
                              { locale: vi }
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {detailedUser?.gender && (
                      <div className="flex items-start gap-3">
                        <UserIcon className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Giới tính</p>
                          <p className="font-medium text-gray-900">
                            {detailedUser.gender === "male"
                              ? "Nam"
                              : detailedUser.gender === "female"
                              ? "Nữ"
                              : "Khác"}
                          </p>
                        </div>
                      </div>
                    )}

                    {detailedUser?.address && (
                      <div className="flex items-start gap-3">
                        <MapPinIcon className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Địa chỉ</p>
                          <p className="font-medium text-gray-900">
                            {detailedUser.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Violation Summary */}
                {violationSummary && violationSummary.total_violations > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldExclamationIcon className="w-5 h-5 text-red-600" />
                      <h3 className="font-semibold text-red-900">
                        Tổng quan vi phạm
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {violationSummary.total_violations}
                        </p>
                        <p className="text-sm text-gray-600">Tổng vi phạm</p>
                      </div>
                      {violationSummary.student_fault_count > 0 && (
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">
                            {violationSummary.student_fault_count}
                          </p>
                          <p className="text-sm text-gray-600">Lỗi học viên</p>
                        </div>
                      )}
                      {violationSummary.tutor_fault_count > 0 && (
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">
                            {violationSummary.tutor_fault_count}
                          </p>
                          <p className="text-sm text-gray-600">Lỗi gia sư</p>
                        </div>
                      )}
                      {violationSummary.both_fault_count > 0 && (
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">
                            {violationSummary.both_fault_count}
                          </p>
                          <p className="text-sm text-gray-600">Lỗi cả hai</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {violationSummary && violationSummary.total_violations > 0 ? (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Lịch sử báo cáo vi phạm gần đây
                    </h3>
                    <div className="space-y-3">
                      {violationSummary.recent_reports.map(
                        (report: any, index: number) => (
                          <div
                            key={index}
                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {report.title || "Báo cáo vi phạm"}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {report.description?.substring(0, 100)}
                                  {report.description?.length > 100
                                    ? "..."
                                    : ""}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-gray-500">
                                    {report.created_at || report.createdAt
                                      ? format(
                                          new Date(
                                            report.created_at ||
                                              report.createdAt
                                          ),
                                          "dd/MM/yyyy HH:mm",
                                          { locale: vi }
                                        )
                                      : "Không rõ thời gian"}
                                  </span>
                                  {report.resolution?.decision && (
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full ${
                                        report.resolution.decision ===
                                          "STUDENT_FAULT" ||
                                        report.resolution.decision ===
                                          "TUTOR_FAULT"
                                          ? "bg-red-100 text-red-800"
                                          : report.resolution.decision ===
                                            "BOTH_FAULT"
                                          ? "bg-orange-100 text-orange-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {report.resolution.decision ===
                                      "STUDENT_FAULT"
                                        ? "Lỗi học viên"
                                        : report.resolution.decision ===
                                          "TUTOR_FAULT"
                                        ? "Lỗi gia sư"
                                        : report.resolution.decision ===
                                          "BOTH_FAULT"
                                        ? "Lỗi cả hai"
                                        : report.resolution.decision ===
                                          "NO_FAULT"
                                        ? "Không ai sai"
                                        : "Bỏ qua"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShieldExclamationIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Không có vi phạm nào</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-colors"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UserDetailModal;

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  LockOpenIcon,
} from "@heroicons/react/24/outline";
import type { AdminUserListItem } from "../../../types/admin.types";

interface BlockConfirmModalProps {
  user: AdminUserListItem;
  action: "block" | "unblock";
  onConfirm: (reason: string) => Promise<void>;
  onClose: () => void;
}

const BlockConfirmModal: React.FC<BlockConfirmModalProps> = ({
  user,
  action,
  onConfirm,
  onClose,
}) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (action === "block" && !reason.trim()) {
      alert("Vui lòng nhập lý do khóa tài khoản");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(reason);
    } finally {
      setLoading(false);
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
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              {action === "block" ? (
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <LockClosedIcon className="w-6 h-6 text-red-600" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <LockOpenIcon className="w-6 h-6 text-green-600" />
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900">
                {action === "block" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Warning */}
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                {action === "block" ? (
                  <>
                    Bạn có chắc chắn muốn khóa tài khoản của{" "}
                    <span className="font-semibold">{user.full_name}</span>?
                    <br />
                    Người dùng sẽ không thể đăng nhập vào hệ thống sau khi bị
                    khóa.
                  </>
                ) : (
                  <>
                    Bạn có chắc chắn muốn mở khóa tài khoản của{" "}
                    <span className="font-semibold">{user.full_name}</span>?
                    <br />
                    Người dùng sẽ có thể đăng nhập và sử dụng hệ thống trở lại.
                  </>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar_url || "/default-avatar.png"}
                  alt={user.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {user.full_name}
                  </p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span
                  className={`px-2.5 py-0.5 rounded-full font-medium ${
                    user.role === "TUTOR"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {user.role === "TUTOR" ? "Gia sư" : "Học viên"}
                </span>
                {user.violation_count > 0 && (
                  <span className="text-red-600 font-medium">
                    {user.violation_count} vi phạm
                  </span>
                )}
              </div>
            </div>

            {/* Reason Input */}
            {action === "block" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do khóa tài khoản <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nhập lý do khóa tài khoản (ví dụ: Vi phạm điều khoản, hành vi không phù hợp...)"
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lý do này sẽ được lưu lại và có thể được thông báo cho người
                  dùng.
                </p>
              </div>
            )}

            {action === "unblock" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nhập ghi chú về việc mở khóa..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  action === "block"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang xử lý...</span>
                  </div>
                ) : action === "block" ? (
                  "Xác nhận khóa"
                ) : (
                  "Xác nhận mở khóa"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BlockConfirmModal;

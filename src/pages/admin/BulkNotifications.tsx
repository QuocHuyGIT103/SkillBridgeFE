import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BellIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { BellIcon as BellSolidIcon } from "@heroicons/react/24/solid";

type RecipientType = "all" | "students" | "tutors" | "specific";
type NotificationType = "info" | "warning" | "success" | "error";

const BulkNotifications: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    recipientType: "all" as RecipientType,
    notificationType: "info" as NotificationType,
    scheduledDate: "",
    sendNow: true,
  });

  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({ show: false, success: false, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      setSendStatus({
        show: true,
        success: true,
        message: "Thông báo đã được gửi thành công!",
      });

      // Reset form
      setFormData({
        title: "",
        message: "",
        recipientType: "all",
        notificationType: "info",
        scheduledDate: "",
        sendNow: true,
      });

      // Hide status after 3 seconds
      setTimeout(() => {
        setSendStatus({ show: false, success: false, message: "" });
      }, 3000);
    }, 1500);
  };

  const getRecipientCount = () => {
    switch (formData.recipientType) {
      case "all":
        return "1,234 người dùng";
      case "students":
        return "856 học viên";
      case "tutors":
        return "378 gia sư";
      case "specific":
        return "Chọn người nhận cụ thể";
      default:
        return "";
    }
  };

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
              <BellSolidIcon className="w-8 h-8 mr-3 text-blue-600" />
              Thông báo hàng loạt
            </h1>
            <p className="text-gray-600 mt-1">
              Gửi thông báo đến nhiều người dùng cùng lúc
            </p>
          </div>
        </div>
      </motion.div>

      {/* Status Message */}
      {sendStatus.show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center gap-3 ${
            sendStatus.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {sendStatus.success ? (
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
          ) : (
            <XCircleIcon className="w-6 h-6 text-red-600" />
          )}
          <p
            className={`font-medium ${
              sendStatus.success ? "text-green-800" : "text-red-800"
            }`}
          >
            {sendStatus.message}
          </p>
        </motion.div>
      )}

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề thông báo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Nhập tiêu đề thông báo..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Nhập nội dung thông báo..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.message.length}/500 ký tự
            </p>
          </div>

          {/* Recipient Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đối tượng nhận <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: "all", label: "Tất cả", icon: UserGroupIcon },
                { value: "students", label: "Học viên", icon: UserGroupIcon },
                { value: "tutors", label: "Gia sư", icon: UserGroupIcon },
                { value: "specific", label: "Cụ thể", icon: UserGroupIcon },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      recipientType: option.value as RecipientType,
                    })
                  }
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    formData.recipientType === option.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <option.icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Sẽ gửi đến:{" "}
              <span className="font-semibold">{getRecipientCount()}</span>
            </p>
          </div>

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại thông báo
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: "info", label: "Thông tin", color: "blue" },
                { value: "warning", label: "Cảnh báo", color: "yellow" },
                { value: "success", label: "Thành công", color: "green" },
                { value: "error", label: "Lỗi", color: "red" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      notificationType: option.value as NotificationType,
                    })
                  }
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    formData.notificationType === option.value
                      ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Send Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian gửi
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="send-now"
                  checked={formData.sendNow}
                  onChange={() => setFormData({ ...formData, sendNow: true })}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="send-now" className="text-sm text-gray-700">
                  Gửi ngay
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="schedule"
                  checked={!formData.sendNow}
                  onChange={() => setFormData({ ...formData, sendNow: false })}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="schedule" className="text-sm text-gray-700">
                  Lên lịch
                </label>
              </div>
              {!formData.sendNow && (
                <div className="ml-7">
                  <input
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduledDate: e.target.value,
                      })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  title: "",
                  message: "",
                  recipientType: "all",
                  notificationType: "info",
                  scheduledDate: "",
                  sendNow: true,
                })
              }
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đặt lại
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-5 h-5" />
                  {formData.sendNow ? "Gửi ngay" : "Lên lịch gửi"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BellIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Thông báo hôm nay</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đã gửi tuần này</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đang lên lịch</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BulkNotifications;

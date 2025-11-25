import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  XMarkIcon,
  CalendarIcon,
  MapPinIcon,
  VideoCameraIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";

import { useContractStore } from "../../store/contract.store";
import type {
  Contract,
  StudentContractResponse,
} from "../../types/contract.types";

interface ContractReviewModalProps {
  contract: Contract;
  onClose: () => void;
  onSuccess: () => void;
}

interface ResponseFormData {
  action: "APPROVE" | "REJECT" | "REQUEST_CHANGES";
  message?: string;
  requestedChanges?: string;
}

const WEEKDAYS = [
  { value: 0, label: "Chủ nhật" },
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
];

const ContractReviewModal: React.FC<ContractReviewModalProps> = ({
  contract,
  onClose,
  onSuccess,
}) => {
  const { respondToContract, isRespondingToContract } = useContractStore();
  const [selectedAction, setSelectedAction] = useState<
    "APPROVE" | "REJECT" | "REQUEST_CHANGES" | null
  >(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResponseFormData>();

  const watchMessage = watch("message");
  const watchRequestedChanges = watch("requestedChanges");

  const onSubmit = async (data: ResponseFormData) => {
    if (!selectedAction) return;

    try {
      const responseData: StudentContractResponse = {
        action: selectedAction,
        message: data.message,
        requestedChanges:
          selectedAction === "REQUEST_CHANGES"
            ? data.requestedChanges
            : undefined,
      };

      await respondToContract(contract.id, responseData);
      onSuccess();
    } catch (error) {
      // Error handled in store
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getDaysOfWeekText = () => {
    return contract.schedule.dayOfWeek
      .map((day) => WEEKDAYS.find((w) => w.value === day)?.label)
      .filter(Boolean)
      .join(", ");
  };

  const getExpiryTimeRemaining = () => {
    const now = new Date();
    const expiry = new Date(contract.expiresAt);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) return "Đã hết hạn";

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} ngày ${diffHours % 24} giờ`;
    }
    return `${diffHours} giờ`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Xem xét hợp đồng
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Từ gia sư: {contract.tutor?.full_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Expiry Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
              <span className="font-medium text-amber-900">
                Thời hạn phê duyệt
              </span>
            </div>
            <p className="text-sm text-amber-800 mt-1">
              Hợp đồng sẽ hết hạn sau:{" "}
              <strong>{getExpiryTimeRemaining()}</strong>
            </p>
          </div>

          {/* Contract Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <DocumentCheckIcon className="w-5 h-5" />
                <span>Thông tin hợp đồng</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tên hợp đồng
                  </label>
                  <p className="mt-1 text-sm text-gray-900 font-medium">
                    {contract.title}
                  </p>
                </div>

                {contract.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mô tả
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {contract.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tổng số buổi
                    </label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">
                      {contract.totalSessions} buổi
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Thời lượng/buổi
                    </label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">
                      {contract.sessionDuration} phút
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Giá/buổi
                    </label>
                    <p className="mt-1 text-sm text-gray-900 font-medium text-green-600">
                      {formatCurrency(contract.pricePerSession)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tổng học phí
                    </label>
                    <p className="mt-1 text-lg text-gray-900 font-bold text-green-600">
                      {formatCurrency(contract.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule & Location */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5" />
                <span>Lịch học & Địa điểm</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ngày học
                  </label>
                  <p className="mt-1 text-sm text-gray-900 font-medium">
                    {getDaysOfWeekText()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Giờ bắt đầu
                    </label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">
                      {contract.schedule.startTime}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Giờ kết thúc
                    </label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">
                      {contract.schedule.endTime}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ngày bắt đầu
                    </label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">
                      {new Date(contract.startDate).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Dự kiến kết thúc
                    </label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">
                      {new Date(contract.expectedEndDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hình thức học
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    {contract.learningMode === "ONLINE" ? (
                      <>
                        <VideoCameraIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-900 font-medium">
                          Online
                        </span>
                      </>
                    ) : (
                      <>
                        <MapPinIcon className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-900 font-medium">
                          Trực tiếp
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {contract.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Địa điểm học
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {contract.location.address}
                    </p>
                  </div>
                )}

                {contract.onlineInfo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nền tảng online
                    </label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">
                      {contract.onlineInfo.platform}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Response Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Action Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quyết định của bạn *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Approve */}
                <button
                  type="button"
                  onClick={() => setSelectedAction("APPROVE")}
                  className={`flex items-center justify-center space-x-2 p-4 border-2 rounded-lg transition-colors ${
                    selectedAction === "APPROVE"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <DocumentCheckIcon className="w-5 h-5" />
                  <span className="font-medium">Phê duyệt</span>
                </button>

                {/* Request Changes */}
                <button
                  type="button"
                  onClick={() => setSelectedAction("REQUEST_CHANGES")}
                  className={`flex items-center justify-center space-x-2 p-4 border-2 rounded-lg transition-colors ${
                    selectedAction === "REQUEST_CHANGES"
                      ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                      : "border-gray-200 hover:border-yellow-300"
                  }`}
                >
                  <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
                  <span className="font-medium">Yêu cầu sửa đổi</span>
                </button>

                {/* Reject */}
                <button
                  type="button"
                  onClick={() => setSelectedAction("REJECT")}
                  className={`flex items-center justify-center space-x-2 p-4 border-2 rounded-lg transition-colors ${
                    selectedAction === "REJECT"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 hover:border-red-300"
                  }`}
                >
                  <XMarkIcon className="w-5 h-5" />
                  <span className="font-medium">Từ chối</span>
                </button>
              </div>
              {!selectedAction && (
                <p className="mt-1 text-sm text-red-600">
                  Vui lòng chọn một quyết định
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tin nhắn cho gia sư (không bắt buộc)
              </label>
              <textarea
                {...register("message", {
                  maxLength: {
                    value: 500,
                    message: "Tin nhắn không được vượt quá 500 ký tự",
                  },
                })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Chia sẻ suy nghĩ của bạn về hợp đồng này..."
              />
              <div className="flex justify-between items-center mt-1">
                {errors.message && (
                  <p className="text-sm text-red-600">
                    {errors.message.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {watchMessage?.length || 0}/500
                </p>
              </div>
            </div>

            {/* Requested Changes (only if REQUEST_CHANGES is selected) */}
            {selectedAction === "REQUEST_CHANGES" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Những thay đổi bạn mong muốn *
                </label>
                <textarea
                  {...register("requestedChanges", {
                    required:
                      selectedAction === "REQUEST_CHANGES"
                        ? "Vui lòng mô tả những thay đổi mong muốn"
                        : false,
                    minLength: {
                      value: 10,
                      message: "Mô tả phải có ít nhất 10 ký tự",
                    },
                    maxLength: {
                      value: 1000,
                      message: "Mô tả không được vượt quá 1000 ký tự",
                    },
                  })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Mô tả chi tiết những điều khoản bạn muốn thay đổi trong hợp đồng..."
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.requestedChanges && (
                    <p className="text-sm text-red-600">
                      {errors.requestedChanges.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 ml-auto">
                    {watchRequestedChanges?.length || 0}/1000
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isRespondingToContract}
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={!selectedAction || isRespondingToContract}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRespondingToContract ? "Đang xử lý..." : "Gửi phản hồi"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContractReviewModal;

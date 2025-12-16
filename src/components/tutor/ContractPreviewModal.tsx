import React from "react";
import { motion } from "framer-motion";
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  VideoCameraIcon,
  DocumentCheckIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import type { CreateContractInput } from "../../types/contract.types";
import type { ContactRequest } from "../../types/contactRequest.types";
import {
  formatCurrency,
  getDaysOfWeekText,
  formatDate,
  formatDuration,
  getPlatformDisplayName,
} from "../../utils/contractFormatters";

interface ContractDataWithClassInfo extends CreateContractInput {
  classTitle: string;
  classDescription?: string;
  contractCode: string;
  contractTerms: string;
}

interface ContractPreviewModalProps {
  contractData: ContractDataWithClassInfo;
  request: ContactRequest;
  onClose: () => void;
  onConfirm: () => void;
  isCreating?: boolean;
}

const ContractPreviewModal: React.FC<ContractPreviewModalProps> = ({
  contractData,
  request,
  onClose,
  onConfirm,
  isCreating = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <DocumentCheckIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Xem trước hợp đồng
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isCreating}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Warning Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-amber-900 mb-1">
                  Vui lòng kiểm tra kỹ thông tin
                </h4>
                <p className="text-sm text-amber-800">
                  Hợp đồng sẽ được gửi đến học viên{" "}
                  <span className="font-medium">
                    {request.student?.full_name}
                  </span>{" "}
                  để phê duyệt. Học viên có 3 ngày để xem xét và phản hồi.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2 mb-4">
                  <DocumentCheckIcon className="w-5 h-5 text-blue-600" />
                  <span>Thông tin hợp đồng</span>
                </h4>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Mã hợp đồng
                    </label>
                    <p className="text-base text-gray-900 font-bold font-mono">
                      {contractData.contractCode}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Điều khoản hợp đồng
                    </label>
                    <div className="bg-white rounded border border-gray-200 p-3 max-h-64 overflow-y-auto">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                        {contractData.contractTerms}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Class Info */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2 mb-4">
                  <DocumentCheckIcon className="w-5 h-5 text-green-600" />
                  <span>Thông tin lớp học</span>
                </h4>

                <div className="bg-green-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-green-900 mb-1">
                      Tên lớp học
                    </label>
                    <p className="text-sm text-green-800 font-medium">
                      {contractData.classTitle}
                    </p>
                  </div>

                  {contractData.classDescription && (
                    <div>
                      <label className="block text-sm font-medium text-green-900 mb-1">
                        Mô tả lớp học
                      </label>
                      <p className="text-sm text-green-800">
                        {contractData.classDescription}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-green-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Tổng số buổi
                      </label>
                      <p className="text-sm text-gray-900 font-medium">
                        {contractData.totalSessions} buổi
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Thời lượng/buổi
                      </label>
                      <p className="text-sm text-gray-900 font-medium">
                        {formatDuration(contractData.sessionDuration)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Hình thức học
                    </label>
                    <div className="flex items-center space-x-2">
                      {contractData.learningMode === "ONLINE" ? (
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
                </div>
              </div>

              {/* Participant Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">
                  Người tham gia
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Học viên:</span>
                    <span className="text-sm text-gray-900 font-medium">
                      {request.student?.full_name}
                    </span>
                  </div>
                  {request.subjectInfo && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Môn học:</span>
                      <span className="text-sm text-gray-900 font-medium">
                        {request.subjectInfo.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Schedule & Location */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2 mb-4">
                  <CalendarIcon className="w-5 h-5 text-purple-600" />
                  <span>Lịch học</span>
                </h4>

                <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-purple-900 mb-1">
                      Ngày học trong tuần
                    </label>
                    <p className="text-sm text-purple-800 font-medium">
                      {getDaysOfWeekText(contractData.schedule.dayOfWeek)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-purple-900 mb-1">
                        Giờ học
                      </label>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4 text-purple-600" />
                        <p className="text-sm text-purple-800 font-medium">
                          {contractData.schedule.startTime} -{" "}
                          {contractData.schedule.endTime}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-900 mb-1">
                        Số buổi/tuần
                      </label>
                      <p className="text-sm text-purple-800 font-medium">
                        {contractData.schedule.dayOfWeek.length} buổi
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-purple-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-purple-900 mb-1">
                          Ngày bắt đầu
                        </label>
                        <p className="text-sm text-purple-800 font-medium">
                          {formatDate(contractData.startDate)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-purple-900 mb-1">
                          Dự kiến kết thúc
                        </label>
                        <p className="text-sm text-purple-800 font-medium">
                          {formatDate(contractData.expectedEndDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location or Online Info */}
              {contractData.learningMode === "OFFLINE" ? (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2 mb-4">
                    <MapPinIcon className="w-5 h-5 text-green-600" />
                    <span>Địa điểm học</span>
                  </h4>

                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-900">
                      {contractData.location?.address}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2 mb-4">
                    <VideoCameraIcon className="w-5 h-5 text-blue-600" />
                    <span>Thông tin học online</span>
                  </h4>

                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">
                        Nền tảng
                      </label>
                      <p className="text-sm text-blue-800 font-medium">
                        {getPlatformDisplayName(
                          contractData.onlineInfo?.platform || "GOOGLE_MEET"
                        )}
                      </p>
                    </div>

                    {contractData.onlineInfo?.meetingLink ? (
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-1">
                          Link phòng học
                        </label>
                        <p className="text-sm text-blue-800 font-mono break-all">
                          {contractData.onlineInfo.meetingLink}
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs text-blue-700 bg-blue-100 rounded p-2">
                        <p className="font-medium mb-1">📌 Lưu ý:</p>
                        <p>
                          Link phòng học sẽ được tự động tạo sau khi hợp đồng
                          được phê duyệt.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary - Full Width */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h4 className="font-medium text-green-900 mb-4 flex items-center space-x-2">
              <CurrencyDollarIcon className="w-5 h-5" />
              <span>Tóm tắt học phí</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <span className="block text-sm text-gray-600 mb-1">
                  Giá mỗi buổi
                </span>
                <span className="block text-lg font-semibold text-gray-900">
                  {formatCurrency(contractData.pricePerSession)}
                </span>
              </div>

              <div className="bg-white rounded-lg p-4">
                <span className="block text-sm text-gray-600 mb-1">
                  Tổng số buổi
                </span>
                <span className="block text-lg font-semibold text-gray-900">
                  {contractData.totalSessions} buổi
                </span>
              </div>

              <div className="bg-green-100 rounded-lg p-4 border-2 border-green-300">
                <span className="block text-sm text-green-700 mb-1">
                  Tổng học phí
                </span>
                <span className="block text-xl font-bold text-green-900">
                  {formatCurrency(contractData.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <span className="font-medium">💡 Lưu ý: </span>
              Sau khi tạo hợp đồng, học viên sẽ nhận được thông báo và có 3 ngày
              để xem xét. Nếu học viên phê duyệt, lớp học sẽ được tạo tự động và
              bạn có thể bắt đầu giảng dạy.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Quay lại chỉnh sửa
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isCreating}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isCreating ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Đang tạo hợp đồng...</span>
                </>
              ) : (
                <>
                  <DocumentCheckIcon className="w-5 h-5" />
                  <span>Xác nhận tạo hợp đồng</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContractPreviewModal;

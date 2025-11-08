import React from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface VerificationSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  error?: string | null;
  success?: boolean;
  title?: string;
  submitText?: string;
  cancelText?: string;
}

const VerificationSubmitModal: React.FC<VerificationSubmitModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  error = null,
  success = false,
  title = "Gửi yêu cầu xác thực",
  submitText = "Gửi xác thực",
  cancelText = "Hủy",
}) => {
  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!isLoading && !success) {
      onSubmit();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 text-blue-600">
                {success ? (
                  <CheckCircleIcon className="h-6 w-6" />
                ) : error ? (
                  <ExclamationTriangleIcon className="h-6 w-6" />
                ) : (
                  <DocumentTextIcon className="h-6 w-6" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>

            {/* Content */}
            <div className="mt-4">
              {success ? (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon
                        className="h-5 w-5 text-green-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-green-800">
                        Gửi yêu cầu thành công!
                      </h4>
                      <p className="mt-1 text-sm text-green-700">
                        Yêu cầu xác thực đã được gửi đến admin. Bạn sẽ nhận được
                        thông báo khi có kết quả.
                      </p>
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon
                        className="h-5 w-5 text-red-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-red-800">
                        Có lỗi xảy ra
                      </h4>
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Information about what will be submitted */}
                  <div className="rounded-md bg-blue-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <DocumentTextIcon
                          className="h-5 w-5 text-blue-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800">
                          Thông tin sẽ được gửi xác thực
                        </h4>
                        <ul className="mt-2 text-sm text-blue-700">
                          <li>
                            • Thông tin cá nhân (tên, số điện thoại, địa chỉ)
                          </li>
                          <li>
                            • Thông tin giới thiệu (headline, introduction)
                          </li>
                          <li>• Kinh nghiệm giảng dạy</li>
                          <li>• Ảnh CCCD</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Warning about process */}
                  <div className="rounded-md bg-yellow-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <ClockIcon
                          className="h-5 w-5 text-yellow-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-yellow-800">
                          Lưu ý quan trọng
                        </h4>
                        <p className="mt-1 text-sm text-yellow-700">
                          Sau khi gửi, bạn sẽ không thể chỉnh sửa thông tin cho
                          đến khi admin xử lý yêu cầu. Quá trình xác thực có thể
                          mất 1-3 ngày làm việc.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {success ? "Đóng" : cancelText}
              </button>
              {!success && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Đang gửi...</span>
                    </div>
                  ) : (
                    submitText
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationSubmitModal;


import React from "react";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface VerificationWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  warningMessage: string;
  isLoading?: boolean;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

const VerificationWarningModal: React.FC<VerificationWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  warningMessage,
  isLoading = false,
  title = "Cảnh báo xác thực",
  confirmText = "Tiếp tục chỉnh sửa",
  cancelText = "Hủy",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 text-yellow-600">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>

            {/* Content */}
            <div className="mt-4">
              <div className="rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon
                      className="h-5 w-5 text-yellow-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">{warningMessage}</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-4 rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon
                      className="h-5 w-5 text-blue-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">
                      Điều này có nghĩa là gì?
                    </h4>
                    <p className="mt-1 text-sm text-blue-700">
                      Mọi thay đổi sẽ cần gửi yêu cầu xác thực cho admin. Thông
                      tin hiện tại sẽ được backup và có thể được khôi phục nếu
                      admin từ chối yêu cầu.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationWarningModal;


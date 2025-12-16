import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface CancelClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  classTitle: string;
  studentName?: string;
  isLoading?: boolean;
}

const CancelClassModal: React.FC<CancelClassModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  classTitle,
  studentName,
  isLoading = false,
}) => {
  const [confirmed, setConfirmed] = useState(false);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      handleClose();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setConfirmed(false);
      onClose();
    }
  };

  const handleConfirm = () => {
    if (confirmed) {
      onConfirm();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header gradient */}
            <div className="h-2 bg-gradient-to-r from-rose-500 to-red-500" />

            <div className="p-6 md:p-8">
              {/* Icon and Title */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-rose-100">
                  <XCircleIcon className="w-10 h-10 text-rose-600" />
                </div>

                <h3 className="text-2xl font-bold mb-2 text-rose-900">
                  Hủy lớp học
                </h3>
                <p className="text-sm text-gray-600">
                  Hành động này không thể hoàn tác
                </p>
              </div>

              {/* Content */}
              <div className="space-y-4 mb-6">
                {/* Warning Box */}
                <div className="rounded-2xl bg-rose-50/70 border border-rose-200 p-4">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-rose-900">
                      <p className="font-semibold mb-2">Lưu ý quan trọng:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Lớp học sẽ bị hủy vĩnh viễn</li>
                        <li>Học viên sẽ được thông báo về việc hủy</li>
                        <li>Bạn sẽ không thể khôi phục lớp học này</li>
                        <li>Các buổi học chưa hoàn thành sẽ bị hủy</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Class Info */}
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Lớp học:</span>
                    <span className="font-semibold text-gray-900 text-right">
                      {classTitle}
                    </span>
                  </div>
                  {studentName && (
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="text-gray-600 font-medium">
                        Học viên:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {studentName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirmation Checkbox */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      disabled={isLoading}
                      className="mt-1 w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500 disabled:opacity-50 cursor-pointer"
                    />
                    <span className="text-sm text-gray-900 font-medium">
                      Tôi hiểu rằng hành động này không thể hoàn tác và đồng ý
                      hủy lớp học này
                    </span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isLoading || !confirmed}
                  className="flex-1 px-4 py-3 rounded-xl bg-rose-600 text-white font-medium shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    "Xác nhận hủy"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CancelClassModal;

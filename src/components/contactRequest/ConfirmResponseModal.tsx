import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface ConfirmResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'ACCEPT' | 'REJECT';
  tutorName?: string;
  subjectName?: string;
  isLoading?: boolean;
}

const ConfirmResponseModal: React.FC<ConfirmResponseModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  tutorName,
  subjectName,
  isLoading = false,
}) => {
  const isAccept = action === 'ACCEPT';

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
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
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header gradient */}
            <div
              className={`h-2 ${isAccept
                ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                : 'bg-gradient-to-r from-rose-500 to-red-500'
                }`}
            />

            <div className="p-6 md:p-8">
              {/* Icon and Title */}
              <div className="flex flex-col items-center text-center mb-6">
                <div
                  className={`flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isAccept
                    ? 'bg-emerald-100'
                    : 'bg-rose-100'
                    }`}
                >
                  {isAccept ? (
                    <CheckCircleIcon className="w-10 h-10 text-emerald-600" />
                  ) : (
                    <XCircleIcon className="w-10 h-10 text-rose-600" />
                  )}
                </div>

                <h3
                  className={`text-2xl font-bold mb-2 ${isAccept ? 'text-emerald-900' : 'text-rose-900'
                    }`}
                >
                  {isAccept ? 'Chấp nhận đề nghị dạy?' : 'Từ chối đề nghị dạy?'}
                </h3>
              </div>

              {/* Content */}
              <div className="space-y-4 mb-6">
                {isAccept ? (
                  <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-4">
                    <p className="text-sm text-emerald-900 leading-relaxed">
                      Bạn có chắc chắn muốn chấp nhận đề nghị dạy này? Gia sư sẽ tạo lớp học sau khi bạn chấp nhận.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-rose-50/70 border border-rose-100 p-4">
                    <p className="text-sm text-rose-900 leading-relaxed">
                      Bạn có chắc chắn muốn từ chối đề nghị dạy này? Hành động này không thể hoàn tác.
                    </p>
                  </div>
                )}

                {/* Tutor Info */}
                {(tutorName || subjectName) && (
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                          <AcademicCapIcon className="w-5 h-5 text-indigo-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        {tutorName && (
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {tutorName}
                          </p>
                        )}
                        {subjectName && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            Môn: {subjectName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-3 rounded-xl text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${isAccept
                    ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500'
                    }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    isAccept ? 'Chấp nhận' : 'Từ chối'
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

export default ConfirmResponseModal;


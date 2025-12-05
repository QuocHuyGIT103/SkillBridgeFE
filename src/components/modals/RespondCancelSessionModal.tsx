import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface RespondCancelSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: 'APPROVE' | 'REJECT') => void;
  sessionInfo: {
    sessionNumber: number;
    date: string;
    time: string;
    requestedByLabel: string;
    reason: string;
  };
  isLoading?: boolean;
}

const RespondCancelSessionModal: React.FC<RespondCancelSessionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sessionInfo,
  isLoading = false,
}) => {
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 relative">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-lg p-1 transition-colors disabled:opacity-50"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Phản hồi yêu cầu huỷ buổi học
                    </h3>
                    <p className="text-white/90 text-sm">
                      Buổi {sessionInfo.sessionNumber} • {sessionInfo.date}
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Session Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-medium text-gray-900">
                      {sessionInfo.time}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Yêu cầu bởi:</span>
                    <span className="font-medium text-gray-900">
                      {sessionInfo.requestedByLabel}
                    </span>
                  </div>
                </div>

                {/* Reason */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-amber-900 mb-1">
                    Lý do huỷ buổi học:
                  </p>
                  <p className="text-sm text-amber-800 whitespace-pre-line">
                    {sessionInfo.reason}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Đóng
                </button>
                <button
                  onClick={() => onConfirm('REJECT')}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <XMarkIcon className="w-5 h-5" />
                  <span>Từ chối</span>
                </button>
                <button
                  onClick={() => onConfirm('APPROVE')}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Chấp nhận</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RespondCancelSessionModal;



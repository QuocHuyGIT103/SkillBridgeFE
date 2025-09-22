import React from "react";
import { motion } from "framer-motion";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { VerificationStatus } from "../../types/verification.types";
import type { VerificationRequestWithPopulatedData } from "../../types/verification.types";

interface VerificationMessagesProps {
  verificationRequest: VerificationRequestWithPopulatedData | null;
}

const VerificationMessages: React.FC<VerificationMessagesProps> = ({
  verificationRequest,
}) => {
  if (!verificationRequest) return null;

  // Rejected Message
  if (
    verificationRequest.status === VerificationStatus.REJECTED &&
    verificationRequest.admin_feedback
  ) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6"
      >
        <div className="flex items-start space-x-3">
          <XCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
              Yêu cầu xác thực bị từ chối
            </h3>
            <p className="text-red-700 dark:text-red-300 mt-2">
              <strong>Phản hồi từ admin:</strong>
            </p>
            <p className="text-red-700 dark:text-red-300 mt-1 bg-red-100 dark:bg-red-800/30 p-3 rounded-lg">
              {verificationRequest.admin_feedback}
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-3">
              Bạn có thể chỉnh sửa thông tin và gửi yêu cầu xác thực mới.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Approved Message
  if (verificationRequest.status === VerificationStatus.APPROVED) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6"
      >
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
              Tài khoản đã được xác thực!
            </h3>
            <p className="text-green-700 dark:text-green-300 mt-1">
              Thông tin học vấn và chứng chỉ của bạn đã được xác minh. Bạn có
              thể bắt đầu nhận học sinh.
            </p>
            {verificationRequest.admin_feedback && (
              <div className="mt-3">
                <p className="text-green-700 dark:text-green-300">
                  <strong>Ghi chú từ admin:</strong>
                </p>
                <p className="text-green-700 dark:text-green-300 mt-1 bg-green-100 dark:bg-green-800/30 p-3 rounded-lg">
                  {verificationRequest.admin_feedback}
                </p>
              </div>
            )}
            {verificationRequest.reviewed_at && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                Xác thực vào:{" "}
                {new Date(verificationRequest.reviewed_at).toLocaleString(
                  "vi-VN"
                )}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Pending Message
  if (verificationRequest.status === VerificationStatus.PENDING) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6"
      >
        <div className="flex items-start space-x-3">
          <ClockIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
              Yêu cầu xác thực đang được xem xét
            </h3>
            <p className="text-blue-700 dark:text-blue-300 mt-1">
              Admin sẽ xem xét và phản hồi yêu cầu xác thực của bạn trong thời
              gian sớm nhất.
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              Gửi yêu cầu vào:{" "}
              {new Date(verificationRequest.created_at).toLocaleString("vi-VN")}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};

export default VerificationMessages;

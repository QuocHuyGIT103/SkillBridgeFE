import React from "react";
import { motion } from "framer-motion";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface VerificationNoticeProps {
  show: boolean;
}

const VerificationNotice: React.FC<VerificationNoticeProps> = ({ show }) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-6"
    >
      <div className="flex items-start space-x-3">
        <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
            Chưa đủ điều kiện xác thực
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 mt-1">
            Để yêu cầu xác thực, bạn cần hoàn thành ít nhất:
          </p>
          <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
            <li>Một trình độ học vấn</li>
            <li>Ít nhất một chứng chỉ</li>
          </ul>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-3">
            💡 Thành tích là tùy chọn nhưng sẽ giúp tăng độ tin cậy của hồ sơ
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default VerificationNotice;

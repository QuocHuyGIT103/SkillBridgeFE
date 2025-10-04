import React from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface ReVerificationNotificationProps {
  type: "success" | "info";
  title: string;
  message: string;
  onClose: () => void;
}

const ReVerificationNotification: React.FC<ReVerificationNotificationProps> = ({
  type,
  title,
  message,
  onClose,
}) => {
  const iconClass = type === "success" ? "text-green-600" : "text-blue-600";
  const bgClass =
    type === "success"
      ? "bg-green-50 border-green-200"
      : "bg-blue-50 border-blue-200";
  const Icon = type === "success" ? CheckCircleIcon : ExclamationTriangleIcon;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg border shadow-lg ${bgClass}`}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`w-6 h-6 ${iconClass} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className="sr-only">Đóng</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ReVerificationNotification;

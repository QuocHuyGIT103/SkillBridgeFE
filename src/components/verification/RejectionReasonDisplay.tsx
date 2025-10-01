import React, { useState } from "react";
import {
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface RejectionReasonDisplayProps {
  rejectionReason: string;
  className?: string;
  maxLength?: number;
  showIcon?: boolean;
}

const RejectionReasonDisplay: React.FC<RejectionReasonDisplayProps> = ({
  rejectionReason,
  className = "",
  maxLength = 100,
  showIcon = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldTruncate = rejectionReason.length > maxLength;
  const displayText =
    isExpanded || !shouldTruncate
      ? rejectionReason
      : rejectionReason.substring(0, maxLength) + "...";

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`rounded-md bg-red-50 border border-red-200 ${className}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start space-x-3">
          {showIcon && (
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-red-800">
                Lý do từ chối
              </h4>
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-3">
          <div className="text-sm text-red-700">
            <p className="whitespace-pre-wrap">{displayText}</p>
          </div>

          {/* Expand/Collapse button */}
          {shouldTruncate && (
            <button
              onClick={toggleExpanded}
              className="mt-2 inline-flex items-center space-x-1 text-sm font-medium text-red-600 hover:text-red-800 focus:outline-none focus:underline"
            >
              <span>{isExpanded ? "Thu gọn" : "Xem thêm"}</span>
              {isExpanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Action suggestion */}
        <div className="mt-4 rounded-md bg-red-100 p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon
                className="h-4 w-4 text-red-500"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <p className="text-xs text-red-700">
                <strong>Bước tiếp theo:</strong> Vui lòng chỉnh sửa thông tin
                theo góp ý của admin và gửi lại yêu cầu xác thực.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectionReasonDisplay;

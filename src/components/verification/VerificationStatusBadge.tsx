import React from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PencilIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import type { VerificationStatus } from "../../types/qualification.types";

interface VerificationStatusBadgeProps {
  status: VerificationStatus;
  showTooltip?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const VerificationStatusBadge: React.FC<VerificationStatusBadgeProps> = ({
  status,
  showTooltip = true,
  size = "md",
  className = "",
}) => {
  const getStatusConfig = (status: VerificationStatus) => {
    switch (status) {
      case "DRAFT":
        return {
          icon: PencilIcon,
          text: "Nháp",
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          iconColor: "text-gray-500",
          tooltip: "Thông tin chưa được gửi xác thực, có thể chỉnh sửa tự do",
        };
      case "PENDING":
        return {
          icon: ClockIcon,
          text: "Chờ xác thực",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          iconColor: "text-yellow-600",
          tooltip: "Đang chờ admin xem xét, không thể chỉnh sửa",
        };
      case "VERIFIED":
        return {
          icon: CheckCircleIcon,
          text: "Đã xác thực",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          iconColor: "text-green-600",
          tooltip: "Đã được xác thực, có thể chỉnh sửa nhưng cần cảnh báo",
        };
      case "REJECTED":
        return {
          icon: XCircleIcon,
          text: "Bị từ chối",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          iconColor: "text-red-600",
          tooltip: "Bị từ chối, có thể chỉnh sửa và gửi lại",
        };
      case "MODIFIED_PENDING":
        return {
          icon: ArrowPathIcon,
          text: "Đã chỉnh sửa",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          iconColor: "text-blue-600",
          tooltip: "Đã chỉnh sửa thông tin đã xác thực, chờ xác thực lại",
        };
      case "MODIFIED_AFTER_REJECTION":
        return {
          icon: PencilIcon,
          text: "Đã sửa sau từ chối",
          bgColor: "bg-orange-100",
          textColor: "text-orange-800",
          iconColor: "text-orange-600",
          tooltip: "Đã chỉnh sửa sau khi bị từ chối",
        };
      default:
        return {
          icon: ExclamationTriangleIcon,
          text: "Không xác định",
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          iconColor: "text-gray-500",
          tooltip: "Trạng thái không xác định",
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "sm":
        return {
          container: "px-2 py-1 text-xs",
          icon: "h-3 w-3",
          text: "text-xs",
        };
      case "lg":
        return {
          container: "px-4 py-2 text-base",
          icon: "h-5 w-5",
          text: "text-base",
        };
      default: // md
        return {
          container: "px-3 py-1.5 text-sm",
          icon: "h-4 w-4",
          text: "text-sm",
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);
  const Icon = config.icon;

  const badgeElement = (
    <div
      className={`inline-flex items-center space-x-1.5 rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClasses.container} ${className}`}
    >
      <Icon className={`${config.iconColor} ${sizeClasses.icon}`} />
      <span className={sizeClasses.text}>{config.text}</span>
    </div>
  );

  if (!showTooltip) {
    return badgeElement;
  }

  return (
    <div className="group relative inline-block">
      {badgeElement}
      <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform group-hover:block">
        <div className="whitespace-nowrap rounded-md bg-gray-900 px-3 py-2 text-sm text-white shadow-lg">
          {config.tooltip}
          <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStatusBadge;


import React from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

interface PaymentStatusBadgeProps {
  status: "PENDING" | "COMPLETED" | "FAILED" | "EXPIRED" | "REFUNDED";
  size?: "sm" | "md" | "lg";
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const getStatusConfig = () => {
    switch (status) {
      case "COMPLETED":
        return {
          label: "Đã thanh toán",
          bg: "bg-green-100",
          text: "text-green-800",
          icon: CheckCircleIcon,
        };
      case "PENDING":
        return {
          label: "Đang xử lý",
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          icon: ClockIcon,
        };
      case "FAILED":
        return {
          label: "Thất bại",
          bg: "bg-red-100",
          text: "text-red-800",
          icon: XCircleIcon,
        };
      case "EXPIRED":
        return {
          label: "Đã hết hạn",
          bg: "bg-gray-100",
          text: "text-gray-800",
          icon: ClockIcon,
        };
      case "REFUNDED":
        return {
          label: "Đã hoàn tiền",
          bg: "bg-blue-100",
          text: "text-blue-800",
          icon: BanknotesIcon,
        };
      default:
        return {
          label: "Không xác định",
          bg: "bg-gray-100",
          text: "text-gray-800",
          icon: ClockIcon,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
};

export default PaymentStatusBadge;

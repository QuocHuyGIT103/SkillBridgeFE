import React from "react";
import {
  CheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface VerificationStatusProps {
  isVerified: boolean;
  size?: "sm" | "md";
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({
  isVerified,
  size = "sm",
}) => {
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  if (isVerified) {
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full ${textSize} font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}
      >
        <CheckIcon className={`${iconSize} mr-1`} />
        Đã xác thực
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full ${textSize} font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}
    >
      <ExclamationTriangleIcon className={`${iconSize} mr-1`} />
      Chưa xác thực
    </span>
  );
};

export default VerificationStatus;

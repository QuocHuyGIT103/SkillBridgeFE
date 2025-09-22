import React from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { VerificationStatus } from "../../types/verification.types";

interface VerificationStatusBadgeProps {
  status: VerificationStatus | null;
}

const VerificationStatusBadge: React.FC<VerificationStatusBadgeProps> = ({
  status,
}) => {
  if (!status) return null;

  switch (status) {
    case VerificationStatus.PENDING:
      return (
        <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg">
          <ClockIcon className="w-5 h-5" />
          <span>Đang chờ xác thực</span>
        </div>
      );
    case VerificationStatus.APPROVED:
      return (
        <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg">
          <CheckCircleIcon className="w-5 h-5" />
          <span>Đã xác thực</span>
        </div>
      );
    case VerificationStatus.REJECTED:
      return (
        <div className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg">
          <XCircleIcon className="w-5 h-5" />
          <span>Bị từ chối</span>
        </div>
      );
    default:
      return null;
  }
};

export default VerificationStatusBadge;

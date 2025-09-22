import React from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

interface VerificationRequestButtonProps {
  canRequest: boolean;
  isCreating: boolean;
  onRequest: () => Promise<void>;
}

const VerificationRequestButton: React.FC<VerificationRequestButtonProps> = ({
  canRequest,
  isCreating,
  onRequest,
}) => {
  if (!canRequest) return null;

  return (
    <button
      onClick={onRequest}
      disabled={isCreating}
      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isCreating ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Đang gửi...</span>
        </>
      ) : (
        <>
          <ShieldCheckIcon className="w-5 h-5" />
          <span>Yêu cầu xác thực</span>
        </>
      )}
    </button>
  );
};

export default VerificationRequestButton;

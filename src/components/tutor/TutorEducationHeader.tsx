import React from "react";
import { motion } from "framer-motion";
import VerificationStatusBadge from "./VerificationStatusBadge";
import VerificationRequestButton from "./VerificationRequestButton";
import type { VerificationRequestWithPopulatedData } from "../../types/verification.types";

interface TutorEducationHeaderProps {
  verificationRequest: VerificationRequestWithPopulatedData | null;
  canRequestVerification: boolean;
  isCreatingRequest: boolean;
  onVerificationRequest: () => Promise<void>;
}

const TutorEducationHeader: React.FC<TutorEducationHeaderProps> = ({
  verificationRequest,
  canRequestVerification,
  isCreatingRequest,
  onVerificationRequest,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-primary">Học vấn & Chứng chỉ</h1>
        <p className="text-secondary mt-2">
          Quản lý thông tin học vấn, chứng chỉ và thành tích của bạn
        </p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Verification Status Badge */}
        <VerificationStatusBadge status={verificationRequest?.status || null} />

        {/* Verification Request Button */}
        <VerificationRequestButton
          canRequest={canRequestVerification}
          isCreating={isCreatingRequest}
          onRequest={onVerificationRequest}
        />
      </div>
    </motion.div>
  );
};

export default TutorEducationHeader;

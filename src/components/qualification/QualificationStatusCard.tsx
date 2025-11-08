import React from "react";
import { motion } from "framer-motion";
import { AcademicCapIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import type {
  QualificationInfo,
  QualificationsData,
} from "../../types/qualification.types";

interface QualificationStatusCardProps {
  qualificationInfo: QualificationInfo;
  qualifications: QualificationsData | null;
}

const QualificationStatusCard: React.FC<QualificationStatusCardProps> = ({
  qualificationInfo,
  qualifications,
}) => {
  // Kiểm tra có DRAFT items không
  const hasDraftItems = () => {
    if (!qualifications) return false;

    const hasDraftEducation = qualifications.education?.status === "DRAFT";
    const hasDraftCertificates = qualifications.certificates.some(
      (cert) => cert.status === "DRAFT"
    );
    const hasDraftAchievements = qualifications.achievements.some(
      (achievement) => achievement.status === "DRAFT"
    );

    return hasDraftEducation || hasDraftCertificates || hasDraftAchievements;
  };

  // Đếm số DRAFT items
  const getDraftCount = () => {
    if (!qualifications) return 0;

    let count = 0;
    if (qualifications.education?.status === "DRAFT") count++;
    count += qualifications.certificates.filter(
      (cert) => cert.status === "DRAFT"
    ).length;
    count += qualifications.achievements.filter(
      (achievement) => achievement.status === "DRAFT"
    ).length;

    return count;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
    >
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          <AcademicCapIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Trạng thái trình độ
          </h3>
          <p className="text-gray-700 mb-3">{qualificationInfo.suggestion}</p>

          {/* Thông báo đặc biệt cho DRAFT items */}
          {hasDraftItems() && (
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <DocumentTextIcon className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Bạn có {getDraftCount()} thông tin đang ở trạng thái bản
                    nháp
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Hãy gửi yêu cầu xác thực để trở thành gia sư chính thức!
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Đủ điều kiện:</span>
              <span
                className={
                  qualificationInfo.isQualified
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {qualificationInfo.isQualified ? "Có" : "Chưa"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Có thể gửi yêu cầu:</span>
              <span
                className={
                  qualificationInfo.canSubmitVerification
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {qualificationInfo.canSubmitVerification ? "Có" : "Không"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Đang chờ xác thực:</span>
              <span className="text-blue-600">
                {qualificationInfo.pendingVerificationCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QualificationStatusCard;

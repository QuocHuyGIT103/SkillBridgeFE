import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import type {
  CreateVerificationRequest,
  QualificationsData,
} from "../../types/qualification.types";
import {
  translateEducationLevel,
  translateVerificationStatus,
} from "../../utils/enumTranslations";

interface VerificationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateVerificationRequest) => void;
  qualifications: QualificationsData | null;
  isLoading: boolean;
}

const VerificationRequestModal: React.FC<VerificationRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  qualifications,
  isLoading,
}) => {
  const [selectedItems, setSelectedItems] = useState<{
    education: boolean;
    certificates: string[];
    achievements: string[];
  }>({
    education: false,
    certificates: [],
    achievements: [],
  });

  const [requestType, setRequestType] = useState<
    "NEW" | "UPDATE" | "ADDITIONAL"
  >("NEW");

  useEffect(() => {
    if (qualifications) {
      // Auto-select items that need verification
      const needsVerification = {
        education: Boolean(
          qualifications.education &&
            qualifications.education.status !== "VERIFIED"
        ),
        certificates: qualifications.certificates
          .filter((cert) => cert.status !== "VERIFIED")
          .map((cert) => cert.id),
        achievements: qualifications.achievements
          .filter((achievement) => achievement.status !== "VERIFIED")
          .map((achievement) => achievement.id),
      };
      setSelectedItems(needsVerification);

      // Determine request type based on current state
      const hasVerifiedEducation =
        qualifications.education?.status === "VERIFIED";
      const hasVerifiedCertificates = qualifications.certificates.some(
        (cert) => cert.status === "VERIFIED"
      );
      const hasVerifiedAchievements = qualifications.achievements.some(
        (achievement) => achievement.status === "VERIFIED"
      );

      if (
        hasVerifiedEducation ||
        hasVerifiedCertificates ||
        hasVerifiedAchievements
      ) {
        // If there are verified items, this is an UPDATE or ADDITIONAL request
        const hasNewItems =
          needsVerification.education ||
          needsVerification.certificates.length > 0 ||
          needsVerification.achievements.length > 0;

        if (hasNewItems) {
          setRequestType("ADDITIONAL");
        } else {
          setRequestType("UPDATE");
        }
      } else {
        // First time verification
        setRequestType("NEW");
      }
    }
  }, [qualifications]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const requestData: CreateVerificationRequest = {};

    if (selectedItems.education && qualifications?.education) {
      requestData.educationId = qualifications.education.id;
    }

    if (selectedItems.certificates.length > 0) {
      requestData.certificateIds = selectedItems.certificates;
    }

    if (selectedItems.achievements.length > 0) {
      requestData.achievementIds = selectedItems.achievements;
    }

    // Check if at least one item is selected
    if (
      !requestData.educationId &&
      !requestData.certificateIds?.length &&
      !requestData.achievementIds?.length
    ) {
      alert("Vui lòng chọn ít nhất một mục để xác thực");
      return;
    }

    onSubmit(requestData);
  };

  const toggleEducation = () => {
    setSelectedItems((prev) => ({
      ...prev,
      education: !prev.education,
    }));
  };

  const toggleCertificate = (certId: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      certificates: prev.certificates.includes(certId)
        ? prev.certificates.filter((id) => id !== certId)
        : [...prev.certificates, certId],
    }));
  };

  const toggleAchievement = (achievementId: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      achievements: prev.achievements.includes(achievementId)
        ? prev.achievements.filter((id) => id !== achievementId)
        : [...prev.achievements, achievementId],
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "text-gray-600 bg-gray-100";
      case "VERIFIED":
        return "text-green-600 bg-green-100";
      case "PENDING":
        return "text-yellow-600 bg-yellow-100";
      case "REJECTED":
        return "text-red-600 bg-red-100";
      case "MODIFIED_PENDING":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    return translateVerificationStatus(status);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Gửi yêu cầu xác thực
            </h2>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  requestType === "NEW"
                    ? "bg-blue-100 text-blue-800"
                    : requestType === "UPDATE"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {requestType === "NEW"
                  ? "Xác thực lần đầu"
                  : requestType === "UPDATE"
                  ? "Cập nhật thông tin"
                  : "Thêm thông tin mới"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="flex items-start space-x-3 mb-4">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Chọn thông tin cần xác thực
                </p>
                <p className="text-sm text-gray-600">
                  Chỉ những mục chưa được xác thực hoặc đã thay đổi mới có thể
                  được chọn. Admin sẽ xem xét và phản hồi trong vòng 24-48 giờ.
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-900">
                  Tóm tắt yêu cầu
                </span>
              </div>
              <div className="text-sm text-blue-800">
                {requestType === "NEW" &&
                  "Đây là lần đầu bạn gửi yêu cầu xác thực. Hãy đảm bảo thông tin chính xác."}
                {requestType === "UPDATE" &&
                  "Bạn đang cập nhật thông tin đã được xác thực trước đó."}
                {requestType === "ADDITIONAL" &&
                  "Bạn đang thêm thông tin mới vào hồ sơ đã được xác thực."}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Education Section */}
            {qualifications?.education && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Học vấn
                </h3>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.education}
                        onChange={toggleEducation}
                        disabled={
                          qualifications.education.status === "VERIFIED"
                        }
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {qualifications.education.school}
                        </h4>
                        <p className="text-sm text-gray-600 mb-1">
                          {qualifications.education.major ||
                            "Không có chuyên ngành"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {translateEducationLevel(
                            qualifications.education.level
                          )}{" "}
                          • {qualifications.education.startYear} -{" "}
                          {qualifications.education.endYear}
                        </p>
                        {qualifications.education.rejectionReason && (
                          <p className="text-xs text-red-600 mt-2">
                            <span className="font-medium">Lý do từ chối:</span>{" "}
                            {qualifications.education.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        qualifications.education.status
                      )}`}
                    >
                      {getStatusText(qualifications.education.status)}
                    </span>
                    {qualifications.education.status === "VERIFIED" && (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Certificates Section */}
            {qualifications?.certificates &&
              qualifications.certificates.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Chứng chỉ
                  </h3>
                  <div className="space-y-3">
                    {qualifications.certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedItems.certificates.includes(
                                cert.id
                              )}
                              onChange={() => toggleCertificate(cert.id)}
                              disabled={cert.status === "VERIFIED"}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {cert.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {cert.issuingOrganization}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              cert.status
                            )}`}
                          >
                            {getStatusText(cert.status)}
                          </span>
                          {cert.status === "VERIFIED" && (
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Achievements Section */}
            {qualifications?.achievements &&
              qualifications.achievements.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Thành tích
                  </h3>
                  <div className="space-y-3">
                    {qualifications.achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedItems.achievements.includes(
                                achievement.id
                              )}
                              onChange={() => toggleAchievement(achievement.id)}
                              disabled={achievement.status === "VERIFIED"}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {achievement.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {achievement.awardingOrganization}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              achievement.status
                            )}`}
                          >
                            {getStatusText(achievement.status)}
                          </span>
                          {achievement.status === "VERIFIED" && (
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Đang gửi..." : "Gửi yêu cầu xác thực"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerificationRequestModal;

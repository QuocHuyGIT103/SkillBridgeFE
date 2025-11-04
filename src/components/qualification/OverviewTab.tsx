import React from "react";
import {
  AcademicCapIcon,
  DocumentTextIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  XCircleIcon as XCircleSolidIcon,
  ClockIcon as ClockSolidIcon,
} from "@heroicons/react/24/solid";
import type {
  QualificationsData,
  VerificationRequest,
} from "../../types/qualification.types";
import {
  translateEducationLevel,
  translateVerificationStatus,
} from "../../utils/enumTranslations";
import { canEditItem, getDisplayData } from "../../utils/qualification.utils";

interface OverviewTabProps {
  qualifications: QualificationsData | null;
  tutorRequests: VerificationRequest[];
  onEditEducation: (education: any) => void;
  onEditCertificate: (certificate: any) => void;
  onAddEducation: () => void;
  onAddCertificate: () => void;
  onViewAllCertificates: () => void;
  onViewAllAchievements: () => void;
  isCreatingCertificate: boolean;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  qualifications,
  tutorRequests,
  onEditEducation,
  onAddEducation,
  onAddCertificate,
  onViewAllCertificates,
  onViewAllAchievements,
  isCreatingCertificate,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
      case "VERIFIED":
        return <CheckCircleSolidIcon className="w-5 h-5 text-green-500" />;
      case "PENDING":
        return <ClockSolidIcon className="w-5 h-5 text-yellow-500" />;
      case "REJECTED":
        return <XCircleSolidIcon className="w-5 h-5 text-red-500" />;
      case "MODIFIED_PENDING":
        return <ClockSolidIcon className="w-5 h-5 text-orange-500" />;
      default:
        return <ClockSolidIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    return translateVerificationStatus(status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "VERIFIED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "MODIFIED_PENDING":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Học vấn</p>
              <p className="text-2xl font-bold text-gray-900">
                {qualifications?.education ? "1" : "0"}
              </p>
              <p className="text-sm text-gray-500">
                {qualifications?.education
                  ? getStatusText(qualifications.education.status)
                  : "Chưa có"}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <AcademicCapIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chứng chỉ</p>
              <p className="text-2xl font-bold text-gray-900">
                {qualifications?.certificates.length || 0}
              </p>
              <p className="text-sm text-gray-500">
                {qualifications?.qualificationStats?.verifiedCertificates || 0}{" "}
                đã xác thực
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Thành tích</p>
              <p className="text-2xl font-bold text-gray-900">
                {qualifications?.achievements.length || 0}
              </p>
              <p className="text-sm text-gray-500">
                {qualifications?.qualificationStats?.verifiedAchievements || 0}{" "}
                đã xác thực
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrophyIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Education */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Thông tin học vấn
            </h3>
            <button
              onClick={() => {
                if (qualifications?.education) {
                  onEditEducation(qualifications.education);
                } else {
                  onAddEducation();
                }
              }}
              disabled={
                qualifications?.education &&
                !canEditItem(
                  qualifications.education,
                  "education",
                  tutorRequests
                )
              }
              className={`text-sm font-medium ${
                qualifications?.education &&
                !canEditItem(
                  qualifications.education,
                  "education",
                  tutorRequests
                )
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-primary hover:text-primary/80"
              }`}
            >
              {qualifications?.education ? "Chỉnh sửa" : "Thêm học vấn"}
            </button>
          </div>
          {qualifications?.education ? (
            <div className="space-y-4">
              {(() => {
                const displayData = getDisplayData(qualifications.education);
                return (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {displayData.school}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {displayData.major || "Không có chuyên ngành"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {translateEducationLevel(displayData.level)} •{" "}
                          {displayData.startYear} - {displayData.endYear}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(qualifications.education.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            qualifications.education.status
                          )}`}
                        >
                          {getStatusText(qualifications.education.status)}
                        </span>
                      </div>
                    </div>
                    {qualifications.education.rejectionReason && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">
                          <span className="font-medium">Lý do từ chối:</span>{" "}
                          {qualifications.education.rejectionReason}
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-8">
              <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">Chưa có thông tin học vấn</p>
              <p className="text-sm text-gray-400">
                Thêm thông tin học vấn để bắt đầu
              </p>
            </div>
          )}
        </div>

        {/* Certificates Overview */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Chứng chỉ ({qualifications?.certificates.length || 0})
            </h3>
            <button
              onClick={onAddCertificate}
              disabled={isCreatingCertificate}
              className={`text-sm font-medium cursor-pointer ${
                isCreatingCertificate
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-primary hover:text-primary/80"
              }`}
            >
              {isCreatingCertificate ? "Đang tạo..." : "Thêm chứng chỉ"}
            </button>
          </div>
          {qualifications?.certificates.length ? (
            <div className="space-y-3">
              {qualifications.certificates.slice(0, 3).map((cert) => {
                const displayData = getDisplayData(cert);
                return (
                  <div
                    key={cert.id}
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {displayData.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1">
                        {displayData.issuingOrganization}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(displayData.issueDate).toLocaleDateString(
                          "vi-VN"
                        )}
                        {displayData.expiryDate &&
                          ` - ${new Date(
                            displayData.expiryDate
                          ).toLocaleDateString("vi-VN")}`}
                      </p>
                      {cert.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">
                          Từ chối: {cert.rejectionReason}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(cert.status)}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          cert.status
                        )}`}
                      >
                        {getStatusText(cert.status)}
                      </span>
                    </div>
                  </div>
                );
              })}
              {qualifications.certificates.length > 3 && (
                <div className="text-center pt-2">
                  <button
                    onClick={onViewAllCertificates}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    Xem tất cả {qualifications.certificates.length} chứng chỉ
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">Chưa có chứng chỉ</p>
              <p className="text-sm text-gray-400">
                Thêm chứng chỉ để tăng độ tin cậy
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Achievements Overview */}
      {qualifications?.achievements &&
        qualifications.achievements.length > 0 && (
          <div className="mt-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Thành tích ({qualifications.achievements.length})
                </h3>
                <button
                  onClick={onViewAllAchievements}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {qualifications.achievements.slice(0, 4).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {achievement.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-1">
                          {achievement.awardingOrganization}
                        </p>
                        <p className="text-xs text-gray-500">
                          {achievement.level} •{" "}
                          {new Date(
                            achievement.achievedDate
                          ).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          achievement.status
                        )}`}
                      >
                        {getStatusText(achievement.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default OverviewTab;

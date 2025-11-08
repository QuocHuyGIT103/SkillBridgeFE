import React from "react";
import {
  PlusIcon,
  AcademicCapIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  XCircleIcon as XCircleSolidIcon,
  ClockIcon as ClockSolidIcon,
} from "@heroicons/react/24/solid";
import ImagePreview from "../common/ImagePreview";
import type {
  QualificationsData,
  VerificationRequest,
} from "../../types/qualification.types";
import {
  translateEducationLevel,
  translateVerificationStatus,
} from "../../utils/enumTranslations";
import { canEditItem, getDisplayData } from "../../utils/qualification.utils";

interface EducationTabProps {
  qualifications: QualificationsData | null;
  tutorRequests: VerificationRequest[];
  isCreatingEducation: boolean;
  isUpdatingEducation: boolean;
  onEditEducation: (education: any) => void;
  onAddEducation: () => void;
}

const EducationTab: React.FC<EducationTabProps> = ({
  qualifications,
  tutorRequests,
  isCreatingEducation,
  isUpdatingEducation,
  onEditEducation,
  onAddEducation,
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
    switch (status) {
      case "DRAFT":
        return "Bản nháp";
      case "VERIFIED":
        return "Đã xác thực";
      case "PENDING":
        return "Đang chờ";
      case "REJECTED":
        return "Bị từ chối";
      case "MODIFIED_PENDING":
        return "Cần xác thực lại";
      default:
        return "Không xác định";
    }
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
      <div className="flex items-center justify-between">
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
            (qualifications?.education &&
              !canEditItem(
                qualifications.education,
                "education",
                tutorRequests
              )) ||
            isCreatingEducation ||
            isUpdatingEducation
          }
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            (qualifications?.education &&
              !canEditItem(
                qualifications.education,
                "education",
                tutorRequests
              )) ||
            isCreatingEducation ||
            isUpdatingEducation
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
          title={
            qualifications?.education &&
            !canEditItem(qualifications.education, "education", tutorRequests)
              ? "Không thể chỉnh sửa khi đang chờ xác thực"
              : ""
          }
        >
          {isCreatingEducation || isUpdatingEducation ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            <PlusIcon className="w-5 h-5" />
          )}
          <span>
            {isCreatingEducation
              ? "Đang tạo..."
              : isUpdatingEducation
              ? "Đang cập nhật..."
              : qualifications?.education
              ? "Chỉnh sửa"
              : "Thêm học vấn"}
          </span>
        </button>
      </div>

      {qualifications?.education ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {(() => {
            const displayData = getDisplayData(qualifications.education);
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trường học
                  </label>
                  <p className="text-gray-900">{displayData.school}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chuyên ngành
                  </label>
                  <p className="text-gray-900">
                    {displayData.major || "Không có"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trình độ
                  </label>
                  <p className="text-gray-900">
                    {translateEducationLevel(displayData.level)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian học
                  </label>
                  <p className="text-gray-900">
                    {displayData.startYear} - {displayData.endYear}
                  </p>
                </div>
                {displayData.imgUrl && (
                  <div className="mb-4">
                    <ImagePreview
                      src={displayData.imgUrl}
                      alt={displayData.school}
                      thumbnailClassName="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(qualifications.education.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        qualifications.education.status
                      )}`}
                    >
                      {getStatusText(qualifications.education.status)}
                    </span>
                  </div>
                  {qualifications.education.rejectionReason && (
                    <p className="text-sm text-red-600 mt-2">
                      Lý do từ chối: {qualifications.education.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có thông tin học vấn
          </h3>
          <p className="text-gray-500 mb-4">
            Thêm thông tin học vấn để bắt đầu quá trình xác thực
          </p>
          <button
            onClick={onAddEducation}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Thêm học vấn
          </button>
        </div>
      )}
    </div>
  );
};

export default EducationTab;

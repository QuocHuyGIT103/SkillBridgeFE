import React from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
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
import { canEditItem, getDisplayData } from "../../utils/qualification.utils";

interface CertificatesTabProps {
  qualifications: QualificationsData | null;
  tutorRequests: VerificationRequest[];
  isCreatingCertificate: boolean;
  isUpdatingCertificate: boolean;
  isDeletingCertificate: boolean;
  onAddCertificate: () => void;
  onEditCertificate: (certificate: any) => void;
  onDeleteCertificate: (id: string) => void;
}

const CertificatesTab: React.FC<CertificatesTabProps> = ({
  qualifications,
  tutorRequests,
  isCreatingCertificate,
  isUpdatingCertificate,
  isDeletingCertificate,
  onAddCertificate,
  onEditCertificate,
  onDeleteCertificate,
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
        <h3 className="text-lg font-semibold text-gray-900">Chứng chỉ</h3>
        <button
          onClick={onAddCertificate}
          disabled={isCreatingCertificate}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isCreatingCertificate
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          {isCreatingCertificate ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            <PlusIcon className="w-5 h-5" />
          )}
          <span>
            {isCreatingCertificate ? "Đang tạo..." : "Thêm chứng chỉ"}
          </span>
        </button>
      </div>

      {qualifications?.certificates.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qualifications.certificates.map((cert) => {
            const displayData = getDisplayData(cert);
            const canEdit = canEditItem(cert, "certificate", tutorRequests);
            return (
              <div
                key={cert.id}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {displayData.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {displayData.issuingOrganization}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(cert.status)}
                  </div>
                </div>

                {/* Image Preview */}
                {displayData.imageUrl && (
                  <div className="mb-4">
                    <ImagePreview
                      src={displayData.imageUrl}
                      alt={displayData.name}
                      thumbnailClassName="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Ngày cấp:
                    </span>
                    <p className="text-sm text-gray-900">
                      {new Date(displayData.issueDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                  {displayData.expiryDate && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Ngày hết hạn:
                      </span>
                      <p className="text-sm text-gray-900">
                        {new Date(displayData.expiryDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                  )}
                  <div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        cert.status
                      )}`}
                    >
                      {getStatusText(cert.status)}
                    </span>
                  </div>
                </div>

                {displayData.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {displayData.description}
                  </p>
                )}

                {cert.rejectionReason && (
                  <p className="text-sm text-red-600 mb-4">
                    Lý do từ chối: {cert.rejectionReason}
                  </p>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEditCertificate(cert)}
                    disabled={!canEdit || isUpdatingCertificate}
                    className={`flex items-center space-x-1 text-sm ${
                      canEdit && !isUpdatingCertificate
                        ? "text-primary hover:text-primary/80"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                    title={
                      !canEdit
                        ? "Không thể chỉnh sửa khi đang chờ xác thực"
                        : "Chỉnh sửa"
                    }
                  >
                    {isUpdatingCertificate ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    ) : (
                      <PencilIcon className="w-4 h-4" />
                    )}
                    <span>
                      {isUpdatingCertificate ? "Đang cập nhật..." : "Chỉnh sửa"}
                    </span>
                  </button>
                  <button
                    onClick={() => onDeleteCertificate(cert.id)}
                    disabled={isDeletingCertificate}
                    className={`flex items-center space-x-1 text-sm ${
                      isDeletingCertificate
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-red-600 hover:text-red-700"
                    }`}
                  >
                    {isDeletingCertificate ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                    <span>{isDeletingCertificate ? "Đang xóa..." : "Xóa"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có chứng chỉ
          </h3>
          <p className="text-gray-500 mb-4">
            Thêm chứng chỉ để tăng độ tin cậy của hồ sơ
          </p>
          <button
            onClick={onAddCertificate}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Thêm chứng chỉ
          </button>
        </div>
      )}
    </div>
  );
};

export default CertificatesTab;

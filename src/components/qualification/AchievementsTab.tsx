import React from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TrophyIcon,
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
import { canEditItem } from "../../utils/qualification.utils";

interface AchievementsTabProps {
  qualifications: QualificationsData | null;
  tutorRequests: VerificationRequest[];
  onAddAchievement: () => void;
  onEditAchievement: (achievement: any) => void;
  onDeleteAchievement: (id: string) => void;
}

const AchievementsTab: React.FC<AchievementsTabProps> = ({
  qualifications,
  tutorRequests,
  onAddAchievement,
  onEditAchievement,
  onDeleteAchievement,
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
        <h3 className="text-lg font-semibold text-gray-900">Thành tích</h3>
        <button
          onClick={onAddAchievement}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Thêm thành tích</span>
        </button>
      </div>

      {qualifications?.achievements.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qualifications.achievements.map((achievement) => {
            const canEdit = canEditItem(
              achievement,
              "achievement",
              tutorRequests
            );
            return (
              <div
                key={achievement._id}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {achievement.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {achievement.awardingOrganization}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(achievement.status)}
                  </div>
                </div>

                {/* Image Preview */}
                {achievement.imgUrl && (
                  <div className="mb-4">
                    <ImagePreview
                      src={achievement.imgUrl}
                      alt={achievement.name}
                      thumbnailClassName="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Cấp độ:
                    </span>
                    <p className="text-sm text-gray-900">{achievement.level}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Loại:
                    </span>
                    <p className="text-sm text-gray-900">{achievement.type}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Lĩnh vực:
                    </span>
                    <p className="text-sm text-gray-900">{achievement.field}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Ngày đạt được:
                    </span>
                    <p className="text-sm text-gray-900">
                      {new Date(achievement.achievedDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        achievement.status
                      )}`}
                    >
                      {getStatusText(achievement.status)}
                    </span>
                  </div>
                </div>

                {achievement.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {achievement.description}
                  </p>
                )}

                {achievement.rejectionReason && (
                  <p className="text-sm text-red-600 mb-4">
                    Lý do từ chối: {achievement.rejectionReason}
                  </p>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEditAchievement(achievement)}
                    disabled={!canEdit}
                    className={`flex items-center space-x-1 text-sm ${
                      canEdit
                        ? "text-primary hover:text-primary/80"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                    title={
                      !canEdit
                        ? "Không thể chỉnh sửa khi đang chờ xác thực"
                        : "Chỉnh sửa"
                    }
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Chỉnh sửa</span>
                  </button>
                  <button
                    onClick={() => onDeleteAchievement(achievement._id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có thành tích
          </h3>
          <p className="text-gray-500 mb-4">
            Thêm thành tích để làm nổi bật hồ sơ của bạn
          </p>
          <button
            onClick={onAddAchievement}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Thêm thành tích
          </button>
        </div>
      )}
    </div>
  );
};

export default AchievementsTab;

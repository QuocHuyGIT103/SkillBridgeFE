import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { useTutorProfileStore } from "../../store/tutorProfile.store";
import {
  VerificationStatusBadge,
  VerificationWarningModal,
  RejectionReasonDisplay,
} from "../verification";
import type { VerificationStatus } from "../../types/qualification.types";

interface PersonalInfo {
  headline: string;
  introduction: string;
  teaching_experience?: string;
  student_levels?: string;
  video_intro_link?: string;
}

interface IntroductionSectionProps {
  profileData: any;
  editedInfo: PersonalInfo;
  isEditing: boolean;
  onInputChange: (field: keyof PersonalInfo, value: string) => void;
  onEditToggle?: () => void;
}

const IntroductionSection: React.FC<IntroductionSectionProps> = ({
  profileData,
  editedInfo,
  isEditing,
  onInputChange,
  onEditToggle,
}) => {
  // Store hooks
  const { checkEditStatus, verificationStatus, canEdit, editWarning } =
    useTutorProfileStore();

  // Local state
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isCheckingEditStatus, setIsCheckingEditStatus] = useState(false);

  // Check edit status when component mounts or verification status changes
  useEffect(() => {
    const checkStatus = async () => {
      if (profileData?.profile?.id) {
        setIsCheckingEditStatus(true);
        try {
          await checkEditStatus();
        } catch (error) {
          console.error("Error checking edit status:", error);
        } finally {
          setIsCheckingEditStatus(false);
        }
      }
    };

    checkStatus();
  }, [profileData?.profile?.id, checkEditStatus]);

  const handleWarningConfirm = () => {
    setShowWarningModal(false);
    if (onEditToggle) {
      onEditToggle();
    }
  };

  const getVerificationStatus = (): VerificationStatus | null => {
    return profileData?.profile?.status || verificationStatus;
  };

  const getRejectionReason = (): string | null => {
    return profileData?.profile?.rejection_reason || null;
  };

  const isEditDisabled = !canEdit || isCheckingEditStatus;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-6"
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Giới thiệu bản thân
            </h2>
          </div>

          {/* Verification Status Badge */}
          {getVerificationStatus() && (
            <VerificationStatusBadge
              status={getVerificationStatus()!}
              size="md"
              showTooltip={true}
            />
          )}
        </div>

        {/* Rejection Reason Display */}
        {getVerificationStatus() === "REJECTED" && getRejectionReason() && (
          <div className="mt-4">
            <RejectionReasonDisplay
              rejectionReason={getRejectionReason()!}
              maxLength={150}
              showIcon={true}
            />
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Attractive Headline */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/10 rounded-lg p-4 border-l-4 border-primary">
          <div className="flex items-center space-x-2 mb-3">
            <SparklesIcon className="w-5 h-5 text-primary" />
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Dòng tiêu đề lôi cuốn *
            </label>
          </div>
          <p className="text-xs text-gray-500 mb-3 italic">
            Viết một dòng tiêu đề lôi cuốn, bắt mắt để gây ấn tượng với học
            viên.
          </p>
          {isEditing && !isEditDisabled ? (
            <input
              id="headline"
              name="headline"
              type="text"
              value={editedInfo.headline || ""}
              onChange={(e) => onInputChange("headline", e.target.value)}
              className="w-full px-4 py-3 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              placeholder="VD: Gia sư Toán học với 5+ năm kinh nghiệm, giúp học sinh đạt điểm cao"
              maxLength={100}
            />
          ) : (
            <div className="px-4 py-3 bg-white rounded-lg border border-primary/20">
              <p className="text-gray-900 dark:text-gray-100 text-lg font-medium">
                {profileData?.profile?.headline || "Chưa có tiêu đề"}
              </p>
            </div>
          )}
        </div>

        {/* Personal Introduction */}
        <div className="bg-gradient-to-r from-secondary/5 to-accent/5 rounded-lg p-4 border-l-4 border-secondary">
          <div className="flex items-center space-x-2 mb-3">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-secondary" />
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Giới thiệu về bản thân *
            </label>
          </div>
          {isEditing && !isEditDisabled ? (
            <textarea
              id="introduction"
              name="introduction"
              value={editedInfo.introduction || ""}
              onChange={(e) => onInputChange("introduction", e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white"
              placeholder="Hãy chia sẻ về bản thân, sở thích, phương pháp giảng dạy, mục tiêu hướng dẫn học sinh..."
            />
          ) : (
            <div className="px-4 py-3 bg-white rounded-lg border border-secondary/20 min-h-[120px]">
              <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                {profileData?.profile?.introduction || "Chưa có giới thiệu"}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teaching Experience */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg p-4 border-l-4 border-green-500">
            <div className="flex items-center space-x-2 mb-3">
              <AcademicCapIcon className="w-5 h-5 text-green-600" />
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Kinh nghiệm giảng dạy{" "}
                <span className="text-gray-400 font-normal">(Tùy chọn)</span>
              </label>
            </div>
            {isEditing && !isEditDisabled ? (
              <textarea
                id="teaching_experience"
                name="teaching_experience"
                value={editedInfo.teaching_experience || ""}
                onChange={(e) =>
                  onInputChange("teaching_experience", e.target.value)
                }
                rows={4}
                className="w-full px-4 py-3 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white"
                placeholder="Mô tả kinh nghiệm giảng dạy, các thành tích đáng chú ý..."
              />
            ) : (
              <div className="px-4 py-3 bg-white rounded-lg border border-green-200 min-h-[100px]">
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                  {profileData?.profile?.teaching_experience || "Chưa cập nhật"}
                </p>
              </div>
            )}
          </div>

          {/* Student Levels */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-center space-x-2 mb-3">
              <UserGroupIcon className="w-5 h-5 text-blue-600" />
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Trình độ học viên nhận giảng dạy{" "}
                <span className="text-gray-400 font-normal">(Tùy chọn)</span>
              </label>
            </div>
            {isEditing && !isEditDisabled ? (
              <textarea
                id="student_levels"
                name="student_levels"
                value={editedInfo.student_levels || ""}
                onChange={(e) =>
                  onInputChange("student_levels", e.target.value)
                }
                rows={4}
                className="w-full px-4 py-3 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white"
                placeholder="VD: Học sinh THCS, THPT, sinh viên đại học..."
              />
            ) : (
              <div className="px-4 py-3 bg-white rounded-lg border border-blue-200 min-h-[100px]">
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                  {profileData?.profile?.student_levels || "Chưa cập nhật"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Video Introduction Link */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-lg p-4 border-l-4 border-purple-500">
          <div className="flex items-center space-x-2 mb-3">
            <VideoCameraIcon className="w-5 h-5 text-purple-600" />
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Link video giới thiệu về bản thân{" "}
              <span className="text-gray-400 font-normal">(Tùy chọn)</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Gợi ý: YouTube, Google Drive, Vimeo hoặc các nền tảng video khác
          </p>
          {isEditing && !isEditDisabled ? (
            <input
              id="video_intro_link"
              name="video_intro_link"
              type="url"
              value={editedInfo.video_intro_link || ""}
              onChange={(e) =>
                onInputChange("video_intro_link", e.target.value)
              }
              className="w-full px-4 py-3 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              placeholder="https://youtube.com/watch?v=..."
            />
          ) : (
            <div className="px-4 py-3 bg-white rounded-lg border border-purple-200">
              {profileData?.profile?.video_intro_link ? (
                <a
                  href={profileData.profile.video_intro_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-medium flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span>Xem video giới thiệu</span>
                </a>
              ) : (
                <span className="text-gray-500">Chưa có video giới thiệu</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Verification Warning Modal */}
      <VerificationWarningModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        onConfirm={handleWarningConfirm}
        warningMessage={
          editWarning ||
          "Thông tin đã được xác thực. Mọi thay đổi sẽ cần gửi yêu cầu xác thực cho admin."
        }
        isLoading={false}
        title="Cảnh báo xác thực thông tin giới thiệu"
        confirmText="Tiếp tục chỉnh sửa"
        cancelText="Hủy"
      />
    </motion.div>
  );
};

export default IntroductionSection;

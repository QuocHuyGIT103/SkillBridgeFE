import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useTutorProfileStore } from "../../store/tutorProfile.store";
import { useAutoFocusOnError } from "../../hooks/useAutoFocusOnError";
import toast from "react-hot-toast";
import type { StructuredAddress } from "../../types/address.types";
import type { VerificationStatus } from "../../types/qualification.types";
import {
  VerificationStatusBadge,
  VerificationSubmitModal,
  VerificationWarningModal,
} from "../../components/verification";

// Components
import TutorProfileStatusCard from "../../components/tutor/TutorProfileStatusCard";
import PersonalInfoSection from "../../components/profile/PersonalInfoSection";
import IntroductionSection from "../../components/profile/IntroductionSection";
import CCCDSection from "../../components/profile/CCCDSection";

interface PersonalInfo {
  full_name: string;
  email: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  address: string;
  structured_address: StructuredAddress;
  portrait_image: File | null;
  cccd_images: File[];
  // New introduction fields
  headline: string;
  introduction: string;
  teaching_experience?: string;
  student_levels?: string;
  video_intro_link?: string;
}

const TutorPersonalProfilePage: React.FC = () => {
  // Zustand store
  const {
    profileData,
    profileStatusData,
    isLoading,
    isUpdatingPersonal,
    isUpdatingIntroduction,
    isUploadingCCCD,
    error,
    validationErrors,
    verificationStatus,
    canEdit,
    editWarning,
    isCheckingEditStatus,
    isSubmittingVerification,
    fetchProfile,
    updatePersonalInfo,
    updateIntroduction,
    uploadCCCDImages,
    deleteCCCDImage,
    clearError,
    checkEditStatus,
    submitForVerification,
    checkOperationStatus,
  } = useTutorProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [pendingEditAction, setPendingEditAction] = useState<
    (() => void) | null
  >(null);
  const [hasConfirmedWarning, setHasConfirmedWarning] = useState(false);
  const [editedInfo, setEditedInfo] = useState<PersonalInfo>({
    full_name: "",
    email: "",
    phone_number: "",
    gender: "",
    date_of_birth: "",
    address: "",
    structured_address: {
      province_code: "",
      district_code: "",
      ward_code: "",
      detail_address: "",
    },
    portrait_image: null,
    cccd_images: [],
    headline: "",
    introduction: "",
    teaching_experience: "",
    student_levels: "",
    video_intro_link: "",
  });

  const portraitInputRef = useRef<HTMLInputElement>(null);
  const cccdInputRef = useRef<HTMLInputElement>(null);
  const hasCheckedEditStatus = useRef<boolean>(false);
  const [hasRunEditStatusEffect, setHasRunEditStatusEffect] = useState(false);

  // Auto focus on validation error
  useAutoFocusOnError(validationErrors);

  // Fetch profile data on component mount
  useEffect(() => {
    const initializeProfile = async () => {
      try {
        await fetchProfile();
        await checkOperationStatus();
      } catch (error) {
        console.error("Error initializing profile:", error);
        toast.error("Không thể tải thông tin hồ sơ");
      }
    };

    initializeProfile();
  }, []); // Remove fetchProfile dependency to prevent re-initialization

  // Check edit status only ONCE after profileData loaded
  useEffect(() => {
    if (profileData?.profile?.id && !hasRunEditStatusEffect) {
      (async () => {
        try {
          hasCheckedEditStatus.current = true;
          await checkEditStatus();
          setHasRunEditStatusEffect(true);
        } catch (error) {
          console.error("Error checking edit status:", error);
          hasCheckedEditStatus.current = false;
        }
      })();
    }
  }, [profileData?.profile?.id, hasRunEditStatusEffect, checkEditStatus]);

  // Update editedInfo when profileData changes
  useEffect(() => {
    if (profileData) {
      const user = profileData.user;
      const profile = profileData.profile;

      setEditedInfo({
        full_name: user?.full_name || "",
        email: user?.email || "",
        phone_number: user?.phone_number || "",
        gender: user?.gender || "",
        date_of_birth: user?.date_of_birth
          ? new Date(user.date_of_birth).toISOString().split("T")[0]
          : "",
        address: user?.address || "",
        structured_address: {
          province_code: user?.structured_address?.province_code || "",
          district_code: user?.structured_address?.district_code || "",
          ward_code: user?.structured_address?.ward_code || "",
          detail_address: user?.structured_address?.detail_address || "",
        },
        portrait_image: null,
        cccd_images: [],
        headline: profile?.headline || "",
        introduction: profile?.introduction || "",
        teaching_experience: profile?.teaching_experience || "",
        student_levels: profile?.student_levels || "",
        video_intro_link: profile?.video_intro_link || "",
      });
    }
  }, [profileData]);

  // Handle errors with toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleEditToggle = async () => {
    if (isEditing) {
      // Reset to original data from profileData
      resetEditedInfo();
      setIsEditing(false);
    } else {
      // Check edit status before allowing edit
      await checkEditStatusAndProceed();
    }
  };

  const resetEditedInfo = () => {
    if (profileData) {
      const user = profileData.user;
      const profile = profileData.profile;

      setEditedInfo({
        full_name: user?.full_name || "",
        email: user?.email || "",
        phone_number: user?.phone_number || "",
        gender: user?.gender || "",
        date_of_birth: user?.date_of_birth
          ? new Date(user.date_of_birth).toISOString().split("T")[0]
          : "",
        address: user?.address || "",
        structured_address: {
          province_code: user?.structured_address?.province_code || "",
          district_code: user?.structured_address?.district_code || "",
          ward_code: user?.structured_address?.ward_code || "",
          detail_address: user?.structured_address?.detail_address || "",
        },
        portrait_image: null,
        cccd_images: [],
        headline: profile?.headline || "",
        introduction: profile?.introduction || "",
        teaching_experience: profile?.teaching_experience || "",
        student_levels: profile?.student_levels || "",
        video_intro_link: profile?.video_intro_link || "",
      });
    }
  };

  const checkEditStatusAndProceed = async () => {
    try {
      // Don't call checkEditStatus here - it should already be called in useEffect
      // Just check the current state
      if (!verificationStatus) {
        // If we don't have verification status yet, wait for it
        toast("Đang kiểm tra trạng thái, vui lòng đợi...", { icon: "⏳" });
        return;
      }

      if (!canEdit) {
        // Don't show toast for PENDING status, just return silently
        // The button will be disabled and show tooltip instead
        return;
      }

      if (editWarning) {
        // Show warning modal
        setPendingEditAction(() => () => setIsEditing(true));
        setShowWarningModal(true);
        return;
      }

      // No warning, proceed with edit
      setIsEditing(true);
    } catch (error) {
      console.error("Error checking edit status:", error);
      // Don't show toast for PENDING status errors
      if (!(error as any).message?.includes("đang chờ xác thực")) {
        toast.error("Không thể kiểm tra trạng thái chỉnh sửa");
      }
    }
  };

  const handleWarningConfirm = () => {
    setShowWarningModal(false);
    setHasConfirmedWarning(true); // Mark that user has confirmed the warning
    if (pendingEditAction) {
      pendingEditAction();
      setPendingEditAction(null);
    }
  };

  const handleWarningCancel = () => {
    setShowWarningModal(false);
    setPendingEditAction(null);
    setHasConfirmedWarning(false); // Reset confirmation flag
  };

  const handleSave = async () => {
    try {
      // Update personal info
      await updatePersonalInfo({
        full_name: editedInfo.full_name,
        phone_number: editedInfo.phone_number,
        gender: editedInfo.gender as "male" | "female" | "other",
        date_of_birth: editedInfo.date_of_birth,
        address: editedInfo.address,
        structured_address: editedInfo.structured_address,
        avatar_file: editedInfo.portrait_image || undefined,
        confirmed: hasConfirmedWarning, // Send confirmation flag
      });

      // Update introduction
      await updateIntroduction({
        headline: editedInfo.headline,
        introduction: editedInfo.introduction,
        teaching_experience: editedInfo.teaching_experience,
        student_levels: editedInfo.student_levels,
        video_intro_link: editedInfo.video_intro_link,
        confirmed: hasConfirmedWarning, // Send confirmation flag
      });

      setIsEditing(false);
      setHasConfirmedWarning(false); // Reset confirmation flag after successful save
      toast.success("Cập nhật hồ sơ thành công!");

      // Refresh profile after successful save
      setTimeout(async () => {
        try {
          await fetchProfile();
          // Don't reset the check flag - we don't need to re-check edit status after save
        } catch (error) {
          console.error("Error refreshing profile after save:", error);
        }
      }, 1000);
    } catch (error) {
      // Error handling is done in the store
      console.error("Error saving profile:", error);
    }
  };

  const handleInputChange = (field: keyof PersonalInfo, value: string) => {
    setEditedInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleStructuredAddressChange = (
    updates: Partial<StructuredAddress>
  ) => {
    setEditedInfo((prev) => ({
      ...prev,
      structured_address: {
        ...prev.structured_address,
        ...updates,
      },
    }));
  };

  const handlePortraitUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditedInfo((prev) => ({ ...prev, portrait_image: file }));
    }
  };

  const handleCCCDUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      try {
        const success = await uploadCCCDImages(files);
        if (success) {
          toast.success(`Tải ${files.length} ảnh CCCD thành công!`);
        }
        // Reset input
        if (cccdInputRef.current) {
          cccdInputRef.current.value = "";
        }
      } catch (error: any) {
        // Error will be shown via the error useEffect
      }
    }
  };

  const removeCCCDImage = async (imageUrl: string) => {
    try {
      const success = await deleteCCCDImage(imageUrl);
      if (success) {
        toast.success("Xóa ảnh CCCD thành công!");
      }
    } catch (error: any) {
      // Error will be shown via the error useEffect
    }
  };

  // Verification handlers
  const handleSubmitVerification = async () => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);
      await submitForVerification();
      setSubmitSuccess(true);
      toast.success("Gửi yêu cầu xác thực thành công!");

      // Refresh profile to get updated status
      setTimeout(async () => {
        try {
          await fetchProfile();
          // Reset the check flag to allow re-checking edit status after verification submit
          // This is needed because verification status might have changed
          hasCheckedEditStatus.current = false;
        } catch (error) {
          console.error(
            "Error refreshing profile after verification submit:",
            error
          );
        }
      }, 1000);
    } catch (error: any) {
      setSubmitError(error.message || "Có lỗi xảy ra khi gửi yêu cầu xác thực");
    }
  };

  const getVerificationStatus = (): VerificationStatus | null => {
    return profileData?.profile?.status || verificationStatus;
  };

  const canSubmitVerification = (): boolean => {
    const status = getVerificationStatus();
    return (
      status === "DRAFT" ||
      status === "REJECTED" ||
      status === "MODIFIED_AFTER_REJECTION"
    );
  };

  const getEditButtonText = (): string => {
    if (isCheckingEditStatus) return "Đang kiểm tra...";
    if (!canEdit) return "Không thể chỉnh sửa";
    if (editWarning) return "Chỉnh sửa (cần xác thực)";
    return "Chỉnh sửa";
  };

  const getEditButtonClass = (): string => {
    const baseClass =
      "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors";
    if (isCheckingEditStatus || !canEdit) {
      return `${baseClass} bg-gray-400 text-white cursor-not-allowed`;
    }
    if (editWarning) {
      return `${baseClass} bg-amber-500 text-white hover:bg-amber-600`;
    }
    return `${baseClass} bg-primary text-white hover:bg-primary/90`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Đang tải hồ sơ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-3xl font-bold text-primary">
                  Hồ sơ của tôi
                </h1>
                {/* Verification Status Badge */}
                {getVerificationStatus() && (
                  <VerificationStatusBadge
                    status={getVerificationStatus()!}
                    size="lg"
                    showTooltip={true}
                  />
                )}
              </div>
              <p className="text-secondary">
                Quản lý thông tin cá nhân và tài khoản của bạn
              </p>

              {/* Edit Warning */}
              {editWarning && !isEditing && (
                <div className="mt-3 flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span className="text-sm">{editWarning}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              {/* Submit Verification Button */}
              {canSubmitVerification() && (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  disabled={isSubmittingVerification}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  <span>Gửi xác thực</span>
                </button>
              )}

              {/* Edit/Save Buttons */}
              {!isEditing ? (
                <div className="relative group">
                  <button
                    onClick={handleEditToggle}
                    disabled={isCheckingEditStatus || !canEdit}
                    className={getEditButtonClass()}
                  >
                    {isCheckingEditStatus ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Đang kiểm tra...</span>
                      </>
                    ) : (
                      <>
                        <PencilIcon className="w-4 h-4" />
                        <span>{getEditButtonText()}</span>
                      </>
                    )}
                  </button>

                  {/* Tooltip for disabled button */}
                  {!canEdit && !isCheckingEditStatus && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      {verificationStatus === "PENDING"
                        ? "Thông tin đang chờ xác thực, không thể chỉnh sửa"
                        : verificationStatus === "MODIFIED_PENDING"
                        ? "Thông tin đang chờ duyệt chỉnh sửa, không thể chỉnh sửa thêm"
                        : "Không thể chỉnh sửa thông tin lúc này"}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isUpdatingPersonal || isUpdatingIntroduction}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isUpdatingPersonal || isUpdatingIntroduction ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        <span>Lưu</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Hủy</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tutor Profile Status Card (no actions on profile page) */}
        {profileStatusData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            <TutorProfileStatusCard
              statusData={profileStatusData}
              profileData={profileData?.profile as any}
              showActions={false}
            />
          </motion.div>
        )}

        {/* Personal Info Section */}
        <PersonalInfoSection
          profileData={profileData}
          editedInfo={editedInfo}
          isEditing={isEditing}
          isUpdatingPersonal={isUpdatingPersonal}
          onInputChange={handleInputChange}
          onPortraitUpload={handlePortraitUpload}
          onStructuredAddressChange={handleStructuredAddressChange}
          portraitInputRef={portraitInputRef}
          onEditToggle={handleEditToggle}
        />

        {/* Introduction Section */}
        <IntroductionSection
          profileData={profileData}
          editedInfo={editedInfo}
          isEditing={isEditing}
          onInputChange={handleInputChange}
          onEditToggle={handleEditToggle}
        />

        {/* CCCD Section */}
        <CCCDSection
          profileData={profileData}
          isEditing={isEditing}
          isUploadingCCCD={isUploadingCCCD}
          onCCCDUpload={handleCCCDUpload}
          onRemoveCCCDImage={removeCCCDImage}
          cccdInputRef={cccdInputRef}
        />

        {/* Verification Submit Modal */}
        <VerificationSubmitModal
          isOpen={showSubmitModal}
          onClose={() => {
            setShowSubmitModal(false);
            setSubmitError(null);
            setSubmitSuccess(false);
          }}
          onSubmit={handleSubmitVerification}
          isLoading={isSubmittingVerification}
          error={submitError}
          success={submitSuccess}
          title="Gửi yêu cầu xác thực thông tin gia sư"
          submitText="Gửi xác thực"
          cancelText="Hủy"
        />

        {/* Verification Warning Modal */}
        <VerificationWarningModal
          isOpen={showWarningModal}
          onClose={handleWarningCancel}
          onConfirm={handleWarningConfirm}
          warningMessage={editWarning || ""}
          isLoading={false}
          title="Cảnh báo xác thực"
          confirmText="Tiếp tục chỉnh sửa"
          cancelText="Hủy"
        />
      </div>
    </div>
  );
};

export default TutorPersonalProfilePage;

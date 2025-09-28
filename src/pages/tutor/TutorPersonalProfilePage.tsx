import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTutorProfileStore } from "../../store/tutorProfile.store";
import { useAutoFocusOnError } from "../../hooks/useAutoFocusOnError";
import toast from "react-hot-toast";
import type { StructuredAddress } from "../../types/address.types";

// Components
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
    isLoading,
    isUpdatingPersonal,
    isUpdatingIntroduction,
    isUploadingCCCD,
    error,
    validationErrors,
    fetchProfile,
    updatePersonalInfo,
    updateIntroduction,
    uploadCCCDImages,
    deleteCCCDImage,
    clearError,
  } = useTutorProfileStore();

  const [isEditing, setIsEditing] = useState(false);
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

  // Auto focus on validation error
  useAutoFocusOnError(validationErrors);

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset to original data from profileData
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
    }
    setIsEditing(!isEditing);
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
      });

      // Update introduction
      await updateIntroduction({
        headline: editedInfo.headline,
        introduction: editedInfo.introduction,
        teaching_experience: editedInfo.teaching_experience,
        student_levels: editedInfo.student_levels,
        video_intro_link: editedInfo.video_intro_link,
      });

      setIsEditing(false);
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (error) {
      // Error handling is done in the store
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
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-primary">Hồ sơ của tôi</h1>
            <p className="text-secondary mt-2">
              Quản lý thông tin cá nhân và tài khoản của bạn
            </p>
          </div>
          <div className="flex space-x-3">
            {!isEditing ? (
              <button
                onClick={handleEditToggle}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Chỉnh sửa</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isUpdatingPersonal || isUpdatingIntroduction}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>Hủy</span>
                </button>
              </>
            )}
          </div>
        </motion.div>

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
        />

        {/* Introduction Section */}
        <IntroductionSection
          profileData={profileData}
          editedInfo={editedInfo}
          isEditing={isEditing}
          onInputChange={handleInputChange}
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
      </div>
    </div>
  );
};

export default TutorPersonalProfilePage;

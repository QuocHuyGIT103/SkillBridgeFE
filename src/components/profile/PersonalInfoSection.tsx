import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserCircleIcon,
  CameraIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import AddressSelector from "../AddressSelector";
import type { StructuredAddress } from "../../types/address.types";
import { useTutorProfileStore } from "../../store/tutorProfile.store";
import {
  VerificationStatusBadge,
  VerificationWarningModal,
  RejectionReasonDisplay,
} from "../verification";
import type { VerificationStatus } from "../../types/qualification.types";

interface PersonalInfo {
  full_name: string;
  email: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  address: string;
  structured_address: StructuredAddress;
  portrait_image: File | null;
}

interface PersonalInfoSectionProps {
  profileData: any;
  editedInfo: PersonalInfo;
  isEditing: boolean;
  isUpdatingPersonal: boolean;
  onInputChange: (field: keyof PersonalInfo, value: string) => void;
  onPortraitUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onStructuredAddressChange: (updates: Partial<StructuredAddress>) => void;
  portraitInputRef: React.RefObject<HTMLInputElement | null>;
  onEditToggle?: () => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  profileData,
  editedInfo,
  isEditing,
  isUpdatingPersonal,
  onInputChange,
  onPortraitUpload,
  onStructuredAddressChange,
  portraitInputRef,
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

  const getImageUrl = (file: File | null) => {
    return file ? URL.createObjectURL(file) : null;
  };

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
      transition={{ delay: 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-6"
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <UserCircleIcon className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Thông tin cá nhân
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

      <div className="flex flex-col lg:flex-row lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
        {/* Portrait Section */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden border-4 border-accent">
              {editedInfo.portrait_image ? (
                <img
                  src={getImageUrl(editedInfo.portrait_image)!}
                  alt="Portrait"
                  className="w-full h-full object-cover"
                />
              ) : profileData?.user?.avatar_url ? (
                <img
                  src={profileData.user.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircleIcon className="w-20 h-20 text-secondary" />
              )}
            </div>
            {isEditing && !isEditDisabled && (
              <button
                onClick={() => portraitInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <CameraIcon className="w-5 h-5" />
              </button>
            )}
            <input
              ref={portraitInputRef}
              type="file"
              accept="image/*"
              onChange={onPortraitUpload}
              className="hidden"
            />
          </div>
          <p className="text-sm text-secondary mt-2 text-center">
            Ảnh chân dung
          </p>
        </div>

        {/* Basic Info */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Họ và tên
            </label>
            {isEditing && !isEditDisabled ? (
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={editedInfo.full_name}
                onChange={(e) => onInputChange("full_name", e.target.value)}
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            ) : (
              <div className="flex items-center space-x-2 px-4 py-2 bg-accent/20 rounded-lg">
                <UserCircleIcon className="w-5 h-5 text-secondary" />
                <span className="text-gray-900 dark:text-gray-100">
                  {profileData?.user?.full_name || "Chưa cập nhật"}
                </span>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <EnvelopeIcon className="w-5 h-5 text-secondary" />
              <span className="text-gray-600 dark:text-gray-400">
                {profileData?.user?.email || "Chưa cập nhật"}
              </span>
              <span className="text-xs text-gray-500">
                (Không thể thay đổi)
              </span>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Giới tính
            </label>
            {isEditing && !isEditDisabled ? (
              <select
                id="gender"
                name="gender"
                value={editedInfo.gender}
                onChange={(e) => onInputChange("gender", e.target.value)}
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            ) : (
              <div className="flex items-center space-x-2 px-4 py-2 bg-accent/20 rounded-lg">
                <UserCircleIcon className="w-5 h-5 text-secondary" />
                <span className="text-gray-900 dark:text-gray-100">
                  {profileData?.user?.gender === "male"
                    ? "Nam"
                    : profileData?.user?.gender === "female"
                    ? "Nữ"
                    : profileData?.user?.gender === "other"
                    ? "Khác"
                    : "Chưa cập nhật"}
                </span>
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Số điện thoại
            </label>
            {isEditing && !isEditDisabled ? (
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                value={editedInfo.phone_number}
                onChange={(e) => onInputChange("phone_number", e.target.value)}
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            ) : (
              <div className="flex items-center space-x-2 px-4 py-2 bg-accent/20 rounded-lg">
                <PhoneIcon className="w-5 h-5 text-secondary" />
                <span className="text-gray-900 dark:text-gray-100">
                  {profileData?.user?.phone_number || "Chưa cập nhật"}
                </span>
              </div>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ngày sinh
            </label>
            {isEditing && !isEditDisabled ? (
              <input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={editedInfo.date_of_birth}
                onChange={(e) => onInputChange("date_of_birth", e.target.value)}
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            ) : (
              <div className="flex items-center space-x-2 px-4 py-2 bg-accent/20 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-secondary" />
                <span className="text-gray-900 dark:text-gray-100">
                  {profileData?.user?.date_of_birth
                    ? new Date(
                        profileData.user.date_of_birth
                      ).toLocaleDateString("vi-VN")
                    : "Chưa cập nhật"}
                </span>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Địa chỉ
            </label>
            <AddressSelector
              selectedProvince={editedInfo.structured_address.province_code}
              selectedDistrict={editedInfo.structured_address.district_code}
              selectedWard={editedInfo.structured_address.ward_code}
              detailAddress={editedInfo.structured_address.detail_address}
              onProvinceChange={(provinceCode) =>
                onStructuredAddressChange({
                  province_code: provinceCode,
                  district_code: "",
                  ward_code: "",
                })
              }
              onDistrictChange={(districtCode) =>
                onStructuredAddressChange({
                  district_code: districtCode,
                  ward_code: "",
                })
              }
              onWardChange={(wardCode) =>
                onStructuredAddressChange({
                  ward_code: wardCode,
                })
              }
              onDetailAddressChange={(detailAddress) =>
                onStructuredAddressChange({
                  detail_address: detailAddress,
                })
              }
              isEditing={isEditing && !isEditDisabled}
              provinceInfo={
                profileData?.user?.structured_address?.province_info
              }
              districtInfo={
                profileData?.user?.structured_address?.district_info
              }
              wardInfo={profileData?.user?.structured_address?.ward_info}
            />
          </div>
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
        isLoading={isUpdatingPersonal}
        title="Cảnh báo xác thực thông tin cá nhân"
        confirmText="Tiếp tục chỉnh sửa"
        cancelText="Hủy"
      />
    </motion.div>
  );
};

export default PersonalInfoSection;

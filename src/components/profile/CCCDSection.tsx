import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IdentificationIcon,
  DocumentTextIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTutorProfileStore } from "../../store/tutorProfile.store";
import {
  VerificationStatusBadge,
  RejectionReasonDisplay,
} from "../verification";
import type { VerificationStatus } from "../../types/qualification.types";

interface CCCDSectionProps {
  profileData: any;
  isEditing: boolean;
  isUploadingCCCD: boolean;
  onCCCDUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemoveCCCDImage: (imageUrl: string) => Promise<void>;
  cccdInputRef: React.RefObject<HTMLInputElement | null>; // Fixed TypeScript ref type
}

const CCCDSection: React.FC<CCCDSectionProps> = ({
  profileData,
  isEditing,
  isUploadingCCCD,
  onCCCDUpload,
  onRemoveCCCDImage,
  cccdInputRef,
}) => {
  // Store hooks
  const { checkEditStatus, verificationStatus, canEdit } =
    useTutorProfileStore();

  // Local state
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
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <IdentificationIcon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Căn cước công dân (CCCD)
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* Verification Status Badge */}
            {getVerificationStatus() && (
              <VerificationStatusBadge
                status={getVerificationStatus()!}
                size="md"
                showTooltip={true}
              />
            )}

            {/* Upload Button */}
            {isEditing && !isEditDisabled && (
              <button
                onClick={() => cccdInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                disabled={isUploadingCCCD}
              >
                <DocumentTextIcon className="w-4 h-4" />
                <span>Thêm ảnh CCCD</span>
              </button>
            )}
          </div>
        </div>

        <input
          ref={cccdInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onCCCDUpload}
          className="hidden"
        />

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

      {/* CCCD Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profileData?.profile?.cccd_images &&
        profileData.profile.cccd_images.length > 0 ? (
          profileData.profile.cccd_images.map(
            (imageUrl: string, index: number) => (
              <div key={index} className="relative group">
                <div className="aspect-[16/10] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-accent/30">
                  <img
                    src={imageUrl}
                    alt={`CCCD ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-image.png"; // Fallback image
                    }}
                  />
                </div>
                {isEditing && !isEditDisabled && (
                  <button
                    onClick={() => onRemoveCCCDImage(imageUrl)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isUploadingCCCD}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            )
          )
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <IdentificationIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Chưa có hình ảnh CCCD nào được tải lên</p>
            {isEditing && !isEditDisabled && (
              <button
                onClick={() => cccdInputRef.current?.click()}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                disabled={isUploadingCCCD}
              >
                Tải ảnh CCCD
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CCCDSection;

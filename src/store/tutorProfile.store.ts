import { create } from "zustand";
import axiosClient from "../api/axiosClient";
import VerificationService from "../services/verification.service";
import type { StructuredAddress } from "../types/address.types";
import type {
  VerificationStatus,
  EditStatusResponse,
  VerificationSubmitResponse,
  VerificationErrorResponse,
  TutorProfile as QualificationTutorProfile,
} from "../types/qualification.types";

// Types for the store
export interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  gender?: "male" | "female" | "other";
  date_of_birth?: Date;
  address?: string;
  structured_address?: StructuredAddress;
  role: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

// Use TutorProfile from qualification.types
export type TutorProfile = QualificationTutorProfile;

export interface TutorProfileData {
  user: User | null;
  profile: TutorProfile | null;
}

interface PersonalInfoUpdate {
  full_name?: string;
  phone_number?: string;
  gender?: "male" | "female" | "other";
  date_of_birth?: string;
  address?: string;
  structured_address?: StructuredAddress;
  avatar_file?: File;
}

interface IntroductionUpdate {
  headline?: string;
  introduction?: string;
  teaching_experience?: string;
  student_levels?: string;
  video_intro_link?: string;
}

interface TutorProfileState {
  // Data
  profileData: TutorProfileData | null;

  // Verification states
  verificationStatus: VerificationStatus | null;
  canEdit: boolean;
  editWarning: string | null;

  // Loading states
  isLoading: boolean;
  isUpdatingPersonal: boolean;
  isUpdatingIntroduction: boolean;
  isUploadingCCCD: boolean;
  isCheckingEditStatus: boolean;
  isSubmittingVerification: boolean;

  // Error states
  error: string | null;
  validationErrors: Array<{ field: string; message: string }> | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updatePersonalInfo: (
    data: PersonalInfoUpdate & { confirmed?: boolean }
  ) => Promise<void>;
  updateIntroduction: (
    data: IntroductionUpdate & { confirmed?: boolean }
  ) => Promise<void>;
  uploadCCCDImages: (files: File[]) => Promise<boolean>;
  deleteCCCDImage: (imageUrl: string) => Promise<boolean>;
  checkEditStatus: () => Promise<EditStatusResponse | undefined>;
  submitForVerification: () => Promise<VerificationSubmitResponse>;
  clearError: () => void;
  resetProfile: () => void;
}

export const useTutorProfileStore = create<TutorProfileState>((set, get) => ({
  // Initial state
  profileData: null,
  verificationStatus: null,
  canEdit: true,
  editWarning: null,
  isLoading: false,
  isUpdatingPersonal: false,
  isUpdatingIntroduction: false,
  isUploadingCCCD: false,
  isCheckingEditStatus: false,
  isSubmittingVerification: false,
  error: null,
  validationErrors: null,

  // Fetch profile data
  fetchProfile: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axiosClient.get("/tutor/profile");

      if (response.success && response.data) {
        set({
          profileData: response.data,
          // Update verification status from profile data
          verificationStatus: response.data.profile?.status || null,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Không thể tải thông tin hồ sơ");
      }
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể tải thông tin hồ sơ",
        isLoading: false,
      });
    }
  },

  // Update personal information
  updatePersonalInfo: async (
    data: PersonalInfoUpdate & { confirmed?: boolean }
  ) => {
    set({ isUpdatingPersonal: true, error: null, validationErrors: null });

    try {
      const formData = new FormData();

      // Add text fields
      Object.keys(data).forEach((key) => {
        if (
          key !== "avatar_file" &&
          key !== "confirmed" &&
          data[key as keyof PersonalInfoUpdate] !== undefined
        ) {
          const value = data[key as keyof PersonalInfoUpdate];
          if (key === "structured_address" && typeof value === "object") {
            // Handle structured_address as JSON string
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value as string);
          }
        }
      });

      // Add confirmed flag if provided
      if (data.confirmed) {
        formData.append("confirmed", "true");
      }

      // Add avatar file if provided
      if (data.avatar_file) {
        formData.append("avatar_url", data.avatar_file);
      }

      const response = await axiosClient.put(
        "/tutor/profile/personal",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.success && response.data) {
        // Update the user data in the store
        const currentProfile = get().profileData;
        if (currentProfile) {
          set({
            profileData: {
              ...currentProfile,
              user: response.data,
            },
            isUpdatingPersonal: false,
          });
        }
      } else {
        // Handle validation response (warning or blocked)
        if (response.data) {
          if (response.data.requiresConfirmation) {
            // This is a warning response - user can still edit but needs confirmation
            throw new Error(
              response.message || "Cần xác nhận để tiếp tục chỉnh sửa"
            );
          } else if (!response.data.canEdit) {
            // This is a blocked response - user cannot edit
            throw new Error(
              response.message || "Không thể chỉnh sửa thông tin"
            );
          }
        }
        throw new Error(
          response.message || "Không thể cập nhật thông tin cá nhân"
        );
      }
    } catch (error: any) {
      let errorMessage = "Không thể cập nhật thông tin cá nhân";
      let validationData = null;

      // Handle validation response (warning or blocked)
      if (error.response?.data?.data) {
        const responseData = error.response.data.data;
        if (responseData.requiresConfirmation) {
          // This is a warning response - user can still edit but needs confirmation
          errorMessage =
            error.response.data.message || "Cần xác nhận để tiếp tục chỉnh sửa";
          validationData = responseData;
        } else if (!responseData.canEdit) {
          // This is a blocked response - user cannot edit
          errorMessage =
            error.response.data.message || "Không thể chỉnh sửa thông tin";
          validationData = responseData;
        } else {
          errorMessage = error.response.data.message || errorMessage;
        }
      } else {
        errorMessage = error.message || errorMessage;
        validationData = error.data || null;
      }

      set({
        error: errorMessage,
        validationErrors: validationData,
        isUpdatingPersonal: false,
      });
      throw error;
    }
  },

  // Update introduction
  updateIntroduction: async (
    data: IntroductionUpdate & { confirmed?: boolean }
  ) => {
    set({ isUpdatingIntroduction: true, error: null, validationErrors: null });

    try {
      const response = await axiosClient.put(
        "/tutor/profile/introduction",
        data
      );

      if (response.success && response.data) {
        // Update the profile data in the store
        const currentProfile = get().profileData;
        if (currentProfile) {
          set({
            profileData: {
              ...currentProfile,
              profile: response.data,
            },
            isUpdatingIntroduction: false,
          });
        }
      } else {
        // Handle validation response (warning or blocked)
        if (response.data) {
          if (response.data.requiresConfirmation) {
            // This is a warning response - user can still edit but needs confirmation
            throw new Error(
              response.message || "Cần xác nhận để tiếp tục chỉnh sửa"
            );
          } else if (!response.data.canEdit) {
            // This is a blocked response - user cannot edit
            throw new Error(
              response.message || "Không thể chỉnh sửa thông tin"
            );
          }
        }
        throw new Error(
          response.message || "Không thể cập nhật thông tin giới thiệu"
        );
      }
    } catch (error: any) {
      let errorMessage = "Không thể cập nhật thông tin giới thiệu";
      let validationData = null;

      // Handle validation response (warning or blocked)
      if (error.response?.data?.data) {
        const responseData = error.response.data.data;
        if (responseData.requiresConfirmation) {
          // This is a warning response - user can still edit but needs confirmation
          errorMessage =
            error.response.data.message || "Cần xác nhận để tiếp tục chỉnh sửa";
          validationData = responseData;
        } else if (!responseData.canEdit) {
          // This is a blocked response - user cannot edit
          errorMessage =
            error.response.data.message || "Không thể chỉnh sửa thông tin";
          validationData = responseData;
        } else {
          errorMessage = error.response.data.message || errorMessage;
        }
      } else {
        errorMessage = error.message || errorMessage;
        validationData = error.data || null;
      }

      set({
        error: errorMessage,
        validationErrors: validationData,
        isUpdatingIntroduction: false,
      });
      throw error;
    }
  },

  // Upload CCCD images
  uploadCCCDImages: async (files: File[]) => {
    set({ isUploadingCCCD: true, error: null });

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("cccd_images", file);
      });

      const response = await axiosClient.post("/tutor/cccd/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.success && response.data) {
        // Update the CCCD images in the store
        const currentProfile = get().profileData;
        if (currentProfile && currentProfile.profile) {
          set({
            profileData: {
              ...currentProfile,
              profile: {
                ...currentProfile.profile,
                cccd_images: response.data.cccd_images,
              },
            },
            isUploadingCCCD: false,
          });
          return true; // Success
        } else {
          throw new Error("Hồ sơ hiện tại không có sẵn");
        }
      } else {
        throw new Error(response.message || "Không thể tải ảnh CCCD");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể tải ảnh CCCD";
      set({
        error: errorMessage,
        isUploadingCCCD: false,
      });
      throw new Error(errorMessage);
    }
  },

  // Delete CCCD image
  deleteCCCDImage: async (imageUrl: string) => {
    set({ error: null });

    try {
      const response = await axiosClient.delete("/tutor/cccd", {
        data: { imageUrl },
      });

      if (response.success && response.data) {
        // Update the CCCD images in the store
        const currentProfile = get().profileData;
        if (currentProfile && currentProfile.profile) {
          set({
            profileData: {
              ...currentProfile,
              profile: {
                ...currentProfile.profile,
                cccd_images: response.data.cccd_images,
              },
            },
          });
          return true; // Success
        } else {
          throw new Error("Hồ sơ hiện tại không có sẵn");
        }
      } else {
        throw new Error(response.message || "Không thể xóa ảnh CCCD");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể xóa ảnh CCCD";
      set({
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  // Check edit status
  checkEditStatus: async () => {
    set({ isCheckingEditStatus: true, error: null });

    try {
      const response = await VerificationService.checkEditStatus();

      // Debug: Log response structure
      console.log("checkEditStatus response:", response);
      console.log("response.data:", response.data);
      console.log("response.success:", response.success);

      if (response.data) {
        // Check if response.data has the expected structure
        let editStatus: EditStatusResponse;

        if (response.data.data) {
          // API returns { success, message, data: { canEdit, status, warning } }
          editStatus = response.data.data;
        } else if ((response.data as any).canEdit !== undefined) {
          // API returns { success, message, data: { canEdit, status, warning } } directly
          editStatus = response.data as unknown as EditStatusResponse;
        } else {
          throw new Error(
            "Invalid response structure from checkEditStatus API"
          );
        }

        set({
          verificationStatus: editStatus.status,
          canEdit: editStatus.canEdit,
          editWarning: editStatus.warning || null,
          isCheckingEditStatus: false,
        });
        return editStatus;
      } else {
        throw new Error(
          response.message || "Không thể kiểm tra trạng thái chỉnh sửa"
        );
      }
    } catch (error: any) {
      // Handle specific error types
      let errorMessage = "Không thể kiểm tra trạng thái chỉnh sửa";
      let shouldShowError = true;

      if (error.data?.errorType) {
        const errorData: VerificationErrorResponse = error.data;
        switch (errorData.errorType) {
          case "PENDING_REQUEST":
            errorMessage = "Đã có yêu cầu xác thực đang chờ xử lý";
            shouldShowError = false; // Don't show toast for PENDING
            break;
          case "NOT_FOUND":
            errorMessage = "Không tìm thấy thông tin gia sư";
            break;
          case "ACCESS_DENIED":
            errorMessage = "Không có quyền truy cập";
            break;
          case "INTERNAL_ERROR":
            errorMessage = "Lỗi hệ thống, vui lòng thử lại sau";
            break;
        }
      } else {
        // Check if it's a PENDING status response
        if (error.response?.data?.message?.includes("đang chờ xác thực")) {
          shouldShowError = false; // Don't show toast for PENDING
        }
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      }

      set({
        error: shouldShowError ? errorMessage : null, // Only set error if should show
        isCheckingEditStatus: false,
      });

      if (shouldShowError) {
        throw error;
      }

      // Return undefined for PENDING status (no error, but no data either)
      return undefined;
    }
  },

  // Submit for verification
  submitForVerification: async () => {
    set({ isSubmittingVerification: true, error: null });

    try {
      const response =
        await VerificationService.submitTutorProfileVerification();

      // Debug: Log response structure
      console.log("submitForVerification response:", response);

      if (response.success && response.data) {
        // Check if response.data has the expected structure
        let submitResponse: VerificationSubmitResponse;

        if (response.data.data) {
          // API returns { success, message, data: { requestId, status, submittedAt } }
          submitResponse = response.data.data;
        } else if ((response.data as any).requestId) {
          // API returns { success, message, data: { requestId, status, submittedAt } } directly
          submitResponse =
            response.data as unknown as VerificationSubmitResponse;
        } else {
          throw new Error(
            "Invalid response structure from submitForVerification API"
          );
        }

        // Update verification status to PENDING
        set({
          verificationStatus: "PENDING" as VerificationStatus,
          canEdit: false,
          editWarning: null,
          isSubmittingVerification: false,
        });
        return submitResponse;
      } else {
        throw new Error(response.message || "Không thể gửi yêu cầu xác thực");
      }
    } catch (error: any) {
      // Handle specific error types
      let errorMessage = "Không thể gửi yêu cầu xác thực";

      if (error.data?.errorType) {
        const errorData: VerificationErrorResponse = error.data;
        switch (errorData.errorType) {
          case "PENDING_REQUEST":
            errorMessage = "Đã có yêu cầu xác thực đang chờ xử lý";
            break;
          case "NOT_FOUND":
            errorMessage = "Không tìm thấy thông tin gia sư";
            break;
          case "ACCESS_DENIED":
            errorMessage = "Không có quyền truy cập";
            break;
          case "INTERNAL_ERROR":
            errorMessage = "Lỗi hệ thống, vui lòng thử lại sau";
            break;
        }
      } else {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      }

      set({
        error: errorMessage,
        isSubmittingVerification: false,
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null, validationErrors: null });
  },

  // Reset profile
  resetProfile: () => {
    set({
      profileData: null,
      verificationStatus: null,
      canEdit: true,
      editWarning: null,
      isLoading: false,
      isUpdatingPersonal: false,
      isUpdatingIntroduction: false,
      isUploadingCCCD: false,
      isCheckingEditStatus: false,
      isSubmittingVerification: false,
      error: null,
      validationErrors: null,
    });
  },
}));

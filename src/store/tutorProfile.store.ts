import { create } from "zustand";
import axiosClient from "../api/axiosClient";

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
  role: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface TutorProfile {
  id: string;
  user_id: string;
  headline?: string;
  introduction?: string;
  teaching_experience?: string;
  student_levels?: string;
  video_intro_link?: string;
  cccd_images: string[];
  created_at: Date;
  updated_at: Date;
}

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

  // Loading states
  isLoading: boolean;
  isUpdatingPersonal: boolean;
  isUpdatingIntroduction: boolean;
  isUploadingCCCD: boolean;

  // Error states
  error: string | null;
  validationErrors: Array<{ field: string; message: string }> | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updatePersonalInfo: (data: PersonalInfoUpdate) => Promise<void>;
  updateIntroduction: (data: IntroductionUpdate) => Promise<void>;
  uploadCCCDImages: (files: File[]) => Promise<boolean>;
  deleteCCCDImage: (imageUrl: string) => Promise<boolean>;
  clearError: () => void;
  resetProfile: () => void;
}

export const useTutorProfileStore = create<TutorProfileState>((set, get) => ({
  // Initial state
  profileData: null,
  isLoading: false,
  isUpdatingPersonal: false,
  isUpdatingIntroduction: false,
  isUploadingCCCD: false,
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
  updatePersonalInfo: async (data: PersonalInfoUpdate) => {
    set({ isUpdatingPersonal: true, error: null, validationErrors: null });

    try {
      const formData = new FormData();

      // Add text fields
      Object.keys(data).forEach((key) => {
        if (
          key !== "avatar_file" &&
          data[key as keyof PersonalInfoUpdate] !== undefined
        ) {
          formData.append(key, data[key as keyof PersonalInfoUpdate] as string);
        }
      });

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
        throw new Error(
          response.message || "Không thể cập nhật thông tin cá nhân"
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.message || "Không thể cập nhật thông tin cá nhân";
      const validationData = error.data || null;

      set({
        error: errorMessage,
        validationErrors: validationData,
        isUpdatingPersonal: false,
      });
      throw error;
    }
  },

  // Update introduction
  updateIntroduction: async (data: IntroductionUpdate) => {
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
        throw new Error(
          response.message || "Không thể cập nhật thông tin giới thiệu"
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.message || "Không thể cập nhật thông tin giới thiệu";
      const validationData = error.data || null;

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

  // Clear error
  clearError: () => {
    set({ error: null, validationErrors: null });
  },

  // Reset profile
  resetProfile: () => {
    set({
      profileData: null,
      isLoading: false,
      isUpdatingPersonal: false,
      isUpdatingIntroduction: false,
      isUploadingCCCD: false,
      error: null,
      validationErrors: null,
    });
  },
}));

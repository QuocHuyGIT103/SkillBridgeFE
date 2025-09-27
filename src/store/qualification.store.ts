import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import QualificationService from "../services/qualification.service";
import { canDeleteCertificate } from "../utils/qualification.utils";
import type {
  QualificationsData,
  QualificationInfo,
  CreateEducationRequest,
  UpdateEducationRequest,
  CreateCertificateRequest,
  UpdateCertificateRequest,
  CreateAchievementRequest,
  UpdateAchievementRequest,
} from "../types/qualification.types";

interface QualificationState {
  // Data
  qualifications: QualificationsData | null;
  qualificationInfo: QualificationInfo | null;

  // Loading states
  isLoading: boolean;
  isCreatingEducation: boolean;
  isUpdatingEducation: boolean;
  isCreatingCertificate: boolean;
  isUpdatingCertificate: boolean;
  isDeletingCertificate: boolean;
  isCreatingAchievement: boolean;
  isUpdatingAchievement: boolean;
  isDeletingAchievement: boolean;

  // Actions
  fetchQualifications: () => Promise<void>;
  createEducation: (data: CreateEducationRequest) => Promise<void>;
  updateEducation: (data: UpdateEducationRequest) => Promise<void>;
  createCertificate: (data: CreateCertificateRequest) => Promise<void>;
  updateCertificate: (
    id: string,
    data: UpdateCertificateRequest
  ) => Promise<void>;
  deleteCertificate: (id: string) => Promise<void>;
  createAchievement: (data: CreateAchievementRequest) => Promise<void>;
  updateAchievement: (
    id: string,
    data: UpdateAchievementRequest
  ) => Promise<void>;
  deleteAchievement: (id: string) => Promise<void>;

  // Utility actions
  clearQualifications: () => void;
  getQualificationSuggestion: () => string | null;
  canSubmitVerification: () => boolean;
  getPendingCount: () => number;
}

export const useQualificationStore = create<QualificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      qualifications: null,
      qualificationInfo: null,
      isLoading: false,
      isCreatingEducation: false,
      isUpdatingEducation: false,
      isCreatingCertificate: false,
      isUpdatingCertificate: false,
      isDeletingCertificate: false,
      isCreatingAchievement: false,
      isUpdatingAchievement: false,
      isDeletingAchievement: false,

      // ==================== FETCH QUALIFICATIONS ====================
      fetchQualifications: async () => {
        set({ isLoading: true });
        try {
          const response = await QualificationService.getQualifications();
          console.log("Response:", response);
          set({
            qualifications: (response as any).data,
            qualificationInfo: (response as any).qualification,
          });
        } catch (error: any) {
          toast.error(error.message || "Không thể tải thông tin trình độ");
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // ==================== EDUCATION MANAGEMENT ====================
      createEducation: async (data: CreateEducationRequest) => {
        set({ isCreatingEducation: true });
        try {
          const response = await QualificationService.createEducation(data);
          console.log("Create education response:", response);

          // Validate response structure
          if (!response || !(response as any).data) {
            throw new Error("Invalid response structure from API");
          }

          // Update state
          set((state) => {
            const educationData = (response as any).data;
            const qualificationInfo = (response as any).qualification;

            const newState = {
              qualifications: state.qualifications
                ? {
                    ...state.qualifications,
                    education: educationData,
                    qualificationStats: state.qualifications.qualificationStats
                      ? {
                          ...state.qualifications.qualificationStats,
                          totalEducation: 1,
                          verifiedEducation:
                            educationData?.status === "VERIFIED" ? 1 : 0,
                        }
                      : undefined,
                  }
                : {
                    education: educationData,
                    certificates: [],
                    achievements: [],
                    qualificationStats: {
                      totalEducation: 1,
                      totalCertificates: 0,
                      totalAchievements: 0,
                      verifiedEducation:
                        educationData?.status === "VERIFIED" ? 1 : 0,
                      verifiedCertificates: 0,
                      verifiedAchievements: 0,
                    },
                  },
              qualificationInfo: qualificationInfo,
            } as any;

            console.log("Updated qualifications state:", newState);
            return newState;
          });

          // Force a re-render by triggering a small state change
          setTimeout(() => {
            set((state) => ({ ...state }));
          }, 100);

          toast.success("Thêm thông tin học vấn thành công");
        } catch (error: any) {
          toast.error(error.message || "Không thể thêm thông tin học vấn");
          throw error;
        } finally {
          set({ isCreatingEducation: false });
        }
      },

      updateEducation: async (data: UpdateEducationRequest) => {
        set({ isUpdatingEducation: true });
        try {
          const response = await QualificationService.updateEducation(data);
          console.log("Update education response:", response);

          // Validate response structure
          if (!response || !(response as any).data) {
            throw new Error("Invalid response structure from API");
          }

          const educationData = (response as any).data;
          const qualificationInfo = (response as any).qualification;

          // Update state
          set(
            (state) =>
              ({
                qualifications: state.qualifications
                  ? {
                      ...state.qualifications,
                      education: educationData,
                      qualificationStats: state.qualifications
                        .qualificationStats
                        ? {
                            ...state.qualifications.qualificationStats,
                            verifiedEducation:
                              educationData?.status === "VERIFIED" ? 1 : 0,
                          }
                        : undefined,
                    }
                  : {
                      education: educationData,
                      certificates: [],
                      achievements: [],
                      qualificationStats: {
                        totalEducation: 1,
                        totalCertificates: 0,
                        totalAchievements: 0,
                        verifiedEducation:
                          educationData?.status === "VERIFIED" ? 1 : 0,
                        verifiedCertificates: 0,
                        verifiedAchievements: 0,
                      },
                    },
                qualificationInfo: qualificationInfo,
              } as any)
          );

          toast.success("Cập nhật thông tin học vấn thành công");
        } catch (error: any) {
          toast.error(error.message || "Không thể cập nhật thông tin học vấn");
          throw error;
        } finally {
          set({ isUpdatingEducation: false });
        }
      },

      // ==================== CERTIFICATE MANAGEMENT ====================
      createCertificate: async (data: CreateCertificateRequest) => {
        set({ isCreatingCertificate: true });
        try {
          const response = await QualificationService.createCertificate(data);
          const certificateData = (response as any).data;
          const qualificationInfo = (response as any).qualification;

          // Update state
          set(
            (state) =>
              ({
                qualifications: state.qualifications
                  ? {
                      ...state.qualifications,
                      certificates: [
                        ...state.qualifications.certificates,
                        certificateData,
                      ],
                      qualificationStats: state.qualifications
                        .qualificationStats
                        ? {
                            ...state.qualifications.qualificationStats,
                            totalCertificates:
                              state.qualifications.qualificationStats
                                .totalCertificates + 1,
                            verifiedCertificates:
                              state.qualifications.qualificationStats
                                .verifiedCertificates +
                              (certificateData.status === "VERIFIED" ? 1 : 0),
                          }
                        : undefined,
                    }
                  : null,
                qualificationInfo: qualificationInfo,
              } as any)
          );

          toast.success("Thêm chứng chỉ thành công");
        } catch (error: any) {
          toast.error(error.message || "Không thể thêm chứng chỉ");
          throw error;
        } finally {
          set({ isCreatingCertificate: false });
        }
      },

      updateCertificate: async (id: string, data: UpdateCertificateRequest) => {
        set({ isUpdatingCertificate: true });
        try {
          const response = await QualificationService.updateCertificate(
            id,
            data
          );
          const certificateData = (response as any).data;
          const qualificationInfo = (response as any).qualification;

          // Update state
          set((state) => {
            if (!state.qualifications) return state;

            const oldCertificate = state.qualifications.certificates.find(
              (c) => c.id === id
            );
            const wasVerified = oldCertificate?.status === "VERIFIED";
            const isNowVerified = certificateData.status === "VERIFIED";

            return {
              qualifications: {
                ...state.qualifications,
                certificates: state.qualifications.certificates.map((c) =>
                  c.id === id ? certificateData : c
                ),
                qualificationStats: state.qualifications.qualificationStats
                  ? {
                      ...state.qualifications.qualificationStats,
                      verifiedCertificates:
                        state.qualifications.qualificationStats
                          .verifiedCertificates +
                        (isNowVerified ? 1 : 0) -
                        (wasVerified ? 1 : 0),
                    }
                  : undefined,
              },
              qualificationInfo: qualificationInfo,
            } as any;
          });

          toast.success("Cập nhật chứng chỉ thành công");
        } catch (error: any) {
          toast.error(error.message || "Không thể cập nhật chứng chỉ");
          throw error;
        } finally {
          set({ isUpdatingCertificate: false });
        }
      },

      deleteCertificate: async (id: string) => {
        set({ isDeletingCertificate: true });
        try {
          // Validate before deletion
          const state = get();
          if (!state.qualifications) {
            throw new Error("Không tìm thấy thông tin trình độ");
          }

          const validation = canDeleteCertificate(
            id,
            state.qualifications.certificates
          );
          if (!validation.canDelete) {
            throw new Error(validation.reason);
          }

          await QualificationService.deleteCertificate(id);

          // Update state
          set((state) => {
            if (!state.qualifications) return state;

            const certificateToDelete = state.qualifications.certificates.find(
              (c) => c.id === id
            );
            const wasVerified = certificateToDelete?.status === "VERIFIED";

            return {
              qualifications: {
                ...state.qualifications,
                certificates: state.qualifications.certificates.filter(
                  (c) => c.id !== id
                ),
                qualificationStats: state.qualifications.qualificationStats
                  ? {
                      ...state.qualifications.qualificationStats,
                      totalCertificates:
                        state.qualifications.qualificationStats
                          .totalCertificates - 1,
                      verifiedCertificates:
                        state.qualifications.qualificationStats
                          .verifiedCertificates - (wasVerified ? 1 : 0),
                    }
                  : undefined,
              },
            } as any;
          });

          toast.success("Xóa chứng chỉ thành công");
        } catch (error: any) {
          toast.error(error.message || "Không thể xóa chứng chỉ");
          throw error;
        } finally {
          set({ isDeletingCertificate: false });
        }
      },

      // ==================== ACHIEVEMENT MANAGEMENT ====================
      createAchievement: async (data: CreateAchievementRequest) => {
        set({ isCreatingAchievement: true });
        try {
          const response = await QualificationService.createAchievement(data);
          const achievementData = (response as any).data;
          const qualificationInfo = (response as any).qualification;

          // Update state
          set(
            (state) =>
              ({
                qualifications: state.qualifications
                  ? {
                      ...state.qualifications,
                      achievements: [
                        ...state.qualifications.achievements,
                        achievementData,
                      ],
                      qualificationStats: state.qualifications
                        .qualificationStats
                        ? {
                            ...state.qualifications.qualificationStats,
                            totalAchievements:
                              state.qualifications.qualificationStats
                                .totalAchievements + 1,
                            verifiedAchievements:
                              state.qualifications.qualificationStats
                                .verifiedAchievements +
                              (achievementData.status === "VERIFIED" ? 1 : 0),
                          }
                        : undefined,
                    }
                  : null,
                qualificationInfo: qualificationInfo,
              } as any)
          );

          toast.success("Thêm thành tích thành công");
        } catch (error: any) {
          toast.error(error.message || "Không thể thêm thành tích");
          throw error;
        } finally {
          set({ isCreatingAchievement: false });
        }
      },

      updateAchievement: async (id: string, data: UpdateAchievementRequest) => {
        set({ isUpdatingAchievement: true });
        try {
          const response = await QualificationService.updateAchievement(
            id,
            data
          );
          const achievementData = (response as any).data;
          const qualificationInfo = (response as any).qualification;

          // Update state
          set((state) => {
            if (!state.qualifications) return state;

            const oldAchievement = state.qualifications.achievements.find(
              (a) => a.id === id
            );
            const wasVerified = oldAchievement?.status === "VERIFIED";
            const isNowVerified = achievementData.status === "VERIFIED";

            return {
              qualifications: {
                ...state.qualifications,
                achievements: state.qualifications.achievements.map((a) =>
                  a.id === id ? achievementData : a
                ),
                qualificationStats: state.qualifications.qualificationStats
                  ? {
                      ...state.qualifications.qualificationStats,
                      verifiedAchievements:
                        state.qualifications.qualificationStats
                          .verifiedAchievements +
                        (isNowVerified ? 1 : 0) -
                        (wasVerified ? 1 : 0),
                    }
                  : undefined,
              },
              qualificationInfo: qualificationInfo,
            } as any;
          });

          toast.success("Cập nhật thành tích thành công");
        } catch (error: any) {
          toast.error(error.message || "Không thể cập nhật thành tích");
          throw error;
        } finally {
          set({ isUpdatingAchievement: false });
        }
      },

      deleteAchievement: async (id: string) => {
        set({ isDeletingAchievement: true });
        try {
          await QualificationService.deleteAchievement(id);

          // Update state
          set((state) => {
            if (!state.qualifications) return state;

            const achievementToDelete = state.qualifications.achievements.find(
              (a) => a.id === id
            );
            const wasVerified = achievementToDelete?.status === "VERIFIED";

            return {
              qualifications: {
                ...state.qualifications,
                achievements: state.qualifications.achievements.filter(
                  (a) => a.id !== id
                ),
                qualificationStats: state.qualifications.qualificationStats
                  ? {
                      ...state.qualifications.qualificationStats,
                      totalAchievements:
                        state.qualifications.qualificationStats
                          .totalAchievements - 1,
                      verifiedAchievements:
                        state.qualifications.qualificationStats
                          .verifiedAchievements - (wasVerified ? 1 : 0),
                    }
                  : undefined,
              },
            } as any;
          });

          toast.success("Xóa thành tích thành công");
        } catch (error: any) {
          toast.error(error.message || "Không thể xóa thành tích");
          throw error;
        } finally {
          set({ isDeletingAchievement: false });
        }
      },

      // ==================== UTILITY FUNCTIONS ====================
      clearQualifications: () => {
        set({
          qualifications: null,
          qualificationInfo: null,
        });
      },

      getQualificationSuggestion: () => {
        const state = get();
        return state.qualificationInfo?.suggestion || null;
      },

      canSubmitVerification: () => {
        const state = get();
        return state.qualificationInfo?.canSubmitVerification || false;
      },

      getPendingCount: () => {
        const state = get();
        return state.qualificationInfo?.pendingVerificationCount || 0;
      },
    }),
    {
      name: "qualification-storage",
      partialize: (state) => ({
        qualifications: state.qualifications,
        qualificationInfo: state.qualificationInfo,
      }),
    }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import achievementService from "../services/achievement.service";
import type {
  Achievement,
  CreateAchievementFormData,
  UpdateAchievementFormData,
} from "../services/achievement.service";

interface AchievementState {
  achievements: Achievement[];
  achievementTypes: Record<string, string> | null;
  achievementLevels: Record<string, string> | null;
  currentAchievement: Achievement | null;
  isLoading: boolean;
  isSubmitting: boolean;

  // Actions
  fetchAchievements: () => Promise<void>;
  fetchAchievementTypes: () => Promise<void>;
  fetchAchievementLevels: () => Promise<void>;
  fetchAchievementById: (id: string) => Promise<void>;
  createAchievement: (data: CreateAchievementFormData) => Promise<void>;
  updateAchievement: (
    id: string,
    data: UpdateAchievementFormData
  ) => Promise<void>;
  deleteAchievement: (id: string) => Promise<void>;
  deleteAchievementImage: (id: string) => Promise<void>;
  clearCurrentAchievement: () => void;
  clearAchievements: () => void;
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      achievements: [],
      achievementTypes: null,
      achievementLevels: null,
      currentAchievement: null,
      isLoading: false,
      isSubmitting: false,

      fetchAchievements: async () => {
        set({ isLoading: true });
        try {
          const response = await achievementService.getAchievements();

          if (response.success && response.data) {
            set({ achievements: response.data });
          } else {
            toast.error(response.message || "Không thể tải dữ liệu thành tích");
          }
        } catch (error: any) {
          toast.error(
            error.message || "Đã xảy ra lỗi khi tải dữ liệu thành tích"
          );
          console.error("Error fetching achievements:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchAchievementTypes: async () => {
        try {
          const response = await achievementService.getAchievementTypes();

          if (response.success && response.data) {
            set({ achievementTypes: response.data.types });
          } else {
            toast.error(
              response.message || "Không thể tải danh sách loại thành tích"
            );
          }
        } catch (error: any) {
          toast.error(
            error.message || "Đã xảy ra lỗi khi tải danh sách loại thành tích"
          );
          console.error("Error fetching achievement types:", error);
        }
      },

      fetchAchievementLevels: async () => {
        try {
          const response = await achievementService.getAchievementLevels();

          if (response.success && response.data) {
            set({ achievementLevels: response.data.levels });
          } else {
            toast.error(
              response.message || "Không thể tải danh sách cấp độ thành tích"
            );
          }
        } catch (error: any) {
          toast.error(
            error.message || "Đã xảy ra lỗi khi tải danh sách cấp độ thành tích"
          );
          console.error("Error fetching achievement levels:", error);
        }
      },

      fetchAchievementById: async (id: string) => {
        set({ isLoading: true });
        try {
          const response = await achievementService.getAchievementById(id);

          if (response.success && response.data) {
            set({ currentAchievement: response.data });
          } else {
            toast.error(
              response.message || "Không thể tải thông tin thành tích"
            );
          }
        } catch (error: any) {
          toast.error(
            error.message || "Đã xảy ra lỗi khi tải thông tin thành tích"
          );
          console.error("Error fetching achievement:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      createAchievement: async (data: CreateAchievementFormData) => {
        set({ isSubmitting: true });
        try {
          const response = await achievementService.createAchievement(data);

          if (response.success && response.data) {
            const currentAchievements = get().achievements;
            set({
              achievements: [...currentAchievements, response.data],
              currentAchievement: response.data,
            });
            toast.success(response.message || "Thêm thành tích thành công!");
          } else {
            toast.error(response.message || "Thêm thành tích thất bại");
            throw new Error(response.message || "Thêm thành tích thất bại");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi thêm thành tích");
          throw error;
        } finally {
          set({ isSubmitting: false });
        }
      },

      updateAchievement: async (
        id: string,
        data: UpdateAchievementFormData
      ) => {
        set({ isSubmitting: true });
        try {
          const response = await achievementService.updateAchievement(id, data);

          if (response.success && response.data) {
            const currentAchievements = get().achievements;
            const updatedAchievements = currentAchievements.map((achievement) =>
              achievement._id === id ? response.data : achievement
            );
            set({
              achievements: updatedAchievements,
              currentAchievement: response.data,
            });
            toast.success(
              response.message || "Cập nhật thành tích thành công!"
            );
          } else {
            toast.error(response.message || "Cập nhật thành tích thất bại");
            throw new Error(response.message || "Cập nhật thành tích thất bại");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi cập nhật thành tích");
          throw error;
        } finally {
          set({ isSubmitting: false });
        }
      },

      deleteAchievement: async (id: string) => {
        set({ isSubmitting: true });
        try {
          const response = await achievementService.deleteAchievement(id);

          if (response.success) {
            const currentAchievements = get().achievements;
            const filteredAchievements = currentAchievements.filter(
              (achievement) => achievement._id !== id
            );
            set({
              achievements: filteredAchievements,
              currentAchievement:
                get().currentAchievement?._id === id
                  ? null
                  : get().currentAchievement,
            });
            toast.success(response.message || "Xóa thành tích thành công!");
          } else {
            toast.error(response.message || "Xóa thành tích thất bại");
            throw new Error(response.message || "Xóa thành tích thất bại");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi xóa thành tích");
          throw error;
        } finally {
          set({ isSubmitting: false });
        }
      },

      deleteAchievementImage: async (id: string) => {
        set({ isSubmitting: true });
        try {
          const response = await achievementService.deleteAchievementImage(id);

          if (response.success && response.data) {
            const currentAchievements = get().achievements;
            const updatedAchievements = currentAchievements.map((achievement) =>
              achievement._id === id ? response.data : achievement
            );
            set({
              achievements: updatedAchievements,
              currentAchievement:
                get().currentAchievement?._id === id
                  ? response.data
                  : get().currentAchievement,
            });
            toast.success(response.message || "Xóa ảnh thành tích thành công!");
          } else {
            toast.error(response.message || "Xóa ảnh thành tích thất bại");
            throw new Error(response.message || "Xóa ảnh thành tích thất bại");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi xóa ảnh thành tích");
          throw error;
        } finally {
          set({ isSubmitting: false });
        }
      },

      clearCurrentAchievement: () => {
        set({ currentAchievement: null });
      },

      clearAchievements: () => {
        set({
          achievements: [],
          currentAchievement: null,
          achievementTypes: null,
          achievementLevels: null,
        });
      },
    }),
    {
      name: "achievement-store",
      // Only persist the data, not loading states
      partialize: (state) => ({
        achievements: state.achievements,
        achievementTypes: state.achievementTypes,
        achievementLevels: state.achievementLevels,
        currentAchievement: state.currentAchievement,
      }),
    }
  )
);

export default useAchievementStore;

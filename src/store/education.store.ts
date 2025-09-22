import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import educationService from "../services/education.service";
import type {
  Education,
  CreateEducationFormData,
  UpdateEducationFormData,
} from "../services/education.service";

interface EducationState {
  educations: Education[];
  educationLevels: Record<string, string> | null;
  currentEducation: Education | null;
  isLoading: boolean;
  isSubmitting: boolean;

  // Actions
  fetchEducations: () => Promise<void>;
  fetchEducationLevels: () => Promise<void>;
  fetchEducationById: (id: string) => Promise<void>;
  createEducation: (data: CreateEducationFormData) => Promise<void>;
  updateEducation: (id: string, data: UpdateEducationFormData) => Promise<void>;
  deleteEducation: (id: string) => Promise<void>;
  deleteDegreeImage: (id: string) => Promise<void>;
  clearCurrentEducation: () => void;
  clearEducations: () => void;
}

export const useEducationStore = create<EducationState>()(
  persist(
    (set, get) => ({
      educations: [],
      educationLevels: null,
      currentEducation: null,
      isLoading: false,
      isSubmitting: false,

      fetchEducations: async () => {
        set({ isLoading: true });
        try {
          const response = await educationService.getEducations();

          if (response.success && response.data) {
            // Backend returns single education object, not array
            const educationArray = Array.isArray(response.data)
              ? response.data
              : [response.data];
            set({ educations: educationArray });
          } else {
            toast.error(response.message || "Không thể tải dữ liệu học vấn");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi tải dữ liệu học vấn");
          console.error("Error fetching educations:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchEducationLevels: async () => {
        try {
          const response = await educationService.getEducationLevels();

          if (response.success && response.data) {
            set({ educationLevels: response.data.levels });
          } else {
            toast.error(response.message || "Không thể tải danh sách bậc học");
          }
        } catch (error: any) {
          toast.error(
            error.message || "Đã xảy ra lỗi khi tải danh sách bậc học"
          );
          console.error("Error fetching education levels:", error);
        }
      },

      fetchEducationById: async (id: string) => {
        set({ isLoading: true });
        try {
          const response = await educationService.getEducationById(id);

          if (response.success && response.data) {
            set({ currentEducation: response.data });
          } else {
            toast.error(response.message || "Không thể tải thông tin học vấn");
          }
        } catch (error: any) {
          toast.error(
            error.message || "Đã xảy ra lỗi khi tải thông tin học vấn"
          );
          console.error("Error fetching education:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      createEducation: async (data: CreateEducationFormData) => {
        set({ isSubmitting: true });
        try {
          const response = await educationService.createEducation(data);

          if (response.success && response.data) {
            const currentEducations = get().educations;
            set({
              educations: [...currentEducations, response.data],
              currentEducation: response.data,
            });
            toast.success(response.message || "Thêm học vấn thành công!");
          } else {
            toast.error(response.message || "Thêm học vấn thất bại");
            throw new Error(response.message || "Thêm học vấn thất bại");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi thêm học vấn");
          throw error;
        } finally {
          set({ isSubmitting: false });
        }
      },

      updateEducation: async (id: string, data: UpdateEducationFormData) => {
        set({ isSubmitting: true });
        try {
          const response = await educationService.updateEducation(id, data);

          if (response.success && response.data) {
            const currentEducations = get().educations;
            const updatedEducations = currentEducations.map((education) =>
              education._id === id ? response.data : education
            );
            set({
              educations: updatedEducations,
              currentEducation: response.data,
            });
            toast.success(response.message || "Cập nhật học vấn thành công!");
          } else {
            toast.error(response.message || "Cập nhật học vấn thất bại");
            throw new Error(response.message || "Cập nhật học vấn thất bại");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi cập nhật học vấn");
          throw error;
        } finally {
          set({ isSubmitting: false });
        }
      },

      deleteEducation: async (id: string) => {
        set({ isSubmitting: true });
        try {
          const response = await educationService.deleteEducation(id);

          if (response.success) {
            const currentEducations = get().educations;
            const filteredEducations = currentEducations.filter(
              (education) => education._id !== id
            );
            set({
              educations: filteredEducations,
              currentEducation:
                get().currentEducation?._id === id
                  ? null
                  : get().currentEducation,
            });
            toast.success(response.message || "Xóa học vấn thành công!");
          } else {
            toast.error(response.message || "Xóa học vấn thất bại");
            throw new Error(response.message || "Xóa học vấn thất bại");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi xóa học vấn");
          throw error;
        } finally {
          set({ isSubmitting: false });
        }
      },

      deleteDegreeImage: async (id: string) => {
        set({ isSubmitting: true });
        try {
          const response = await educationService.deleteDegreeImage(id);

          if (response.success && response.data) {
            const currentEducations = get().educations;
            const updatedEducations = currentEducations.map((education) =>
              education._id === id ? response.data : education
            );
            set({
              educations: updatedEducations,
              currentEducation:
                get().currentEducation?._id === id
                  ? response.data
                  : get().currentEducation,
            });
            toast.success(response.message || "Xóa ảnh bằng cấp thành công!");
          } else {
            toast.error(response.message || "Xóa ảnh bằng cấp thất bại");
            throw new Error(response.message || "Xóa ảnh bằng cấp thất bại");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi xóa ảnh bằng cấp");
          throw error;
        } finally {
          set({ isSubmitting: false });
        }
      },

      clearCurrentEducation: () => {
        set({ currentEducation: null });
      },

      clearEducations: () => {
        set({
          educations: [],
          currentEducation: null,
          educationLevels: null,
        });
      },
    }),
    {
      name: "education-store",
      // Only persist the data, not loading states
      partialize: (state) => ({
        educations: state.educations,
        educationLevels: state.educationLevels,
        currentEducation: state.currentEducation,
      }),
    }
  )
);

export default useEducationStore;

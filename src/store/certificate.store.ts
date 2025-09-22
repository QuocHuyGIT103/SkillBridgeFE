import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import certificateService from "../services/certificate.service";
import type {
  Certificate,
  CreateCertificateFormData,
  UpdateCertificateFormData,
} from "../services/certificate.service";

interface CertificateState {
  certificates: Certificate[];
  currentCertificate: Certificate | null;
  isLoading: boolean;
  isSubmitting: boolean;

  // Actions
  fetchCertificates: () => Promise<void>;
  fetchCertificateById: (id: string) => Promise<void>;
  createCertificate: (data: CreateCertificateFormData) => Promise<void>;
  updateCertificate: (
    id: string,
    data: UpdateCertificateFormData
  ) => Promise<void>;
  deleteCertificate: (id: string) => Promise<void>;
  deleteCertificateImage: (id: string) => Promise<void>;
  clearCurrentCertificate: () => void;
  clearCertificates: () => void;
}

export const useCertificateStore = create<CertificateState>()(
  persist(
    (set, get) => ({
      certificates: [],
      currentCertificate: null,
      isLoading: false,
      isSubmitting: false,

      fetchCertificates: async () => {
        set({ isLoading: true });
        try {
          const response = await certificateService.getCertificates();

          if (response.success && response.data) {
            set({ certificates: response.data });
          } else {
            toast.error(response.message || "Không thể tải dữ liệu chứng chỉ");
          }
        } catch (error: any) {
          toast.error(
            error.message || "Đã xảy ra lỗi khi tải dữ liệu chứng chỉ"
          );
          console.error("Error fetching certificates:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchCertificateById: async (id: string) => {
        set({ isLoading: true });
        try {
          const response = await certificateService.getCertificateById(id);

          if (response.success && response.data) {
            set({ currentCertificate: response.data });
          } else {
            toast.error(
              response.message || "Không thể tải thông tin chứng chỉ"
            );
          }
        } catch (error: any) {
          toast.error(
            error.message || "Đã xảy ra lỗi khi tải thông tin chứng chỉ"
          );
          console.error("Error fetching certificate:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      createCertificate: async (data: CreateCertificateFormData) => {
        set({ isSubmitting: true });
        try {
          const response = await certificateService.createCertificate(data);

          if (response.success && response.data) {
            const currentCertificates = get().certificates;
            set({
              certificates: [...currentCertificates, response.data],
              currentCertificate: response.data,
            });
            toast.success(response.message || "Thêm chứng chỉ thành công!");
          } else {
            toast.error(response.message || "Thêm chứng chỉ thất bại");
            throw new Error(response.message || "Thêm chứng chỉ thất bại");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi thêm chứng chỉ");
          throw error;
        } finally {
          set({ isSubmitting: false });
        }
      },

      updateCertificate: async (
        id: string,
        data: UpdateCertificateFormData
      ) => {
        set({ isSubmitting: true });
        try {
          const response = await certificateService.updateCertificate(id, data);

          if (response.success && response.data) {
            const currentCertificates = get().certificates;
            const updatedCertificates = currentCertificates.map((certificate) =>
              certificate._id === id ? response.data : certificate
            );
            set({
              certificates: updatedCertificates,
              currentCertificate: response.data,
            });
            toast.success(response.message || "Cập nhật chứng chỉ thành công!");
          } else {
            toast.error(response.message || "Cập nhật chứng chỉ thất bại");
            throw new Error(response.message || "Cập nhật chứng chỉ thất bại");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi cập nhật chứng chỉ");
          throw error;
        } finally {
          set({ isSubmitting: false });
        }
      },

      deleteCertificate: async (id: string) => {
        set({ isSubmitting: true });
        try {
          const response = await certificateService.deleteCertificate(id);

          if (response.success) {
            const currentCertificates = get().certificates;
            const filteredCertificates = currentCertificates.filter(
              (certificate) => certificate._id !== id
            );
            set({
              certificates: filteredCertificates,
              currentCertificate:
                get().currentCertificate?._id === id
                  ? null
                  : get().currentCertificate,
            });
            toast.success(response.message || "Xóa chứng chỉ thành công!");
          } else {
            toast.error(response.message || "Xóa chứng chỉ thất bại");
            throw new Error(response.message || "Xóa chứng chỉ thất bại");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi xóa chứng chỉ");
          throw error;
        } finally {
          set({ isSubmitting: false });
        }
      },

      deleteCertificateImage: async (id: string) => {
        set({ isSubmitting: true });
        try {
          const response = await certificateService.deleteCertificateImage(id);

          if (response.success && response.data) {
            const currentCertificates = get().certificates;
            const updatedCertificates = currentCertificates.map((certificate) =>
              certificate._id === id ? response.data : certificate
            );
            set({
              certificates: updatedCertificates,
              currentCertificate:
                get().currentCertificate?._id === id
                  ? response.data
                  : get().currentCertificate,
            });
            toast.success(response.message || "Xóa ảnh chứng chỉ thành công!");
          } else {
            toast.error(response.message || "Xóa ảnh chứng chỉ thất bại");
            throw new Error(response.message || "Xóa ảnh chứng chỉ thất bại");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi xóa ảnh chứng chỉ");
          throw error;
        } finally {
          set({ isSubmitting: false });
        }
      },

      clearCurrentCertificate: () => {
        set({ currentCertificate: null });
      },

      clearCertificates: () => {
        set({
          certificates: [],
          currentCertificate: null,
        });
      },
    }),
    {
      name: "certificate-store",
      // Only persist the data, not loading states
      partialize: (state) => ({
        certificates: state.certificates,
        currentCertificate: state.currentCertificate,
      }),
    }
  )
);

export default useCertificateStore;

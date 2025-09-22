import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import verificationService from "../services/verification.service";
import type {
  VerificationRequest,
  VerificationStatusResponse,
  VerificationStatus,
} from "../services/verification.service";

interface VerificationState {
  verificationRequests: VerificationRequest[];
  currentVerificationRequest: VerificationRequest | null;
  verificationStatus: VerificationStatusResponse | null;
  isLoading: boolean;
  isSubmitting: boolean;

  // Actions
  createVerificationRequest: () => Promise<void>;
  fetchVerificationStatus: () => Promise<void>;
  fetchVerificationRequestById: (id: string) => Promise<void>;
  fetchAllVerificationRequests: (params?: {
    page?: number;
    limit?: number;
    status?: VerificationStatus;
    tutor_id?: string;
  }) => Promise<void>;
  reviewVerificationRequest: (
    id: string,
    data: { status: VerificationStatus; admin_feedback?: string }
  ) => Promise<void>;
  cancelVerificationRequest: (id: string) => Promise<void>;
  clearCurrentVerificationRequest: () => void;
  clearVerificationData: () => void;
}

export const useVerificationStore = create<VerificationState>()(
  persist(
    (set, get) => ({
      verificationRequests: [],
      currentVerificationRequest: null,
      verificationStatus: null,
      isLoading: false,
      isSubmitting: false,

      createVerificationRequest: async () => {
        set({ isSubmitting: true });
        try {
          const response =
            await verificationService.createVerificationRequest();

          if (response.success && response.data) {
            set({
              currentVerificationRequest: response.data,
              verificationStatus: {
                has_request: true,
                verification_request: response.data,
              },
            });
            toast.success(
              response.message ||
                "Yêu cầu xác thực đã được gửi thành công. Admin sẽ xem xét và phản hồi sớm nhất có thể."
            );
          } else {
            toast.error(response.message || "Tạo yêu cầu xác thực thất bại");
            throw new Error(
              response.message || "Tạo yêu cầu xác thực thất bại"
            );
          }
        } catch (error: any) {
          toast.error(
            error.message || "Đã xảy ra lỗi khi tạo yêu cầu xác thực"
          );
          throw error;
        } finally {
          set({ isSubmitting: false });
        }
      },

      fetchVerificationStatus: async () => {
        set({ isLoading: true });
        try {
          const response = await verificationService.getVerificationStatus();

          if (response.success && response.data) {
            set({ verificationStatus: response.data });
          } else {
            toast.error(
              response.message || "Không thể tải trạng thái xác thực"
            );
          }
        } catch (error: any) {
          toast.error(
            error.message || "Đã xảy ra lỗi khi tải trạng thái xác thực"
          );
          console.error("Error fetching verification status:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchVerificationRequestById: async (id: string) => {
        set({ isLoading: true });
        try {
          const response = await verificationService.getVerificationRequestById(
            id
          );

          if (response.success && response.data) {
            set({ currentVerificationRequest: response.data });
          } else {
            toast.error(
              response.message || "Không thể tải thông tin yêu cầu xác thực"
            );
          }
        } catch (error: any) {
          toast.error(
            error.message || "Đã xảy ra lỗi khi tải thông tin yêu cầu xác thực"
          );
          console.error("Error fetching verification request:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchAllVerificationRequests: async (params) => {
        set({ isLoading: true });
        try {
          const response = await verificationService.getAllVerificationRequests(
            params
          );

          if (response.success && response.data) {
            set({ verificationRequests: response.data });
          } else {
            toast.error(
              response.message || "Không thể tải danh sách yêu cầu xác thực"
            );
          }
        } catch (error: any) {
          toast.error(
            error.message || "Đã xảy ra lỗi khi tải danh sách yêu cầu xác thực"
          );
          console.error("Error fetching verification requests:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      reviewVerificationRequest: async (
        id: string,
        data: { status: VerificationStatus; admin_feedback?: string }
      ) => {
        set({ isSubmitting: true });
        try {
          const response = await verificationService.reviewVerificationRequest(
            id,
            data
          );

          if (response.success && response.data) {
            const currentRequests = get().verificationRequests;
            const updatedRequests = currentRequests.map((request) =>
              request._id === id ? response.data : request
            );

            set({
              verificationRequests: updatedRequests,
              currentVerificationRequest:
                get().currentVerificationRequest?._id === id
                  ? response.data
                  : get().currentVerificationRequest,
            });

            const statusText =
              data.status === "approved" ? "phê duyệt" : "từ chối";
            toast.success(
              response.message ||
                `${
                  statusText.charAt(0).toUpperCase() + statusText.slice(1)
                } yêu cầu xác thực thành công!`
            );
          } else {
            toast.error(response.message || "Xử lý yêu cầu xác thực thất bại");
            throw new Error(
              response.message || "Xử lý yêu cầu xác thực thất bại"
            );
          }
        } catch (error: any) {
          toast.error(
            error.message || "Đã xảy ra lỗi khi xử lý yêu cầu xác thực"
          );
          throw error;
        } finally {
          set({ isSubmitting: false });
        }
      },

      cancelVerificationRequest: async (id: string) => {
        set({ isSubmitting: true });
        try {
          const response = await verificationService.cancelVerificationRequest(
            id
          );

          if (response.success) {
            const currentRequests = get().verificationRequests;
            const filteredRequests = currentRequests.filter(
              (request) => request._id !== id
            );

            set({
              verificationRequests: filteredRequests,
              currentVerificationRequest:
                get().currentVerificationRequest?._id === id
                  ? null
                  : get().currentVerificationRequest,
              verificationStatus:
                get().verificationStatus?.verification_request?._id === id
                  ? { has_request: false }
                  : get().verificationStatus,
            });
            toast.success(
              response.message || "Hủy yêu cầu xác thực thành công!"
            );
          } else {
            toast.error(response.message || "Hủy yêu cầu xác thực thất bại");
            throw new Error(
              response.message || "Hủy yêu cầu xác thực thất bại"
            );
          }
        } catch (error: any) {
          toast.error(
            error.message || "Đã xảy ra lỗi khi hủy yêu cầu xác thực"
          );
          throw error;
        } finally {
          set({ isSubmitting: false });
        }
      },

      clearCurrentVerificationRequest: () => {
        set({ currentVerificationRequest: null });
      },

      clearVerificationData: () => {
        set({
          verificationRequests: [],
          currentVerificationRequest: null,
          verificationStatus: null,
        });
      },
    }),
    {
      name: "verification-store",
      // Only persist the data, not loading states
      partialize: (state) => ({
        verificationRequests: state.verificationRequests,
        currentVerificationRequest: state.currentVerificationRequest,
        verificationStatus: state.verificationStatus,
      }),
    }
  )
);

export default useVerificationStore;

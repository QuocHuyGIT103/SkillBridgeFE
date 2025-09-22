import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-hot-toast";
import verificationService from "../services/verification.service";
import type {
  VerificationRequestWithPopulatedData,
  ApproveVerificationData,
  RejectVerificationData,
} from "../types/verification.types";

interface VerificationState {
  // Data
  currentVerificationRequest: VerificationRequestWithPopulatedData | null;
  verificationHistory: VerificationRequestWithPopulatedData[];
  pendingRequests: VerificationRequestWithPopulatedData[]; // Admin only
  allRequests: VerificationRequestWithPopulatedData[]; // Admin only - for history page
  selectedRequest: VerificationRequestWithPopulatedData | null; // Admin only

  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  isCreatingRequest: boolean;

  // Tutor Actions
  createVerificationRequest: () => Promise<void>;
  fetchVerificationStatus: () => Promise<void>;
  fetchVerificationHistory: () => Promise<void>;

  // Admin Actions
  fetchPendingRequests: () => Promise<void>;
  fetchAllRequests: () => Promise<void>;
  fetchVerificationRequestById: (requestId: string) => Promise<void>;
  approveVerificationRequest: (
    requestId: string,
    data: ApproveVerificationData
  ) => Promise<void>;
  rejectVerificationRequest: (
    requestId: string,
    data: RejectVerificationData
  ) => Promise<void>;

  // Utility Actions
  clearCurrentRequest: () => void;
  clearSelectedRequest: () => void;
  clearVerificationData: () => void;
}

export const useVerificationStore = create<VerificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentVerificationRequest: null,
      verificationHistory: [],
      pendingRequests: [],
      allRequests: [],
      selectedRequest: null,
      isLoading: false,
      isSubmitting: false,
      isCreatingRequest: false,

      // Tutor Actions
      createVerificationRequest: async () => {
        set({ isCreatingRequest: true });
        try {
          const response =
            await verificationService.createVerificationRequest();

          if (response.success && response.data) {
            // Fetch updated status after creating request
            await get().fetchVerificationStatus();
            toast.success(
              response.message || "Yêu cầu xác thực đã được gửi thành công!"
            );
          } else {
            toast.error(response.message || "Không thể tạo yêu cầu xác thực");
            throw new Error(
              response.message || "Không thể tạo yêu cầu xác thực"
            );
          }
        } catch (error: any) {
          toast.error(
            error.message || "Đã xảy ra lỗi khi tạo yêu cầu xác thực"
          );
          throw error;
        } finally {
          set({ isCreatingRequest: false });
        }
      },

      fetchVerificationStatus: async () => {
        set({ isLoading: true });
        try {
          const response = await verificationService.getVerificationStatus();

          if (response.success) {
            set({ currentVerificationRequest: response.data });
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

      fetchVerificationHistory: async () => {
        set({ isLoading: true });
        try {
          const response = await verificationService.getVerificationHistory();

          if (response.success && response.data) {
            set({ verificationHistory: response.data });
          } else {
            toast.error(response.message || "Không thể tải lịch sử xác thực");
          }
        } catch (error: any) {
          toast.error(
            error.message || "Đã xảy ra lỗi khi tải lịch sử xác thực"
          );
          console.error("Error fetching verification history:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Admin Actions
      fetchPendingRequests: async () => {
        set({ isLoading: true });
        try {
          const response = await verificationService.getPendingRequests();

          if (response.success && response.data) {
            set({ pendingRequests: response.data });
          } else {
            toast.error(
              response.message || "Không thể tải danh sách yêu cầu xác thực"
            );
          }
        } catch (error: any) {
          toast.error(
            error.message || "Đã xảy ra lỗi khi tải danh sách yêu cầu xác thực"
          );
          console.error("Error fetching pending requests:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchAllRequests: async () => {
        set({ isLoading: true });
        try {
          const response = await verificationService.getAllRequests();

          if (response.success && response.data) {
            set({ allRequests: response.data });
          } else {
            toast.error(
              response.message ||
                "Không thể tải danh sách tất cả yêu cầu xác thực"
            );
          }
        } catch (error: any) {
          toast.error(
            error.message ||
              "Đã xảy ra lỗi khi tải danh sách tất cả yêu cầu xác thực"
          );
          console.error("Error fetching all requests:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchVerificationRequestById: async (requestId: string) => {
        set({ isLoading: true });
        try {
          const response = await verificationService.getVerificationRequestById(
            requestId
          );

          if (response.success && response.data) {
            set({ selectedRequest: response.data });
          } else {
            toast.error(
              response.message || "Không thể tải chi tiết yêu cầu xác thực"
            );
          }
        } catch (error: any) {
          toast.error(
            error.message || "Đã xảy ra lỗi khi tải chi tiết yêu cầu xác thực"
          );
          console.error("Error fetching verification request:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      approveVerificationRequest: async (
        requestId: string,
        data: ApproveVerificationData
      ) => {
        set({ isSubmitting: true });
        try {
          const response = await verificationService.approveVerificationRequest(
            requestId,
            data
          );

          if (response.success) {
            // Update pending requests list
            const updatedPendingRequests = get().pendingRequests.filter(
              (request) => request._id !== requestId
            );
            set({ pendingRequests: updatedPendingRequests });

            // Clear selected request if it was the approved one
            if (get().selectedRequest?._id === requestId) {
              set({ selectedRequest: null });
            }

            toast.success(
              response.message || "Yêu cầu xác thực đã được phê duyệt!"
            );
          } else {
            toast.error(response.message || "Không thể phê duyệt yêu cầu");
            throw new Error(response.message || "Không thể phê duyệt yêu cầu");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi phê duyệt yêu cầu");
          throw error;
        } finally {
          set({ isSubmitting: false });
        }
      },

      rejectVerificationRequest: async (
        requestId: string,
        data: RejectVerificationData
      ) => {
        set({ isSubmitting: true });
        try {
          const response = await verificationService.rejectVerificationRequest(
            requestId,
            data
          );

          if (response.success) {
            // Update pending requests list
            const updatedPendingRequests = get().pendingRequests.filter(
              (request) => request._id !== requestId
            );
            set({ pendingRequests: updatedPendingRequests });

            // Clear selected request if it was the rejected one
            if (get().selectedRequest?._id === requestId) {
              set({ selectedRequest: null });
            }

            toast.success(
              response.message || "Yêu cầu xác thực đã được từ chối!"
            );
          } else {
            toast.error(response.message || "Không thể từ chối yêu cầu");
            throw new Error(response.message || "Không thể từ chối yêu cầu");
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi từ chối yêu cầu");
          throw error;
        } finally {
          set({ isSubmitting: false });
        }
      },

      // Utility Actions
      clearCurrentRequest: () => {
        set({ currentVerificationRequest: null });
      },

      clearSelectedRequest: () => {
        set({ selectedRequest: null });
      },

      clearVerificationData: () => {
        set({
          currentVerificationRequest: null,
          verificationHistory: [],
          pendingRequests: [],
          selectedRequest: null,
        });
      },
    }),
    {
      name: "verification-store",
      // Only persist the data, not loading states
      partialize: (state) => ({
        currentVerificationRequest: state.currentVerificationRequest,
        verificationHistory: state.verificationHistory,
        pendingRequests: state.pendingRequests,
        selectedRequest: state.selectedRequest,
      }),
    }
  )
);

export default useVerificationStore;

import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import VerificationService from "../services/verification.service";
import type {
  VerificationRequest,
  VerificationDetail,
  CreateVerificationRequest,
  ProcessVerificationRequest,
  RequestStatus,
} from "../types/qualification.types";

interface VerificationState {
  // Data
  tutorRequests: VerificationRequest[];
  adminRequests: VerificationRequest[];
  verificationHistory: VerificationDetail[];
  currentRequest: VerificationRequest | null;

  // Pagination
  tutorPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  adminPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  historyPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;

  // Loading states
  isLoading: boolean;
  isCreatingRequest: boolean;
  isProcessingRequest: boolean;
  isFetchingTutorRequests: boolean;
  isFetchingAdminRequests: boolean;
  isFetchingHistory: boolean;
  isFetchingDetail: boolean;

  // Actions - Tutor
  createVerificationRequest: (data: CreateVerificationRequest) => Promise<void>;
  fetchTutorVerificationRequests: (params?: {
    page?: number;
    limit?: number;
  }) => Promise<void>;

  // Actions - Admin
  fetchAdminVerificationRequests: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    tutorId?: string;
  }) => Promise<void>;
  fetchVerificationRequestDetail: (id: string) => Promise<void>;
  processVerificationRequest: (
    id: string,
    data: ProcessVerificationRequest
  ) => Promise<void>;
  fetchVerificationHistory: (params?: {
    page?: number;
    limit?: number;
    tutorId?: string;
    targetType?: string;
    status?: string;
  }) => Promise<void>;

  // Utility actions
  clearVerificationData: () => void;
  clearCurrentRequest: () => void;
  getRequestById: (id: string) => VerificationRequest | undefined;
  getPendingRequestsCount: () => number;
}

export const useVerificationStore = create<VerificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      tutorRequests: [],
      adminRequests: [],
      verificationHistory: [],
      currentRequest: null,
      tutorPagination: null,
      adminPagination: null,
      historyPagination: null,
      isLoading: false,
      isCreatingRequest: false,
      isProcessingRequest: false,
      isFetchingTutorRequests: false,
      isFetchingAdminRequests: false,
      isFetchingHistory: false,
      isFetchingDetail: false,

      // ==================== TUTOR ACTIONS ====================
      createVerificationRequest: async (data: CreateVerificationRequest) => {
        set({ isCreatingRequest: true });
        try {
          const response = await VerificationService.createVerificationRequest(
            data
          );

          // Add to tutor requests
          const requestData = (response as any).data;
          set((state) => ({
            tutorRequests: [requestData, ...state.tutorRequests],
          }));

          toast.success("Gửi yêu cầu xác thực thành công");
        } catch (error: any) {
          toast.error(error.message || "Không thể gửi yêu cầu xác thực");
          throw error;
        } finally {
          set({ isCreatingRequest: false });
        }
      },

      fetchTutorVerificationRequests: async (params?: {
        page?: number;
        limit?: number;
      }) => {
        set({ isFetchingTutorRequests: true });
        try {
          const response =
            await VerificationService.getTutorVerificationRequests(params);

          const responseData = (response as any).data;
          set({
            tutorRequests: responseData.requests,
            tutorPagination: responseData.pagination,
          });
        } catch (error: any) {
          toast.error(
            error.message || "Không thể tải danh sách yêu cầu xác thực"
          );
          throw error;
        } finally {
          set({ isFetchingTutorRequests: false });
        }
      },

      // ==================== ADMIN ACTIONS ====================
      fetchAdminVerificationRequests: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        tutorId?: string;
      }) => {
        set({ isFetchingAdminRequests: true });
        try {
          const response =
            await VerificationService.getAdminVerificationRequests(params);

          const responseData = (response as any).data;
          set({
            adminRequests: responseData.requests,
            adminPagination: responseData.pagination,
          });
        } catch (error: any) {
          toast.error(
            error.message || "Không thể tải danh sách yêu cầu xác thực"
          );
          throw error;
        } finally {
          set({ isFetchingAdminRequests: false });
        }
      },

      fetchVerificationRequestDetail: async (id: string) => {
        set({ isFetchingDetail: true });
        try {
          const response =
            await VerificationService.getVerificationRequestDetail(id);

          const requestData = (response as any).data;
          set({
            currentRequest: requestData,
          });
        } catch (error: any) {
          toast.error(
            error.message || "Không thể tải chi tiết yêu cầu xác thực"
          );
          throw error;
        } finally {
          set({ isFetchingDetail: false });
        }
      },

      processVerificationRequest: async (
        id: string,
        data: ProcessVerificationRequest
      ) => {
        set({ isProcessingRequest: true });
        try {
          const response = await VerificationService.processVerificationRequest(
            id,
            data
          );
          const responseData = (response as any).data;

          // Update the request in both admin and tutor lists
          set((state) => ({
            adminRequests: state.adminRequests.map((req) =>
              req._id === id
                ? {
                    ...req,
                    status: responseData.status as RequestStatus,
                    reviewedAt: responseData.reviewedAt,
                    reviewedBy: responseData.reviewedBy
                      ? {
                          _id: responseData.reviewedBy,
                          fullName: "",
                          email: "",
                        }
                      : undefined,
                    adminNote: responseData.adminNote,
                    result: responseData.result,
                  }
                : req
            ),
            tutorRequests: state.tutorRequests.map((req) =>
              req._id === id
                ? {
                    ...req,
                    status: responseData.status as RequestStatus,
                    reviewedAt: responseData.reviewedAt,
                    reviewedBy: responseData.reviewedBy
                      ? {
                          _id: responseData.reviewedBy,
                          fullName: "",
                          email: "",
                        }
                      : undefined,
                    adminNote: responseData.adminNote,
                    result: responseData.result,
                  }
                : req
            ),
            currentRequest:
              state.currentRequest?._id === id
                ? {
                    ...state.currentRequest,
                    status: responseData.status as RequestStatus,
                    reviewedAt: responseData.reviewedAt,
                    reviewedBy: responseData.reviewedBy
                      ? {
                          _id: responseData.reviewedBy,
                          fullName: "",
                          email: "",
                        }
                      : undefined,
                    adminNote: responseData.adminNote,
                    result: responseData.result,
                  }
                : state.currentRequest,
          }));

          toast.success("Xử lý yêu cầu xác thực thành công");
        } catch (error: any) {
          toast.error(error.message || "Không thể xử lý yêu cầu xác thực");
          throw error;
        } finally {
          set({ isProcessingRequest: false });
        }
      },

      fetchVerificationHistory: async (params?: {
        page?: number;
        limit?: number;
        tutorId?: string;
        targetType?: string;
        status?: string;
      }) => {
        set({ isFetchingHistory: true });
        try {
          const response = await VerificationService.getVerificationHistory(
            params
          );

          const responseData = (response as any).data;
          set({
            verificationHistory: responseData.history,
            historyPagination: responseData.pagination,
          });
        } catch (error: any) {
          toast.error(error.message || "Không thể tải lịch sử xác thực");
          throw error;
        } finally {
          set({ isFetchingHistory: false });
        }
      },

      // ==================== UTILITY FUNCTIONS ====================
      clearVerificationData: () => {
        set({
          tutorRequests: [],
          adminRequests: [],
          verificationHistory: [],
          currentRequest: null,
          tutorPagination: null,
          adminPagination: null,
          historyPagination: null,
        });
      },

      clearCurrentRequest: () => {
        set({ currentRequest: null });
      },

      getRequestById: (id: string) => {
        const state = get();
        return (
          state.tutorRequests.find((req) => req._id === id) ||
          state.adminRequests.find((req) => req._id === id) ||
          undefined
        );
      },

      getPendingRequestsCount: () => {
        const state = get();
        return (
          state.tutorRequests.filter((req) => req.status === "PENDING").length +
          state.adminRequests.filter((req) => req.status === "PENDING").length
        );
      },
    }),
    {
      name: "verification-storage",
      partialize: (state) => ({
        tutorRequests: state.tutorRequests,
        tutorPagination: state.tutorPagination,
      }),
    }
  )
);

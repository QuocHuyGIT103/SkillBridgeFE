import { create } from "zustand";
import { toast } from "react-hot-toast";
import { contactRequestService } from "../services/contactRequest.service";
import type {
  ContactRequest,
  CreateContactRequestInput,
  TutorResponseInput,
  CreateLearningClassInput,
  ContactRequestFilters,
} from "../types/contactRequest.types";

interface ContactRequestStore {
  // State
  requests: ContactRequest[];
  currentRequest: ContactRequest | null;
  isLoading: boolean;
  isCreating: boolean;
  isResponding: boolean;
  isCreatingClass: boolean;
  error: string | null;

  // Pagination
  pagination: {
    current: number;
    total: number;
    count: number;
  };

  // Filters
  filters: ContactRequestFilters;

  // Actions
  createContactRequest: (data: CreateContactRequestInput) => Promise<void>;
  createTeachRequestFromTutor: (data: {
    tutorPostId: string;
    studentPostId: string;
    subject: string;
    message: string;
    preferredSchedule?: string;
    expectedPrice?: number;
    sessionDuration?: number;
    learningMode: "ONLINE" | "OFFLINE" | "FLEXIBLE";
  }) => Promise<void>;
  getStudentRequests: (filters?: ContactRequestFilters) => Promise<void>;
  getTutorRequests: (filters?: ContactRequestFilters) => Promise<void>;
  respondToRequest: (
    requestId: string,
    data: TutorResponseInput
  ) => Promise<void>;
  studentRespondToRequest: (
    requestId: string,
    data: { action: "ACCEPT" | "REJECT"; message?: string }
  ) => Promise<void>;
  createLearningClass: (data: CreateLearningClassInput) => Promise<any>; // ✅ Fix return type
  cancelRequest: (requestId: string) => Promise<void>;
  getRequestDetail: (requestId: string) => Promise<void>;

  // Utility actions
  setFilters: (filters: ContactRequestFilters) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  requests: [],
  currentRequest: null,
  isLoading: false,
  isCreating: false,
  isResponding: false,
  isCreatingClass: false,
  error: null,
  pagination: {
    current: 1,
    total: 1,
    count: 0,
  },
  filters: {
    page: 1,
    limit: 10,
  },
};

const getRequestId = (request: any): string => {
  if (!request) return "";
  const rawId = request.id || request._id;
  if (!rawId) return "";
  if (typeof rawId === "string") return rawId;
  if (typeof rawId === "object" && typeof rawId.toString === "function") {
    return rawId.toString();
  }
  return "";
};

export const useContactRequestStore = create<ContactRequestStore>(
  (set, get) => ({
    ...initialState,

    createContactRequest: async (data: CreateContactRequestInput) => {
      set({ isCreating: true, error: null });

      try {
        const response = await contactRequestService.createContactRequest(data);

        if (response.success) {
          // 1. Thông báo thành công ngay lập tức
          toast.success(response.message || "Gửi yêu cầu thành công!");

          // 2. Tải lại danh sách trong một try...catch riêng
          // để lỗi của nó không ảnh hưởng đến luồng chính.
          try {
            const currentFilters = get().filters;
            await get().getStudentRequests(currentFilters);
          } catch (refreshError) {
            console.error("Lỗi khi làm mới danh sách yêu cầu:", refreshError);
            toast.error("Không thể tự động làm mới danh sách.");
          }
        } else {
          throw new Error(response.message);
        }
      } catch (error: any) {
        // Khối catch này bây giờ CHỈ xử lý lỗi của việc TẠO YÊU CẦU
        const message =
          error.response?.data?.message ||
          error.message ||
          "Gửi yêu cầu thất bại";
        set({ error: message });
        toast.error(message);
        throw error;
      } finally {
        set({ isCreating: false });
      }
    },

    getStudentRequests: async (filters: ContactRequestFilters = {}) => {
      set({ isLoading: true, error: null });

      try {
        const mergedFilters = { ...get().filters, ...filters };
        const response = await contactRequestService.getStudentRequests(
          mergedFilters
        );

        if (response.success) {
          set({
            requests: response.data.requests,
            pagination: response.data.pagination,
            filters: mergedFilters,
          });
        } else {
          throw new Error("Không thể lấy danh sách yêu cầu");
        }
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Lỗi khi lấy danh sách yêu cầu";
        set({ error: message });
        console.error("Get student requests error:", error);
      } finally {
        set({ isLoading: false });
      }
    },

    createTeachRequestFromTutor: async (data) => {
      set({ isCreating: true, error: null });
      try {
        const response =
          await contactRequestService.createTeachRequestFromTutor(data);
        if (response.success) {
          toast.success(response.message || "Đã gửi đề nghị dạy");
          // Refresh tutor incoming requests list
          const currentFilters = get().filters;
          await get().getTutorRequests(currentFilters);
        } else {
          throw new Error(response.message);
        }
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Gửi đề nghị thất bại";
        set({ error: message });
        toast.error(message);
        throw error;
      } finally {
        set({ isCreating: false });
      }
    },

    getTutorRequests: async (filters: ContactRequestFilters = {}) => {
      set({ isLoading: true, error: null });

      try {
        const mergedFilters = { ...get().filters, ...filters };
        const response = await contactRequestService.getTutorRequests(
          mergedFilters
        );

        if (response.success) {
          set({
            requests: response.data.requests,
            pagination: response.data.pagination,
            filters: mergedFilters,
          });
        } else {
          throw new Error("Không thể lấy danh sách yêu cầu");
        }
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Lỗi khi lấy danh sách yêu cầu";
        set({ error: message });
        console.error("Get tutor requests error:", error);
      } finally {
        set({ isLoading: false });
      }
    },

    respondToRequest: async (requestId: string, data: TutorResponseInput) => {
      set({ isResponding: true, error: null });

      try {
        const response = await contactRequestService.respondToRequest(
          requestId,
          data
        );

        if (response.success) {
          toast.success(response.message);

          // Update the request in the list
          const requests = get().requests.map((request) =>
            getRequestId(request) === requestId ? response.data! : request
          );
          set({ requests });

          // Update current request if viewing detail
          const currentRequest = get().currentRequest;
          if (currentRequest && getRequestId(currentRequest) === requestId) {
            set({ currentRequest: response.data! });
          }
        } else {
          throw new Error(response.message);
        }
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Phản hồi yêu cầu thất bại";
        set({ error: message });
        toast.error(message);
        throw error;
      } finally {
        set({ isResponding: false });
      }
    },

    studentRespondToRequest: async (requestId, data) => {
      set({ isResponding: true, error: null });
      try {
        const response = await contactRequestService.studentRespondToRequest(
          requestId,
          data
        );
        if (response.success) {
          toast.success(response.message);
          // Update list for student
          const currentFilters = get().filters;
          await get().getStudentRequests(currentFilters);
        } else {
          throw new Error(response.message);
        }
      } catch (error: any) {
        const message =
          error.response?.data?.message || error.message || "Phản hồi thất bại";
        set({ error: message });
        toast.error(message);
        throw error;
      } finally {
        set({ isResponding: false });
      }
    },

    createLearningClass: async (data: CreateLearningClassInput) => {
      set({ isCreatingClass: true, error: null });

      try {
        const response = await contactRequestService.createLearningClass(data);

        if (response.success) {
          toast.success(response.message);

          // Refresh requests to update status
          const currentFilters = get().filters;
          await get().getTutorRequests(currentFilters);

          return response.data;
        } else {
          throw new Error(response.message);
        }
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Tạo lớp học thất bại";
        set({ error: message });
        toast.error(message);
        throw error;
      } finally {
        set({ isCreatingClass: false });
      }
    },

    cancelRequest: async (requestId: string) => {
      set({ isLoading: true, error: null });

      try {
        const response = await contactRequestService.cancelRequest(requestId);

        if (response.success) {
          toast.success(response.message);

          // Remove or update the request in the list
          const requests = get().requests.map((request) =>
            getRequestId(request) === requestId
              ? { ...request, status: "CANCELLED" as const }
              : request
          );
          set({ requests });
        } else {
          throw new Error(response.message);
        }
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Hủy yêu cầu thất bại";
        set({ error: message });
        toast.error(message);
      } finally {
        set({ isLoading: false });
      }
    },

    getRequestDetail: async (requestId: string) => {
      set({ isLoading: true, error: null });

      try {
        const response = await contactRequestService.getRequestDetail(
          requestId
        );

        if (response.success) {
          set({ currentRequest: response.data! });
        } else {
          throw new Error("Không thể lấy thông tin yêu cầu");
        }
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Lỗi khi lấy thông tin yêu cầu";
        set({ error: message });
        console.error("Get request detail error:", error);
      } finally {
        set({ isLoading: false });
      }
    },

    setFilters: (filters: ContactRequestFilters) => {
      set({ filters: { ...get().filters, ...filters } });
    },

    clearError: () => {
      set({ error: null });
    },

    reset: () => {
      set(initialState);
    },
  })
);

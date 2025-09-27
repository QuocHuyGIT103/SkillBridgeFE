import axiosClient from "../api/axiosClient";
import type {
  VerificationRequest,
  CreateVerificationRequest,
  ProcessVerificationRequest,
  VerificationRequestsResponse,
  VerificationHistoryResponse,
} from "../types/qualification.types";

const VerificationService = {
  // ==================== TUTOR VERIFICATION REQUESTS ====================

  /**
   * Gửi yêu cầu xác thực thông tin
   */
  createVerificationRequest: async (data: CreateVerificationRequest) => {
    try {
      const response = await axiosClient.post<{
        success: boolean;
        message: string;
        data: VerificationRequest;
      }>("/tutor/verification-requests", data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xem lịch sử yêu cầu xác thực của gia sư
   */
  getTutorVerificationRequests: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const url = `/tutor/verification-requests${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await axiosClient.get<{
        success: boolean;
        message: string;
        data: VerificationRequestsResponse;
      }>(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ==================== ADMIN VERIFICATION MANAGEMENT ====================

  /**
   * Lấy danh sách yêu cầu xác thực (Admin)
   */
  getAdminVerificationRequests: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    tutorId?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.status) queryParams.append("status", params.status);
      if (params?.tutorId) queryParams.append("tutorId", params.tutorId);

      const url = `/admin/verification-requests${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await axiosClient.get<{
        success: boolean;
        message: string;
        data: VerificationRequestsResponse;
      }>(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xem chi tiết yêu cầu xác thực (Admin)
   */
  getVerificationRequestDetail: async (id: string) => {
    try {
      const response = await axiosClient.get<{
        success: boolean;
        message: string;
        data: VerificationRequest;
      }>(`/admin/verification-requests/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xử lý yêu cầu xác thực (Admin)
   */
  processVerificationRequest: async (
    id: string,
    data: ProcessVerificationRequest
  ) => {
    try {
      const response = await axiosClient.put<{
        success: boolean;
        message: string;
        data: {
          _id: string;
          status: string;
          reviewedAt: string;
          reviewedBy: string;
          adminNote?: string;
          result: string;
        };
      }>(`/admin/verification-requests/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xem lịch sử xác thực đã xử lý (Admin)
   */
  getVerificationHistory: async (params?: {
    page?: number;
    limit?: number;
    tutorId?: string;
    targetType?: string;
    status?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.tutorId) queryParams.append("tutorId", params.tutorId);
      if (params?.targetType)
        queryParams.append("targetType", params.targetType);
      if (params?.status) queryParams.append("status", params.status);

      const url = `/admin/verification-history${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await axiosClient.get<{
        success: boolean;
        message: string;
        data: VerificationHistoryResponse;
      }>(url);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default VerificationService;

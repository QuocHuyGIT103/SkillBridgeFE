import axiosClient from "../api/axiosClient";
import type {
  VerificationRequest,
  CreateVerificationRequest,
  ProcessVerificationRequest,
  VerificationRequestsResponse,
  VerificationHistoryResponse,
  EditStatusResponse,
  VerificationSubmitResponse,
  VerificationErrorResponse,
} from "../types/qualification.types";

const VerificationService = {
  // ==================== TUTOR VERIFICATION REQUESTS ====================

  /**
   * Kiểm tra trạng thái có thể chỉnh sửa TutorProfile
   */
  checkEditStatus: async () => {
    try {
      const response = await axiosClient.get<{
        success: boolean;
        message: string;
        data: EditStatusResponse;
      }>("/tutor/profile/check-edit-status");
      return response;
    } catch (error: any) {
      // Handle 403 as valid response when canEdit is false
      if (
        error.response?.status === 403 &&
        error.response?.data?.data?.canEdit === false
      ) {
        // This is actually a valid response, not an error
        return {
          success: false, // Backend returns success: false for 403
          message: error.response.data.message,
          data: error.response.data.data,
        };
      }

      // Handle specific error types for edit status
      if (error.response?.data?.data?.errorType) {
        const errorData: VerificationErrorResponse = error.response.data.data;
        const enhancedError = new Error(
          error.response.data.message ||
            "Không thể kiểm tra trạng thái chỉnh sửa"
        );
        (enhancedError as any).data = errorData;
        throw enhancedError;
      }
      throw error;
    }
  },

  /**
   * Gửi yêu cầu xác thực TutorProfile
   */
  submitTutorProfileVerification: async () => {
    try {
      const response = await axiosClient.post<{
        success: boolean;
        message: string;
        data: VerificationSubmitResponse;
      }>("/tutor/profile/submit-verification");
      return response;
    } catch (error: any) {
      // Handle specific error types for verification submission
      if (error.response?.data?.data?.errorType) {
        const errorData: VerificationErrorResponse = error.response.data.data;
        const enhancedError = new Error(
          error.response.data.message || "Không thể gửi yêu cầu xác thực"
        );
        (enhancedError as any).data = errorData;
        throw enhancedError;
      }
      throw error;
    }
  },

  /**
   * Gửi yêu cầu xác thực thông tin (Qualifications)
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
          id: string;
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

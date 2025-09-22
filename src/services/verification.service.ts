import axiosClient from "../api/axiosClient";
import type {
  VerificationRequest,
  VerificationRequestWithPopulatedData,
  ApproveVerificationData,
  RejectVerificationData,
  VerificationApiResponse,
  VerificationListResponse,
} from "../types/verification.types";

export const verificationService = {
  // Tutor endpoints

  /**
   * Create a new verification request
   * Automatically collects tutor's current data
   */
  async createVerificationRequest(): Promise<
    VerificationApiResponse<VerificationRequest>
  > {
    const response = await axiosClient.post("/verification/request");
    return response;
  },

  /**
   * Get current verification status for logged-in tutor
   */
  async getVerificationStatus(): Promise<
    VerificationApiResponse<VerificationRequestWithPopulatedData | null>
  > {
    const response = await axiosClient.get("/verification/status");
    return response;
  },

  /**
   * Get verification history for logged-in tutor
   */
  async getVerificationHistory(): Promise<
    VerificationListResponse<VerificationRequestWithPopulatedData>
  > {
    const response = await axiosClient.get("/verification/history");
    return response;
  },

  // Admin endpoints

  /**
   * Get all pending verification requests (Admin only)
   */
  async getPendingRequests(): Promise<
    VerificationListResponse<VerificationRequestWithPopulatedData>
  > {
    const response = await axiosClient.get("/verification/pending");
    return response;
  },

  /**
   * Get verification request details by ID (Admin only)
   */
  async getVerificationRequestById(
    requestId: string
  ): Promise<VerificationApiResponse<VerificationRequestWithPopulatedData>> {
    const response = await axiosClient.get(`/verification/${requestId}`);
    return response;
  },

  /**
   * Approve verification request (Admin only)
   */
  async approveVerificationRequest(
    requestId: string,
    data: ApproveVerificationData
  ): Promise<VerificationApiResponse<VerificationRequest>> {
    const response = await axiosClient.put(
      `/verification/${requestId}/approve`,
      data
    );
    return response;
  },

  /**
   * Reject verification request (Admin only)
   */
  async rejectVerificationRequest(
    requestId: string,
    data: RejectVerificationData
  ): Promise<VerificationApiResponse<VerificationRequest>> {
    const response = await axiosClient.put(
      `/verification/${requestId}/reject`,
      data
    );
    return response;
  },
};

export default verificationService;

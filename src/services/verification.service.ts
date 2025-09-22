import axiosClient from "../api/axiosClient";

export const VerificationStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type VerificationStatus =
  (typeof VerificationStatus)[keyof typeof VerificationStatus];

export interface IEducationData {
  level: string;
  school: string;
  major?: string;
  start_year: string;
  end_year: string;
  degree_image_url?: string;
}

export interface ICertificateData {
  name: string;
  description: string;
  issued_by: string;
  issue_date?: string;
  expiry_date?: string;
  certificate_image_url?: string;
}

export interface IAchievementData {
  name: string;
  level: string;
  date_achieved: string;
  organization: string;
  type: string;
  field: string;
  description: string;
  achievement_image_url?: string;
}

export interface VerificationRequest {
  _id: string;
  tutor_id: string;
  status: VerificationStatus;
  // Reference fields (always present)
  education_id?: string;
  certificate_ids: string[];
  achievement_ids: string[];
  // Populated data fields (only when populated by backend)
  education_data?: IEducationData;
  certificates_data?: ICertificateData[];
  achievements_data?: IAchievementData[];
  admin_feedback?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationStatusResponse {
  has_request: boolean;
  verification_request?: VerificationRequest;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export const verificationService = {
  // Create verification request - automatically collect tutor's current data
  async createVerificationRequest(): Promise<ApiResponse<VerificationRequest>> {
    const response = await axiosClient.post("/verification/request");
    return response;
  },

  // Get current verification status for the logged-in tutor
  async getVerificationStatus(): Promise<
    ApiResponse<VerificationStatusResponse>
  > {
    const response = await axiosClient.get("/verification/status");
    return response;
  },

  // Get verification request by ID
  async getVerificationRequestById(
    id: string
  ): Promise<ApiResponse<VerificationRequest>> {
    const response = await axiosClient.get(`/verification/requests/${id}`);
    return response;
  },

  // Get all verification requests (admin only)
  async getAllVerificationRequests(params?: {
    page?: number;
    limit?: number;
    status?: VerificationStatus;
    tutor_id?: string;
  }): Promise<ListResponse<VerificationRequest>> {
    const response = await axiosClient.get("/verification/requests", {
      params,
    });
    return response;
  },

  // Review verification request (admin only)
  async reviewVerificationRequest(
    id: string,
    data: {
      status: VerificationStatus;
      admin_feedback?: string;
    }
  ): Promise<ApiResponse<VerificationRequest>> {
    const response = await axiosClient.put(
      `/verification/requests/${id}/review`,
      data
    );
    return response;
  },

  // Cancel verification request (tutor only)
  async cancelVerificationRequest(id: string): Promise<ApiResponse<null>> {
    const response = await axiosClient.delete(`/verification/requests/${id}`);
    return response;
  },

  // Utility functions for handling reference vs populated data
  hasPopulatedData(request: VerificationRequest): boolean {
    return !!(
      request.education_data ||
      request.certificates_data?.length ||
      request.achievements_data?.length
    );
  },

  // Get display data - use populated data if available, otherwise show reference info
  getDisplayData(request: VerificationRequest): {
    hasEducation: boolean;
    certificateCount: number;
    achievementCount: number;
    educationData?: IEducationData;
    certificatesData?: ICertificateData[];
    achievementsData?: IAchievementData[];
  } {
    return {
      hasEducation: !!(request.education_id || request.education_data),
      certificateCount:
        request.certificates_data?.length ||
        request.certificate_ids?.length ||
        0,
      achievementCount:
        request.achievements_data?.length ||
        request.achievement_ids?.length ||
        0,
      educationData: request.education_data,
      certificatesData: request.certificates_data,
      achievementsData: request.achievements_data,
    };
  },
};

export default verificationService;

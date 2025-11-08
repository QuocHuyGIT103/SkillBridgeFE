import axiosClient from "../api/axiosClient";

export interface TutorProfileStatusResponse {
  canOperate: boolean;
  profileStatus:
    | "DRAFT"
    | "PENDING"
    | "VERIFIED"
    | "REJECTED"
    | "MODIFIED_PENDING"
    | "MODIFIED_AFTER_REJECTION";
  verifiedAt?: string;
}

export interface TutorProfileDetailResponse {
  user: {
    full_name: string;
    email: string;
    phone_number?: string;
    avatar_url?: string;
    gender?: string;
    date_of_birth?: string;
    address?: string;
  };
  profile: {
    id: string;
    user_id: string;
    headline?: string;
    introduction?: string;
    teaching_experience?: string;
    student_levels?: string;
    video_intro_link?: string;
    cccd_images: string[];
    status: string;
    rejection_reason?: string;
    verified_at?: string;
    verified_by?: string;
    created_at: string;
    updated_at: string;
  };
}

class TutorProfileService {
  /**
   * Check if tutor can operate (create posts, etc.)
   * GET /api/v1/tutor/profile/can-operate
   */
  async checkCanOperate(): Promise<TutorProfileStatusResponse> {
    // axiosClient returns { success, message, data: T }
    // Generic parameter represents the payload T, accessible via response.data
    const response = await axiosClient.get<TutorProfileStatusResponse>(
      "/tutor/profile/can-operate"
    );
    return response.data;
  }

  /**
   * Get full tutor profile details
   * GET /api/v1/tutor/profile
   */
  async getProfile(): Promise<TutorProfileDetailResponse> {
    const response = await axiosClient.get<TutorProfileDetailResponse>(
      "/tutor/profile"
    );
    return response.data;
  }
}

export const tutorProfileService = new TutorProfileService();
export default tutorProfileService;

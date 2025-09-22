export const VerificationStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type VerificationStatus =
  (typeof VerificationStatus)[keyof typeof VerificationStatus];

export interface VerificationRequest {
  _id: string;
  tutor_id: string;
  status: VerificationStatus;
  education_id?: string;
  certificate_ids: string[];
  achievement_ids: string[];
  admin_feedback?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationRequestWithPopulatedData {
  _id: string;
  tutor_id: {
    _id: string;
    full_name: string;
    email: string;
    phone_number?: string;
  };
  status: VerificationStatus;
  education_id?: {
    _id: string;
    institution_name: string;
    degree: string;
    field_of_study: string;
    graduation_year: number;
    gpa?: number;
    is_verified: boolean;
  };
  certificate_ids: Array<{
    _id: string;
    name: string;
    description: string;
    issued_by: string;
    issue_date?: string;
    expiry_date?: string;
    certificate_image_url?: string;
    is_verified: boolean;
  }>;
  achievement_ids: Array<{
    _id: string;
    name: string;
    level: string;
    date_achieved: string;
    organization: string;
    type: string;
    field: string;
    description: string;
    achievement_image_url?: string;
    is_verified: boolean;
  }>;
  admin_feedback?: string;
  reviewed_by?: {
    _id: string;
    full_name: string;
    email: string;
  };
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateVerificationRequestData {
  tutor_id: string;
  education_id?: string;
  certificate_ids: string[];
  achievement_ids: string[];
}

export interface ApproveVerificationData {
  feedback?: string;
}

export interface RejectVerificationData {
  feedback: string;
}

export interface VerificationApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface VerificationListResponse<T> {
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

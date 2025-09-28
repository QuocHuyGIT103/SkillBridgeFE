// Constants
export const EducationLevel = {
  HIGH_SCHOOL: "HIGH_SCHOOL",
  COLLEGE: "COLLEGE",
  UNIVERSITY: "UNIVERSITY",
  MASTER: "MASTER",
  PHD: "PHD",
} as const;

export const AchievementLevel = {
  INTERNATIONAL: "INTERNATIONAL",
  NATIONAL: "NATIONAL",
  REGIONAL: "REGIONAL",
  LOCAL: "LOCAL",
  INSTITUTIONAL: "INSTITUTIONAL",
} as const;

export const AchievementType = {
  COMPETITION: "COMPETITION",
  SCHOLARSHIP: "SCHOLARSHIP",
  RESEARCH: "RESEARCH",
  PUBLICATION: "PUBLICATION",
  OTHER: "OTHER",
} as const;

export const VerificationStatus = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
  MODIFIED_PENDING: "MODIFIED_PENDING",
  MODIFIED_AFTER_REJECTION: "MODIFIED_AFTER_REJECTION",
} as const;

export const RequestStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  PARTIALLY_APPROVED: "PARTIALLY_APPROVED",
  REJECTED: "REJECTED",
} as const;

export const RequestType = {
  NEW: "NEW",
  UPDATE: "UPDATE",
} as const;

export const VerificationTargetType = {
  EDUCATION: "EDUCATION",
  CERTIFICATE: "CERTIFICATE",
  ACHIEVEMENT: "ACHIEVEMENT",
} as const;

// Type definitions for the constants
export type EducationLevel =
  (typeof EducationLevel)[keyof typeof EducationLevel];
export type AchievementLevel =
  (typeof AchievementLevel)[keyof typeof AchievementLevel];
export type AchievementType =
  (typeof AchievementType)[keyof typeof AchievementType];
export type VerificationStatus =
  (typeof VerificationStatus)[keyof typeof VerificationStatus];
export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];
export type RequestType = (typeof RequestType)[keyof typeof RequestType];
export type VerificationTargetType =
  (typeof VerificationTargetType)[keyof typeof VerificationTargetType];

// Interfaces
export interface Education {
  id: string;
  tutorId: string;
  level: EducationLevel;
  school: string;
  major: string;
  imgUrl?: string;
  startYear: number;
  endYear: number;
  status: VerificationStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  verifiedData?: {
    level: EducationLevel;
    school: string;
    major: string;
    startYear: number;
    endYear: number;
  };
}

export interface Certificate {
  id: string;
  tutorId: string;
  name: string;
  issuingOrganization: string;
  description?: string;
  issueDate: string;
  expiryDate?: string;
  imageUrl?: string;
  status: VerificationStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  verifiedData?: {
    name: string;
    issuingOrganization: string;
    description?: string;
    issueDate: string;
    expiryDate?: string;
    imageUrl?: string;
  };
}

export interface Achievement {
  id: string;
  tutorId: string;
  name: string;
  level: AchievementLevel;
  achievedDate: string;
  awardingOrganization: string;
  type: AchievementType;
  field: string;
  imgUrl?: string;
  description?: string;
  status: VerificationStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  verifiedData?: {
    name: string;
    level: AchievementLevel;
    achievedDate: string;
    awardingOrganization: string;
    type: AchievementType;
    field: string;
    description?: string;
  };
}

export interface QualificationStats {
  totalEducation: number;
  totalCertificates: number;
  totalAchievements: number;
  verifiedEducation: number;
  verifiedCertificates: number;
  verifiedAchievements: number;
}

export interface QualificationInfo {
  isQualified: boolean;
  canSubmitVerification: boolean;
  hasChangesNeedVerification: boolean;
  pendingVerificationCount: number;
  missingRequirements: string[];
  suggestion: string;
}

export interface QualificationsData {
  education?: Education;
  certificates: Certificate[];
  achievements: Achievement[];
  qualificationStats?: QualificationStats;
}

export interface VerificationDetail {
  id: string;
  requestId: string;
  targetType: VerificationTargetType;
  targetId: string;
  requestType: RequestType;
  status: VerificationStatus;
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
  dataSnapshot: any;
  target?: Education | Certificate | Achievement;
}

export interface VerificationRequest {
  id: string;
  tutorId: {
    id: string;
    email: string;
    fullName: string;
  };
  status: RequestStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    id: string;
    fullName: string;
    email: string;
  };
  adminNote?: string;
  result?: string;
  createdAt: string;
  updatedAt: string;
  details?: VerificationDetail[];
  detailsCount?: number;
}

// Request/Response types
export interface CreateEducationRequest {
  level: EducationLevel;
  school: string;
  major?: string;
  startYear: number;
  endYear: number;
  image?: File;
}

export interface UpdateEducationRequest {
  level?: EducationLevel;
  school?: string;
  major?: string;
  startYear?: number;
  endYear?: number;
  image?: File;
}

export interface CreateCertificateRequest {
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  description?: string;
  image?: File;
}

export interface UpdateCertificateRequest {
  name?: string;
  issuingOrganization?: string;
  issueDate?: string;
  expiryDate?: string;
  description?: string;
  image?: File;
}

export interface CreateAchievementRequest {
  name: string;
  level: AchievementLevel;
  achievedDate: string;
  awardingOrganization: string;
  type: AchievementType;
  field: string;
  description?: string;
  image?: File;
}

export interface UpdateAchievementRequest {
  name?: string;
  level?: AchievementLevel;
  achievedDate?: string;
  awardingOrganization?: string;
  type?: AchievementType;
  field?: string;
  description?: string;
  image?: File;
}

export interface CreateVerificationRequest {
  educationId?: string;
  certificateIds?: string[];
  achievementIds?: string[];
}

export interface VerificationDecision {
  detailId: string;
  status: VerificationStatus;
  rejectionReason?: string;
}

export interface ProcessVerificationRequest {
  decisions: VerificationDecision[];
  adminNote?: string;
}

// API Response types
export interface QualificationsResponse {
  education?: Education;
  certificates: Certificate[];
  achievements: Achievement[];
  qualificationStats: QualificationStats;
}

export interface VerificationRequestsResponse {
  requests: VerificationRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface VerificationHistoryResponse {
  history: VerificationDetail[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// Re-export all types with explicit naming to avoid conflicts
export * from "./address.types";

// Admin types - rename conflicting types
export type {
  AdminDashboardUser,
  AdminNavigationItem,
  AdminNavigationSubItem,
  UserManagementStats,
  SystemStats,
  TutorApproval,
  Certificate as AdminCertificate, // Rename to avoid conflict
  SessionManagement,
  TransactionRecord,
  Complaint,
  SystemConfiguration,
  RevenueAnalytics,
  UserAnalytics,
  SessionAnalytics,
} from "./admin.types";

// Qualification types - rename conflicting types
export type {
  EducationLevel,
  AchievementLevel,
  AchievementType,
  VerificationStatus,
  RequestStatus,
  RequestType,
  VerificationTargetType,
  Education,
  Certificate as QualificationCertificate, // Rename to avoid conflict
  Achievement,
  TutorProfile as QualificationTutorProfile, // Rename to avoid conflict
  QualificationStats,
  QualificationInfo,
  QualificationsData,
  VerificationDetail,
  VerificationRequest,
  CreateEducationRequest,
  UpdateEducationRequest,
  CreateCertificateRequest,
  UpdateCertificateRequest,
  CreateAchievementRequest,
  UpdateAchievementRequest,
  CreateVerificationRequest,
  VerificationDecision,
  ProcessVerificationRequest,
  QualificationsResponse,
  VerificationRequestsResponse,
  VerificationHistoryResponse,
  EditStatusResponse,
  VerificationSubmitResponse,
  VerificationErrorResponse,
  VerificationWarningResponse,
  VerificationBlockedResponse,
} from "./qualification.types";

// Tutor types - rename conflicting types
export type {
  TutorDashboardUser,
  NavigationItem,
  NavigationSubItem,
  NotificationItem,
  DashboardStats,
  RecentActivity,
  UpcomingSession,
  Student,
  Lesson,
  ChatConversation,
  Message,
  FinancialTransaction,
  TutorProfile as TutorProfileType, // Rename to avoid conflict
  TutorProfileVerification,
  EducationItem,
  ExperienceItem,
  CertificationItem,
  LanguageItem,
  AvailabilitySlot,
} from "./tutor.types";
export type {
  StudentNavigationItem,
  StudentStats,
  Assignment,
  Tutor,
  Conversation,
  Lesson as StudentLesson,
  Message as StudentMessage,
} from "./student.types";

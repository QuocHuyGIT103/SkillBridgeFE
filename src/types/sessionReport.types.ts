// Session Report Types

export type ReportStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "DISMISSED";
export type ReportPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ReportedAgainst = "STUDENT" | "TUTOR";
export type ReportDecision =
  | "STUDENT_FAULT"
  | "TUTOR_FAULT"
  | "BOTH_FAULT"
  | "NO_FAULT"
  | "DISMISSED";

export interface ReportEvidence {
  url: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
  fileName?: string;
  uploadedAt: string;
}

export interface ReporterInfo {
  userId: string;
  role: "STUDENT" | "TUTOR";
  userName: string;
}

export interface ReportResolution {
  resolvedBy: string;
  resolverName: string;
  decision: ReportDecision;
  message: string;
  resolvedAt: string;
  notifiedAt?: string;
}

export interface AdminNote {
  _id: string;
  adminId: string;
  adminName: string;
  note: string;
  createdAt: string;
}

export interface SessionReport {
  _id: string;
  classId: string;
  sessionNumber: number;
  reportedBy: ReporterInfo;
  reportedAgainst: ReportedAgainst;
  description: string;
  evidence: ReportEvidence[];
  status: ReportStatus;
  priority: ReportPriority;
  resolution?: ReportResolution;
  adminNotes: AdminNote[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportPayload {
  classId: string;
  sessionNumber: number;
  reportedAgainst: ReportedAgainst;
  description: string;
  priority?: ReportPriority;
}

export interface ReportFilters {
  status?: ReportStatus;
  priority?: ReportPriority;
  classId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ReportsResponse {
  reports: SessionReport[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ReportFormData {
  description: string;
  priority: ReportPriority;
  evidenceFiles: File[];
}

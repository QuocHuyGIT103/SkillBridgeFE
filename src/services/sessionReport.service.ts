import axiosClient from "../api/axiosClient";
import type {
  SessionReport,
  CreateReportPayload,
  ReportFilters,
  ReportsResponse,
} from "../types/sessionReport.types";

const sessionReportService = {
  /**
   * Create a new session report with optional evidence files
   */
  createReport: async (
    payload: CreateReportPayload,
    evidenceFiles?: File[]
  ): Promise<SessionReport> => {
    const formData = new FormData();

    // Append report data
    formData.append("classId", payload.classId);
    formData.append("sessionNumber", payload.sessionNumber.toString());
    formData.append("reportedAgainst", payload.reportedAgainst);
    formData.append("description", payload.description);

    if (payload.priority) {
      formData.append("priority", payload.priority);
    }

    // Append evidence files
    if (evidenceFiles && evidenceFiles.length > 0) {
      evidenceFiles.forEach((file) => {
        formData.append("evidence", file);
      });
    }

    const response = await axiosClient.post<SessionReport>(
      "/session-reports",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  /**
   * Get my reports (student's own reports)
   */
  getMyReports: async (filters?: ReportFilters): Promise<ReportsResponse> => {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.classId) params.append("classId", filters.classId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
    }

    const response = await axiosClient.get<ReportsResponse>(
      `/session-reports?${params.toString()}`
    );

    return response.data;
  },

  /**
   * Get specific report by ID
   */
  getReportById: async (reportId: string): Promise<SessionReport> => {
    const response = await axiosClient.get<SessionReport>(
      `/session-reports/${reportId}`
    );

    return response.data;
  },

  /**
   * Upload additional evidence to an existing report
   */
  uploadAdditionalEvidence: async (
    reportId: string,
    evidenceFiles: File[]
  ): Promise<SessionReport> => {
    const formData = new FormData();

    evidenceFiles.forEach((file) => {
      formData.append("evidence", file);
    });

    const response = await axiosClient.post<SessionReport>(
      `/session-reports/${reportId}/evidence`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  /**
   * Check if a session can be reported (during session or within 48 hours after)
   */
  canReportSession: (scheduledDate: string, duration: number): boolean => {
    const sessionStartTime = new Date(scheduledDate).getTime();
    const sessionEndTime = sessionStartTime + duration * 60000;
    const fortyEightHoursAfter = sessionEndTime + 48 * 60 * 60 * 1000;
    const now = Date.now();

    return now >= sessionStartTime && now <= fortyEightHoursAfter;
  },

  /**
   * Get time remaining to report (in hours)
   */
  getReportTimeRemaining: (scheduledDate: string, duration: number): number => {
    const sessionEndTime = new Date(scheduledDate).getTime() + duration * 60000;
    const fortyEightHoursAfter = sessionEndTime + 48 * 60 * 60 * 1000;
    const now = Date.now();
    const remainingMs = fortyEightHoursAfter - now;

    return Math.max(0, Math.floor(remainingMs / (60 * 60 * 1000)));
  },
};

export default sessionReportService;

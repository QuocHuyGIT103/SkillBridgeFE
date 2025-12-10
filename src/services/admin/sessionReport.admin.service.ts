import axiosClient from "../../api/axiosClient";
import type {
  SessionReport,
  ReportStatus,
  ReportPriority,
  ReportDecision,
} from "../../types/sessionReport.types";

export interface AdminReportFilters {
  status?: ReportStatus;
  priority?: ReportPriority;
  classId?: string;
  reportedByRole?: "STUDENT" | "TUTOR";
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AdminReportStats {
  total: number;
  pending: number;
  underReview: number;
  resolved: number;
  dismissed: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

export interface ResolveReportData {
  decision: ReportDecision;
  message: string;
  actionTaken?: string;
}

export interface AddNoteData {
  note: string;
}

class AdminSessionReportService {
  private readonly BASE_URL = "/admin/session-reports";

  /**
   * Get all session reports with filters (admin only)
   */
  async getAllReports(filters: AdminReportFilters = {}): Promise<{
    reports: SessionReport[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalReports: number;
      limit: number;
    };
    stats: AdminReportStats;
  }> {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.classId) params.append("classId", filters.classId);
    if (filters.reportedByRole)
      params.append("reportedByRole", filters.reportedByRole);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await axiosClient.get<{
      reports: SessionReport[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalReports: number;
        limit: number;
      };
      stats: AdminReportStats;
    }>(`${this.BASE_URL}?${params.toString()}`);

    return response.data;
  }

  /**
   * Get report by ID (admin only)
   */
  async getReportById(reportId: string): Promise<SessionReport> {
    const response = await axiosClient.get<SessionReport>(
      `${this.BASE_URL}/${reportId}`
    );
    return response.data;
  }

  /**
   * Update report status (admin only)
   */
  async updateReportStatus(
    reportId: string,
    status: "UNDER_REVIEW" | "RESOLVED" | "DISMISSED"
  ): Promise<SessionReport> {
    const response = await axiosClient.put<SessionReport>(
      `${this.BASE_URL}/${reportId}/status`,
      { status }
    );
    return response.data;
  }

  /**
   * Resolve or dismiss report (admin only)
   */
  async resolveReport(
    reportId: string,
    data: ResolveReportData
  ): Promise<SessionReport> {
    const response = await axiosClient.put<SessionReport>(
      `${this.BASE_URL}/${reportId}/resolve`,
      data
    );
    return response.data;
  }

  /**
   * Add admin note to report (admin only)
   */
  async addNote(reportId: string, data: AddNoteData): Promise<SessionReport> {
    const response = await axiosClient.post<SessionReport>(
      `${this.BASE_URL}/${reportId}/notes`,
      data
    );
    return response.data;
  }

  /**
   * Get report statistics (admin only)
   */
  async getStatistics(): Promise<AdminReportStats> {
    const response = await axiosClient.get<AdminReportStats>(
      `${this.BASE_URL}/statistics`
    );
    return response.data;
  }
}

export const adminSessionReportService = new AdminSessionReportService();
export default adminSessionReportService;

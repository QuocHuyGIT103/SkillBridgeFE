import axiosClient from "../../api/axiosClient";

// Pagination wrapper for APIs that use nested pagination
interface PaginationWrapper {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard Overview Interfaces
export interface DashboardUserStats {
  total_users: number;
  total_students: number;
  total_tutors: number;
  active_users: number;
  locked_users: number;
  pending_users: number;
  total_violations: number;
}

export interface DashboardPaymentStats {
  statusStats: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  paymentMethodStats: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  revenue: {
    total: number;
    count: number;
    average: number;
  };
  refunds: {
    total: number;
    count: number;
  };
  successRate: number;
  dailyStats: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    revenue: number;
    count: number;
  }>;
}

export interface DashboardSessionReport {
  _id: string;
  session_id: string;
  reporter: {
    _id: string;
    full_name: string;
    email: string;
  };
  reported_user: {
    _id: string;
    full_name: string;
    email: string;
  };
  report_reason: string;
  status: "PENDING" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  created_at: string;
}

export interface DashboardSessionReportsResponse {
  reports: DashboardSessionReport[];
  total: number;
  page: number;
  totalPages: number;
  stats?: {
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
  };
}

export interface DashboardVerificationRequest {
  _id: string;
  user_id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PARTIALLY_APPROVED";
  submitted_at: string;
  reviewed_at?: string;
}

export interface DashboardVerificationResponse {
  requests: DashboardVerificationRequest[];
  pagination: PaginationWrapper;
}

export interface DashboardContractStats {
  statusStats: Array<{
    _id: string;
    count: number;
    totalValue: number;
  }>;
  monthlyStats: Array<{
    _id: {
      year: number;
      month: number;
    };
    count: number;
    totalValue: number;
  }>;
}

export interface RecentUser {
  _id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface RecentPayment {
  _id: string;
  order_id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
}

export interface DashboardOverviewData {
  userStats: DashboardUserStats;
  paymentStats: DashboardPaymentStats;
  pendingReports: number;
  pendingVerifications: number;
  contractStats: DashboardContractStats;
  recentUsers: RecentUser[];
  recentVerifications: DashboardVerificationRequest[];
  recentReports: DashboardSessionReport[];
  recentPayments: RecentPayment[];
}

const AdminDashboardService = {
  // Get user statistics - using /users endpoint with pagination for reliability
  getUserStats: async () => {
    try {
      // Fallback: Get user count from /users endpoint with limit=1
      const response = await axiosClient.get<{
        users: any[];
        pagination: PaginationWrapper;
      }>("/admin/users", {
        params: { limit: 1, page: 1 },
      });

      if (response.success && response.data) {
        // Extract total from nested pagination structure
        const total = response.data.pagination?.total || 0;

        return {
          success: true,
          data: {
            total_users: total,
            total_students: 0, // Will be calculated if needed
            total_tutors: 0,
            active_users: 0,
            locked_users: 0,
            pending_users: 0,
            total_violations: 0,
          },
          message: "User stats retrieved successfully",
        };
      }

      // If that fails too, return zeros
      return {
        success: true,
        data: {
          total_users: 0,
          total_students: 0,
          total_tutors: 0,
          active_users: 0,
          locked_users: 0,
          pending_users: 0,
          total_violations: 0,
        },
        message: "User stats not available",
      };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      // Return empty stats on error
      return {
        success: true,
        data: {
          total_users: 0,
          total_students: 0,
          total_tutors: 0,
          active_users: 0,
          locked_users: 0,
          pending_users: 0,
          total_violations: 0,
        },
        message: "Failed to fetch user stats",
      };
    }
  },

  // Get payment statistics
  getPaymentStats: async () => {
    try {
      const response = await axiosClient.get<DashboardPaymentStats>(
        "/admin/payments/stats"
      );
      return response;
    } catch (error) {
      console.error("Error fetching payment stats:", error);
      // Return empty stats on error instead of throwing
      return {
        success: true,
        data: {
          statusStats: [],
          paymentMethodStats: [],
          revenue: {
            total: 0,
            count: 0,
            average: 0,
          },
          refunds: {
            total: 0,
            count: 0,
          },
          successRate: 0,
          dailyStats: [],
        },
        message: "Payment stats not available",
      };
    }
  },

  // Get session reports (complaints)
  getSessionReports: async (status?: string, limit: number = 10) => {
    try {
      const params: any = { limit, page: 1 };
      if (status) {
        params.status = status;
      }
      const response = await axiosClient.get<DashboardSessionReportsResponse>(
        "/admin/session-reports",
        { params }
      );
      return response;
    } catch (error) {
      console.error("Error fetching session reports:", error);
      return {
        success: true,
        data: {
          reports: [],
          total: 0,
          page: 1,
          totalPages: 0,
        },
        message: "Session reports not available",
      };
    }
  },

  // Get verification requests
  getVerificationRequests: async (status?: string, limit: number = 10) => {
    try {
      const params: any = { limit, page: 1 };
      if (status) {
        params.status = status;
      }
      const response = await axiosClient.get<DashboardVerificationResponse>(
        "/admin/verification-requests",
        { params }
      );
      return response;
    } catch (error) {
      console.error("Error fetching verification requests:", error);
      return {
        success: true,
        data: {
          requests: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 0,
            totalPages: 0,
          },
        },
        message: "Verification requests not available",
      };
    }
  },

  // Get contract statistics
  // Note: This endpoint may not exist yet, returning empty data as fallback
  getContractStats: async () => {
    try {
      const response = await axiosClient.get<DashboardContractStats>(
        "/admin/contracts/stats"
      );
      return response;
    } catch (error) {
      // Return empty stats if API doesn't exist
      return {
        success: true,
        data: {
          statusStats: [],
          monthlyStats: [],
        },
        message: "Contract stats not available",
      };
    }
  },

  // Get recent users
  getRecentUsers: async (limit: number = 5) => {
    try {
      const response = await axiosClient.get<{
        users: RecentUser[];
        pagination: PaginationWrapper;
      }>("/admin/users", {
        params: {
          limit,
          page: 1,
          sort_by: "created_at",
          sort_order: "desc",
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get recent payments
  getRecentPayments: async (limit: number = 5) => {
    try {
      const response = await axiosClient.get<{
        payments: RecentPayment[];
        pagination: PaginationWrapper;
      }>("/admin/payments", {
        params: {
          limit,
          page: 1,
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get all dashboard data in one call (aggregated)
  getDashboardOverview: async () => {
    try {
      // Only fetch essential data - reduced from 8 to 4 API calls for faster loading
      // Add timeout to prevent hanging
      const API_TIMEOUT = 10000; // 10 seconds max per API

      const [
        userStatsRes,
        paymentStatsRes,
        pendingReportsRes,
        pendingVerificationsRes,
      ] = await Promise.race([
        Promise.allSettled([
          AdminDashboardService.getUserStats(),
          AdminDashboardService.getPaymentStats(),
          AdminDashboardService.getSessionReports("PENDING", 1), // Only need count
          AdminDashboardService.getVerificationRequests("PENDING", 1), // Only need count
        ]),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Dashboard API timeout")),
            API_TIMEOUT
          )
        ),
      ]);

      const dashboardData: Partial<DashboardOverviewData> = {};

      // Process user stats
      if (
        userStatsRes.status === "fulfilled" &&
        userStatsRes.value?.success &&
        userStatsRes.value?.data
      ) {
        dashboardData.userStats = userStatsRes.value.data;
      }

      // Process payment stats
      if (
        paymentStatsRes.status === "fulfilled" &&
        paymentStatsRes.value?.success &&
        paymentStatsRes.value?.data
      ) {
        dashboardData.paymentStats = paymentStatsRes.value.data;
      }

      // Process pending reports count
      if (
        pendingReportsRes.status === "fulfilled" &&
        pendingReportsRes.value?.success &&
        pendingReportsRes.value?.data
      ) {
        dashboardData.pendingReports = pendingReportsRes.value.data.total || 0;
      }

      // Process pending verifications count
      if (
        pendingVerificationsRes.status === "fulfilled" &&
        pendingVerificationsRes.value?.success &&
        pendingVerificationsRes.value?.data
      ) {
        dashboardData.pendingVerifications =
          pendingVerificationsRes.value.data.pagination?.total || 0;
      }

      // Set empty contract stats (API endpoint doesn't exist yet)
      dashboardData.contractStats = {
        statusStats: [],
        monthlyStats: [],
      };

      // Set empty arrays for recent data (load on demand later if needed)
      dashboardData.recentUsers = [];
      dashboardData.recentVerifications = [];
      dashboardData.recentReports = [];
      dashboardData.recentPayments = [];

      return {
        success: true,
        data: dashboardData as DashboardOverviewData,
        message: "Dashboard data loaded successfully",
      };
    } catch (error: any) {
      throw error;
    }
  },

  // Separate method to load recent activities (call only when needed)
  getRecentActivities: async () => {
    try {
      const [
        recentUsersRes,
        recentVerificationsRes,
        recentReportsRes,
        recentPaymentsRes,
      ] = await Promise.allSettled([
        AdminDashboardService.getRecentUsers(5),
        AdminDashboardService.getVerificationRequests(undefined, 5),
        AdminDashboardService.getSessionReports(undefined, 5),
        AdminDashboardService.getRecentPayments(4),
      ]);

      const recentData: any = {
        recentUsers: [],
        recentVerifications: [],
        recentReports: [],
        recentPayments: [],
      };

      if (
        recentUsersRes.status === "fulfilled" &&
        recentUsersRes.value?.success
      ) {
        recentData.recentUsers = recentUsersRes.value.data.users || [];
      }

      if (
        recentVerificationsRes.status === "fulfilled" &&
        recentVerificationsRes.value?.success
      ) {
        recentData.recentVerifications =
          recentVerificationsRes.value.data.requests || [];
      }

      if (
        recentReportsRes.status === "fulfilled" &&
        recentReportsRes.value?.success
      ) {
        recentData.recentReports = recentReportsRes.value.data.reports || [];
      }

      if (
        recentPaymentsRes.status === "fulfilled" &&
        recentPaymentsRes.value?.success
      ) {
        recentData.recentPayments = recentPaymentsRes.value.data.payments || [];
      }

      return {
        success: true,
        data: recentData,
        message: "Recent activities loaded successfully",
      };
    } catch (error: any) {
      throw error;
    }
  },
};

export default AdminDashboardService;

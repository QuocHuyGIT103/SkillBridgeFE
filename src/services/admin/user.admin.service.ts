import axiosClient from "../../api/axiosClient";
import type {
  AdminUserFilters,
  AdminUserResponse,
  UserDetailedInfo,
  UserViolationSummary,
} from "../../types/admin.types";

class AdminUserService {
  private readonly BASE_URL = "/admin/users";

  /**
   * Get all users with filters and pagination
   */
  async getAllUsers(
    filters: AdminUserFilters = {}
  ): Promise<AdminUserResponse> {
    const params = new URLSearchParams();

    if (filters.role) params.append("role", filters.role);
    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.sort_by) params.append("sort_by", filters.sort_by);
    if (filters.sort_order) params.append("sort_order", filters.sort_order);

    const response = await axiosClient.get(`${this.BASE_URL}?${params}`);
    return response.data;
  }

  /**
   * Get detailed user information
   */
  async getUserDetails(userId: string): Promise<{
    user: UserDetailedInfo;
    violation_summary: UserViolationSummary;
  }> {
    const response = await axiosClient.get(`${this.BASE_URL}/${userId}`);
    return response.data;
  }

  /**
   * Update user status (block/unblock)
   */
  async updateUserStatus(
    userId: string,
    status: "active" | "locked",
    reason?: string
  ): Promise<any> {
    const response = await axiosClient.patch(
      `${this.BASE_URL}/${userId}/status`,
      {
        status,
        reason,
      }
    );
    return response;
  }

  /**
   * Block a user account
   */
  async blockUser(userId: string, reason: string): Promise<any> {
    return this.updateUserStatus(userId, "locked", reason);
  }

  /**
   * Unblock a user account
   */
  async unblockUser(userId: string, reason?: string): Promise<any> {
    return this.updateUserStatus(userId, "active", reason);
  }

  /**
   * Get user violation history
   */
  async getUserViolations(userId: string): Promise<any> {
    const response = await axiosClient.get(
      `${this.BASE_URL}/${userId}/violations`
    );
    return response.data;
  }

  /**
   * Update user information (admin override)
   */
  async updateUserInfo(
    userId: string,
    updates: Partial<UserDetailedInfo>
  ): Promise<any> {
    const response = await axiosClient.put(
      `${this.BASE_URL}/${userId}`,
      updates
    );
    return response;
  }
}

export default new AdminUserService();

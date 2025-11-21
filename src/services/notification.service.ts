import axiosClient from "../api/axiosClient";
import type { ApiResponse } from "../types/index";

export interface NotificationData {
  _id: string;
  userId: string;
  type:
    | "CONTACT_REQUEST"
    | "CLASS_CREATED"
    | "HOMEWORK_ASSIGNED"
    | "HOMEWORK_SUBMITTED"
    | "HOMEWORK_GRADED"
    | "ATTENDANCE_MARKED"
    | "CANCELLATION_REQUESTED"
    | "CANCELLATION_RESPONDED"
    | "MESSAGE"
    | "SYSTEM"
    | "CONTRACT_CREATED"
    | "CONTRACT_APPROVED"
    | "CONTRACT_REJECTED"
    | "CONTRACT_EXPIRED"
    | "CONTRACT_CANCELLED";
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  priority: "low" | "normal" | "high" | "critical";
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
}

export interface NotificationListResponse {
  notifications: NotificationData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

class NotificationService {
  /**
   * Get user notifications
   */
  static async getNotifications(options?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<ApiResponse<NotificationListResponse>> {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.unreadOnly) params.append("unreadOnly", "true");

    const queryString = params.toString();
    const url = `/notifications${queryString ? `?${queryString}` : ""}`;

    return axiosClient.get<NotificationListResponse>(url);
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(): Promise<ApiResponse<{ unreadCount: number }>> {
    return axiosClient.get<{ unreadCount: number }>(
      "/notifications/unread-count"
    );
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<ApiResponse<void>> {
    return axiosClient.patch<void>(`/notifications/${notificationId}/read`);
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<ApiResponse<{ count: number }>> {
    return axiosClient.patch<{ count: number }>("/notifications/mark-all-read");
  }

  /**
   * Delete notification
   */
  static async deleteNotification(
    notificationId: string
  ): Promise<ApiResponse<void>> {
    return axiosClient.delete<void>(`/notifications/${notificationId}`);
  }
}

export default NotificationService;

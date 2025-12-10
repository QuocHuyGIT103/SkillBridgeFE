import axiosClient from "../api/axiosClient";
import type {
  PaymentFilters,
  PaymentListResponse,
  PaymentDetail,
  PaymentStats,
  PaymentStatsFilters,
} from "../types/payment.types";
import type { ApiResponse } from "../types";

const PaymentAdminService = {
  /**
   * Get all payments with filters and pagination
   */
  getAllPayments: async (
    filters: PaymentFilters
  ): Promise<ApiResponse<PaymentListResponse>> => {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.status) params.append("status", filters.status);
      if (filters.paymentMethod)
        params.append("paymentMethod", filters.paymentMethod);
      if (filters.paymentType)
        params.append("paymentType", filters.paymentType);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.search) params.append("search", filters.search);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const response = await axiosClient.get<PaymentListResponse>(
        `/admin/payments?${params.toString()}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payment statistics
   */
  getPaymentStats: async (
    filters?: PaymentStatsFilters
  ): Promise<ApiResponse<PaymentStats>> => {
    try {
      const params = new URLSearchParams();

      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const response = await axiosClient.get<PaymentStats>(
        `/admin/payments/stats?${params.toString()}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payment details by ID
   */
  getPaymentDetails: async (
    paymentId: string
  ): Promise<ApiResponse<PaymentDetail>> => {
    try {
      const response = await axiosClient.get<PaymentDetail>(
        `/admin/payments/${paymentId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payment by orderId
   */
  getPaymentByOrderId: async (
    orderId: string
  ): Promise<ApiResponse<PaymentDetail>> => {
    try {
      const response = await axiosClient.get<PaymentDetail>(
        `/admin/payments/order/${orderId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Export payments data
   */
  exportPayments: async (filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<PaymentDetail[]>> => {
    try {
      const params = new URLSearchParams();

      if (filters?.status) params.append("status", filters.status);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const response = await axiosClient.get<PaymentDetail[]>(
        `/admin/payments/export?${params.toString()}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default PaymentAdminService;

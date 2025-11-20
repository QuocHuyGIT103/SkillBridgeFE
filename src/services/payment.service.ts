import axiosClient from "../api/axiosClient";

/**
 * Payment Types
 */

export type PaymentType = "SINGLE_WEEK" | "MULTI_WEEK" | "FULL_REMAINING";
export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED"
  | "REFUNDED";

export interface Payment {
  id: string;
  orderId: string;
  paymentScheduleId: string;
  contractId: string;
  learningClassId: string;
  studentId: string;
  tutorId: string;
  amount: number;
  paymentType: PaymentType;
  sessionNumbers: number[];
  paymentMethod: "VNPAY";
  paymentGateway?: "VNPAY";
  gatewayTransactionId?: string;
  gatewayResponseCode?: string;
  gatewayBankCode?: string;
  gatewayCardType?: string;
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string;
  expiredAt?: string;
  description?: string;
  ipAddress?: string;
}

export interface PaymentInstallment {
  installmentNumber: number;
  sessionNumber: number;
  amount: number;
  dueDate: string;
  status: "UNPAID" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  paidAt?: string;
  paymentMethod?: "VNPAY";
  paymentId?: string;
  transactionId?: string;
  notes?: string;
}

export interface InitiatePaymentRequest {
  learningClassId: string;
  paymentType: PaymentType;
  sessionNumbers: number[];
}

export interface InitiatePaymentResponse {
  payment: Payment;
  paymentUrl: string;
}

export interface AvailableSession {
  sessionNumber: number;
  amount: number;
  dueDate: string;
  status: "UNPAID" | "OVERDUE";
}

export interface AvailableSessionsResponse {
  unpaidSessions: AvailableSession[];
  totalUnpaidAmount: number;
}

export interface PaymentHistoryFilter {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  learningClassId?: string;
}

export interface PaymentHistoryResponse {
  payments: Payment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Payment Service
 */
const PaymentService = {
  /**
   * Initiate payment for selected sessions
   * POST /api/v1/payments/initiate
   */
  initiatePayment: async (data: InitiatePaymentRequest) => {
    try {
      const response = await axiosClient.post<InitiatePaymentResponse>(
        "/payments/initiate",
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payment by order ID
   * GET /api/v1/payments/:orderId
   */
  getPaymentByOrderId: async (orderId: string) => {
    try {
      const response = await axiosClient.get<Payment>(`/payments/${orderId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get available sessions for payment
   * GET /api/v1/payments/classes/:learningClassId/available-sessions
   */
  getAvailableSessions: async (learningClassId: string) => {
    try {
      const response = await axiosClient.get<AvailableSessionsResponse>(
        `/payments/classes/${learningClassId}/available-sessions`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payment history
   * GET /api/v1/payments/history
   */
  getPaymentHistory: async (filters?: PaymentHistoryFilter) => {
    try {
      const params = new URLSearchParams();

      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.status) params.append("status", filters.status);
      if (filters?.learningClassId)
        params.append("learningClassId", filters.learningClassId);

      const queryString = params.toString();
      const url = queryString
        ? `/payments/history?${queryString}`
        : "/payments/history";

      const response = await axiosClient.get<PaymentHistoryResponse>(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Test API - Create simple test payment (Development only)
   * GET /api/v1/payments/test/create-simple
   */
  createTestPayment: async () => {
    try {
      const response = await axiosClient.get<InitiatePaymentResponse>(
        "/payments/test/create-simple"
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default PaymentService;

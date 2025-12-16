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
   * Get financial summary for student
   * Aggregates data from payment schedules and payment history
   */
  getFinancialSummary: async () => {
    try {
      // Import contract service dynamically to avoid circular dependency
      const { default: ContractService } = await import("./contract.service");

      // Fetch all payment schedules
      const schedulesResponse =
        await ContractService.getStudentPaymentSchedules({ limit: 100 });
      const schedules = schedulesResponse.schedules;

      // Calculate totals
      const totalAmount = schedules.reduce(
        (sum, s) => sum + (s.totalAmount || 0),
        0
      );
      const totalPaid = schedules.reduce(
        (sum, s) => sum + (s.paidAmount || 0),
        0
      );
      const totalUnpaid = schedules.reduce(
        (sum, s) => sum + (s.remainingAmount || 0),
        0
      );

      // Get upcoming payments (next 30 days)
      const now = new Date();
      const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      let upcomingPayments: Array<{
        dueDate: string;
        amount: number;
        className: string;
        tutorName: string;
        classId: string;
        sessionNumber: number;
        status: string;
      }> = [];

      schedules.forEach((schedule) => {
        const learningClass =
          typeof schedule.learningClassId === "object"
            ? schedule.learningClassId
            : null;
        const subjectName = learningClass?.subject?.name || "Môn học";
        const tutorName = learningClass?.tutorId?.full_name || "Gia sư";
        const classId =
          learningClass?._id ||
          (typeof schedule.learningClassId === "string"
            ? schedule.learningClassId
            : "");

        schedule.installments?.forEach((installment) => {
          const dueDate = new Date(installment.dueDate);
          if (
            (installment.status === "PENDING" ||
              installment.status === "OVERDUE") &&
            dueDate <= next30Days
          ) {
            upcomingPayments.push({
              dueDate: installment.dueDate,
              amount: installment.amount,
              className: subjectName,
              tutorName: tutorName,
              classId: classId,
              sessionNumber: 0,
              status: installment.status,
            });
          }
        });
      });

      // Sort by due date
      upcomingPayments.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );

      // Get payment by class breakdown
      const paymentsByClass = schedules.map((schedule) => {
        const learningClass =
          typeof schedule.learningClassId === "object"
            ? schedule.learningClassId
            : null;
        const subjectName = learningClass?.subject?.name || "Môn học";
        const tutorName = learningClass?.tutorId?.full_name || "Gia sư";
        const classId =
          learningClass?._id ||
          (typeof schedule.learningClassId === "string"
            ? schedule.learningClassId
            : "");

        return {
          classId,
          className: subjectName,
          tutorName: tutorName,
          totalAmount: schedule.totalAmount || 0,
          paidAmount: schedule.paidAmount || 0,
          remainingAmount: schedule.remainingAmount || 0,
          progress:
            schedule.totalAmount > 0
              ? (schedule.paidAmount / schedule.totalAmount) * 100
              : 0,
        };
      });

      // Get recent payment history for monthly trend
      const historyResponse = await PaymentService.getPaymentHistory({
        limit: 100,
        status: "COMPLETED",
      });

      // Group by month for trend
      const monthlyPayments: { [key: string]: number } = {};
      historyResponse.data.payments.forEach((payment) => {
        if (payment.paidAt) {
          const date = new Date(payment.paidAt);
          const monthKey = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;
          monthlyPayments[monthKey] =
            (monthlyPayments[monthKey] || 0) + payment.amount;
        }
      });

      // Convert to array and sort by month
      const monthlyTrend = Object.entries(monthlyPayments)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => a.month.localeCompare(b.month));

      return {
        success: true,
        data: {
          totalAmount,
          totalPaid,
          totalUnpaid,
          upcomingPaymentsCount: upcomingPayments.length,
          upcomingPayments: upcomingPayments.slice(0, 10), // Top 10
          paymentsByClass,
          monthlyTrend,
          recentPayments: historyResponse.data.payments.slice(0, 10),
        },
      };
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      throw error;
    }
  },

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

import axiosClient from "../../api/axiosClient";
import type {
  TutorPaymentSchedule,
  TutorEarningsStats,
  TutorFinancialTransaction,
  MonthlyEarningsTrend,
} from "../../types/tutor.types";

export interface GetPaymentSchedulesFilters {
  status?: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "OVERDUE";
  page?: number;
  limit?: number;
}

export interface PaymentSchedulesResponse {
  schedules: TutorPaymentSchedule[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

const TUTOR_SHARE = 0.8; // 80% for tutor
const PLATFORM_SHARE = 0.2; // 20% for platform

const TutorFinanceService = {
  /**
   * Get tutor's payment schedules from backend
   */
  getPaymentSchedules: async (
    filters: GetPaymentSchedulesFilters = {}
  ): Promise<PaymentSchedulesResponse> => {
    try {
      const response = await axiosClient.get<PaymentSchedulesResponse>(
        "/contracts/tutor/payment-schedules",
        { params: filters }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Calculate comprehensive earnings statistics with 80/20 split
   */
  calculateEarningsStats: async (): Promise<TutorEarningsStats> => {
    try {
      // Fetch all payment schedules (with high limit to get all data for stats)
      const response = await axiosClient.get<PaymentSchedulesResponse>(
        "/contracts/tutor/payment-schedules",
        { params: { limit: 1000 } }
      );

      const schedules = response.data.schedules || [];

      let grossRevenue = 0; // Total paid (100%)
      let totalPending = 0; // Total pending (100%)
      let completedPayments = 0;
      let pendingPayments = 0;
      let overduePayments = 0;
      const studentIds = new Set<string>();
      const monthlyData: { [key: string]: MonthlyEarningsTrend } = {};

      const paymentsByStatus = {
        PENDING: 0,
        PAID: 0,
        OVERDUE: 0,
        CANCELLED: 0,
      };

      // Process each payment schedule
      schedules.forEach((schedule) => {
        // Track unique students
        if (schedule.studentId?._id) {
          studentIds.add(schedule.studentId._id);
        }

        // Process installments
        schedule.installments?.forEach((installment) => {
          const amount = installment.amount || 0;

          // Count payments by status
          if (installment.status === "PAID") {
            grossRevenue += amount;
            completedPayments++;
            paymentsByStatus.PAID++;

            // Track monthly trend
            if (installment.paid_at) {
              const month = installment.paid_at.substring(0, 7); // Get YYYY-MM
              if (!monthlyData[month]) {
                monthlyData[month] = {
                  month,
                  grossAmount: 0,
                  tutorEarnings: 0,
                  platformFee: 0,
                  paymentCount: 0,
                };
              }
              monthlyData[month].grossAmount += amount;
              monthlyData[month].tutorEarnings += amount * TUTOR_SHARE;
              monthlyData[month].platformFee += amount * PLATFORM_SHARE;
              monthlyData[month].paymentCount++;
            }
          } else if (installment.status === "PENDING") {
            totalPending += amount;
            pendingPayments++;
            paymentsByStatus.PENDING++;
          } else if (installment.status === "OVERDUE") {
            totalPending += amount;
            overduePayments++;
            paymentsByStatus.OVERDUE++;
          } else if (installment.status === "CANCELLED") {
            paymentsByStatus.CANCELLED++;
          }
        });
      });

      // Calculate tutor's share (80%) and platform fee (20%)
      const totalEarnings = grossRevenue * TUTOR_SHARE;
      const platformFee = grossRevenue * PLATFORM_SHARE;
      const pendingEarnings = totalPending * TUTOR_SHARE;
      const pendingPlatformFee = totalPending * PLATFORM_SHARE;

      // Convert monthly data to sorted array
      const monthlyTrend = Object.values(monthlyData).sort((a, b) =>
        a.month.localeCompare(b.month)
      );

      return {
        totalEarnings,
        platformFee,
        grossRevenue,
        pendingEarnings,
        pendingPlatformFee,
        totalPending,
        totalStudents: studentIds.size,
        completedPayments,
        pendingPayments,
        overduePayments,
        monthlyTrend,
        paymentsByStatus,
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get flattened transactions list from payment schedules
   */
  getTransactionsList: async (
    filters: GetPaymentSchedulesFilters = {}
  ): Promise<TutorFinancialTransaction[]> => {
    try {
      const response = await axiosClient.get<PaymentSchedulesResponse>(
        "/contracts/tutor/payment-schedules",
        { params: filters }
      );

      const schedules = response.data.schedules || [];
      const transactions: TutorFinancialTransaction[] = [];

      schedules.forEach((schedule) => {
        schedule.installments?.forEach((installment) => {
          const grossAmount = installment.amount || 0;
          transactions.push({
            _id:
              installment._id ||
              `${schedule._id}-${installment.installment_number}`,
            scheduleId: schedule._id,
            studentName: schedule.studentId?.full_name || "Unknown Student",
            studentAvatar: schedule.studentId?.avatar_url,
            contractTitle: schedule.contractId?.title,
            amount: grossAmount,
            tutorEarnings: grossAmount * TUTOR_SHARE,
            platformFee: grossAmount * PLATFORM_SHARE,
            installmentNumber: installment.installment_number,
            status: installment.status,
            dueDate: installment.due_date,
            paidAt: installment.paid_at,
            paymentMethod: schedule.paymentMethod,
          });
        });
      });

      // Sort by due date (most recent first)
      transactions.sort((a, b) => {
        const dateA = a.paidAt || a.dueDate;
        const dateB = b.paidAt || b.dueDate;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      return transactions;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get recent transactions (last 10)
   */
  getRecentTransactions: async (): Promise<TutorFinancialTransaction[]> => {
    try {
      const allTransactions = await TutorFinanceService.getTransactionsList({
        limit: 100,
      });
      return allTransactions.slice(0, 10);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get upcoming payments (pending/overdue)
   */
  getUpcomingPayments: async (): Promise<TutorFinancialTransaction[]> => {
    try {
      const allTransactions = await TutorFinanceService.getTransactionsList({
        limit: 100,
      });

      // Filter for pending and overdue payments
      const upcoming = allTransactions.filter(
        (t) => t.status === "PENDING" || t.status === "OVERDUE"
      );

      // Sort by due date (earliest first)
      upcoming.sort((a, b) => {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

      return upcoming.slice(0, 10);
    } catch (error) {
      throw error;
    }
  },
};

export default TutorFinanceService;

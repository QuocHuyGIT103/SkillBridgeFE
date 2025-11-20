import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import PaymentService from "../services/payment.service";
import type {
  Payment,
  InitiatePaymentRequest,
  AvailableSession,
  PaymentHistoryFilter,
} from "../services/payment.service";

interface PaymentState {
  // Current payment flow
  currentPayment: Payment | null;
  paymentUrl: string | null;

  // Available sessions for payment
  availableSessions: AvailableSession[];
  totalUnpaidAmount: number;

  // Payment history
  payments: Payment[];
  paymentsPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;

  // Loading states
  isInitiatingPayment: boolean;
  isLoadingAvailableSessions: boolean;
  isLoadingPaymentHistory: boolean;
  isLoadingPaymentDetails: boolean;

  // Actions
  initiatePayment: (data: InitiatePaymentRequest) => Promise<string | null>;
  getPaymentByOrderId: (orderId: string) => Promise<void>;
  getAvailableSessions: (learningClassId: string) => Promise<void>;
  getPaymentHistory: (filters?: PaymentHistoryFilter) => Promise<void>;
  clearCurrentPayment: () => void;
  createTestPayment: () => Promise<string | null>;
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      // Initial state
      currentPayment: null,
      paymentUrl: null,
      availableSessions: [],
      totalUnpaidAmount: 0,
      payments: [],
      paymentsPagination: null,
      isInitiatingPayment: false,
      isLoadingAvailableSessions: false,
      isLoadingPaymentHistory: false,
      isLoadingPaymentDetails: false,

      /**
       * Initiate payment for selected sessions
       * Returns payment URL for redirect to VNPay
       */
      initiatePayment: async (data: InitiatePaymentRequest) => {
        set({ isInitiatingPayment: true });
        try {
          const response = await PaymentService.initiatePayment(data);

          if (response.success && response.data) {
            set({
              currentPayment: response.data.payment,
              paymentUrl: response.data.paymentUrl,
            });

            toast.success(
              response.message || "Khởi tạo thanh toán thành công!"
            );

            // Return payment URL for redirect
            return response.data.paymentUrl;
          } else {
            toast.error(response.message || "Không thể khởi tạo thanh toán");
            return null;
          }
        } catch (error: any) {
          const errorMessage =
            error.message || "Đã xảy ra lỗi khi khởi tạo thanh toán";
          toast.error(errorMessage);
          console.error("Error initiating payment:", error);
          return null;
        } finally {
          set({ isInitiatingPayment: false });
        }
      },

      /**
       * Get payment details by order ID
       */
      getPaymentByOrderId: async (orderId: string) => {
        set({ isLoadingPaymentDetails: true });
        try {
          const response = await PaymentService.getPaymentByOrderId(orderId);

          if (response.success && response.data) {
            set({ currentPayment: response.data });
          } else {
            toast.error(
              response.message || "Không thể lấy thông tin thanh toán"
            );
          }
        } catch (error: any) {
          const errorMessage =
            error.message || "Đã xảy ra lỗi khi lấy thông tin thanh toán";
          toast.error(errorMessage);
          console.error("Error getting payment details:", error);
        } finally {
          set({ isLoadingPaymentDetails: false });
        }
      },

      /**
       * Get available sessions for payment
       */
      getAvailableSessions: async (learningClassId: string) => {
        set({ isLoadingAvailableSessions: true });
        try {
          const response = await PaymentService.getAvailableSessions(
            learningClassId
          );

          if (response.success && response.data) {
            set({
              availableSessions: response.data.unpaidSessions,
              totalUnpaidAmount: response.data.totalUnpaidAmount,
            });
          } else {
            toast.error(
              response.message ||
                "Không thể lấy danh sách buổi học chưa thanh toán"
            );
          }
        } catch (error: any) {
          const errorMessage =
            error.message ||
            "Đã xảy ra lỗi khi lấy danh sách buổi học chưa thanh toán";
          toast.error(errorMessage);
          console.error("Error getting available sessions:", error);
        } finally {
          set({ isLoadingAvailableSessions: false });
        }
      },

      /**
       * Get payment history with filters
       */
      getPaymentHistory: async (filters?: PaymentHistoryFilter) => {
        set({ isLoadingPaymentHistory: true });
        try {
          const response = await PaymentService.getPaymentHistory(filters);

          if (response.success && response.data) {
            set({
              payments: response.data.payments,
              paymentsPagination: response.data.pagination,
            });
          } else {
            toast.error(response.message || "Không thể lấy lịch sử thanh toán");
          }
        } catch (error: any) {
          const errorMessage =
            error.message || "Đã xảy ra lỗi khi lấy lịch sử thanh toán";
          toast.error(errorMessage);
          console.error("Error getting payment history:", error);
        } finally {
          set({ isLoadingPaymentHistory: false });
        }
      },

      /**
       * Clear current payment flow
       */
      clearCurrentPayment: () => {
        set({
          currentPayment: null,
          paymentUrl: null,
        });
      },

      /**
       * Test API - Create test payment (Development only)
       */
      createTestPayment: async () => {
        set({ isInitiatingPayment: true });
        try {
          const response = await PaymentService.createTestPayment();

          if (response.success && response.data) {
            set({
              currentPayment: response.data.payment,
              paymentUrl: response.data.paymentUrl,
            });

            toast.success("Tạo thanh toán test thành công!");
            return response.data.paymentUrl;
          } else {
            toast.error("Không thể tạo thanh toán test");
            return null;
          }
        } catch (error: any) {
          toast.error(error.message || "Đã xảy ra lỗi khi tạo thanh toán test");
          console.error("Error creating test payment:", error);
          return null;
        } finally {
          set({ isInitiatingPayment: false });
        }
      },
    }),
    {
      name: "payment-storage",
      partialize: (state) => ({
        // Only persist current payment info
        currentPayment: state.currentPayment,
        paymentUrl: state.paymentUrl,
      }),
    }
  )
);

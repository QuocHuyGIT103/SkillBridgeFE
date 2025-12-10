import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import TutorFinanceService from "../services/tutor/tutorFinance.service";
import type { GetPaymentSchedulesFilters } from "../services/tutor/tutorFinance.service";
import type {
  TutorPaymentSchedule,
  TutorEarningsStats,
  TutorFinancialTransaction,
} from "../types/tutor.types";

interface TutorFinanceState {
  // State
  paymentSchedules: TutorPaymentSchedule[];
  earningsStats: TutorEarningsStats | null;
  recentTransactions: TutorFinancialTransaction[];
  upcomingPayments: TutorFinancialTransaction[];
  isLoading: boolean;
  isLoadingStats: boolean;
  error: string | null;
  lastFetched: string | null;

  // Pagination
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  } | null;

  // Actions
  fetchPaymentSchedules: (
    filters?: GetPaymentSchedulesFilters
  ) => Promise<void>;
  fetchEarningsStats: () => Promise<void>;
  fetchRecentTransactions: () => Promise<void>;
  fetchUpcomingPayments: () => Promise<void>;
  fetchAllFinanceData: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  paymentSchedules: [],
  earningsStats: null,
  recentTransactions: [],
  upcomingPayments: [],
  isLoading: false,
  isLoadingStats: false,
  error: null,
  lastFetched: null,
  pagination: null,
};

export const useTutorFinanceStore = create<TutorFinanceState>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchPaymentSchedules: async (filters?: GetPaymentSchedulesFilters) => {
        set({ isLoading: true, error: null });
        try {
          const response = await TutorFinanceService.getPaymentSchedules(
            filters
          );

          if (response.schedules) {
            set({
              paymentSchedules: response.schedules,
              pagination: response.pagination,
              lastFetched: new Date().toISOString(),
            });
          }
        } catch (error: any) {
          const errorMessage =
            error.message || "Không thể tải dữ liệu thanh toán";
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchEarningsStats: async () => {
        set({ isLoadingStats: true, error: null });
        try {
          const stats = await TutorFinanceService.calculateEarningsStats();
          set({
            earningsStats: stats,
            lastFetched: new Date().toISOString(),
          });
        } catch (error: any) {
          const errorMessage =
            error.message || "Không thể tải thống kê thu nhập";
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoadingStats: false });
        }
      },

      fetchRecentTransactions: async () => {
        set({ isLoading: true, error: null });
        try {
          const transactions =
            await TutorFinanceService.getRecentTransactions();
          set({
            recentTransactions: transactions,
            lastFetched: new Date().toISOString(),
          });
        } catch (error: any) {
          const errorMessage =
            error.message || "Không thể tải giao dịch gần đây";
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchUpcomingPayments: async () => {
        set({ isLoading: true, error: null });
        try {
          const payments = await TutorFinanceService.getUpcomingPayments();
          set({
            upcomingPayments: payments,
            lastFetched: new Date().toISOString(),
          });
        } catch (error: any) {
          const errorMessage = error.message || "Không thể tải lịch thanh toán";
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchAllFinanceData: async () => {
        set({ isLoading: true, isLoadingStats: true, error: null });
        try {
          // Fetch all data in parallel for better performance
          await Promise.all([
            get().fetchEarningsStats(),
            get().fetchRecentTransactions(),
            get().fetchUpcomingPayments(),
          ]);

          // Remove toast notification on every refresh
        } catch (error: any) {
          // Errors are already handled in individual fetch methods
          console.error("Error fetching finance data:", error);
        } finally {
          set({ isLoading: false, isLoadingStats: false });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "tutor-finance-storage",
      partialize: (state) => ({
        // Only persist non-sensitive data for faster load
        lastFetched: state.lastFetched,
      }),
    }
  )
);

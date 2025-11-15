import { create } from "zustand";
import { devtools } from "zustand/middleware";
import contractService from "../services/contract.service";
import type {
  Contract,
  CreateContractInput,
  StudentContractResponse,
  ContractFilters,
  PaymentSchedule,
  ProcessPaymentInput,
} from "../types/contract.types";
import { toast } from "react-hot-toast";

interface ContractState {
  // Contract data
  contracts: Contract[];
  pendingContracts: Contract[];
  currentContract: Contract | null;
  paymentSchedules: PaymentSchedule[];
  currentPaymentSchedule: PaymentSchedule | null;

  // Loading states
  isLoading: boolean;
  isCreatingContract: boolean;
  isRespondingToContract: boolean;
  isProcessingPayment: boolean;
  isCancellingContract: boolean;

  // Pagination
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };

  // Filters
  filters: ContractFilters;

  // Error state
  error: string | null;

  // ==================== CONTRACT ACTIONS ====================

  // Create contract (Tutor)
  createContract: (data: CreateContractInput) => Promise<Contract>;
  autoSignForTutor: (contractId: string) => Promise<void>;

  // Get contracts
  getTutorContracts: (filters?: ContractFilters) => Promise<void>;
  getStudentContracts: (filters?: ContractFilters) => Promise<void>;
  getPendingContracts: () => Promise<void>;
  getContractById: (contractId: string) => Promise<void>;

  // Student respond to contract
  respondToContract: (
    contractId: string,
    response: StudentContractResponse
  ) => Promise<void>;

  // Cancel contract
  cancelContract: (contractId: string, reason?: string) => Promise<void>;

  // ==================== CONTRACT SIGNING ACTIONS (OTP-based) ====================

  // Initiate contract signing - sends OTP to email
  initiateContractSigning: (
    contractId: string,
    role: "student" | "tutor"
  ) => Promise<{
    contractId: string;
    email: string;
    expiresAt: string;
    role: string;
  }>;

  // Verify OTP and sign contract
  verifyContractSignature: (
    contractId: string,
    otpCode: string,
    role: "student" | "tutor",
    consentText: string
  ) => Promise<{
    contractId: string;
    signedAt: string;
    role: string;
    fullySignedNow: boolean;
    message: string;
  }>;

  // Resend OTP for contract signing
  resendContractOTP: (
    contractId: string,
    role: "student" | "tutor"
  ) => Promise<{
    contractId: string;
    email: string;
    expiresAt: string;
  }>;

  // Get contract audit trail
  getContractAuditTrail: (contractId: string) => Promise<void>;

  // NEW: Approve and sign contract in one action
  approveAndSignContract: (
    contractId: string,
    data: {
      otpCode: string;
      consentText: string;
      message?: string;
    }
  ) => Promise<{
    contractId: string;
    approvedAt: string;
    signedAt: string;
    fullySignedNow: boolean;
    message: string;
  }>;

  // ==================== PAYMENT ACTIONS ====================

  // Get payment schedules
  getPaymentSchedule: (contractId: string) => Promise<void>;
  getStudentPaymentSchedules: (filters?: any) => Promise<void>;
  getTutorPaymentSchedules: (filters?: any) => Promise<void>;

  // Process payment
  processPayment: (
    paymentScheduleId: string,
    paymentData: ProcessPaymentInput
  ) => Promise<void>;

  // ==================== UTILITY ACTIONS ====================

  // Set filters
  setFilters: (filters: Partial<ContractFilters>) => void;

  // Clear states
  clearContracts: () => void;
  clearCurrentContract: () => void;
  clearError: () => void;

  // Reset store
  reset: () => void;
}

const initialState = {
  contracts: [],
  pendingContracts: [],
  currentContract: null,
  paymentSchedules: [],
  currentPaymentSchedule: null,
  isLoading: false,
  isCreatingContract: false,
  isRespondingToContract: false,
  isProcessingPayment: false,
  isCancellingContract: false,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  },
  filters: {},
  error: null,
};

export const useContractStore = create<ContractState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ==================== CONTRACT ACTIONS ====================

      createContract: async (data: CreateContractInput) => {
        set({ isCreatingContract: true, error: null });
        try {
          const contract = await contractService.createContract(data);

          // Add to contracts list if it's the tutor's view
          set((state) => ({
            contracts: [contract, ...state.contracts],
            isCreatingContract: false,
          }));

          toast.success(
            "Hợp đồng đã được tạo thành công! Đang chờ học viên phê duyệt."
          );
          return contract;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Không thể tạo hợp đồng";
          set({ error: errorMessage, isCreatingContract: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      autoSignForTutor: async (contractId: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await contractService.autoSignForTutor(contractId);

          // Update contract in the list if exists
          set((state) => ({
            contracts: state.contracts.map((contract) =>
              contract.id === contractId
                ? {
                    ...contract,
                    tutorSignedAt: result.signedAt,
                    isSigned: false, // Still waiting for student
                  }
                : contract
            ),
            isLoading: false,
          }));

          toast.success(
            "Gia sư đã ký hợp đồng tự động! Chờ học viên phê duyệt và ký."
          );
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Không thể ký tự động cho gia sư";
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      getTutorContracts: async (filters?: ContractFilters) => {
        set({ isLoading: true, error: null });
        try {
          const result = await contractService.getTutorContracts(filters);
          set({
            contracts: result.contracts,
            pagination: result.pagination,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Không thể tải hợp đồng";
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      getStudentContracts: async (filters?: ContractFilters) => {
        set({ isLoading: true, error: null });
        try {
          const result = await contractService.getStudentContracts(filters);
          set({
            contracts: result.contracts,
            pagination: result.pagination,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error.message ||
            error.response?.data?.message ||
            "Không thể tải hợp đồng";
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      getPendingContracts: async () => {
        set({ isLoading: true, error: null });
        try {
          const contracts = await contractService.getPendingContracts();
          set({
            pendingContracts: contracts,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Không thể tải hợp đồng chờ duyệt";
          set({ error: errorMessage, isLoading: false });
        }
      },

      getContractById: async (contractId: string) => {
        set({ isLoading: true, error: null });
        try {
          const contract = await contractService.getContractById(contractId);
          set({
            currentContract: contract,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Không thể tải chi tiết hợp đồng";
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      respondToContract: async (
        contractId: string,
        response: StudentContractResponse
      ) => {
        set({ isRespondingToContract: true, error: null });
        try {
          const updatedContract = await contractService.respondToContract(
            contractId,
            response
          );

          // Update contracts in state
          set((state) => ({
            contracts: state.contracts.map((c) =>
              c.id === contractId ? updatedContract : c
            ),
            pendingContracts: state.pendingContracts.filter(
              (c) => c.id !== contractId
            ),
            currentContract:
              state.currentContract?.id === contractId
                ? updatedContract
                : state.currentContract,
            isRespondingToContract: false,
          }));

          const actionText =
            response.action === "APPROVE"
              ? "phê duyệt"
              : response.action === "REJECT"
              ? "từ chối"
              : "yêu cầu thay đổi";
          toast.success(`Đã ${actionText} hợp đồng thành công!`);
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Không thể phản hồi hợp đồng";
          set({ error: errorMessage, isRespondingToContract: false });
          toast.error(errorMessage);
        }
      },

      cancelContract: async (contractId: string, reason?: string) => {
        set({ isCancellingContract: true, error: null });
        try {
          const updatedContract = await contractService.cancelContract(
            contractId,
            reason
          );

          // Update contracts in state
          set((state) => ({
            contracts: state.contracts.map((c) =>
              c.id === contractId ? updatedContract : c
            ),
            currentContract:
              state.currentContract?.id === contractId
                ? updatedContract
                : state.currentContract,
            isCancellingContract: false,
          }));

          toast.success("Đã hủy hợp đồng thành công!");
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Không thể hủy hợp đồng";
          set({ error: errorMessage, isCancellingContract: false });
          toast.error(errorMessage);
        }
      },

      // ==================== CONTRACT SIGNING ACTIONS (OTP-based) ====================

      initiateContractSigning: async (
        contractId: string,
        role: "student" | "tutor"
      ) => {
        set({ isLoading: true, error: null });
        try {
          const result = await contractService.initiateContractSigning(
            contractId,
            role
          );

          set({ isLoading: false });

          const roleText = role === "student" ? "học viên" : "gia sư";
          toast.success(`Mã OTP đã được gửi tới email ${roleText}!`);

          return result;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            "Không thể khởi tạo quá trình ký hợp đồng";
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      verifyContractSignature: async (
        contractId: string,
        otpCode: string,
        role: "student" | "tutor",
        consentText: string
      ) => {
        set({ isLoading: true, error: null });
        try {
          const result = await contractService.verifyContractSignature(
            contractId,
            otpCode,
            role,
            consentText
          );

          // Refresh current contract to update signing status
          if (get().currentContract?.id === contractId) {
            await get().getContractById(contractId);
          }

          set({ isLoading: false });

          toast.success(
            result.fullySignedNow
              ? "🎉 Hợp đồng đã được ký hoàn tất bởi cả hai bên!"
              : "✅ Đã ký hợp đồng thành công! Chờ bên còn lại ký."
          );

          return result;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Xác thực OTP không thành công";
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      resendContractOTP: async (
        contractId: string,
        role: "student" | "tutor"
      ) => {
        set({ isLoading: true, error: null });
        try {
          const result = await contractService.resendContractOTP(
            contractId,
            role
          );

          set({ isLoading: false });
          toast.success("Mã OTP mới đã được gửi lại!");

          return result;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Không thể gửi lại mã OTP";
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      getContractAuditTrail: async (contractId: string) => {
        set({ isLoading: true, error: null });
        try {
          const auditTrail = await contractService.getContractAuditTrail(
            contractId
          );

          set({ isLoading: false });

          // You can store audit trail in state if needed
          // For now, just return it for display
          return auditTrail;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            "Không thể tải lịch sử ký hợp đồng";
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      // NEW: Approve and sign contract in one action
      approveAndSignContract: async (
        contractId: string,
        data: {
          otpCode: string;
          consentText: string;
          message?: string;
        }
      ) => {
        set({ isRespondingToContract: true, error: null });
        try {
          const result = await contractService.approveAndSignContract(
            contractId,
            data
          );

          // Update current contract if it matches
          const currentContract = get().currentContract;
          if (currentContract && currentContract.id === contractId) {
            set({
              currentContract: {
                ...currentContract,
                status: "APPROVED",
                approvedAt: result.approvedAt,
                studentSignedAt: result.signedAt,
                studentResponse: {
                  action: "APPROVE",
                  respondedAt: result.approvedAt,
                  message: data.message,
                },
              },
            });
          }

          // Remove from pending contracts
          set((state) => ({
            pendingContracts: state.pendingContracts.filter(
              (contract) => contract.id !== contractId
            ),
          }));

          // Update contracts list
          set((state) => ({
            contracts: state.contracts.map((contract) =>
              contract.id === contractId
                ? {
                    ...contract,
                    status: "APPROVED",
                    approvedAt: result.approvedAt,
                    studentSignedAt: result.signedAt,
                  }
                : contract
            ),
          }));

          set({ isRespondingToContract: false });

          if (result.fullySignedNow) {
            toast.success(
              "Hợp đồng đã được phê duyệt và ký thành công! Lớp học đã được tạo."
            );
          } else {
            toast.success(
              "Hợp đồng đã được phê duyệt và ký. Chờ gia sư ký để hoàn tất."
            );
          }

          return result;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            "Không thể phê duyệt và ký hợp đồng";
          set({ error: errorMessage, isRespondingToContract: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // ==================== PAYMENT ACTIONS ====================

      getPaymentSchedule: async (contractId: string) => {
        set({ isLoading: true, error: null });
        try {
          const paymentSchedule = await contractService.getPaymentSchedule(
            contractId
          );
          set({
            currentPaymentSchedule: paymentSchedule,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Không thể tải lịch thanh toán";
          set({ error: errorMessage, isLoading: false });
        }
      },

      getStudentPaymentSchedules: async (filters?: any) => {
        set({ isLoading: true, error: null });
        try {
          const result = await contractService.getStudentPaymentSchedules(
            filters
          );
          set({
            paymentSchedules: result.schedules,
            pagination: result.pagination,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Không thể tải lịch thanh toán";
          set({ error: errorMessage, isLoading: false });
        }
      },

      getTutorPaymentSchedules: async (filters?: any) => {
        set({ isLoading: true, error: null });
        try {
          const result = await contractService.getTutorPaymentSchedules(
            filters
          );
          set({
            paymentSchedules: result.schedules,
            pagination: result.pagination,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Không thể tải lịch thanh toán";
          set({ error: errorMessage, isLoading: false });
        }
      },

      processPayment: async (
        paymentScheduleId: string,
        paymentData: ProcessPaymentInput
      ) => {
        set({ isProcessingPayment: true, error: null });
        try {
          const updatedSchedule = await contractService.processPayment(
            paymentScheduleId,
            paymentData
          );

          // Update payment schedules in state
          set((state) => ({
            paymentSchedules: state.paymentSchedules.map((s) =>
              s.id === paymentScheduleId ? updatedSchedule : s
            ),
            currentPaymentSchedule:
              state.currentPaymentSchedule?.id === paymentScheduleId
                ? updatedSchedule
                : state.currentPaymentSchedule,
            isProcessingPayment: false,
          }));

          toast.success("Thanh toán đã được xử lý thành công!");
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Không thể xử lý thanh toán";
          set({ error: errorMessage, isProcessingPayment: false });
          toast.error(errorMessage);
        }
      },

      // ==================== UTILITY ACTIONS ====================

      setFilters: (newFilters: Partial<ContractFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      clearContracts: () => {
        set({ contracts: [], pendingContracts: [] });
      },

      clearCurrentContract: () => {
        set({ currentContract: null, currentPaymentSchedule: null });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "contract-store",
    }
  )
);

export default useContractStore;

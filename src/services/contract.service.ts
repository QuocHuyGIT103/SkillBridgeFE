import axiosClient from "../api/axiosClient";
import type {
  Contract,
  CreateContractInput,
  StudentContractResponse,
  ContractFilters,
  PaymentSchedule,
  ProcessPaymentInput,
} from "../types/contract.types";

class ContractService {
  private baseURL = "/contracts";

  // ==================== CONTRACT MANAGEMENT ====================

  // Create contract (Tutor)
  async createContract(data: CreateContractInput): Promise<Contract> {
    const response = await axiosClient.post(this.baseURL, data);
    return response.data;
  }

  // Get tutor's contracts
  async getTutorContracts(filters?: ContractFilters): Promise<{
    contracts: Contract[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const response = await axiosClient.get(
      `${this.baseURL}/tutor/my-contracts`,
      {
        params: filters,
      }
    );
    return response.data;
  }

  // Get student's contracts
  async getStudentContracts(filters?: ContractFilters): Promise<{
    contracts: Contract[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const response = await axiosClient.get(
      `${this.baseURL}/student/my-contracts`,
      {
        params: filters,
      }
    );
    return response.data;
  }

  // Get pending contracts for student
  async getPendingContracts(): Promise<Contract[]> {
    const response = await axiosClient.get(`${this.baseURL}/student/pending`);
    return response.data;
  }

  // Get contract by ID
  async getContractById(contractId: string): Promise<Contract> {
    const response = await axiosClient.get(`${this.baseURL}/${contractId}`);
    return response.data;
  }

  // Student respond to contract
  async respondToContract(
    contractId: string,
    response: StudentContractResponse
  ): Promise<Contract> {
    const apiResponse = await axiosClient.put(
      `${this.baseURL}/${contractId}/respond`,
      response
    );
    return apiResponse.data;
  }

  // Cancel contract
  async cancelContract(contractId: string, reason?: string): Promise<Contract> {
    const response = await axiosClient.put(
      `${this.baseURL}/${contractId}/cancel`,
      { reason }
    );
    return response.data;
  }

  // ==================== PAYMENT MANAGEMENT ====================

  // Get payment schedule for contract
  async getPaymentSchedule(contractId: string): Promise<PaymentSchedule> {
    const response = await axiosClient.get(
      `${this.baseURL}/${contractId}/payment-schedule`
    );
    return response.data;
  }

  // Get student's payment schedules
  async getStudentPaymentSchedules(filters?: any): Promise<{
    schedules: PaymentSchedule[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const response = await axiosClient.get(
      `${this.baseURL}/student/payment-schedules`,
      {
        params: filters,
      }
    );
    return response.data;
  }

  // Get tutor's payment schedules
  async getTutorPaymentSchedules(filters?: any): Promise<{
    schedules: PaymentSchedule[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const response = await axiosClient.get(
      `${this.baseURL}/tutor/payment-schedules`,
      {
        params: filters,
      }
    );
    return response.data;
  }

  // Process payment
  async processPayment(
    paymentScheduleId: string,
    paymentData: ProcessPaymentInput
  ): Promise<PaymentSchedule> {
    const response = await axiosClient.post(
      `${this.baseURL}/payment-schedules/${paymentScheduleId}/pay`,
      paymentData
    );
    return response.data;
  }

  // ==================== ADMIN ENDPOINTS ====================

  // Get all contracts (Admin)
  async getAllContracts(filters?: ContractFilters): Promise<{
    contracts: Contract[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const response = await axiosClient.get(`${this.baseURL}/admin/all`, {
      params: filters,
    });
    return response.data;
  }

  // Get contract statistics (Admin)
  async getContractStats(): Promise<{
    statusStats: Array<{ _id: string; count: number; totalValue: number }>;
    monthlyStats: Array<{
      _id: { year: number; month: number };
      count: number;
      totalValue: number;
    }>;
  }> {
    const response = await axiosClient.get(`${this.baseURL}/admin/stats`);
    return response.data;
  }

  // ==================== CONTRACT SIGNING (OTP-based E-signature) ====================

  // Initiate contract signing - sends OTP to email
  async initiateContractSigning(
    contractId: string,
    role: "student" | "tutor"
  ): Promise<{
    contractId: string;
    email: string;
    expiresAt: string;
    role: string;
  }> {
    const response = await axiosClient.post(
      `${this.baseURL}/${contractId}/initiate-signing`,
      { role }
    );
    return response.data;
  }

  // Verify OTP and sign contract
  async verifyContractSignature(
    contractId: string,
    otpCode: string,
    role: "student" | "tutor",
    consentText: string
  ): Promise<{
    contractId: string;
    signedAt: string;
    role: string;
    fullySignedNow: boolean;
    message: string;
  }> {
    const response = await axiosClient.post(
      `${this.baseURL}/${contractId}/verify-signature`,
      {
        otpCode,
        role,
        consentText,
      }
    );
    return response.data;
  }

  // Resend OTP for contract signing
  async resendContractOTP(
    contractId: string,
    role: "student" | "tutor"
  ): Promise<{
    contractId: string;
    email: string;
    expiresAt: string;
  }> {
    const response = await axiosClient.post(
      `${this.baseURL}/${contractId}/resend-otp`,
      { role }
    );
    return response.data;
  }

  // NEW: Approve and sign contract in one action (Student only)
  async approveAndSignContract(
    contractId: string,
    data: {
      otpCode: string;
      consentText: string;
      message?: string;
    }
  ): Promise<{
    contractId: string;
    approvedAt: string;
    signedAt: string;
    fullySignedNow: boolean;
    message: string;
  }> {
    const response = await axiosClient.put(
      `${this.baseURL}/${contractId}/approve-and-sign`,
      data
    );
    return response.data;
  }

  // NEW: Auto-sign contract for tutor (when creating contract)
  async autoSignForTutor(contractId: string): Promise<{
    contractId: string;
    signedAt: string;
    autoSigned: boolean;
    tutorSigned: boolean;
    awaitingStudentApproval: boolean;
  }> {
    const response = await axiosClient.put(
      `${this.baseURL}/${contractId}/auto-sign-tutor`
    );
    return response.data;
  }

  // Get contract audit trail (signature records)
  async getContractAuditTrail(contractId: string): Promise<{
    contract: {
      id: string;
      contractHash: string;
      isSigned: boolean;
      isLocked: boolean;
      lockedAt?: string;
      studentSignedAt?: string;
      tutorSignedAt?: string;
    };
    signatures: Array<{
      _id: string;
      signer_id: string;
      signer_role: string;
      email: string;
      ip_address?: string;
      signed_at: string;
      status: string;
    }>;
    integrityValid: boolean;
  }> {
    const response = await axiosClient.get(
      `${this.baseURL}/${contractId}/audit-trail`
    );
    return response.data;
  }
}

const contractService = new ContractService();
export default contractService;

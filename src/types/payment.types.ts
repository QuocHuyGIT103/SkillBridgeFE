// Payment types and interfaces for admin transaction management

export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED"
  | "REFUNDED"
  | "CANCELLED";

export type PaymentMethod = "VNPAY" | "BANK_TRANSFER" | "CASH";

export type PaymentType = "SINGLE_WEEK" | "MULTI_WEEK" | "FULL_REMAINING";

export type PaymentGateway = "VNPAY";

export interface PaymentUser {
  _id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string | null;
}

export interface PaymentClass {
  _id: string;
  title: string;
  description?: string;
  total_sessions?: number;
}

export interface PaymentContract {
  _id: string;
  contract_code: string;
  status: string;
  total_amount: number;
}

export interface RefundInfo {
  reason: string;
  amount: number;
  refundedBy: string;
  refundedAt: Date;
}

export interface BankTransferProof {
  screenshotUrl: string;
  uploadedAt: Date;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface PaymentListItem {
  _id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  sessionNumbers: number[];
  studentId: PaymentUser;
  tutorId: PaymentUser;
  learningClassId: PaymentClass;
  contractId?: PaymentContract;
  createdAt: string;
  paidAt?: string;
  expiredAt?: string;
  gatewayTransactionId?: string;
  gatewayBankCode?: string;
}

export interface PaymentDetail extends PaymentListItem {
  paymentScheduleId?: string;
  paymentGateway: PaymentGateway;
  gatewayResponseCode?: string;
  gatewayOrderInfo?: string;
  gatewayData?: any;
  refundInfo?: RefundInfo;
  bankTransferProof?: BankTransferProof;
  notes?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  updatedAt?: string;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentType?: PaymentType;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: "createdAt" | "amount" | "paidAt";
  sortOrder?: "asc" | "desc";
}

export interface PaymentPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaymentListResponse {
  payments: PaymentListItem[];
  pagination: PaymentPagination;
}

export interface StatusStat {
  _id: PaymentStatus;
  count: number;
  totalAmount: number;
}

export interface PaymentMethodStat {
  _id: PaymentMethod;
  count: number;
  totalAmount: number;
}

export interface DailyStat {
  _id: {
    year: number;
    month: number;
    day: number;
  };
  revenue: number;
  count: number;
}

export interface PaymentStats {
  statusStats: StatusStat[];
  paymentMethodStats: PaymentMethodStat[];
  revenue: {
    total: number;
    count: number;
    average: number;
  };
  refunds: {
    total: number;
    count: number;
  };
  successRate: number;
  dailyStats: DailyStat[];
}

export interface PaymentStatsFilters {
  startDate?: string;
  endDate?: string;
}

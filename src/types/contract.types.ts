// Contract related types for frontend

export interface Contract {
  id: string;
  contactRequestId: string;
  studentId: string;
  tutorId: string;
  tutorPostId: string;
  studentPostId?: string;

  // Contract terms
  title: string;
  description?: string;
  totalSessions: number;
  pricePerSession: number;
  totalAmount: number;
  sessionDuration: number;
  learningMode: "ONLINE" | "OFFLINE";

  // Schedule
  schedule: {
    dayOfWeek: number[];
    startTime: string;
    endTime: string;
    timezone: string;
  };

  startDate: string;
  expectedEndDate: string;

  // Location (for offline classes)
  location?: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  // Online meeting info (for online classes)
  onlineInfo?: {
    platform: "ZOOM" | "GOOGLE_MEET" | "MICROSOFT_TEAMS" | "OTHER";
    meetingLink?: string;
    meetingId?: string;
    password?: string;
  };

  // Status
  status:
    | "DRAFT"
    | "PENDING_STUDENT_APPROVAL"
    | "APPROVED"
    | "REJECTED"
    | "EXPIRED"
    | "CANCELLED";

  // Student response
  studentResponse?: {
    action: "APPROVE" | "REJECT" | "REQUEST_CHANGES";
    respondedAt: string;
    message?: string;
    requestedChanges?: string;
  };

  // Metadata
  contractVersion: number;
  previousContractId?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;

  // Electronic signature fields
  contractHash?: string;
  originalContent?: string;
  isSigned: boolean;
  isLocked: boolean;
  lockedAt?: string;
  studentSignedAt?: string;
  tutorSignedAt?: string;

  // Populated fields (from API)
  student?: {
    id: string;
    full_name: string;
    email: string;
    avatar?: string;
  };

  tutor?: {
    id: string;
    full_name: string;
    email: string;
    avatar?: string;
  };

  tutorPost?: {
    id: string;
    title: string;
    pricePerSession: number;
  };

  subjectInfo?: {
    id: string;
    name: string;
  };
}

export interface CreateContractInput {
  contactRequestId: string;
  title: string;
  description?: string;
  totalSessions: number;
  pricePerSession: number;
  totalAmount: number;
  sessionDuration: number;
  learningMode: "ONLINE" | "OFFLINE";
  schedule: {
    dayOfWeek: number[];
    startTime: string;
    endTime: string;
  };
  startDate: string;
  expectedEndDate: string;
  location?: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  onlineInfo?: {
    platform: "ZOOM" | "GOOGLE_MEET" | "MICROSOFT_TEAMS" | "OTHER";
    meetingLink?: string;
    meetingId?: string;
    password?: string;
  };
}

export interface StudentContractResponse {
  action: "APPROVE" | "REJECT" | "REQUEST_CHANGES";
  message?: string;
  requestedChanges?: string;
}

export interface PaymentSchedule {
  id: string;
  contractId: string;
  learningClassId?: string;
  studentId: string;
  tutorId: string;

  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: "FULL_PAYMENT" | "INSTALLMENTS";

  installments: PaymentInstallment[];
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "OVERDUE";

  paymentTerms: {
    lateFeePercentage: number;
    gracePeriodDays: number;
    cancellationPolicy: {
      refundPercentage: number;
      minimumNoticeDays: number;
    };
  };

  firstPaymentDueDate: string;
  lastPaymentDueDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface PaymentInstallment {
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  paidAt?: string;
  paymentMethod?: "BANK_TRANSFER" | "CREDIT_CARD" | "E_WALLET" | "CASH";
  transactionId?: string;
  notes?: string;
}

export interface ContractFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export interface ProcessPaymentInput {
  installmentNumber: number;
  paymentMethod: "BANK_TRANSFER" | "CREDIT_CARD" | "E_WALLET" | "CASH";
  transactionId?: string;
  notes?: string;
}

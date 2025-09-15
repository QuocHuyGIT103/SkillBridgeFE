export interface AdminDashboardUser {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url: string | null;
  role: "admin" | "ADMIN";
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AdminNavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  children?: AdminNavigationSubItem[];
}

export interface AdminNavigationSubItem {
  id: string;
  label: string;
  path: string;
  badge?: number;
}

export interface UserManagementStats {
  total_users: number;
  total_students: number;
  total_tutors: number;
  active_users: number;
  blocked_users: number;
  new_registrations_today: number;
  pending_tutor_approvals: number;
}

export interface SystemStats {
  total_revenue: number;
  total_sessions: number;
  active_sessions: number;
  completed_sessions: number;
  pending_complaints: number;
  pending_withdrawals: number;
  commission_earnings: number;
  monthly_growth_rate: number;
}

export interface TutorApproval {
  id: string;
  tutor_id: string;
  tutor_name: string;
  email: string;
  specialization: string[];
  certificates: Certificate[];
  submitted_at: string;
  status: "pending" | "approved" | "rejected";
  admin_notes?: string;
}

export interface Certificate {
  id: string;
  name: string;
  institution: string;
  file_url: string;
  verification_status: "pending" | "verified" | "rejected";
  issued_date: string;
}

export interface SessionManagement {
  id: string;
  tutor_name: string;
  student_name: string;
  subject: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  payment_status: "pending" | "paid" | "refunded";
  amount: number;
}

export interface TransactionRecord {
  id: string;
  type: "payment" | "withdrawal" | "refund" | "commission";
  user_id: string;
  user_name: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  created_at: string;
  description: string;
  session_id?: string;
}

export interface Complaint {
  id: string;
  complainant_id: string;
  complainant_name: string;
  against_id: string;
  against_name: string;
  type: "quality" | "behavior" | "payment" | "technical" | "other";
  title: string;
  description: string;
  evidence_files: string[];
  status: "pending" | "investigating" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  admin_response?: string;
  resolution_notes?: string;
}

export interface SystemConfiguration {
  commission_rate: number;
  refund_policy_days: number;
  minimum_payout_amount: number;
  auto_approval_threshold: number;
  platform_fees: {
    transaction_fee: number;
    withdrawal_fee: number;
  };
  notification_settings: {
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
  };
}

export interface RevenueAnalytics {
  period: string;
  total_revenue: number;
  commission_revenue: number;
  transaction_fees: number;
  refunds: number;
  net_revenue: number;
  growth_rate: number;
}

export interface UserAnalytics {
  period: string;
  new_users: number;
  active_users: number;
  churn_rate: number;
  retention_rate: number;
  user_growth_rate: number;
}

export interface SessionAnalytics {
  period: string;
  total_sessions: number;
  completed_sessions: number;
  cancelled_sessions: number;
  completion_rate: number;
  average_session_duration: number;
  popular_subjects: { subject: string; count: number }[];
}

export interface ContactRequest {
  id: string;
  studentId: string | { full_name?: string; email?: string; phone_number?: string; avatar_url?: string; id?: string };
  tutorId: string;
  tutorPostId: string | Record<string, any>; // backend có thể trả object populate ở đây
  studentPostId?: string | Record<string, any>; // backend có thể trả object populate ở đây
  initiatedBy?: 'STUDENT' | 'TUTOR';
  tutorPost?: Record<string, any>; // optional fallback nếu backend dùng khác tên
  studentPost?: { // populated when initiatedBy = 'TUTOR'
    id: string;
    title: string;
    content?: string;
    subjects?: string[];
    grade_levels?: string[];
    hourly_rate?: {
      min: number;
      max: number;
    };
    is_online?: boolean;
  };
  subject: string | { _id?: string; name?: string };
  message: string;
  preferredSchedule?: string;
  expectedPrice?: number;
  sessionDuration?: number;
  learningMode?: string;
  status?: string;
  
  studentContact: {
    phone?: string;
    email?: string;
    preferredContactMethod: 'phone' | 'email' | 'both';
  };
  
  tutorResponse?: {
    message?: string;
    acceptedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    counterOffer?: {
      pricePerSession?: number;
      sessionDuration?: number;
      schedule?: string;
      conditions?: string;
    };
  };
  
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated fields
  tutor?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    phone_number?: string;
    email?: string;
  };
  
  student?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    phone_number?: string;
    email?: string;
  };
  
  subjectInfo?: {
    id: string;
    name: string;
  };
}

export interface CreateContactRequestInput {
  tutorPostId: string;
  subject: string;
  message: string;
  preferredSchedule?: string;
  expectedPrice?: number;
  sessionDuration?: number;
  learningMode: 'ONLINE' | 'OFFLINE' | 'FLEXIBLE';
  studentContact: {
    phone?: string;
    email?: string;
    preferredContactMethod: 'phone' | 'email' | 'both';
  };
}

export interface TutorResponseInput {
  message?: string;
  action: 'ACCEPT' | 'REJECT';
  rejectionReason?: 'SCHEDULE_CONFLICT' | 'PRICE_DISAGREEMENT' | 'STUDENT_LEVEL_MISMATCH' | 'LOCATION_ISSUE' | 'PERSONAL_REASON' | 'OTHER';
  counterOffer?: {
    pricePerSession?: number;
    sessionDuration?: number;
    schedule?: string;
    conditions?: string;
  };
}

export interface CreateLearningClassInput {
  contactRequestId: string;
  title: string;
  description?: string;
  totalSessions: number;
  schedule: {
    dayOfWeek: number[];
    startTime: string;
    endTime: string;
  };
  startDate: string;
  location?: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  onlineInfo?: {
    platform: 'ZOOM' | 'GOOGLE_MEET' | 'MICROSOFT_TEAMS' | 'OTHER';
    meetingLink?: string;
    meetingId?: string;
    password?: string;
  };
}

export interface ContactRequestFilters {
  status?: string;
  subject?: string;
  learningMode?: string;
  initiatedBy?: 'STUDENT' | 'TUTOR';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface LearningClass {
  id: string;
  contactRequestId: string;
  studentId: string;
  tutorId: string;
  tutorPostId: string;
  subject: string;
  title: string;
  description?: string;
  pricePerSession: number;
  sessionDuration: number;
  totalSessions: number;
  learningMode: 'ONLINE' | 'OFFLINE';
  
  schedule: {
    dayOfWeek: number[];
    startTime: string;
    endTime: string;
    timezone: string;
  };
  
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  
  location?: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  onlineInfo?: {
    platform: 'ZOOM' | 'GOOGLE_MEET' | 'MICROSOFT_TEAMS' | 'OTHER';
    meetingLink?: string;
    meetingId?: string;
    password?: string;
  };
  
  sessions: LearningSession[];
  completedSessions: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PAUSED';
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'COMPLETED';
  
  createdAt: string;
  updatedAt: string;
}

export interface LearningSession {
  sessionNumber: number;
  scheduledDate: string;
  duration: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
  actualStartTime?: string;
  actualEndTime?: string;
  notes?: string;
  homework?: string;
  
  studentFeedback?: {
    rating: number;
    comment?: string;
    submittedAt: string;
  };
  
  tutorFeedback?: {
    performance: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';
    attendance: 'ON_TIME' | 'LATE' | 'ABSENT';
    comment?: string;
    submittedAt: string;
  };
}

// Constants
export const LEARNING_MODES = [
  { value: 'ONLINE', label: 'Học online' },
  { value: 'OFFLINE', label: 'Học trực tiếp' },
  { value: 'FLEXIBLE', label: 'Linh hoạt' }
] as const;

export const SESSION_DURATIONS = [
  { value: 60, label: '60 phút' },
  { value: 90, label: '90 phút' },
  { value: 120, label: '120 phút' },
  { value: 150, label: '150 phút' },
  { value: 180, label: '180 phút' }
] as const;

export const CONTACT_METHODS = [
  { value: 'phone', label: 'Điện thoại' },
  { value: 'email', label: 'Email' },
  { value: 'both', label: 'Cả hai' }
] as const;

export const REQUEST_STATUS_LABELS = {
  PENDING: 'Chờ phản hồi',
  ACCEPTED: 'Đã chấp nhận',
  REJECTED: 'Đã từ chối',
  CANCELLED: 'Đã hủy',
  EXPIRED: 'Hết hạn'
};

export const REJECTION_REASONS = {
  SCHEDULE_CONFLICT: 'Xung đột lịch học',
  PRICE_DISAGREEMENT: 'Không đồng ý về giá',
  STUDENT_LEVEL_MISMATCH: 'Không phù hợp trình độ',
  LOCATION_ISSUE: 'Vấn đề về địa điểm',
  PERSONAL_REASON: 'Lý do cá nhân',
  OTHER: 'Lý do khác'
};

export const ONLINE_PLATFORMS = [
  { value: 'ZOOM', label: 'Zoom' },
  { value: 'GOOGLE_MEET', label: 'Google Meet' },
  { value: 'MICROSOFT_TEAMS', label: 'Microsoft Teams' },
  { value: 'OTHER', label: 'Khác' }
] as const;
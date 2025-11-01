export interface LearningClass {
  _id: string;
  title: string;
  subject: {
    _id: string;
    name: string;
  };
  description?: string;
  startDate: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  schedule: {
    dayOfWeek: number[];
    startTime: string;
    endTime: string;
    timezone: string;
  };
  location?: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  onlineInfo?: {
    platform: string;
    meetingLink: string;
    meetingId: string;
    password: string;
  };
  pricePerSession: number;
  sessionDuration: number;
  totalSessions: number;
  completedSessions: number;
  learningMode: 'ONLINE' | 'OFFLINE';
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PAUSED';
  tutorId: {
    full_name: string;
    email: string;
    phone_number: string;
    avatar_url?: string;
    id: string;
  };
  studentId: {
    full_name: string;
    email: string;
    phone_number: string;
    avatar_url?: string;
    id: string;
  };
  contactRequestId: string;
  tutorPostId: string;
  sessions: Array<{
    sessionNumber: number;
    scheduledDate: string;
    duration: number;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
    actualStartTime?: string;
    actualEndTime?: string;
    notes?: string;
    homework?: string;
  }>;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'COMPLETED';
  studentReview?: {
    rating: number;
    comment?: string;
    submittedAt: string;
  };
  tutorReview?: {
    rating: number;
    comment?: string;
    submittedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}
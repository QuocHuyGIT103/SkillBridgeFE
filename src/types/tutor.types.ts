export interface TutorDashboardUser {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url: string | null;
  role: "tutor" | "TUTOR";
  status: string;
  specialization?: string[];
  rating?: number;
  total_students?: number;
  total_lessons?: number;
  created_at: string;
  updated_at: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  children?: NavigationSubItem[];
}

export interface NavigationSubItem {
  id: string;
  label: string;
  path: string;
  badge?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
  action_url?: string;
}

export interface DashboardStats {
  total_students: number;
  active_lessons: number;
  completed_lessons: number;
  total_earnings: number;
  pending_payments: number;
  avg_rating: number;
  upcoming_sessions: number;
  new_messages: number;
}

export interface RecentActivity {
  id: string;
  type:
    | "lesson_completed"
    | "new_student"
    | "payment_received"
    | "message_received"
    | "lesson_scheduled";
  title: string;
  description: string;
  timestamp: string;
  student_name?: string;
  amount?: number;
}

export interface UpcomingSession {
  id: string;
  student_name: string;
  student_avatar?: string;
  subject: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "confirmed" | "pending" | "cancelled";
  meeting_link?: string;
}

export interface Student {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  subjects: string[];
  level: string;
  total_lessons: number;
  last_lesson: string;
  status: "active" | "inactive" | "pending";
}

export interface Lesson {
  id: string;
  student_id: string;
  student_name: string;
  subject: string;
  topic: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  meeting_link?: string;
  notes?: string;
  materials?: string[];
}

export interface ChatConversation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_avatar?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  is_online: boolean;
}

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  type: "text" | "file" | "image";
  timestamp: string;
  read: boolean;
}

export interface FinancialTransaction {
  id: string;
  type: "payment" | "withdrawal" | "refund";
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  description: string;
  student_name?: string;
  lesson_id?: string;
  created_at: string;
}

export interface TutorProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url: string | null;
  bio?: string;
  specialization: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
  hourly_rate: number;
  availability: AvailabilitySlot[];
  rating: number;
  total_reviews: number;
  total_students: number;
  total_lessons: number;
  created_at: string;
}

// TutorProfile for verification (from qualification.types.ts)
export interface TutorProfileVerification {
  id: string;
  user_id: string;
  headline?: string;
  introduction?: string;
  teaching_experience?: string;
  student_levels?: string;
  video_intro_link?: string;
  cccd_images: string[];
  status: string; // VerificationStatus
  rejection_reason?: string;
  verified_at?: string;
  verified_by?: string;
  verified_data?: {
    headline?: string;
    introduction?: string;
    teaching_experience?: string;
    student_levels?: string;
    video_intro_link?: string;
    cccd_images?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: number;
  end_year?: number;
  description?: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  start_date: string;
  end_date?: string;
  description: string;
  current: boolean;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: "beginner" | "intermediate" | "advanced" | "native";
}

export interface AvailabilitySlot {
  id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
  is_available: boolean;
}

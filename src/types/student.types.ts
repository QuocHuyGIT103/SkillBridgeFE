// Student types
export interface StudentNavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

export interface StudentStats {
  weeklyLessons: number;
  totalStudyHours: number;
  subjects: number;
  averageGrade: number;
}

export interface Lesson {
  id: number;
  title: string;
  tutor: string;
  date: string;
  time: string;
  type: "online" | "offline";
  location?: string;
  status: "confirmed" | "pending" | "cancelled";
  avatar?: string;
}

export interface Assignment {
  id: number;
  title: string;
  subject: string;
  tutor: string;
  dueDate?: string;
  dueTime?: string;
  submittedDate?: string;
  submittedTime?: string;
  description: string;
  priority?: "high" | "medium" | "low";
  estimatedTime?: string;
  attachments?: string[];
  instructions?: string;
  feedback?: string;
  grade?: number;
  submittedFiles?: string[];
}

export interface Tutor {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  subjects: string[];
  experience: string;
  price: string;
  location: string;
  isOnline: boolean;
  description: string;
  achievements: string[];
  verified: boolean;
  responseTime: string;
}

export interface Conversation {
  id: number;
  tutorName: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  subject: string;
}

export interface Message {
  id: number;
  senderId: "tutor" | "student";
  content: string;
  timestamp: string;
  type: "text" | "file";
}

// Thêm interface mới
export interface ParentStudentProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  role: string;
  status: string;
  address?: string;
  parent_id?: string;
  date_of_birth?: Date;
  gender?: 'male' | 'female' | 'other';
  grade?: string;
  school?: string;
  subjects?: string[];
  learning_goals?: string;
  preferred_schedule?: string;
  special_requirements?: string;
  created_at: Date;
  updated_at: Date;
}

export interface StudentManagementStats {
  total_students: number;
  active_students: number;
  by_grade: Array<{ grade: string; count: number }>;
  by_subject: Array<{ subject: string; count: number }>;
  recent_students: ParentStudentProfile[];
}

export interface CreateStudentForm {
  full_name: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  phone_number?: string;
  address?: string;
  grade?: string;
  school?: string;
  subjects?: string[];
  learning_goals?: string;
  preferred_schedule?: string;
  special_requirements?: string;
}
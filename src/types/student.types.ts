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
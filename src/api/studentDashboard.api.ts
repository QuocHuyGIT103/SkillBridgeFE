import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types";
import type { StudentProfileData } from "../types/student.types";
import type { LearningClass } from "../types/LearningClass";
import type { Contract } from "../types/contract.types";

// ===== TYPES FOR DASHBOARD =====

export interface DashboardStats {
  weeklyLessons: number;
  totalStudyHours: number;
  activeClasses: number;
  pendingContracts: number;
}

export interface WeeklySession {
  classId: string;
  className: string;
  sessionNumber: number;
  scheduledDate: string;
  dayOfWeek: number;
  timeSlot: string;
  duration: number;
  status: string;
  learningMode: "ONLINE" | "OFFLINE";
  meetingLink?: string;
  location?: {
    details: string;
  };
  tutor: {
    _id: string;
    full_name: string;
    avatar_url?: string;
  };
  student: {
    _id: string;
    full_name: string;
    avatar_url?: string;
  };
  attendance?: {
    tutorAttended: boolean;
    studentAttended: boolean;
  };
  canAttend?: boolean;
  canJoin?: boolean;
}

export interface WeeklyScheduleResponse {
  weekStart: string;
  weekEnd: string;
  sessions: WeeklySession[];
  totalSessions: number;
}

export interface ConversationItem {
  _id: string;
  contactRequestId: string;
  studentId:
    | string
    | {
        _id: string;
        full_name: string;
        avatar_url?: string;
      };
  tutorId:
    | string
    | {
        _id: string;
        full_name: string;
        avatar_url?: string;
      };
  tutorPostId?:
    | string
    | {
        _id: string;
        title: string;
      };
  subject?:
    | string
    | {
        _id: string;
        name: string;
      };
  status: string;
  lastMessage?: {
    content: string;
    senderId: string;
    sentAt: string;
    messageType: string;
  };
  unreadCount: {
    student: number;
    tutor: number;
  };
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface NotificationCount {
  unreadCount: number;
}

// ===== API FUNCTIONS =====

/**
 * Get student profile data
 */
export const getStudentProfile = async (): Promise<
  ApiResponse<StudentProfileData>
> => {
  return axiosClient.get<StudentProfileData>("/student/profile");
};

/**
 * Get all student's classes
 */
export const getStudentClasses = async (): Promise<
  ApiResponse<LearningClass[]>
> => {
  return axiosClient.get<LearningClass[]>("/classes/student");
};

/**
 * Get student's weekly schedule
 */
export const getWeeklySchedule = async (): Promise<
  ApiResponse<WeeklyScheduleResponse>
> => {
  return axiosClient.get<WeeklyScheduleResponse>("/classes/schedule/week");
};

/**
 * Get pending contracts for student
 */
export const getPendingContracts = async (): Promise<
  ApiResponse<Contract[]>
> => {
  return axiosClient.get<Contract[]>("/contracts/student/pending");
};

/**
 * Get student's conversations
 */
export const getConversations = async (): Promise<
  ApiResponse<ConversationItem[]>
> => {
  return axiosClient.get<ConversationItem[]>("/messages/conversations");
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async (): Promise<
  ApiResponse<NotificationCount>
> => {
  return axiosClient.get<NotificationCount>("/notifications/unread-count");
};

/**
 * Calculate dashboard statistics from classes data
 */
export const calculateDashboardStats = (
  classes: LearningClass[],
  weeklySchedule: WeeklyScheduleResponse,
  pendingContracts: Contract[]
): DashboardStats => {
  // Calculate total study hours from all completed sessions
  const totalStudyHours = classes.reduce((total, cls) => {
    return total + (cls.completedSessions * cls.sessionDuration) / 60;
  }, 0);

  // Count active classes
  const activeClasses = classes.filter((cls) => cls.status === "ACTIVE").length;

  // Weekly lessons from schedule
  const weeklyLessons = weeklySchedule.sessions?.length || 0;

  // Pending contracts count
  const pendingContractsCount = pendingContracts.length;

  return {
    weeklyLessons,
    totalStudyHours: Math.round(totalStudyHours),
    activeClasses,
    pendingContracts: pendingContractsCount,
  };
};

/**
 * Get today's sessions from weekly schedule
 */
export const getTodaySessions = (
  weeklySchedule: WeeklyScheduleResponse
): WeeklySession[] => {
  if (!weeklySchedule?.sessions || !Array.isArray(weeklySchedule.sessions)) {
    return [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return weeklySchedule.sessions.filter((session) => {
    const sessionDate = new Date(session.scheduledDate);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === today.getTime();
  });
};

/**
 * Count unread messages from conversations
 */
export const countUnreadMessages = (
  conversations: ConversationItem[],
  currentUserId: string
): number => {
  if (!conversations || !Array.isArray(conversations)) {
    return 0;
  }

  return conversations.reduce((total, conversation) => {
    // Determine if current user is student or tutor
    const studentId =
      typeof conversation.studentId === "string"
        ? conversation.studentId
        : conversation.studentId?._id;

    const isStudent = studentId === currentUserId;

    // Get unread count based on user role
    const unreadCount = isStudent
      ? conversation.unreadCount?.student || 0
      : conversation.unreadCount?.tutor || 0;

    return total + unreadCount;
  }, 0);
};

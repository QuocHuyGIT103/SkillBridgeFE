// Types for Attendance and Homework features

export interface SessionAttendance {
  tutorAttended: boolean;
  tutorAttendedAt?: Date | string;
  studentAttended: boolean;
  studentAttendedAt?: Date | string;
}

export interface HomeworkSubmission {
  fileUrl: string;
  notes?: string;
  submittedAt: Date | string;
}

export interface HomeworkGrade {
  score: number; // 0-10
  feedback?: string;
  gradedAt: Date | string;
}

export type SessionAssignmentStatus = 'pending' | 'submitted' | 'graded';

export interface SessionAssignment {
  id: string;
  title: string;
  description?: string;
  fileUrl?: string;
  deadline?: Date | string;
  assignedAt?: Date | string;
  submission?: HomeworkSubmission;
  grade?: HomeworkGrade;
  status: SessionAssignmentStatus;
  isLate: boolean;
  isLegacy?: boolean;
}

export interface SessionHomework {
  hasAssignment: boolean;
  hasSubmission: boolean;
  hasGrade: boolean;
  totalAssignments: number;
  totalSubmitted: number;
  totalGraded: number;
  isLate: boolean;
  assignments: SessionAssignment[];
}

export interface CancellationRequest {
  requestedBy: 'TUTOR' | 'STUDENT';
  reason: string;
  requestedAt: Date | string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface WeeklySession {
  classId: string;
  className: string;
  sessionNumber: number;
  scheduledDate: Date | string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  timeSlot: string; // e.g., "14:00 - 15:30"
  duration: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'MISSED' | 'PENDING_CANCELLATION';
  learningMode: 'ONLINE' | 'OFFLINE';
  meetingLink?: string;
  location?: {
  type?: string;
  details?: string;
  address?: string;
  };
  attendance: SessionAttendance;
  homework: SessionHomework;
  cancellationRequest?: CancellationRequest;
  canAttend: boolean; // Có thể điểm danh (trong khung giờ)
  canJoin: boolean;   // Có thể vào Google Meet (cả 2 đã điểm danh)
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
}

export interface WeeklyScheduleResponse {
  success: boolean;
  data: {
    weekStart: Date | string;
    weekEnd: Date | string;
    totalSessions: number;
    sessions: WeeklySession[];
  };
}

// Request types
export interface AssignHomeworkRequest {
  title: string;
  description: string;
  fileUrl?: string;
  deadline: string; // ISO date string
}

export interface SubmitHomeworkRequest {
  assignmentId: string;
  fileUrl: string;
  notes?: string;
}

export interface GradeHomeworkRequest {
  assignmentId: string;
  score: number;
  feedback?: string;
}

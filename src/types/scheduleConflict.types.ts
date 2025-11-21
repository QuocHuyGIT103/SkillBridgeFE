export interface ScheduleConflictCheck {
  tutorId: string;
  studentId: string;
  dayOfWeek: number[];
  startTime: string;
  endTime: string;
  startDate: string;
  excludeClassId?: string;
}

export interface ConflictClass {
  classId: string;
  className: string;
  conflictingDays: string[];
  existingTime: string;
  studentName?: string;
  tutorName?: string;
}

export interface ScheduleConflictResult {
  tutorConflicts: ConflictClass[];
  studentConflicts: ConflictClass[];
  hasConflict: boolean;
}

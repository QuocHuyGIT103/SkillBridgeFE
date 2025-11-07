import axiosClient from '../api/axiosClient';
import type {
  WeeklyScheduleResponse,
  AssignHomeworkRequest,
  SubmitHomeworkRequest,
  GradeHomeworkRequest,
} from '../types/attendance';

export const attendanceService = {
  /**
   * Điểm danh cho buổi học
   */
  markAttendance: async (classId: string, sessionNumber: number) => {
    const response = await axiosClient.post(
      `/classes/${classId}/sessions/${sessionNumber}/attendance`
    );
    return response; // ✅ Đã unwrap
  },

  /**
   * Giao bài tập (Tutor only)
   */
  assignHomework: async (
    classId: string,
    sessionNumber: number,
    data: AssignHomeworkRequest
  ) => {
    const response = await axiosClient.post(
      `/classes/${classId}/sessions/${sessionNumber}/homework/assign`,
      data
    );
    return response; // ✅ Đã unwrap
  },

  /**
   * Nộp bài tập (Student only)
   */
  submitHomework: async (
    classId: string,
    sessionNumber: number,
    data: SubmitHomeworkRequest
  ) => {
    const response = await axiosClient.post(
      `/classes/${classId}/sessions/${sessionNumber}/homework/submit`,
      data
    );
    return response; // ✅ Đã unwrap
  },

  /**
   * Chấm điểm (Tutor only)
   */
  gradeHomework: async (
    classId: string,
    sessionNumber: number,
    data: GradeHomeworkRequest
  ) => {
    const response = await axiosClient.post(
      `/classes/${classId}/sessions/${sessionNumber}/homework/grade`,
      data
    );
    return response; // ✅ Đã unwrap
  },

  /**
   * Lấy lịch học theo tuần
   */
  getWeeklySchedule: async (date?: string): Promise<WeeklyScheduleResponse> => {
    const url = date 
      ? `/classes/schedule/week?date=${date}`
      : `/classes/schedule/week`;
    const response = await axiosClient.get(url);
    return response; // ✅ Đã unwrap rồi, return trực tiếp
  },

  /**
   * Huỷ buổi học (Tutor only)
   */
  cancelSession: async (classId: string, sessionNumber: number) => {
    const response = await axiosClient.post(
      `/classes/${classId}/sessions/${sessionNumber}/cancel`
    );
    return response;
  },
};

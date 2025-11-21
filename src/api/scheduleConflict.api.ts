import apiClient from "./axiosClient";
import type {
  ScheduleConflictCheck,
  ScheduleConflictResult,
} from "../types/scheduleConflict.types";

export const scheduleConflictAPI = {
  /**
   * Check schedule conflict for both tutor and student
   */
  checkConflict: async (
    data: ScheduleConflictCheck
  ): Promise<ScheduleConflictResult> => {
    const response = await apiClient.post<ScheduleConflictResult>(
      "/classes/check-schedule-conflict",
      data
    );

    // apiClient đã xử lý response.data trong interceptor
    // response ở đây là { success: boolean, data: ScheduleConflictResult, message?: string }
    if (response.success && response.data) {
      return response.data;
    }

    throw new Error("Failed to check schedule conflict");
  },
};

import axiosClient from '../api/axiosClient';
import type { LearningClass } from '../types/LearningClass';

interface ClassScheduleResponse {
  class: LearningClass;
  sessions: any[];
  stats: {
    total: number;
    completed: number;
    scheduled: number;
    cancelled: number;
    missed: number;
  };
}

export const classService = {
  getTutorClasses: async (): Promise<LearningClass[]> => {
    const response = await axiosClient.get('/classes/tutor');
    return response.data;
  },
  
  getStudentClasses: async (): Promise<LearningClass[]> => {
    const response = await axiosClient.get('/classes/student');
    return response.data;
  },
  
  getClassById: async (classId: string): Promise<LearningClass> => {
    const response = await axiosClient.get(`/classes/${classId}`);
    return response.data;
  },

  getClassSchedule: async (classId: string): Promise<ClassScheduleResponse> => {
    const response = await axiosClient.get(`/classes/${classId}/schedule`);
    return response.data;
  },
  
  updateClassStatus: async (classId: string, status: string): Promise<void> => {
    await axiosClient.patch(`/classes/${classId}/status`, { status });
  },

  updateSessionStatus: async (
    classId: string,
    sessionNumber: number,
    status: string,
    notes?: string
  ): Promise<void> => {
    await axiosClient.patch(`/classes/${classId}/sessions/${sessionNumber}/status`, {
      status,
      notes
    });
  },
  
  createClass: async (classData: Partial<LearningClass>): Promise<LearningClass> => {
    const response = await axiosClient.post('/classes', classData);
    return response.data;
  },
  
  addReview: async (classId: string, reviewData: { rating: number; review: string }): Promise<void> => {
    await axiosClient.post(`/classes/${classId}/student-review`, reviewData);
  }
};
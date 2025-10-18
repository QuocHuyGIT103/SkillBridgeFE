import axiosClient from '../api/axiosClient';
import type { LearningClass } from '../types/LearningClass';

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
    // Fix: Return response.data directly instead of response.data.data
    return response.data;
  },
  
  updateClassStatus: async (classId: string, status: string): Promise<void> => {
    await axiosClient.patch(`/classes/${classId}/status`, { status });
  },
  
  createClass: async (classData: Partial<LearningClass>): Promise<LearningClass> => {
    const response = await axiosClient.post('/classes', classData);
    return response.data;
  },
  
  addReview: async (classId: string, reviewData: { rating: number, review: string }): Promise<void> => {
    await axiosClient.post(`/classes/${classId}/review`, reviewData);
  }
};
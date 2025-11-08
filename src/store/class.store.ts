import { create } from 'zustand';
import type { LearningClass } from '../types/LearningClass';
import { classService } from '../services/class.service';
import { toast } from 'react-hot-toast';

interface ClassScheduleData {
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

interface ClassState {
  tutorClasses: LearningClass[];
  studentClasses: LearningClass[];
  currentClass: LearningClass | null;
  currentSchedule: ClassScheduleData | null;
  loading: boolean;
  error: string | null;
  
  fetchTutorClasses: () => Promise<void>;
  fetchStudentClasses: () => Promise<void>;
  fetchClassById: (classId: string) => Promise<void>;
  fetchClassSchedule: (classId: string) => Promise<void>;
  updateClassStatus: (classId: string, status: string) => Promise<void>;
  updateSessionStatus: (classId: string, sessionNumber: number, status: string, notes?: string) => Promise<void>;
  addReview: (classId: string, rating: number, review: string) => Promise<void>;
  clearCurrentSchedule: () => void;
}

export const useClassStore = create<ClassState>((set, get) => ({
  tutorClasses: [],
  studentClasses: [],
  currentClass: null,
  currentSchedule: null,
  loading: false,
  error: null,
  
  fetchTutorClasses: async () => {
    set({ loading: true, error: null });
    try {
      const classes = await classService.getTutorClasses();
      set({ tutorClasses: classes, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch tutor classes:', error);
      set({ 
        error: 'Failed to fetch classes. Please try again later.', 
        loading: false 
      });
      toast.error('Không thể tải danh sách lớp học. Vui lòng thử lại sau.');
    }
  },
  
  fetchStudentClasses: async () => {
    set({ loading: true, error: null });
    try {
      const classes = await classService.getStudentClasses();
      set({ studentClasses: classes, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch student classes:', error);
      set({ 
        error: 'Failed to fetch classes. Please try again later.', 
        loading: false 
      });
      toast.error('Không thể tải danh sách lớp học. Vui lòng thử lại sau.');
    }
  },
  
  fetchClassById: async (classId: string) => {
    set({ loading: true, error: null });
    try {
      const classData = await classService.getClassById(classId);
      set({ currentClass: classData, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch class details:', error);
      set({ 
        error: 'Failed to fetch class details. Please try again later.', 
        loading: false 
      });
      toast.error('Không thể tải thông tin lớp học. Vui lòng thử lại sau.');
    }
  },

  fetchClassSchedule: async (classId: string) => {
    set({ loading: true, error: null });
    try {
      const scheduleData = await classService.getClassSchedule(classId);
      set({ currentSchedule: scheduleData, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch class schedule:', error);
      set({ 
        error: 'Failed to fetch schedule. Please try again later.', 
        loading: false 
      });
      toast.error('Không thể tải lịch học. Vui lòng thử lại sau.');
    }
  },
  
  updateClassStatus: async (classId: string, status: string) => {
    set({ loading: true, error: null });
    try {
      await classService.updateClassStatus(classId, status);
      
      // Refresh the class lists after update
      if (status === 'COMPLETED' || status === 'CANCELLED') {
        await get().fetchTutorClasses();
        await get().fetchStudentClasses();
        
        // If we're viewing this class, refresh it
        if (get().currentClass?._id === classId) {
          await get().fetchClassById(classId);
        }
      }
      
      set({ loading: false });
      toast.success('Cập nhật trạng thái lớp học thành công!');
    } catch (error: any) {
      console.error('Failed to update class status:', error);
      set({ 
        error: 'Failed to update class status. Please try again later.', 
        loading: false 
      });
      toast.error('Không thể cập nhật trạng thái lớp học. Vui lòng thử lại sau.');
    }
  },

  updateSessionStatus: async (classId: string, sessionNumber: number, status: string, notes?: string) => {
    set({ loading: true, error: null });
    try {
      await classService.updateSessionStatus(classId, sessionNumber, status, notes);
      
      // Refresh the schedule after update
      await get().fetchClassSchedule(classId);
      
      set({ loading: false });
      toast.success('Cập nhật trạng thái buổi học thành công!');
    } catch (error: any) {
      console.error('Failed to update session status:', error);
      set({ 
        error: 'Failed to update session status. Please try again later.', 
        loading: false 
      });
      toast.error('Không thể cập nhật trạng thái buổi học. Vui lòng thử lại sau.');
    }
  },
  
  addReview: async (classId: string, rating: number, review: string) => {
    set({ loading: true, error: null });
    try {
      await classService.addReview(classId, { rating, review });
      
      // Refresh the class details
      await get().fetchClassById(classId);
      
      set({ loading: false });
      toast.success('Đánh giá lớp học thành công!');
    } catch (error: any) {
      console.error('Failed to add review:', error);
      set({ 
        error: 'Failed to add review. Please try again later.', 
        loading: false 
      });
      toast.error('Không thể đánh giá lớp học. Vui lòng thử lại sau.');
    }
  },

  clearCurrentSchedule: () => {
    set({ currentSchedule: null });
  },
}));
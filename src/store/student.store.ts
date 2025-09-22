import { create } from 'zustand';
import { studentService } from '../services/student.service';
import type { StudentProfile, StudentStats } from '../services/student.service';

interface StudentState {
  students: StudentProfile[];
  selectedStudent: StudentProfile | null;
  stats: StudentStats | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchStudents: () => Promise<void>;
  fetchStudentStats: () => Promise<void>;
  createStudent: (data: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  updateStudent: (id: string, data: any) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  resetPassword: (id: string) => Promise<{ temp_password: string }>;
  setSelectedStudent: (student: StudentProfile | null) => void;
  clearError: () => void;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  students: [],
  selectedStudent: null,
  stats: null,
  loading: false,
  error: null,

  fetchStudents: async () => {
    set({ loading: true, error: null });
    try {
      const result = await studentService.getStudentProfiles();
      set({ students: result.students, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Lỗi khi tải danh sách học viên', loading: false });
    }
  },

  fetchStudentStats: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await studentService.getStudentStats();
      set({ stats, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Lỗi khi tải thống kê', loading: false });
    }
  },

  createStudent: async (data) => {
    set({ loading: true, error: null });
    try {
      const result = await studentService.createStudentProfile(data);
      await get().fetchStudents();
      set({ loading: false });
      return { success: true, data: result };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi tạo hồ sơ học viên';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateStudent: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedStudent = await studentService.updateStudentProfile(id, data);
      set(state => ({
        students: state.students.map(s => s.id === id ? updatedStudent : s),
        selectedStudent: state.selectedStudent?.id === id ? updatedStudent : state.selectedStudent,
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Lỗi khi cập nhật học viên', loading: false });
    }
  },

  deleteStudent: async (id) => {
    set({ loading: true, error: null });
    try {
      await studentService.deleteStudentProfile(id);
      set(state => ({
        students: state.students.filter(s => s.id !== id),
        selectedStudent: state.selectedStudent?.id === id ? null : state.selectedStudent,
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Lỗi khi xóa học viên', loading: false });
    }
  },

  resetPassword: async (id) => {
    set({ loading: true, error: null });
    try {
      const result = await studentService.resetStudentPassword(id);
      set({ loading: false });
      return result;
    } catch (error: any) {
      set({ error: error.message || 'Lỗi khi reset mật khẩu', loading: false });
      throw error;
    }
  },

  setSelectedStudent: (student) => set({ selectedStudent: student }),
  clearError: () => set({ error: null })
}));
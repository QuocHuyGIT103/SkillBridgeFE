import axiosClient from '../api/axiosClient';

export interface StudentProfileInput {
  full_name: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  phone_number?: string;
  address?: string;
  grade?: string;
  school?: string;
  subjects?: string[];
  learning_goals?: string;
  preferred_schedule?: string;
  special_requirements?: string;
}

export interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  role: string;
  status: string;
  address?: string;
  parent_id?: string;
  date_of_birth?: Date;
  gender?: string;
  grade?: string;
  school?: string;
  subjects?: string[];
  learning_goals?: string;
  preferred_schedule?: string;
  special_requirements?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateStudentResponse {
  student: StudentProfile;
  temp_password: string;
  note: string;
}

export interface StudentStats {
  total_students: number;
  active_students: number;
  by_grade: Array<{ grade: string; count: number }>;
  by_subject: Array<{ subject: string; count: number }>;
  recent_students: StudentProfile[];
}

class StudentService {
  private readonly baseURL = '/students';

  async createStudentProfile(profileData: StudentProfileInput): Promise<CreateStudentResponse> {
    try {
      const response = await axiosClient.post(`${this.baseURL}/profiles`, profileData);
      
      // ✅ Log để debug response structure

      
      // ✅ Xử lý cả hai trường hợp response structure
      return response.data || response;
    } catch (error) {
      throw error;
    }
  }

  async getStudentProfiles(): Promise<{ students: StudentProfile[]; total: number }> {
    try {
      const response = await axiosClient.get(`${this.baseURL}/profiles`);
      
      return response.data || response;
    } catch (error) {
      throw error;
    }
  }

  async getStudentProfile(studentId: string): Promise<StudentProfile> {
    try {
      const response = await axiosClient.get(`${this.baseURL}/profiles/${studentId}`);
      
      // ✅ Xử lý cả hai trường hợp response structure
      const data = response.data || response;
      return data.student || data;
    } catch (error) {
      throw error;
    }
  }

  async updateStudentProfile(
    studentId: string, 
    updateData: Partial<StudentProfileInput>
  ): Promise<StudentProfile> {
    try {
      const response = await axiosClient.put(`${this.baseURL}/profiles/${studentId}`, updateData);
      
      // ✅ Xử lý cả hai trường hợp response structure
      const data = response.data || response;
      return data.student || data;
    } catch (error) {
      throw error;
    }
  }

  async deleteStudentProfile(studentId: string): Promise<void> {
    try {
      await axiosClient.delete(`${this.baseURL}/profiles/${studentId}`);
    } catch (error) {
      throw error;
    }
  }

  async getStudentStats(): Promise<StudentStats> {
    try {
      const response = await axiosClient.get(`${this.baseURL}/profiles/stats`);
      
      return response.data || response;
    } catch (error) {
  
      throw error;
    }
  }

  async resetStudentPassword(studentId: string): Promise<{ temp_password: string }> {
    try {
      const response = await axiosClient.post(`${this.baseURL}/profiles/${studentId}/reset-password`);
      
      // ✅ Xử lý cả hai trường hợp response structure
      return response.data || response;
    } catch (error) {
      throw error;
    }
  }
}

export const studentService = new StudentService();
import axiosClient from '../api/axiosClient';
import type { 
  StudentProfileData, 
  StudentPersonalInfoUpdate, 
  StudentPreferencesUpdate 
} from '../types/student.types';
import type { ApiResponse } from '../types/index';

interface StudentProfileResponse extends ApiResponse<StudentProfileData> {}

interface UpdateResponse extends ApiResponse<any> {}

class StudentProfileService {
  // Get student profile
  async getProfile(): Promise<StudentProfileResponse> {
    try {
      const response = await axiosClient.get<StudentProfileData>('/student/profile');
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Không thể lấy thông tin hồ sơ');
    }
  }

  // Update personal info
  async updatePersonalInfo(
    data: StudentPersonalInfoUpdate
  ): Promise<UpdateResponse> {
    try {
      const formData = new FormData();
      
      // Add text fields
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof StudentPersonalInfoUpdate];
        if (key !== 'avatar_file' && value !== undefined && value !== null) {
          if (key === 'structured_address' && typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Add avatar file if provided
      if (data.avatar_file) {
        formData.append('avatar_url', data.avatar_file);
      }

      const response = await axiosClient.put('/student/profile/personal', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Không thể cập nhật thông tin cá nhân');
    }
  }

  // Update preferences
  async updatePreferences(
    data: StudentPreferencesUpdate
  ): Promise<UpdateResponse> {
    try {
      const response = await axiosClient.put('/student/profile/preferences', data);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Không thể cập nhật sở thích học tập');
    }
  }
}

export default new StudentProfileService();
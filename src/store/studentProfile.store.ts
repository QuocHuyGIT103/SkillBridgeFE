import { create } from 'zustand';
import StudentProfileService from '../services/studentProfile.service';
import type { 
  StudentProfileData, 
  StudentPersonalInfoUpdate, 
  StudentPreferencesUpdate 
} from '../types/student.types';

interface StudentProfileState {
  // Data
  profileData: StudentProfileData | null;

  // Loading states
  isLoading: boolean;
  isUpdatingPersonal: boolean;
  isUpdatingPreferences: boolean;

  // Error states
  error: string | null;
  validationErrors: Array<{ field: string; message: string }> | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updatePersonalInfo: (data: StudentPersonalInfoUpdate) => Promise<void>;
  updatePreferences: (data: StudentPreferencesUpdate) => Promise<void>;
  clearError: () => void;
  resetProfile: () => void;
}

export const useStudentProfileStore = create<StudentProfileState>((set, get) => ({
  // Initial state
  profileData: null,
  isLoading: false,
  isUpdatingPersonal: false,
  isUpdatingPreferences: false,
  error: null,
  validationErrors: null,

  // Fetch profile data
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await StudentProfileService.getProfile();
      
      if (response.success && response.data) {
        set({ 
          profileData: response.data,
          isLoading: false 
        });
      } else {
        throw new Error(response.message || 'Không thể tải thông tin hồ sơ');
      }
    } catch (error: any) {
      set({
        error: error.message || 'Không thể tải thông tin hồ sơ',
        isLoading: false,
      });
    }
  },

  // Update personal information
  updatePersonalInfo: async (data: StudentPersonalInfoUpdate) => {
    set({ isUpdatingPersonal: true, error: null, validationErrors: null });
    try {
      const response = await StudentProfileService.updatePersonalInfo(data);

      if (response.success && response.data) {
        // Update the user data in the store
        const currentProfile = get().profileData;
        if (currentProfile) {
          set({
            profileData: {
              ...currentProfile,
              user: response.data,
            },
            isUpdatingPersonal: false,
          });
        }
      } else {
        throw new Error(response.message || 'Không thể cập nhật thông tin cá nhân');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Không thể cập nhật thông tin cá nhân';
      
      set({
        error: errorMessage,
        isUpdatingPersonal: false,
      });
      throw error;
    }
  },

  // Update preferences
  updatePreferences: async (data: StudentPreferencesUpdate) => {
    set({ isUpdatingPreferences: true, error: null, validationErrors: null });
    try {
      const response = await StudentProfileService.updatePreferences(data);

      if (response.success && response.data) {
        // Update the profile data in the store
        const currentProfile = get().profileData;
        if (currentProfile) {
          set({
            profileData: {
              ...currentProfile,
              profile: response.data,
            },
            isUpdatingPreferences: false,
          });
        }
      } else {
        throw new Error(response.message || 'Không thể cập nhật sở thích học tập');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Không thể cập nhật sở thích học tập';
      
      set({
        error: errorMessage,
        isUpdatingPreferences: false,
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null, validationErrors: null });
  },

  // Reset profile
  resetProfile: () => {
    set({
      profileData: null,
      isLoading: false,
      isUpdatingPersonal: false,
      isUpdatingPreferences: false,
      error: null,
      validationErrors: null,
    });
  },
}));
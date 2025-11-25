import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import SurveyService from '../services/survey.service';
import type {
  SurveyData,
  StudentSurvey,
  SurveySubmitResponse,
} from '../types/survey.types';

interface SurveyState {
  // Current survey in progress
  currentSurvey: Partial<SurveyData> | null;
  currentStep: number;

  // Submitted survey data
  submittedSurvey: StudentSurvey | null;
  surveyResults: SurveySubmitResponse | null;

  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  isCheckingStatus: boolean;

  // Survey status
  hasCompletedSurvey: boolean;
  canRetake: boolean;

  // Error state
  error: string | null;

  // Actions
  updateSurvey: (data: Partial<SurveyData>) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  submitSurvey: (surveyData: SurveyData) => Promise<void>;
  checkSurveyStatus: () => Promise<void>;
  getSurvey: () => Promise<void>;
  resetSurvey: () => void;
  clearResults: () => void;
  clearError: () => void;
}

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSurvey: null,
      currentStep: 0,
      submittedSurvey: null,
      surveyResults: null,
      isLoading: false,
      isSubmitting: false,
      isCheckingStatus: false,
      hasCompletedSurvey: false,
      canRetake: true,
      error: null,

      // Update survey data
      updateSurvey: (data: Partial<SurveyData>) => {
        const current = get().currentSurvey || {};
        set({ 
          currentSurvey: { ...current, ...data },
          error: null,
        });
      },

      // Set current step
      setStep: (step: number) => {
        set({ currentStep: step });
      },

      // Go to next step
      nextStep: () => {
        const current = get().currentStep;
        set({ currentStep: current + 1 });
      },

      // Go to previous step
      previousStep: () => {
        const current = get().currentStep;
        if (current > 0) {
          set({ currentStep: current - 1 });
        }
      },

      // Submit survey
      submitSurvey: async (surveyData: SurveyData) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await SurveyService.submitSurvey(surveyData);

          if (response.success && response.data) {
            set({
              surveyResults: response.data,
              submittedSurvey: response.data.survey,
              hasCompletedSurvey: true,
              currentSurvey: null,
              currentStep: 0,
              isSubmitting: false,
            });
          } else {
            throw new Error(response.message || 'Không thể gửi khảo sát');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Đã xảy ra lỗi khi gửi khảo sát',
            isSubmitting: false,
          });
          throw error;
        }
      },

      // Check survey status
      checkSurveyStatus: async () => {
        set({ isCheckingStatus: true, error: null });
        try {
          const response = await SurveyService.getSurveyStatus();

          if (response.success && response.data) {
            set({
              hasCompletedSurvey: response.data.hasCompletedSurvey,
              canRetake: response.data.canRetake,
              isCheckingStatus: false,
            });
          }
        } catch (error: any) {
          set({
            error: error.message || 'Không thể kiểm tra trạng thái khảo sát',
            isCheckingStatus: false,
          });
        }
      },

      // Get existing survey
      getSurvey: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await SurveyService.getSurvey();

          if (response.success && response.data) {
            set({
              submittedSurvey: response.data.survey,
              surveyResults: response.data,
              hasCompletedSurvey: true,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error: any) {
          const status = error?.response?.status;
          if (status === 404) {
            set({
              isLoading: false,
              hasCompletedSurvey: false,
            });
            return;
          }

          set({
            error: error.message || 'Không thể lấy thông tin khảo sát',
            isLoading: false,
          });
        }
      },

      // Reset survey (start over)
      resetSurvey: () => {
        set({
          currentSurvey: null,
          currentStep: 0,
          error: null,
        });
      },

      // Clear results (to retake survey)
      clearResults: () => {
        set({
          surveyResults: null,
          submittedSurvey: null,
          currentSurvey: null,
          currentStep: 0,
          error: null,
          hasCompletedSurvey: false,
        });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'survey-storage',
      partialize: (state) => ({
        submittedSurvey: state.submittedSurvey,
        hasCompletedSurvey: state.hasCompletedSurvey,
        canRetake: state.canRetake,
      }),
    }
  )
);

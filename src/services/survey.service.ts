import axiosClient from '../api/axiosClient';
import type { ApiResponse } from '../types/index';
import type {
  SurveyData,
  StudentSurvey,
  SurveySubmitResponse,
  SurveyStatusResponse,
} from '../types/survey.types';

/**
 * AI Survey Service
 * Handles student onboarding survey and AI-powered tutor recommendations
 */
class SurveyService {
  /**
   * Submit AI onboarding survey
   * Returns survey data + AI analysis + tutor recommendations
   */
  static async submitSurvey(surveyData: SurveyData): Promise<ApiResponse<SurveySubmitResponse>> {
    try {
      console.log('📋 Submitting AI Survey:', surveyData);
      
      const response = await axiosClient.post<SurveySubmitResponse>(
        '/ai/survey',
        surveyData
      );

      console.log('✅ Survey submitted successfully:', {
        hasAnalysis: !!response.data?.aiAnalysis,
        recommendationsCount: response.data?.recommendations?.length || 0,
      });

      return response;
    } catch (error: any) {
      console.error('❌ Survey submission error:', error);
      throw error;
    }
  }

  /**
   * Get student's current survey
   */
  static async getSurvey(): Promise<ApiResponse<SurveySubmitResponse>> {
    try {
      const response = await axiosClient.get<SurveySubmitResponse>('/ai/survey');
      return response;
    } catch (error: any) {
      console.error('❌ Get survey error:', error);
      throw error;
    }
  }

  /**
   * Check survey completion status
   */
  static async getSurveyStatus(): Promise<ApiResponse<SurveyStatusResponse>> {
    try {
      const response = await axiosClient.get<SurveyStatusResponse>('/ai/survey/status');
      return response;
    } catch (error: any) {
      console.error('❌ Get survey status error:', error);
      throw error;
    }
  }

  /**
   * Check if student should see survey prompt
   * (Not completed or can retake)
   */
  static async shouldShowSurvey(): Promise<boolean> {
    try {
      const response = await this.getSurveyStatus();
      
      if (response.success && response.data) {
        return !response.data.hasCompletedSurvey || response.data.canRetake;
      }
      
      return true; // Show survey if unable to check
    } catch (error) {
      return true; // Show survey if error
    }
  }

  /**
   * Gợi ý bài tập phù hợp dựa trên survey
   */
  static async getExerciseRecommendations() {
    const response = await axiosClient.get('/ai/survey/exercises');
    return response;
  }
}

export default SurveyService;

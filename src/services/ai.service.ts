import axiosClient from '../api/axiosClient';
import type { ApiResponse } from '../types';

export const aiService = {
  transcribeAudio: (audioUrl: string) => {
    return axiosClient.post('/ai/speech/transcribe', { audioUrl });
  },
};

/**
 * AI Smart Recommendation Service
 * Integrates with Gemini AI backend for intelligent tutor recommendations
 */

// ==================== TYPES ====================

export interface SmartRecommendationQuery {
  limit?: number;           // 1-50, default: 10
  minScore?: number;        // 0-1, default: 0.5
  includeExplanations?: boolean; // default: true
}

export interface MatchDetails {
  subjectMatch: boolean;
  levelMatch: boolean;
  priceMatch: boolean;
  scheduleMatch: boolean;
  semanticScore: number;
}

export interface TutorInfo {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  headline?: string;
  introduction?: string;
  rating?: {
    average: number;
    count: number;
    badges?: string[];
    lastReviewAt?: string | null;
  };
}

export interface TutorPostInfo {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  subjects: Array<{
    _id?: string;
    name: string;
    category?: string;
  }>;
  pricePerSession: number;
  sessionDuration: number;
  teachingMode: 'ONLINE' | 'OFFLINE' | 'BOTH';
  studentLevel: string[];
}

export interface SmartRecommendation {
  tutorId: string;
  matchScore: number;        // 0-100 percentage
  explanation: string;       // AI-generated match reason
  tutor: TutorInfo;
  tutorPost: TutorPostInfo;
  matchDetails: MatchDetails;
}

export interface SmartRecommendationResponse {
  total: number;
  recommendations: SmartRecommendation[];
}

export interface AIStatusResponse {
  geminiAvailable: boolean;
  features: {
    smartRecommendations: boolean;
    semanticSearch: boolean;
    matchExplanations: boolean;
  };
}

export interface VectorizeProfileResponse {
  profileId: string;
  vectorUpdatedAt: string;
}

export interface BatchVectorizeResponse {
  success: number;
  failed: number;
  total: number;
}

// ==================== TUTOR STUDENT RECOMMENDATIONS ====================

export interface StudentPostInfo {
  id: string;
  title: string;
  content?: string;
  subjects: Array<{
    _id?: string;
    name: string;
    category?: string;
  }>;
  grade_levels: string[];
  hourly_rate?: {
    min: number;
    max: number;
  };
  is_online: boolean;
  location?: string;
  requirements?: string;
  availability?: string;
  author: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
}

export interface SmartStudentRecommendation {
  postId: string;
  matchScore: number;        // 0-100 percentage
  explanation: string;       // AI-generated match reason
  studentPost: StudentPostInfo;
  matchDetails: MatchDetails;
}

export interface SmartStudentRecommendationResponse {
  total: number;
  recommendations: SmartStudentRecommendation[];
}

// ==================== SERVICE CLASS ====================

export class AIService {
  /**
   * Get AI-powered smart tutor recommendations for a student post
   * Uses Gemini embeddings + hybrid search (70% structured + 30% semantic)
   * 
   * @param postId - Student post ID
   * @param query - Query parameters (limit, minScore, includeExplanations)
   * @returns Smart recommendations with match scores and AI explanations
   * 
   * @example
   * ```typescript
   * const recommendations = await AIService.getSmartRecommendations('post-123', {
   *   limit: 10,
   *   minScore: 0.6,
   *   includeExplanations: true
   * });
   * ```
   */
  static async getSmartRecommendations(
    postId: string,
    query: SmartRecommendationQuery = {}
  ): Promise<ApiResponse<SmartRecommendationResponse>> {
    const params = new URLSearchParams();

    // Add query parameters
    if (query.limit !== undefined) {
      params.append('limit', Math.min(Math.max(query.limit, 1), 50).toString());
    }

    if (query.minScore !== undefined) {
      params.append('minScore', Math.min(Math.max(query.minScore, 0), 1).toString());
    }

    if (query.includeExplanations !== undefined) {
      params.append('includeExplanations', query.includeExplanations.toString());
    }

    const queryString = params.toString();
    const url = `/ai/posts/${postId}/smart-recommendations${queryString ? `?${queryString}` : ''}`;

    return axiosClient.get<SmartRecommendationResponse>(url);
  }

  /**
   * Get on-demand AI explanation for a specific tutor-post match
   * 
   * This should be called ONLY when user clicks/expands a tutor card.
   * Avoids generating explanations for all 10 results upfront.
   * 
   * Cost saving: 90% (250 VNĐ → 25 VNĐ per search)
   * 
   * @param tutorId - Tutor user ID
   * @param postId - Student post ID
   * @returns AI-generated explanation
   * 
   * @example
   * ```typescript
   * // When user clicks on a tutor card:
   * const explanation = await AIService.getOnDemandExplanation(
   *   'tutor-123',
   *   'post-456'
   * );
   * ```
   */
  static async getOnDemandExplanation(
    tutorId: string,
    postId: string
  ): Promise<ApiResponse<{ explanation: string; tutorId: string; postId: string; generatedAt: string }>> {
    const url = `/ai/tutors/${tutorId}/posts/${postId}/explanation`;
    return axiosClient.get(url);
  }

  /**
   * Get on-demand AI explanation for a specific student-tutor post match (FOR TUTOR)
   * 
   * This should be called ONLY when tutor clicks/expands a student post card.
   * Avoids generating explanations for all results upfront.
   * 
   * Cost saving: 90% per search
   * 
   * @param tutorPostId - Tutor's post ID
   * @param studentPostId - Student post ID
   * @returns AI-generated explanation
   * 
   * @example
   * ```typescript
   * // When tutor clicks on a student post card:
   * const explanation = await AIService.getOnDemandStudentExplanation(
   *   'tutor-post-123',
   *   'student-post-456'
   * );
   * ```
   */
  static async getOnDemandStudentExplanation(
    tutorPostId: string,
    studentPostId: string
  ): Promise<ApiResponse<{ 
    explanation: string; 
    tutorPostId: string; 
    studentPostId: string; 
    matchScore: number;
    usedAI: boolean;
    generatedAt: string 
  }>> {
    const url = `/ai/tutor-posts/${tutorPostId}/student-posts/${studentPostId}/explanation`;
    return axiosClient.get(url);
  }

  /**
   * Check if AI features are available (Gemini API configured)
   * 
   * @returns AI service status and available features
   * 
   * @example
   * ```typescript
   * const status = await AIService.checkAIStatus();
   * if (status.data.geminiAvailable) {
   *   // AI features enabled
   * }
   * ```
   */
  static async checkAIStatus(): Promise<ApiResponse<AIStatusResponse>> {
    return axiosClient.get<AIStatusResponse>('/ai/status');
  }

  /**
   * Trigger vectorization for current tutor's profile
   * Updates AI embeddings for semantic search
   * Requires: Tutor authentication
   * 
   * @returns Vectorization result with timestamp
   * 
   * @example
   * ```typescript
   * // Tutor triggers profile vectorization
   * await AIService.vectorizeTutorProfile();
   * ```
   */
  static async vectorizeTutorProfile(): Promise<ApiResponse<VectorizeProfileResponse>> {
    return axiosClient.post<VectorizeProfileResponse>('/ai/tutors/profile/vectorize');
  }

  /**
   * Admin: Batch vectorize all verified tutor profiles
   * Processes all verified tutors for AI search
   * Requires: Admin authentication
   * 
   * @returns Batch processing results (success/failed counts)
   * 
   * @example
   * ```typescript
   * // Admin runs initial vectorization
   * const result = await AIService.batchVectorizeProfiles();
   * console.log(`Vectorized ${result.data.success} profiles`);
   * ```
   */
  static async batchVectorizeProfiles(): Promise<ApiResponse<BatchVectorizeResponse>> {
    return axiosClient.post<BatchVectorizeResponse>('/ai/admin/tutors/vectorize-all');
  }

  /**
   * Get AI-powered smart student post recommendations for a tutor
   * Uses Gemini embeddings + hybrid search (70% structured + 30% semantic)
   * 
   * @param tutorId - Tutor ID (must match authenticated user)
   * @param query - Query parameters (limit, minScore, includeExplanations)
   * @returns Smart recommendations with match scores and AI explanations
   * 
   * @example
   * ```typescript
   * const recommendations = await AIService.getSmartStudentRecommendations('tutor-123', {
   *   limit: 10,
   *   minScore: 0.6,
   *   includeExplanations: true
   * });
   * ```
   */
  static async getSmartStudentRecommendations(
    tutorId: string,
    query: SmartRecommendationQuery = {}
  ): Promise<ApiResponse<SmartStudentRecommendationResponse>> {
    const params = new URLSearchParams();

    // Add query parameters
    if (query.limit !== undefined) {
      params.append('limit', Math.min(Math.max(query.limit, 1), 50).toString());
    }

    if (query.minScore !== undefined) {
      params.append('minScore', Math.min(Math.max(query.minScore, 0), 1).toString());
    }

    if (query.includeExplanations !== undefined) {
      params.append('includeExplanations', query.includeExplanations.toString());
    }

    const queryString = params.toString();
    const url = `/ai/tutors/${tutorId}/smart-student-posts${queryString ? `?${queryString}` : ''}`;

    return axiosClient.get<SmartStudentRecommendationResponse>(url);
  }

  /**
   * Generate AI explanation for why a student post matches a tutor post
   * Uses Gemini AI to create human-readable match reasons based on vector similarity
   * 
   * @param tutorPostId - Tutor post ID
   * @param studentPostId - Student post ID
   * @param matchScore - Match score (0-1)
   * @returns AI-generated explanation
   */
  static async generateMatchExplanation(
    tutorPostId: string,
    studentPostId: string,
    matchScore: number
  ): Promise<ApiResponse<{ explanation: string; matchScore: number }>> {
    return axiosClient.post('/ai/explain-match', {
      tutorPostId,
      studentPostId,
      matchScore,
    });
  }
}

export default AIService;

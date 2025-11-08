import axiosClient from '../api/axiosClient';
import type { ApiResponse } from '../types';

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
}

export interface TutorPostInfo {
  id: string;
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

// ==================== SERVICE CLASS ====================

class AIService {
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
}

export default AIService;

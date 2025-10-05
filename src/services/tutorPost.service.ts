import axiosClient from "../api/axiosClient";
import type { Subject } from "./subject.service";

/**
 * TutorPost Service
 * Provides APIs for managing tutor posts including CRUD operations, search, and eligibility checks
 */

// Core TutorPost types
export interface TeachingSchedule {
  dayOfWeek: number; // 0-6 (0=Sunday)
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
}

export interface Address {
  province: string; // Province code (e.g., "79" for Ho Chi Minh City)
  district: string; // District code (e.g., "760" for District 1)
  ward: string; // Ward code (e.g., "26734" for Ben Nghe Ward)
  specificAddress: string; // Detail address (street number, street name)
}

export interface TutorProfileInfo {
  headline?: string;
  introduction?: string;
  teaching_experience?: string;
  student_levels?: string;
  video_intro_link?: string;
  status?: string;
}

export interface EducationInfo {
  _id: string;
  level: string;
  school: string;
  major: string;
  startYear: number;
  endYear: number;
  status: string;
}

export interface CertificateInfo {
  _id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  status: string;
}

export interface AchievementInfo {
  _id: string;
  name: string;
  level: string;
  achievedDate: string;
  awardingOrganization: string;
  type: string;
  field: string;
  description?: string;
  status: string;
}

export interface TutorInfo {
  _id: string;
  full_name: string;
  email?: string;
  gender?: string;
  avatar_url?: string;
  date_of_birth?: string;
  structured_address?: {
    province_code?: string;
    district_code?: string;
    ward_code?: string;
    detail_address?: string;
    province_name?: string;
    district_name?: string;
    ward_name?: string;
  };
  profile?: TutorProfileInfo;
  education?: EducationInfo[];
  certificates?: CertificateInfo[];
  achievements?: AchievementInfo[];
}

export interface TutorPost {
  _id?: string;
  id?: string;
  tutorId: TutorInfo;
  title: string;
  description: string;
  subjects: Subject[];
  pricePerSession: number;
  sessionDuration: number;
  teachingMode: "ONLINE" | "OFFLINE" | "BOTH";
  studentLevel: string[];
  teachingSchedule: TeachingSchedule[];
  address?: Address;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  viewCount: number;
  contactCount: number;
  createdAt: string;
  updatedAt: string;
  compatibility?: number;
}

export interface CreateTutorPostRequest {
  title: string;
  description: string;
  subjects: string[]; // Subject IDs
  pricePerSession: number;
  sessionDuration: number;
  teachingMode: "ONLINE" | "OFFLINE" | "BOTH";
  studentLevel: string[];
  teachingSchedule: TeachingSchedule[];
  address?: Address;
}

export interface UpdateTutorPostRequest {
  title?: string;
  description?: string;
  subjects?: string[];
  pricePerSession?: number;
  sessionDuration?: number;
  teachingMode?: "ONLINE" | "OFFLINE" | "BOTH";
  studentLevel?: string[];
  teachingSchedule?: TeachingSchedule[];
  address?: Address;
}

export interface TutorPostsResponse {
  posts: TutorPost[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: TutorPostSearchQuery;
}

export interface TutorPostSearchQuery {
  subjects?: string[];
  teachingMode?: "ONLINE" | "OFFLINE" | "BOTH";
  studentLevel?: string[];
  priceMin?: number;
  priceMax?: number;
  province?: string;
  district?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "pricePerSession" | "viewCount" | "compatibility";
  sortOrder?: "asc" | "desc";
}

export interface TutorEligibilityRequirement {
  id: string;
  title: string;
  description: string;
  status: "completed" | "pending" | "missing";
  actionText?: string;
  actionPath?: string;
}

export interface TutorEligibilityResponse {
  isEligible: boolean;
  requirements: TutorEligibilityRequirement[];
}

const TutorPostService = {
  // ==================== Public APIs (No authentication required) ====================
  searchTutorPosts: async (query?: TutorPostSearchQuery) => {
    try {
      const params = new URLSearchParams();

      if (query?.subjects?.length)
        params.append("subjects", query.subjects.join(","));
      if (query?.teachingMode)
        params.append("teachingMode", query.teachingMode);
      if (query?.studentLevel?.length)
        params.append("studentLevel", query.studentLevel.join(","));
      if (query?.priceMin) params.append("priceMin", query.priceMin.toString());
      if (query?.priceMax) params.append("priceMax", query.priceMax.toString());
      if (query?.province) params.append("province", query.province);
      if (query?.district) params.append("district", query.district);
      if (query?.search) params.append("search", query.search);
      if (query?.page) params.append("page", query.page.toString());
      if (query?.limit) params.append("limit", query.limit.toString());
      if (query?.sortBy) params.append("sortBy", query.sortBy);
      if (query?.sortOrder) params.append("sortOrder", query.sortOrder);

      const response = await axiosClient.get<TutorPostsResponse>(
        `/tutor-posts/search?${params.toString()}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  getTutorPostById: async (postId: string) => {
    try {
      const response = await axiosClient.get<{ tutorPost: TutorPost }>(
        `/tutor-posts/${postId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  incrementContactCount: async (postId: string) => {
    try {
      const response = await axiosClient.post(`/tutor-posts/${postId}/contact`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ==================== Tutor APIs (Authentication required) ====================
  createTutorPost: async (data: CreateTutorPostRequest) => {
    try {
      const response = await axiosClient.post<{ tutorPost: TutorPost }>(
        "/tutor-posts",
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  getMyTutorPosts: async (page?: number, limit?: number) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append("page", page.toString());
      if (limit) params.append("limit", limit.toString());

      const response = await axiosClient.get<TutorPostsResponse>(
        `/tutor-posts?${params.toString()}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateTutorPost: async (postId: string, data: UpdateTutorPostRequest) => {
    try {
      const response = await axiosClient.put<{ tutorPost: TutorPost }>(
        `/tutor-posts/${postId}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  activatePost: async (postId: string) => {
    try {
      const response = await axiosClient.post<{ tutorPost: TutorPost }>(
        `/tutor-posts/${postId}/activate`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  deactivatePost: async (postId: string) => {
    try {
      const response = await axiosClient.post<{ tutorPost: TutorPost }>(
        `/tutor-posts/${postId}/deactivate`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteTutorPost: async (postId: string) => {
    try {
      const response = await axiosClient.delete(`/tutor-posts/${postId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if the current tutor is eligible to create posts
   * Returns eligibility status and requirements list with actionable items
   */
  checkTutorEligibility: async () => {
    try {
      const response = await axiosClient.get<TutorEligibilityResponse>(
        "/tutor-posts/check-eligibility"
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default TutorPostService;

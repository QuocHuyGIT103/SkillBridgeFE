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
  address?: any;
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

// Keep existing interfaces and add new ones

// ✅ Enhanced service with missing methods
const TutorPostService = {
  // ==================== Public APIs (No authentication required) ====================
  
  // ✅ Existing searchTutorPosts method...
  searchTutorPosts: async (query?: TutorPostSearchQuery) => {
    try {
      console.log('🔍 Service - Searching tutors with query:', query);
      
      const params = new URLSearchParams();

      // Build query parameters more carefully
      if (query?.subjects?.length) {
        query.subjects.forEach(subject => {
          if (subject && subject.trim()) {
            params.append("subjects", subject.trim());
          }
        });
      }

      if (query?.teachingMode) {
        params.append("teachingMode", query.teachingMode);
      }

      if (query?.studentLevel?.length) {
        query.studentLevel.forEach(level => {
          if (level && level.trim()) {
            params.append("studentLevel", level.trim());
          }
        });
      }

      if (query?.priceMin !== undefined && query.priceMin >= 0) {
        params.append("priceMin", query.priceMin.toString());
      }

      if (query?.priceMax !== undefined && query.priceMax >= 0) {
        params.append("priceMax", query.priceMax.toString());
      }

      if (query?.province?.trim()) {
        params.append("province", query.province.trim());
      }

      if (query?.district?.trim()) {
        params.append("district", query.district.trim());
      }

      if (query?.search?.trim()) {
        params.append("search", query.search.trim());
      }

      if (query?.page && query.page > 0) {
        params.append("page", query.page.toString());
      }

      if (query?.limit && query.limit > 0) {
        params.append("limit", Math.min(query.limit, 50).toString());
      }

      if (query?.sortBy) {
        params.append("sortBy", query.sortBy);
      }

      if (query?.sortOrder) {
        params.append("sortOrder", query.sortOrder);
      }

      const url = `/tutor-posts/search${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('🌐 Making request to:', url);

      const response = await axiosClient.get<TutorPostsResponse>(url);
      
      console.log('✅ Search response received:', {
        success: response.success,
        postsCount: response.data?.posts?.length || 0,
        totalItems: response.data?.pagination?.totalItems || 0
      });

      return response;
    } catch (error: any) {
      console.error('❌ Search tutors service error:', error);
      throw error;
    }
  },

  // ✅ MISSING: Get tutor post by ID
  getTutorPostById: async (postId: string) => {
    try {
      console.log('📄 Service - Getting tutor post by ID:', postId);
      
      if (!postId || !postId.trim()) {
        throw new Error('Post ID is required');
      }

      const response = await axiosClient.get<{ tutorPost: TutorPost }>(
        `/tutor-posts/${encodeURIComponent(postId.trim())}`
      );
      
      console.log('✅ Tutor post received:', {
        success: response.success,
        postId: response.data?.tutorPost?._id || response.data?.tutorPost?.id
      });

      return response;
    } catch (error: any) {
      console.error('❌ Get tutor post by ID service error:', error);
      throw error;
    }
  },

  // ✅ MISSING: Increment contact count
  incrementContactCount: async (postId: string) => {
    try {
      console.log('📞 Service - Incrementing contact count for post:', postId);
      
      if (!postId || !postId.trim()) {
        throw new Error('Post ID is required');
      }

      const response = await axiosClient.post<any>(
        `/tutor-posts/${encodeURIComponent(postId.trim())}/contact`
      );
      
      console.log('✅ Contact count incremented successfully');

      return response;
    } catch (error: any) {
      console.error('❌ Increment contact count service error:', error);
      throw error;
    }
  },

  // ✅ Get filter options
  getFilterOptions: async () => {
    try {
      console.log('🔧 Service - Getting filter options');
      
      const response = await axiosClient.get<any>('/tutor-posts/filters');
      
      console.log('✅ Filter options received');
      return response;
    } catch (error: any) {
      console.error('❌ Get filter options service error:', error);
      throw error;
    }
  },

  // ✅ Get districts by province
  getDistrictsByProvince: async (provinceCode: string) => {
    try {
      console.log('📍 Service - Getting districts for province:', provinceCode);
      
      if (!provinceCode || !provinceCode.trim()) {
        throw new Error('Province code is required');
      }

      const response = await axiosClient.get<any>(
        `/tutor-posts/locations/provinces/${encodeURIComponent(provinceCode.trim())}/districts`
      );
      
      console.log('✅ Districts received:', response.data?.districts?.length || 0);
      return response;
    } catch (error: any) {
      console.error('❌ Get districts service error:', error);
      throw error;
    }
  },

  // ✅ Get wards by district
  getWardsByDistrict: async (districtCode: string) => {
    try {
      console.log('📍 Service - Getting wards for district:', districtCode);
      
      if (!districtCode || !districtCode.trim()) {
        throw new Error('District code is required');
      }

      const response = await axiosClient.get<any>(
        `/tutor-posts/locations/districts/${encodeURIComponent(districtCode.trim())}/wards`
      );
      
      console.log('✅ Wards received:', response.data?.wards?.length || 0);
      return response;
    } catch (error: any) {
      console.error('❌ Get wards service error:', error);
      throw error;
    }
  },

  // ==================== Tutor APIs (Authentication required) ====================
  
  // ✅ Existing methods...
  createTutorPost: async (data: CreateTutorPostRequest) => {
    try {
      console.log('✏️ Service - Creating tutor post:', { title: data.title });
      
      const response = await axiosClient.post<{ tutorPost: TutorPost }>(
        "/tutor-posts",
        data
      );
      
      console.log('✅ Tutor post created successfully:', response.data?.tutorPost?._id);
      return response;
    } catch (error: any) {
      console.error('❌ Create tutor post service error:', error);
      throw error;
    }
  },

  getMyTutorPosts: async (page?: number, limit?: number) => {
    try {
      console.log('📋 Service - Getting my tutor posts:', { page, limit });
      
      const params = new URLSearchParams();
      if (page && page > 0) params.append("page", page.toString());
      if (limit && limit > 0) params.append("limit", Math.min(limit, 50).toString());

      const response = await axiosClient.get<TutorPostsResponse>(
        `/tutor-posts?${params.toString()}`
      );
      
      console.log('✅ My tutor posts received:', response.data?.posts?.length || 0);
      return response;
    } catch (error: any) {
      console.error('❌ Get my tutor posts service error:', error);
      throw error;
    }
  },

  updateTutorPost: async (postId: string, data: UpdateTutorPostRequest) => {
    try {
      console.log('✏️ Service - Updating tutor post:', postId);
      
      if (!postId || !postId.trim()) {
        throw new Error('Post ID is required');
      }

      const response = await axiosClient.put<{ tutorPost: TutorPost }>(
        `/tutor-posts/${encodeURIComponent(postId.trim())}`,
        data
      );
      
      console.log('✅ Tutor post updated successfully');
      return response;
    } catch (error: any) {
      console.error('❌ Update tutor post service error:', error);
      throw error;
    }
  },

  activatePost: async (postId: string) => {
    try {
      console.log('✅ Service - Activating post:', postId);
      
      if (!postId || !postId.trim()) {
        throw new Error('Post ID is required');
      }

      const response = await axiosClient.post<{ tutorPost: TutorPost }>(
        `/tutor-posts/${encodeURIComponent(postId.trim())}/activate`
      );
      
      console.log('✅ Post activated successfully');
      return response;
    } catch (error: any) {
      console.error('❌ Activate post service error:', error);
      throw error;
    }
  },

  deactivatePost: async (postId: string) => {
    try {
      console.log('❌ Service - Deactivating post:', postId);
      
      if (!postId || !postId.trim()) {
        throw new Error('Post ID is required');
      }

      const response = await axiosClient.post<{ tutorPost: TutorPost }>(
        `/tutor-posts/${encodeURIComponent(postId.trim())}/deactivate`
      );
      
      console.log('✅ Post deactivated successfully');
      return response;
    } catch (error: any) {
      console.error('❌ Deactivate post service error:', error);
      throw error;
    }
  },

  deleteTutorPost: async (postId: string) => {
    try {
      console.log('🗑️ Service - Deleting tutor post:', postId);
      
      if (!postId || !postId.trim()) {
        throw new Error('Post ID is required');
      }

      const response = await axiosClient.delete(
        `/tutor-posts/${encodeURIComponent(postId.trim())}`
      );
      
      console.log('✅ Tutor post deleted successfully');
      return response;
    } catch (error: any) {
      console.error('❌ Delete tutor post service error:', error);
      throw error;
    }
  },

  // ✅ Check tutor eligibility
  checkTutorEligibility: async () => {
    try {
      console.log('🔍 Service - Checking tutor eligibility');
      
      const response = await axiosClient.get<TutorEligibilityResponse>(
        "/tutor-posts/check-eligibility"
      );
      
      console.log('✅ Eligibility check completed:', {
        isEligible: response.data?.isEligible,
        requirementsCount: response.data?.requirements?.length || 0
      });
      
      return response;
    } catch (error: any) {
      console.error('❌ Check tutor eligibility service error:', error);
      throw error;
    }
  },

  // ==================== Debug Methods ====================
  
  // ✅ BONUS: Debug method for development
  debugTutorPosts: async () => {
    try {
      console.log('🐛 Service - Debug tutor posts');
      
      const response = await axiosClient.get<any>('/tutor-posts/debug');
      
      console.log('✅ Debug info received:', response.data);
      return response;
    } catch (error: any) {
      console.error('❌ Debug service error:', error);
      throw error;
    }
  },

  // ==================== Utility Methods ====================
  
  // ✅ BONUS: Validate search query
  validateSearchQuery: (query?: TutorPostSearchQuery): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (query) {
      // Validate page
      if (query.page !== undefined && (query.page < 1 || !Number.isInteger(query.page))) {
        errors.push('Page must be a positive integer');
      }

      // Validate limit
      if (query.limit !== undefined && (query.limit < 1 || query.limit > 50 || !Number.isInteger(query.limit))) {
        errors.push('Limit must be between 1 and 50');
      }

      // Validate price range
      if (query.priceMin !== undefined && query.priceMin < 0) {
        errors.push('Minimum price cannot be negative');
      }

      if (query.priceMax !== undefined && query.priceMax < 0) {
        errors.push('Maximum price cannot be negative');
      }

      if (query.priceMin !== undefined && query.priceMax !== undefined && query.priceMin > query.priceMax) {
        errors.push('Minimum price cannot be greater than maximum price');
      }

      // Validate teaching mode
      if (query.teachingMode && !['ONLINE', 'OFFLINE', 'BOTH'].includes(query.teachingMode)) {
        errors.push('Invalid teaching mode');
      }

      // Validate sort options
      if (query.sortBy && !['createdAt', 'pricePerSession', 'viewCount', 'compatibility'].includes(query.sortBy)) {
        errors.push('Invalid sort field');
      }

      if (query.sortOrder && !['asc', 'desc'].includes(query.sortOrder)) {
        errors.push('Invalid sort order');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // ✅ BONUS: Build query string helper
  buildQueryString: (query?: TutorPostSearchQuery): string => {
    if (!query) return '';

    const params = new URLSearchParams();

    // Add array parameters
    if (query.subjects?.length) {
      query.subjects.forEach(subject => {
        if (subject && subject.trim()) {
          params.append("subjects", subject.trim());
        }
      });
    }

    if (query.studentLevel?.length) {
      query.studentLevel.forEach(level => {
        if (level && level.trim()) {
          params.append("studentLevel", level.trim());
        }
      });
    }

    // Add single parameters
    const singleParams: (keyof TutorPostSearchQuery)[] = [
      'teachingMode', 'priceMin', 'priceMax', 'province', 'district', 
      'search', 'page', 'limit', 'sortBy', 'sortOrder'
    ];

    singleParams.forEach(key => {
      const value = query[key];
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    return params.toString();
  }
};

export default TutorPostService;

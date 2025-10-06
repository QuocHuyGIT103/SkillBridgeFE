import { create } from "zustand";
import toast from "react-hot-toast";
import TutorPostService from "../services/tutorPost.service";

import type {
  TutorPost,
  TutorPostSearchQuery,
  CreateTutorPostRequest,
  UpdateTutorPostRequest,
} from "../services/tutorPost.service";

interface TutorPostState {
  // Search state
  posts: TutorPost[];
  myPosts: TutorPost[];
  currentPost: TutorPost | null;
  
  // Loading states
  isLoading: boolean;
  searchLoading: boolean;
  
  // Pagination
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  
  // Filter data
  filterOptions: any;
  filterLoading: boolean;
  provinces: any[];
  districts: any[];
  wards: any[];
  locationLoading: boolean;
  
  // Current search state
  searchFilters: TutorPostSearchQuery | null;
  
  // Error state
  error: string | null;

  // Actions
  searchTutorPosts: (query?: TutorPostSearchQuery) => Promise<void>;
  loadMorePosts: (query?: TutorPostSearchQuery) => Promise<void>;
  getFilterOptions: () => Promise<void>;
  getDistrictsByProvince: (provinceCode: string) => Promise<void>;
  getWardsByDistrict: (districtCode: string) => Promise<void>;
  getTutorPostById: (postId: string) => Promise<void>;
  incrementContactCount: (postId: string) => Promise<void>;
  
  // Tutor actions (existing)
  createTutorPost: (data: CreateTutorPostRequest) => Promise<void>;
  getMyTutorPosts: (page?: number, limit?: number) => Promise<void>;
  updateTutorPost: (postId: string, data: UpdateTutorPostRequest) => Promise<void>;
  activatePost: (postId: string) => Promise<void>;
  deactivatePost: (postId: string) => Promise<void>;
  deleteTutorPost: (postId: string) => Promise<void>;
  
  // Utility actions
  clearPosts: () => void;
  clearCurrentPost: () => void;
  clearError: () => void;
  resetFilters: () => void;
}

export const useTutorPostStore = create<TutorPostState>((set, get) => ({
  // Initial state
  posts: [],
  myPosts: [],
  currentPost: null,
  isLoading: false,
  searchLoading: false,
  pagination: null,
  filterOptions: null,
  filterLoading: false,
  provinces: [],
  districts: [],
  wards: [],
  locationLoading: false,
  searchFilters: null,
  error: null,

  // ✅ Enhanced search with better error handling
  searchTutorPosts: async (query?: TutorPostSearchQuery) => {
    set({ searchLoading: true, error: null });
    
    try {
      console.log('🔍 Store - Searching with query:', query);
      
      const response = await TutorPostService.searchTutorPosts(query);

      if (response.success && response.data) {
        const { posts, pagination, filters } = response.data;
        
        set({
          posts: posts || [],
          pagination: pagination || null,
          searchFilters: filters || query || null,
          searchLoading: false,
          error: null
        });

        console.log(`✅ Search successful: ${posts?.length || 0} posts loaded`);
      } else {
        throw new Error(response.message || "Failed to search tutor posts");
      }
    } catch (error: any) {
      console.error("❌ Search error:", error);
      const errorMessage = error.message || "Có lỗi xảy ra khi tìm kiếm gia sư";
      
      set({ 
        searchLoading: false,
        error: errorMessage,
        posts: [],
        pagination: null
      });
      
      // Don't show toast for search errors as they're handled in UI
      throw error;
    }
  },

  // ✅ Load more posts for pagination
  loadMorePosts: async (query?: TutorPostSearchQuery) => {
    const { pagination, posts, searchFilters } = get();
    
    if (!pagination?.hasNext) {
      console.log('No more posts to load');
      return;
    }

    set({ searchLoading: true, error: null });

    try {
      const nextPageQuery = {
        ...searchFilters,
        ...query,
        page: (pagination.currentPage || 1) + 1
      };

      console.log('📄 Loading more posts, page:', nextPageQuery.page);

      const response = await TutorPostService.searchTutorPosts(nextPageQuery);

      if (response.success && response.data) {
        const { posts: newPosts, pagination: newPagination } = response.data;
        
        set({
          posts: [...posts, ...(newPosts || [])],
          pagination: newPagination,
          searchFilters: nextPageQuery,
          searchLoading: false
        });

        console.log(`✅ Loaded ${newPosts?.length || 0} more posts`);
      } else {
        throw new Error(response.message || "Failed to load more posts");
      }
    } catch (error: any) {
      console.error("❌ Load more error:", error);
      set({ 
        searchLoading: false,
        error: error.message || "Không thể tải thêm bài đăng"
      });
      throw error;
    }
  },

  // ✅ Load filter options
  getFilterOptions: async () => {
    const { filterOptions } = get();
    
    // Don't reload if already loaded
    if (filterOptions) {
      return;
    }

    set({ filterLoading: true, error: null });

    try {
      console.log('🔧 Loading filter options...');
      
      const response = await TutorPostService.getFilterOptions();

      if (response.success && response.data) {
        set({
          filterOptions: response.data,
          provinces: response.data.provinces || [],
          filterLoading: false
        });

        console.log('✅ Filter options loaded successfully');
      } else {
        throw new Error(response.message || "Failed to get filter options");
      }
    } catch (error: any) {
      console.error("❌ Filter options error:", error);
      set({ 
        filterLoading: false,
        error: error.message || "Không thể tải tùy chọn bộ lọc"
      });
      throw error;
    }
  },

  // ✅ Get districts by province
  getDistrictsByProvince: async (provinceCode: string) => {
    if (!provinceCode) {
      set({ districts: [], wards: [] });
      return;
    }

    set({ locationLoading: true, error: null });

    try {
      console.log('📍 Loading districts for province:', provinceCode);
      
      const response = await TutorPostService.getDistrictsByProvince(provinceCode);

      if (response.success && response.data) {
        set({
          districts: response.data.districts || [],
          wards: [], // Clear wards when province changes
          locationLoading: false
        });

        console.log(`✅ Loaded ${response.data.districts?.length || 0} districts`);
      } else {
        throw new Error(response.message || "Failed to get districts");
      }
    } catch (error: any) {
      console.error("❌ Districts error:", error);
      set({ 
        locationLoading: false,
        districts: [],
        wards: [],
        error: error.message || "Không thể tải danh sách quận/huyện"
      });
    }
  },

  // ✅ Get wards by district
  getWardsByDistrict: async (districtCode: string) => {
    if (!districtCode) {
      set({ wards: [] });
      return;
    }

    set({ locationLoading: true, error: null });

    try {
      console.log('📍 Loading wards for district:', districtCode);
      
      const response = await TutorPostService.getWardsByDistrict(districtCode);

      if (response.success && response.data) {
        set({
          wards: response.data.wards || [],
          locationLoading: false
        });

        console.log(`✅ Loaded ${response.data.wards?.length || 0} wards`);
      } else {
        throw new Error(response.message || "Failed to get wards");
      }
    } catch (error: any) {
      console.error("❌ Wards error:", error);
      set({ 
        locationLoading: false,
        wards: [],
        error: error.message || "Không thể tải danh sách phường/xã"
      });
    }
  },

  // ✅ Enhanced get tutor post by ID
  getTutorPostById: async (postId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('📄 Loading tutor post:', postId);
      
      const response = await TutorPostService.getTutorPostById(postId);

      if (response.success && response.data.tutorPost) {
        set({
          currentPost: response.data.tutorPost,
          isLoading: false
        });

        console.log('✅ Tutor post loaded successfully');
      } else {
        throw new Error(response.message || "Failed to get tutor post");
      }
    } catch (error: any) {
      console.error("❌ Get tutor post error:", error);
      set({ 
        isLoading: false,
        currentPost: null,
        error: error.message || "Không tìm thấy bài đăng gia sư"
      });
      throw error;
    }
  },

  // ✅ Increment contact count
  incrementContactCount: async (postId: string) => {
    try {
      const response = await TutorPostService.incrementContactCount(postId);

      if (response.success) {
        // Update contact count in current post if it matches
        set((state) => ({
          currentPost:
            state.currentPost && (state.currentPost._id === postId || state.currentPost.id === postId)
              ? {
                  ...state.currentPost,
                  contactCount: state.currentPost.contactCount + 1,
                }
              : state.currentPost,
          posts: state.posts.map((post) =>
            (post._id === postId || post.id === postId)
              ? { ...post, contactCount: post.contactCount + 1 }
              : post
          ),
        }));

        console.log('✅ Contact count incremented');
      }
    } catch (error: any) {
      console.error('❌ Increment contact count error:', error);
      // Don't throw error for contact count as it's not critical
    }
  },

  // ✅ Existing tutor methods with enhanced error handling
  createTutorPost: async (data: CreateTutorPostRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await TutorPostService.createTutorPost(data);

      if (response.success && response.data.tutorPost) {
        set((state) => ({
          myPosts: [response.data.tutorPost, ...state.myPosts],
          isLoading: false
        }));

        toast.success(response.message || "Tạo bài đăng thành công");
      } else {
        throw new Error(response.message || "Failed to create tutor post");
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      toast.error(error.message || "Không thể tạo bài đăng");
      throw error;
    }
  },

  getMyTutorPosts: async (page?: number, limit?: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await TutorPostService.getMyTutorPosts(page, limit);

      if (response.success && response.data) {
        set({
          myPosts: response.data.posts,
          pagination: response.data.pagination,
          isLoading: false
        });
      } else {
        throw new Error(response.message || "Failed to get my tutor posts");
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      console.error("Get my tutor posts error:", error);
      throw error;
    }
  },

  updateTutorPost: async (postId: string, data: UpdateTutorPostRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await TutorPostService.updateTutorPost(postId, data);

      if (response.success && response.data.tutorPost) {
        set((state) => ({
          myPosts: state.myPosts.map((post) =>
            (post._id === postId || post.id === postId) ? response.data.tutorPost : post
          ),
          currentPost:
            state.currentPost && (state.currentPost._id === postId || state.currentPost.id === postId)
              ? response.data.tutorPost
              : state.currentPost,
          isLoading: false
        }));

        toast.success(response.message || "Cập nhật bài đăng thành công");
      } else {
        throw new Error(response.message || "Failed to update tutor post");
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      toast.error(error.message || "Không thể cập nhật bài đăng");
      throw error;
    }
  },

  activatePost: async (postId: string) => {
    try {
      const response = await TutorPostService.activatePost(postId);

      if (response.success && response.data.tutorPost) {
        set((state) => ({
          myPosts: state.myPosts.map((post) =>
            (post._id === postId || post.id === postId) ? response.data.tutorPost : post
          ),
          currentPost:
            state.currentPost && (state.currentPost._id === postId || state.currentPost.id === postId)
              ? response.data.tutorPost
              : state.currentPost,
        }));

        toast.success(response.message || "Kích hoạt bài đăng thành công");
      } else {
        throw new Error(response.message || "Failed to activate post");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể kích hoạt bài đăng");
      throw error;
    }
  },

  deactivatePost: async (postId: string) => {
    try {
      const response = await TutorPostService.deactivatePost(postId);

      if (response.success && response.data.tutorPost) {
        set((state) => ({
          myPosts: state.myPosts.map((post) =>
            (post._id === postId || post.id === postId) ? response.data.tutorPost : post
          ),
          currentPost:
            state.currentPost && (state.currentPost._id === postId || state.currentPost.id === postId)
              ? response.data.tutorPost
              : state.currentPost,
        }));

        toast.success(response.message || "Tắt kích hoạt bài đăng thành công");
      } else {
        throw new Error(response.message || "Failed to deactivate post");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tắt kích hoạt bài đăng");
      throw error;
    }
  },

  deleteTutorPost: async (postId: string) => {
    try {
      const response = await TutorPostService.deleteTutorPost(postId);

      if (response.success) {
        set((state) => ({
          myPosts: state.myPosts.filter((post) => 
            post._id !== postId && post.id !== postId
          ),
          currentPost:
            state.currentPost && (state.currentPost._id === postId || state.currentPost.id === postId)
              ? null 
              : state.currentPost,
        }));

        toast.success(response.message || "Xóa bài đăng thành công");
      } else {
        throw new Error(response.message || "Failed to delete post");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể xóa bài đăng");
      throw error;
    }
  },

  // ✅ Utility actions
  clearPosts: () => {
    set({
      posts: [],
      myPosts: [],
      pagination: null,
      searchFilters: null,
      error: null
    });
  },

  clearCurrentPost: () => {
    set({ currentPost: null, error: null });
  },

  clearError: () => {
    set({ error: null });
  },

  resetFilters: () => {
    set({
      districts: [],
      wards: [],
      searchFilters: null,
      error: null
    });
  }
}));

import { create } from 'zustand';
import type { IPost, IPostInput, IPostReviewInput, IPagination } from '../types/post.types';
import { PostService } from '../services/post.service';
import type { TutorPost } from '../services/tutorPost.service';
import toast from 'react-hot-toast';

// ✅ ADD: Smart Search specific interfaces
interface SmartSearchPagination {
  total: number;
  totalItems: number;
  page: number;
  currentPage: number;
  limit: number;
  pages: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface SmartSearchAiAnalysis {
  studentPostAnalyzed?: {
    subjects?: string[];
    gradeLevels?: string[];
    isOnline?: boolean;
    priceRange?: any;
  };
  filtersApplied?: string[];
  totalFound?: number;
  averageCompatibility?: number;
  sortedBy?: string;
  queryStats?: any;
}

// ✅ FIXED: Complete PostState interface
interface PostState {
  // Basic post management
  posts: IPost[];
  selectedPost: IPost | null;
  pagination: IPagination | null;
  isLoading: boolean;
  error: string | null;
  
  // ✅ FIXED: Complete smart search state
  smartSearchResults: TutorPost[];
  smartSearchPagination: SmartSearchPagination | null;
  smartSearchLoading: boolean;
  smartSearchError: string | null; // ✅ ADD: Missing property
  smartSearchAiAnalysis: SmartSearchAiAnalysis | null; // ✅ ADD: Missing property
  
  // Basic post methods
  fetchPostsByStatus: (status: string, page?: number, limit?: number) => Promise<void>;
  fetchAllPostsForAdmin: (status?: string, page?: number, limit?: number) => Promise<void>;
  fetchMyPosts: (page?: number, limit?: number) => Promise<void>;
  createPost: (data: IPostInput) => Promise<boolean>;
  reviewPost: (postId: string, reviewData: IPostReviewInput) => Promise<boolean>;
  getPostById: (postId: string) => Promise<void>;
  updatePost: (postId: string, data: IPostInput) => Promise<boolean>;
  deletePost: (postId: string) => Promise<boolean>;
  
  // ✅ FIXED: Complete smart search methods
  smartSearchTutors: (postId: string, query?: any) => Promise<void>;
  loadMoreSmartSearchResults: (postId: string, query?: any) => Promise<void>; // ✅ ADD: Missing method
  clearSmartSearchResults: () => void; // ✅ ADD: Missing method
  setSmartSearchError: (error: string | null) => void; // ✅ ADD: Missing method
}

const usePostStore = create<PostState>((set, get) => ({
  // ✅ Basic state
  posts: [],
  selectedPost: null,
  pagination: null,
  isLoading: false,
  error: null,
  
  // ✅ FIXED: Complete smart search initial state
  smartSearchResults: [],
  smartSearchPagination: null,
  smartSearchLoading: false,
  smartSearchError: null, // ✅ ADD: Missing initial state
  smartSearchAiAnalysis: null, // ✅ ADD: Missing initial state

  // ✅ Basic post methods (unchanged)
  fetchPostsByStatus: async (status) => {
    set({ isLoading: true, error: null });
    try {
      const responseData = await PostService.getPostsByStatus(status);
      if (responseData.success) {
        set({
          posts: responseData.data.posts,
          pagination: responseData.data.pagination,
          isLoading: false
        });
      }
    } catch (err) {
      set({ error: 'Lỗi khi tải danh sách bài đăng', isLoading: false });
    }
  },

  fetchAllPostsForAdmin: async (status) => {
    set({ isLoading: true, error: null });
    try {
      const responseData = await PostService.getAllPostsForAdmin(status);
      if (responseData.success && responseData.data) {
        set({
          posts: responseData.data.posts || [],
          pagination: responseData.data.pagination || null,
          isLoading: false
        });
      } else {
        set({ isLoading: false, error: responseData.message || 'Không thể tải dữ liệu' });
      }
    } catch (err) {
      set({ error: 'Lỗi khi tải danh sách bài đăng cho admin', isLoading: false });
    }
  },

  fetchMyPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await PostService.getMyPosts();
      if (response.success) {
        set({ posts: response.data, isLoading: false, pagination: null });
      } else {
        set({ error: response.message || 'Lỗi khi tải bài đăng của bạn', isLoading: false });
      }
    } catch (err) {
      set({ error: 'Lỗi khi tải bài đăng của bạn', isLoading: false });
    }
  },

  createPost: async (data: IPostInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await PostService.createPost(data);
      set((state) => ({ 
        posts: [response.data, ...state.posts], 
        isLoading: false 
      }));
      toast.success('Tạo bài đăng thành công! Chờ admin duyệt.');
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Có lỗi không xác định khi tạo bài đăng.';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  reviewPost: async (postId: string, data: IPostReviewInput) => {
    try {
      const response = await PostService.reviewPost(postId, data);
      if (response.success) {
        const updatedPost = response.data;
        set((state) => ({
          posts: state.posts.map((p) => (p.id === postId ? updatedPost : p))
        }));
        return true;
      }
      set({ error: response.message || 'Lỗi khi duyệt bài đăng' });
      return false;
    } catch (err) {
      set({ error: 'Lỗi khi duyệt bài đăng' });
      return false;
    }
  },

  getPostById: async (postId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await PostService.getPostById(postId);
      if (response.success) {
        set({ selectedPost: response.data, isLoading: false });
      } else {
        set({ error: response.message || 'Lỗi khi tải bài đăng', isLoading: false });
      }
    } catch (err) {
      set({ error: 'Lỗi khi tải bài đăng', isLoading: false });
    }
  },

  updatePost: async (postId: string, data: IPostInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await PostService.updatePost(postId, data);
      const updatedPost = response.data;
      set((state) => ({
        posts: state.posts.map((p) => (p.id === postId ? updatedPost : p)),
        selectedPost: state.selectedPost?.id === postId ? updatedPost : state.selectedPost,
        isLoading: false,
      }));
      toast.success('Cập nhật bài đăng thành công!');
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi cập nhật bài đăng.';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  deletePost: async (postId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await PostService.deletePost(postId);
      if (response.success) {
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== postId),
          isLoading: false,
        }));
        return true;
      }
      set({ error: response.message || 'Lỗi khi xóa bài đăng', isLoading: false });
      return false;
    } catch (err) {
      set({ error: 'Lỗi khi xóa bài đăng', isLoading: false });
      return false;
    }
  },

  // ✅ FIXED: Complete Smart Search Implementation
  smartSearchTutors: async (postId: string, query: any = {}) => {
    set({ smartSearchLoading: true, smartSearchError: null });

    try {
      console.log("🤖 Store - Smart Search with query:", { postId, query });

      const response = await PostService.smartSearchTutors(postId, query);

      if (response.success && response.data) {
        const { tutors, pagination, aiAnalysis } = response.data;

        // ✅ FIXED: Set state with proper typing
        set({
          smartSearchResults: tutors || [],
          smartSearchPagination: pagination || null,
          smartSearchAiAnalysis: aiAnalysis || null,
          smartSearchLoading: false,
          smartSearchError: null,
        });

        console.log(`✅ Smart Search successful: ${tutors?.length || 0} tutors loaded`);
      } else {
        throw new Error(response.message || "Failed to smart search tutors");
      }
    } catch (error: any) {
      console.error("❌ Smart Search error:", error);
      const errorMessage = error.message || "Có lỗi xảy ra khi tìm kiếm gia sư thông minh";

      set({
        smartSearchLoading: false,
        smartSearchError: errorMessage,
        smartSearchResults: [],
        smartSearchPagination: null,
      });

      // Don't show toast for search errors as they're handled in UI
      throw error;
    }
  },

  // ✅ FIXED: Complete Load More Implementation
  loadMoreSmartSearchResults: async (postId: string, query: any = {}) => {
    const { smartSearchPagination, smartSearchResults } = get();

    if (!smartSearchPagination?.hasNext) {
      console.log("No more smart search results to load");
      return;
    }

    set({ smartSearchLoading: true, smartSearchError: null });

    try {
      const nextPageQuery = {
        ...query,
        page: (smartSearchPagination.currentPage || 1) + 1,
      };

      console.log("📄 Loading more smart search results, page:", nextPageQuery.page);

      const response = await PostService.smartSearchTutors(postId, nextPageQuery);

      if (response.success && response.data) {
        const { tutors: newTutors, pagination: newPagination } = response.data;

        set({
          smartSearchResults: [...smartSearchResults, ...(newTutors || [])],
          smartSearchPagination: newPagination,
          smartSearchLoading: false,
        });

        console.log(`✅ Loaded ${newTutors?.length || 0} more smart search results`);
      } else {
        throw new Error(response.message || "Failed to load more smart search results");
      }
    } catch (error: any) {
      console.error("❌ Load more smart search error:", error);
      set({
        smartSearchLoading: false,
        smartSearchError: error.message || "Không thể tải thêm kết quả",
      });
      throw error;
    }
  },

  // ✅ ADD: Missing utility methods
  clearSmartSearchResults: () => {
    set({
      smartSearchResults: [],
      smartSearchPagination: null,
      smartSearchAiAnalysis: null,
      smartSearchError: null,
    });
  },

  setSmartSearchError: (error: string | null) => {
    set({ smartSearchError: error });
  },
}));

export default usePostStore;
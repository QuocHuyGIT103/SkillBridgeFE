import { create } from 'zustand';
import type { IPost, IPostInput, IPostReviewInput, IPagination } from '../types/post.types';
import { PostService } from '../services/post.service';

interface PostState {
  posts: IPost[];
  selectedPost: IPost | null;
  pagination: IPagination | null;
  isLoading: boolean;
  error: string | null;
  fetchPostsByStatus: (status: string, page?: number, limit?: number) => Promise<void>;
  fetchAllPostsForAdmin: (status?: string, page?: number, limit?: number) => Promise<void>;
  fetchMyPosts: (page?: number, limit?: number) => Promise<void>;
  createPost: (data: IPostInput) => Promise<boolean>;
  reviewPost: (postId: string, reviewData: IPostReviewInput) => Promise<boolean>;
  getPostById: (postId: string) => Promise<void>;
  updatePost: (postId: string, data: IPostInput) => Promise<boolean>;
  deletePost: (postId: string) => Promise<boolean>;
}

const usePostStore = create<PostState>((set) => ({
  posts: [],
  selectedPost: null,
  pagination: null,
  isLoading: false,
  error: null,

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
      // responseData là { success, message, data: { posts, pagination } }
      if (responseData.success && responseData.data) {
        set({
          posts: responseData.data.posts || [],
          pagination: responseData.data.pagination || null,
          isLoading: false
        });
      } else {
        // Xử lý trường hợp success = false hoặc không có data
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
        set({ posts: response.data, isLoading: false, pagination: null }); // Reset pagination
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
      if (response.success) {
        // Thêm bài đăng mới vào đầu danh sách
        set((state) => ({ posts: [response.data, ...state.posts], isLoading: false }));
        return true;
      }
      set({ error: response.message || 'Lỗi khi tạo bài đăng', isLoading: false });
      return false;
    } catch (err) {
      set({ error: 'Lỗi khi tạo bài đăng', isLoading: false });
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
      if (response.success) {
        const updatedPost = response.data;
        set((state) => ({
          posts: state.posts.map((p) => (p.id === postId ? updatedPost : p)),
          selectedPost: state.selectedPost?.id === postId ? updatedPost : state.selectedPost,
          isLoading: false,
        }));
        return true;
      }
      set({ error: response.message || 'Lỗi khi cập nhật bài đăng', isLoading: false });
      return false;
    } catch (err) {
      set({ error: 'Lỗi khi cập nhật bài đăng', isLoading: false });
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
}));

export default usePostStore;
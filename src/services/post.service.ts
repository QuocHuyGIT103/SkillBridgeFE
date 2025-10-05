import type { IPost, IPostInput, IPostReviewInput, IPaginatedPosts } from '../types';
import type { TutorPost } from './tutorPost.service';
import axiosClient from '../api/axiosClient';
import type { ApiResponse } from '../types/index';

export class PostService {
  // Student: Tạo bài đăng mới
  static async createPost(postData: IPostInput): Promise<ApiResponse<IPost>> {
    return axiosClient.post<IPost>('/posts', postData);
  }

  // Student: Lấy danh sách bài đăng của chính mình (có thể filter theo status)
  static async getMyPosts(status?: string): Promise<ApiResponse<IPost[]>> {
    let url = '/posts/me';
    if (status && status !== 'all') {
      url += `?status=${status}`;
    }
    return axiosClient.get<IPost[]>(url);
  }

  // Public: Lấy danh sách bài đăng theo trạng thái (đã duyệt)
  static async getPostsByStatus(status: string): Promise<ApiResponse<IPaginatedPosts>> {
    return axiosClient.get<IPaginatedPosts>(`/posts?status=${status}`);
  }

  // Admin: Lấy tất cả bài đăng (có thể filter)
  static async getAllPostsForAdmin(status?: string): Promise<ApiResponse<IPaginatedPosts>> {
    let url = '/posts/all';
    if (status && status !== 'all') {
      url += `?status=${status}`;
    }
    return axiosClient.get<IPaginatedPosts>(url);
  }

  // Admin: Duyệt bài đăng
  static async reviewPost(postId: string, reviewData: IPostReviewInput): Promise<ApiResponse<IPost>> {
    return axiosClient.patch<IPost>(`/posts/${postId}/review`, reviewData);
  }

  // Public: Lấy chi tiết bài đăng theo ID
  static async getPostById(postId: string): Promise<ApiResponse<IPost>> {
    return axiosClient.get<IPost>(`/posts/${postId}`);
  }

  // Student: Cập nhật bài đăng
  static async updatePost(postId: string, updateData: IPostInput): Promise<ApiResponse<IPost>> {
    return axiosClient.put<IPost>(`/posts/${postId}`, updateData);
  }

  // Student/Admin: Xóa bài đăng
  static async deletePost(postId: string): Promise<ApiResponse<any>> {
    return axiosClient.delete<any>(`/posts/${postId}`);
  }

  // Student: Tìm kiếm gia sư thông minh dựa trên bài đăng
  static async smartSearchTutors(postId: string, query: { page?: number; limit?: number; sortBy?: string; sortOrder?: string } = {}): Promise<ApiResponse<{ tutors: TutorPost[]; pagination: { currentPage: number; totalPages: number; totalItems: number; hasNext: boolean; hasPrev: boolean } }>> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    return axiosClient.get(`/posts/${postId}/smart-tutors?${params.toString()}`);
  }
}
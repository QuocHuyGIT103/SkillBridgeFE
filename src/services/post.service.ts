import type { IPost, IPostInput, IPostReviewInput, IPaginatedPosts } from '../types';
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
}
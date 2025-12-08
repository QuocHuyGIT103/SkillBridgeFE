import type {
  IPost,
  IPostInput,
  IPostReviewInput,
  IPaginatedPosts,
} from "../types";
import type { TutorPost } from "./tutorPost.service";
import axiosClient from "../api/axiosClient";
import type { ApiResponse } from "../types/index";

// ✅ Define proper response type for Smart Search
interface SmartSearchData {
  tutors: TutorPost[];
  pagination: any;
  aiAnalysis?: any;
}

export class PostService {
  // Student: Tạo bài đăng mới
  static async createPost(postData: IPostInput): Promise<ApiResponse<IPost>> {
    return axiosClient.post<IPost>("/posts", postData);
  }

  // Student: Lấy danh sách bài đăng của chính mình (có thể filter theo status)
  static async getMyPosts(status?: string): Promise<ApiResponse<IPost[]>> {
    let url = "/posts/me";
    if (status && status !== "all") {
      url += `?status=${status}`;
    }
    return axiosClient.get<IPost[]>(url);
  }

  // Public: Lấy danh sách bài đăng theo trạng thái (đã duyệt)
  static async getPostsByStatus(
    status: string
  ): Promise<ApiResponse<IPaginatedPosts>> {
    return axiosClient.get<IPaginatedPosts>(`/posts?status=${status}`);
  }

  // Admin: Lấy tất cả bài đăng (có thể filter)
  static async getAllPostsForAdmin(
    status?: string
  ): Promise<ApiResponse<IPaginatedPosts>> {
    let url = "/posts/all";
    if (status && status !== "all") {
      url += `?status=${status}`;
    }
    return axiosClient.get<IPaginatedPosts>(url);
  }

  // Admin: Duyệt bài đăng
  static async reviewPost(
    postId: string,
    reviewData: IPostReviewInput
  ): Promise<ApiResponse<IPost>> {
    return axiosClient.patch<IPost>(`/posts/${postId}/review`, reviewData);
  }

  // Public: Lấy chi tiết bài đăng theo ID
  static async getPostById(postId: string): Promise<ApiResponse<IPost>> {
    return axiosClient.get<IPost>(`/posts/${postId}`);
  }

  // Student: Cập nhật bài đăng
  static async updatePost(
    postId: string,
    updateData: IPostInput
  ): Promise<ApiResponse<IPost>> {
    return axiosClient.put<IPost>(`/posts/${postId}`, updateData);
  }

  // Student/Admin: Xóa bài đăng
  static async deletePost(postId: string): Promise<ApiResponse<any>> {
    return axiosClient.delete<any>(`/posts/${postId}`);
  }

  // ✅ Student: Tìm kiếm gia sư thông minh dựa trên bài đăng - FIXED TYPE STRUCTURE
  static async smartSearchTutors(
    postId: string,
    filters: any = {}
  ): Promise<ApiResponse<SmartSearchData>> {
    try {
      console.log("🤖 Smart Search Service Call:", {
        postId,
        filters,
        filterCount: Object.keys(filters).filter(
          (k) =>
            filters[k] !== undefined &&
            filters[k] !== "" &&
            !["page", "limit", "sortBy", "sortOrder"].includes(k)
        ).length,
      });

      // ✅ Validate postId
      if (!postId || !postId.trim()) {
        throw new Error("Post ID is required for smart search");
      }

      // ✅ FIXED: Build query parameters theo TutorPostService pattern
      const params = new URLSearchParams();

      // ✅ Handle array parameters properly (như TutorPostService)
      if (filters.subjects?.length) {
        filters.subjects.forEach((subject: string) => {
          if (subject && subject.trim()) {
            params.append("subjects", subject.trim());
          }
        });
      }

      if (filters.studentLevel?.length) {
        filters.studentLevel.forEach((level: string) => {
          if (level && level.trim()) {
            params.append("studentLevel", level.trim());
          }
        });
      }

      // ✅ Handle single value parameters
      if (filters.teachingMode) {
        params.append("teachingMode", filters.teachingMode);
      }

      // ✅ Handle number parameters properly
      if (
        filters.priceMin !== undefined &&
        filters.priceMin !== null &&
        !isNaN(Number(filters.priceMin))
      ) {
        params.append("priceMin", Number(filters.priceMin).toString());
      }

      if (
        filters.priceMax !== undefined &&
        filters.priceMax !== null &&
        !isNaN(Number(filters.priceMax))
      ) {
        params.append("priceMax", Number(filters.priceMax).toString());
      }

      // ✅ Handle location parameters
      if (filters.province?.trim()) {
        params.append("province", filters.province.trim());
      }

      if (filters.district?.trim()) {
        params.append("district", filters.district.trim());
      }

      if (filters.ward?.trim()) {
        params.append("ward", filters.ward.trim());
      }

      // ✅ Handle search text
      if (filters.search?.trim()) {
        params.append("search", filters.search.trim());
      }

      // ✅ Handle pagination - theo TutorPostService pattern
      if (filters.page && filters.page > 0) {
        params.append("page", Math.max(1, Number(filters.page)).toString());
      }

      if (filters.limit && filters.limit > 0) {
        params.append(
          "limit",
          Math.min(50, Math.max(1, Number(filters.limit))).toString()
        );
      }

      // ✅ Handle sorting
      if (filters.sortBy || filters.sort_by) {
        params.append("sort_by", filters.sortBy || filters.sort_by);
      }

      if (filters.sortOrder || filters.sort_order) {
        params.append("sort_order", filters.sortOrder || filters.sort_order);
      }

      // ✅ Build final URL
      const url = `/posts/${postId.trim()}/smart-tutors${params.toString() ? `?${params.toString()}` : ""
        }`;
      console.log("🌐 Smart Search API URL:", url);

      // ✅ Make request - axiosClient returns ApiResponse<T>
      const response: ApiResponse<SmartSearchData> = await axiosClient.get(url);

      console.log("📊 Smart Search Raw Response:", {
        success: response?.success,
        message: response?.message,
        dataKeys: Object.keys(response?.data || {}),
        tutorCount: response?.data?.tutors?.length || 0,
        paginationKeys: Object.keys(response?.data?.pagination || {}),
        hasAiAnalysis: !!response?.data?.aiAnalysis,
      });

      // ✅ Validate response structure matches ApiResponse<SmartSearchData>
      if (response && response.success && response.data) {
        const { tutors, pagination, aiAnalysis } = response.data;

        console.log("✅ Smart Search Processed:", {
          tutorsCount: tutors?.length || 0,
          totalItems: pagination?.total || pagination?.totalItems || 0,
          currentPage: pagination?.page || pagination?.currentPage || 1,
          totalPages: pagination?.pages || pagination?.totalPages || 1,
          hasNext: pagination?.hasNext || false,
          averageCompatibility: aiAnalysis?.averageCompatibility || 0,
          filtersApplied: aiAnalysis?.filtersApplied?.length || 0,
        });

        // ✅ FIXED: Return theo structure của TutorPostService response
        return {
          success: true,
          message: response.message || "🤖 AI tìm kiếm thành công",
          data: {
            tutors: tutors || [],
            pagination: {
              // ✅ Normalize pagination structure như TutorPostService
              currentPage: pagination?.page || pagination?.currentPage || 1,
              totalPages: pagination?.pages || pagination?.totalPages || 1,
              totalItems: pagination?.total || pagination?.totalItems || 0,
              hasNext: pagination?.hasNext || false,
              hasPrev: pagination?.hasPrev || false,
              ...pagination,
            },
            aiAnalysis: aiAnalysis || {},
          },
        };
      } else {
        throw new Error(
          response?.message || "Invalid response structure from server"
        );
      }
    } catch (error: any) {
      console.error("❌ Smart Search Service Error:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi tìm kiếm gia sư thông minh";

      throw new Error(errorMessage);
    }
  }

  // Tutor: Lấy danh sách bài đăng học viên đã được duyệt (dành cho gia sư đã xác thực)
  static async getApprovedStudentPostsForTutor(
    query: {
      subjects?: string[];
      grade_levels?: string[];
      is_online?: boolean;
      search_term?: string;
      min_hourly_rate?: number;
      max_hourly_rate?: number;
      relax?: boolean;
      page?: number;
      limit?: number;
      sort_order?: "asc" | "desc";
    } = {}
  ): Promise<ApiResponse<IPaginatedPosts>> {
    const params = new URLSearchParams();

    // Append arrays
    if (query.subjects && query.subjects.length) {
      query.subjects.forEach((s) => s && params.append("subjects", s));
    }
    if (query.grade_levels && query.grade_levels.length) {
      query.grade_levels.forEach((g) => g && params.append("grade_levels", g));
    }

    // Append scalars
    if (typeof query.is_online === "boolean") {
      params.append("is_online", String(query.is_online));
    }
    if (query.search_term && query.search_term.trim()) {
      params.append("search_term", query.search_term.trim());
    }
    if (query.min_hourly_rate !== undefined && query.min_hourly_rate > 0) {
      params.append("min_hourly_rate", String(query.min_hourly_rate));
    }
    if (query.max_hourly_rate !== undefined && query.max_hourly_rate > 0) {
      params.append("max_hourly_rate", String(query.max_hourly_rate));
    }
    if (query.page && query.page > 0) params.append("page", String(query.page));
    if (query.limit && query.limit > 0)
      params.append("limit", String(Math.min(query.limit, 100)));
    if (query.sort_order) params.append("sort_order", query.sort_order);
    if (typeof query.relax === "boolean") params.append("relax", String(query.relax));

    const qs = params.toString();
    const url = `/posts/tutors/student-posts${qs ? `?${qs}` : ""}`;
    return axiosClient.get<IPaginatedPosts>(url);
  }

  // Tutor: Smart search student posts based on a tutorPost context
  static async smartSearchStudentPostsForTutor(
    query: {
      tutorPostId: string;
      subjects?: string[];
      grade_levels?: string[];
      is_online?: boolean;
      search_term?: string;
      min_hourly_rate?: number;
      max_hourly_rate?: number;
      page?: number;
      limit?: number;
      sort_by?: "compatibility" | "created_at";
      sort_order?: "asc" | "desc";
    }
  ): Promise<ApiResponse<IPaginatedPosts>> {
    const params = new URLSearchParams();

    params.append("tutorPostId", query.tutorPostId);

    if (query.subjects && query.subjects.length) {
      query.subjects.forEach((s) => s && params.append("subjects", s));
    }
    if (query.grade_levels && query.grade_levels.length) {
      query.grade_levels.forEach((g) => g && params.append("grade_levels", g));
    }

    if (typeof query.is_online === "boolean") params.append("is_online", String(query.is_online));
    if (query.search_term && query.search_term.trim()) params.append("search_term", query.search_term.trim());
    if (typeof query.min_hourly_rate === "number") params.append("min_hourly_rate", String(query.min_hourly_rate));
    if (typeof query.max_hourly_rate === "number") params.append("max_hourly_rate", String(query.max_hourly_rate));
    if (query.page && query.page > 0) params.append("page", String(query.page));
    if (query.limit && query.limit > 0) params.append("limit", String(Math.min(query.limit, 100)));
    if (query.sort_by) params.append("sort_by", query.sort_by);
    if (query.sort_order) params.append("sort_order", query.sort_order);

    const url = `/posts/tutors/student-posts/smart?${params.toString()}`;
    return axiosClient.get<IPaginatedPosts>(url);
  }
}

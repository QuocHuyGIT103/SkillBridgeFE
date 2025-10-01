export type PostStatus = 'pending' | 'approved' | 'rejected';

// Dữ liệu đầu vào khi tạo/cập nhật bài đăng
export interface IPostInput {
  title: string;
  content: string;
  subjects: string[];
  grade_levels: string[];
  location?: string;
  is_online?: boolean;
  hourly_rate?: {
    min: number;
    max: number;
  };
  availability?: string;
  requirements?: string;
  expiry_date?: string; 
}

// Dữ liệu đầy đủ của một bài đăng từ API
export interface IPost {
  id: string;
  author_id: {
    _id: string;
    full_name: string;
    avatar: string;
  };
  title: string;
  content: string;
  subjects: string[];
  grade_levels: string[];
  location?: string;
  is_online?: boolean;
  hourly_rate: {
    min: number;
    max: number;
  };
  status: PostStatus;
  admin_note?: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
}

// Dữ liệu đầu vào khi admin duyệt bài
export interface IPostReviewInput {
  status: 'approved' | 'rejected';
  admin_note?: string;
}

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Dữ liệu phân trang từ API
export interface IPaginatedPosts {
  posts: IPost[];
  pagination: IPagination;
}
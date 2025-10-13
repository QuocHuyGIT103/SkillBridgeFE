// Student types
export interface StudentNavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  children?: StudentNavigationItem[];
}

export interface StudentStats {
  totalClasses: number;
  completedAssignments: number;
  averageRating: number;
  totalHours: number;
}

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  tutor: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  score?: number;
}

export interface Tutor {
  id: string;
  name: string;
  avatar: string;
  subjects: string[];
  rating: number;
  hourlyRate: number;
}

export interface Conversation {
  id: string;
  tutor: Tutor;
  lastMessage: Message;
  unreadCount: number;
}

export interface Message {
  id: number;
  content: string;
  timestamp: string;
  isFromMe: boolean;
}

// ✅ Thêm các types mới cho student profile
export interface StudentDashboardUser {
  _id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  gender?: "male" | "female" | "other";
  date_of_birth?: string;
  address?: string;
  structured_address?: {
    province_code?: string;
    district_code?: string;
    ward_code?: string;
    detail_address?: string;
  };
  role: "STUDENT" | "student";
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  _id: string;
  user_id: string;
  learning_goals?: string;
  preferred_subjects?: string[];
  learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
  availability_schedule?: string;
  budget_range?: {
    min?: number;
    max?: number;
  };
  interests?: string;
  special_needs?: string;
  parent_contact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  status: 'draft' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface StudentProfileData {
  user: StudentDashboardUser | null;
  profile: StudentProfile | null;
}

export interface StudentPersonalInfoUpdate {
  full_name?: string;
  phone_number?: string;
  gender?: "male" | "female" | "other";
  date_of_birth?: string;
  address?: string;
  structured_address?: {
    province_code?: string;
    district_code?: string;
    ward_code?: string;
    detail_address?: string;
  };
  avatar_file?: File;
}

export interface StudentPreferencesUpdate {
  learning_goals?: string;
  preferred_subjects?: string[];
  learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
  availability_schedule?: string;
  budget_range?: {
    min?: number;
    max?: number;
  };
  interests?: string;
  special_needs?: string;
  parent_contact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

// ✅ Fix: Export as const array để có thể import
export const LEARNING_STYLE_OPTIONS = [
  {
    value: 'visual' as const,
    label: 'Học qua hình ảnh',
    description: 'Học tốt qua sơ đồ, biểu đồ, hình ảnh'
  },
  {
    value: 'auditory' as const,
    label: 'Học qua âm thanh',
    description: 'Học tốt qua nghe giảng, thảo luận'
  },
  {
    value: 'kinesthetic' as const,
    label: 'Học qua thực hành',
    description: 'Học tốt qua hoạt động, thực hành'
  },
  {
    value: 'reading_writing' as const,
    label: 'Học qua đọc viết',
    description: 'Học tốt qua đọc sách, viết bài'
  }
] as const;

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' }
] as const;

export const RELATIONSHIP_OPTIONS = [
  { value: 'father', label: 'Bố' },
  { value: 'mother', label: 'Mẹ' },
  { value: 'guardian', label: 'Người giám hộ' },
  { value: 'relative', label: 'Người thân' },
  { value: 'other', label: 'Khác' }
] as const;

// ✅ Validation constants
export const VALIDATION_RULES = {
  AVATAR_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  AVATAR_ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  PHONE_PATTERN: /^(\+84|0)[3|5|7|8|9][0-9]{8}$/,
  MAX_PREFERRED_SUBJECTS: 10,
  BUDGET_MIN: 0,
  BUDGET_MAX: 10000000,
};
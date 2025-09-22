// src/utils/constants.ts
export const API_BASE_URL = 'http://localhost:8080/api';

// API Endpoints - không cần thêm /v1 ở đây nữa
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout'
  },
  STUDENTS: {
    BASE: '/students',
    PROFILES: '/students/profiles',
    STATS: '/students/profiles/stats',
    RESET_PASSWORD: (id: string) => `/students/profiles/${id}/reset-password`
  }
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_OTP: '/verify-otp',
  
  // Dashboard Routes
  STUDENT_DASHBOARD: '/student/dashboard',
  TUTOR_DASHBOARD: '/tutor/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  PARENT_DASHBOARD: '/parent/dashboard',
} as const;

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  TUTOR: 'TUTOR',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
} as const;

export const ROLE_LABELS = {
  ADMIN: 'Quản trị viên',
  TUTOR: 'Gia sư',
  STUDENT: 'Học viên',
  PARENT: 'Phụ huynh',
} as const;

// Role descriptions for Register page
export const ROLE_DESCRIPTIONS = {
  STUDENT: 'Tìm kiếm gia sư phù hợp, đặt lịch học và theo dõi tiến độ học tập',
  TUTOR: 'Chia sẻ kiến thức, dạy học và kiếm thu nhập từ khả năng của bạn',
  PARENT: 'Quản lý việc học của con em, tìm gia sư và theo dõi tiến độ',
} as const;

export const THEME_COLORS = {
  primary: '#0f766e', // teal-600
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
} as const;

export const SOCIAL_LOGIN = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
} as const;

export const NAVIGATION_LINKS = [
  { href: '#features', label: 'Tính năng' },
  { href: '#how-it-works', label: 'Cách hoạt động' },
  { href: '#testimonials', label: 'Đánh giá' },
  { href: '#pricing', label: 'Bảng giá' },
  { href: '#contact', label: 'Liên hệ' },
] as const;

export const VALIDATION_RULES = {
  phone: {
    pattern: /^(\+84|0)[3|5|7|8|9][0-9]{8}$/,
    validPrefixes: ['03', '05', '07', '08', '09'],
    maxLength: 10,
    examples: ['0901234567', '0987654321', '0356789012', '0789123456']
  },
  
  fullName: {
    minLength: 2,
    maxLength: 100
  },
  
  address: {
    maxLength: 500
  },
  
  grade: {
    maxLength: 50
  },
  
  school: {
    maxLength: 200
  },
  
  learningGoals: {
    maxLength: 1000
  },
  
  preferredSchedule: {
    maxLength: 500
  },
  
  specialRequirements: {
    maxLength: 1000
  },
  
  subjects: {
    maxItemLength: 100
  }
};

export const VALIDATION_MESSAGES = {
  phone: {
    invalid: 'Số điện thoại phải bắt đầu bằng 03, 05, 07, 08, 09 và có đúng 10 số',
    example: 'Ví dụ: 0901234567, 0356789012'
  },
  
  fullName: {
    required: 'Họ và tên là bắt buộc',
    length: 'Tên phải có từ 2-100 ký tự'
  },
  
  dateOfBirth: {
    future: 'Ngày sinh không được là tương lai',
    invalid: 'Ngày sinh không hợp lệ'
  }
};

// src/utils/constants.ts
export const API_BASE_URL = 'http://localhost:8080/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  FORGOT_PASSWORD: '/forgot-password',
  ABOUT: '/about',
  TUTORS: '/tutors',
  BECOME_TUTOR: '/become-tutor',
  PRICING: '/pricing',
  CONTACT: '/contact',
  HELP: '/help',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  FAQ: '/faq',
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

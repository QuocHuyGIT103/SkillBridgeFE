// src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// Re-export all types
export * from "./admin.types";
export type {
  StudentNavigationItem,
  StudentStats,
  Assignment,
  Tutor,
  Conversation,
  Lesson as StudentLesson,
  Message as StudentMessage,
} from "./student.types";
export * from './post.types';

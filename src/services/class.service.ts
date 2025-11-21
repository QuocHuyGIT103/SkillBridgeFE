import axiosClient from '../api/axiosClient';
import type { LearningClass } from '../types/LearningClass';
import type {
  ClassMaterial,
  ClassAssignment,
  MaterialVisibility,
  AssignmentAttachment,
} from '../types/classResources';

interface ClassScheduleResponse {
  class: LearningClass;
  sessions: any[];
  stats: {
    total: number;
    completed: number;
    scheduled: number;
    cancelled: number;
    missed: number;
  };
  materials?: ClassMaterial[];
  assignments?: ClassAssignment[];
}

export interface TutorReview {
  classId?: string;
  classTitle: string;
  subjectName?: string;
  learningMode?: string;
  totalSessions?: number;
  completedSessions?: number;
  rating: number;
  comment?: string;
  submittedAt: string;
  student: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export interface TutorReviewSummary {
  tutorId: string;
  averageRating: number;
  totalReviews: number;
  badges: string[];
  lastReviewAt?: string | null;
}

export interface TutorReviewsResponse {
  summary: TutorReviewSummary;
  reviews: TutorReview[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ClassMaterialPayload {
  title: string;
  description?: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  visibility?: MaterialVisibility;
}

export interface ClassAssignmentPayload {
  title: string;
  instructions?: string;
  dueDate?: string;
  attachment?: AssignmentAttachment;
}

export interface UpdateAssignmentPayload {
  title?: string;
  instructions?: string;
  dueDate?: string;
  attachment?: AssignmentAttachment | null;
}

export interface AssignmentSubmissionPayload {
  note?: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export const classService = {
  getTutorClasses: async (): Promise<LearningClass[]> => {
    const response = await axiosClient.get('/classes/tutor');
    return response.data;
  },
  
  getStudentClasses: async (): Promise<LearningClass[]> => {
    const response = await axiosClient.get('/classes/student');
    return response.data;
  },
  
  getClassById: async (classId: string): Promise<LearningClass> => {
    const response = await axiosClient.get(`/classes/${classId}`);
    return response.data;
  },

  getClassSchedule: async (classId: string): Promise<ClassScheduleResponse> => {
    const response = await axiosClient.get(`/classes/${classId}/schedule`);
    return response.data;
  },
  
  updateClassStatus: async (classId: string, status: string): Promise<void> => {
    await axiosClient.patch(`/classes/${classId}/status`, { status });
  },

  updateSessionStatus: async (
    classId: string,
    sessionNumber: number,
    status: string,
    notes?: string
  ): Promise<void> => {
    await axiosClient.patch(`/classes/${classId}/sessions/${sessionNumber}/status`, {
      status,
      notes
    });
  },
  
  createClass: async (classData: Partial<LearningClass>): Promise<LearningClass> => {
    const response = await axiosClient.post('/classes', classData);
    return response.data;
  },
  
  addReview: async (classId: string, reviewData: { rating: number; review: string }): Promise<void> => {
    await axiosClient.post(`/classes/${classId}/student-review`, reviewData);
  },

  getTutorReviews: async (
    tutorId: string,
    params?: { page?: number; limit?: number }
  ): Promise<TutorReviewsResponse> => {
    const query = new URLSearchParams();
    if (params?.page) {
      query.append('page', params.page.toString());
    }
    if (params?.limit) {
      query.append('limit', params.limit.toString());
    }

    const url = `/classes/tutors/${tutorId}/reviews${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await axiosClient.get<TutorReviewsResponse>(url);
    return response.data;
  },

  getClassMaterials: async (classId: string) => {
    const response = await axiosClient.get<ClassMaterial[]>(`/classes/${classId}/materials`);
    return response;
  },

  createClassMaterial: async (classId: string, payload: ClassMaterialPayload) => {
    const response = await axiosClient.post(`/classes/${classId}/materials`, payload);
    return response;
  },

  updateClassMaterial: async (
    classId: string,
    materialId: string,
    payload: Partial<ClassMaterialPayload>
  ) => {
    const response = await axiosClient.put(
      `/classes/${classId}/materials/${materialId}`,
      payload
    );
    return response;
  },

  deleteClassMaterial: async (classId: string, materialId: string) => {
    const response = await axiosClient.delete(
      `/classes/${classId}/materials/${materialId}`
    );
    return response;
  },

  getClassAssignments: async (classId: string) => {
    const response = await axiosClient.get<ClassAssignment[]>(`/classes/${classId}/assignments`);
    return response;
  },

  createClassAssignment: async (classId: string, payload: ClassAssignmentPayload) => {
    const response = await axiosClient.post(`/classes/${classId}/assignments`, payload);
    return response;
  },

  updateClassAssignment: async (
    classId: string,
    assignmentId: string,
    payload: UpdateAssignmentPayload
  ) => {
    const response = await axiosClient.put(
      `/classes/${classId}/assignments/${assignmentId}`,
      payload
    );
    return response;
  },

  deleteClassAssignment: async (classId: string, assignmentId: string) => {
    const response = await axiosClient.delete(
      `/classes/${classId}/assignments/${assignmentId}`
    );
    return response;
  },

  submitAssignmentWork: async (
    classId: string,
    assignmentId: string,
    payload: AssignmentSubmissionPayload
  ) => {
    const response = await axiosClient.post(
      `/classes/${classId}/assignments/${assignmentId}/submissions`,
      payload
    );
    return response;
  }
};
import axiosClient from "../api/axiosClient";

// Subject types
export interface Subject {
  _id: string;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectRequest {
  name: string;
  description?: string;
  category: string;
}

export interface UpdateSubjectRequest {
  name?: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}

export interface SubjectsResponse {
  subjects: Subject[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SubjectQuery {
  category?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

const SubjectService = {
  // Public APIs
  getActiveSubjects: async () => {
    try {
      const response = await axiosClient.get<SubjectsResponse>(
        "/subjects/active"
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  getSubjectsByCategory: async (category: string) => {
    try {
      const response = await axiosClient.get<SubjectsResponse>(
        `/subjects/category/${category}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  searchSubjects: async (searchTerm: string) => {
    try {
      const response = await axiosClient.get<SubjectsResponse>(
        `/subjects/search?q=${encodeURIComponent(searchTerm)}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  getSubjectById: async (id: string) => {
    try {
      const response = await axiosClient.get<{ subject: Subject }>(
        `/subjects/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Admin APIs
  createSubject: async (data: CreateSubjectRequest) => {
    try {
      const response = await axiosClient.post<{ subject: Subject }>(
        "/subjects",
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  getAllSubjects: async (query?: SubjectQuery) => {
    try {
      const params = new URLSearchParams();

      if (query?.category) params.append("category", query.category);
      if (query?.isActive !== undefined)
        params.append("isActive", query.isActive.toString());
      if (query?.search) params.append("search", query.search);
      if (query?.page) params.append("page", query.page.toString());
      if (query?.limit) params.append("limit", query.limit.toString());

      const response = await axiosClient.get<SubjectsResponse>(
        `/subjects?${params.toString()}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateSubject: async (id: string, data: UpdateSubjectRequest) => {
    try {
      const response = await axiosClient.put<{ subject: Subject }>(
        `/subjects/${id}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteSubject: async (id: string) => {
    try {
      const response = await axiosClient.delete(`/subjects/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default SubjectService;

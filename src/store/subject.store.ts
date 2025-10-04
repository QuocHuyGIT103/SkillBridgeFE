import { create } from "zustand";
import toast from "react-hot-toast";
import SubjectService from "../services/subject.service";
import type {
  Subject,
  SubjectQuery,
  CreateSubjectRequest,
  UpdateSubjectRequest,
} from "../services/subject.service";

interface SubjectState {
  subjects: Subject[];
  activeSubjects: Subject[];
  isLoading: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;

  // Actions
  getActiveSubjects: () => Promise<void>;
  getSubjectsByCategory: (category: string) => Promise<void>;
  searchSubjects: (searchTerm: string) => Promise<Subject[]>;
  getAllSubjects: (query?: SubjectQuery) => Promise<void>;
  createSubject: (data: CreateSubjectRequest) => Promise<void>;
  updateSubject: (id: string, data: UpdateSubjectRequest) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  clearSubjects: () => void;
}

export const useSubjectStore = create<SubjectState>((set) => ({
  subjects: [],
  activeSubjects: [],
  isLoading: false,
  pagination: null,

  getActiveSubjects: async () => {
    set({ isLoading: true });
    try {
      const response = await SubjectService.getActiveSubjects();

      if (response.success && response.data.subjects) {
        set({
          activeSubjects: response.data.subjects,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Failed to fetch active subjects");
      }
    } catch (error: any) {
      set({ isLoading: false });
      console.error("Get active subjects error:", error);
      throw error;
    }
  },

  getSubjectsByCategory: async (category: string) => {
    set({ isLoading: true });
    try {
      const response = await SubjectService.getSubjectsByCategory(category);

      if (response.success && response.data.subjects) {
        set({
          subjects: response.data.subjects,
          isLoading: false,
        });
      } else {
        throw new Error(
          response.message || "Failed to fetch subjects by category"
        );
      }
    } catch (error: any) {
      set({ isLoading: false });
      console.error("Get subjects by category error:", error);
      throw error;
    }
  },

  searchSubjects: async (searchTerm: string) => {
    try {
      const response = await SubjectService.searchSubjects(searchTerm);

      if (response.success && response.data.subjects) {
        return response.data.subjects;
      } else {
        throw new Error(response.message || "Failed to search subjects");
      }
    } catch (error: any) {
      console.error("Search subjects error:", error);
      throw error;
    }
  },

  getAllSubjects: async (query?: SubjectQuery) => {
    set({ isLoading: true });
    try {
      const response = await SubjectService.getAllSubjects(query);

      if (response.success && response.data) {
        set({
          subjects: response.data.subjects,
          pagination: response.data.pagination || null,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Failed to fetch all subjects");
      }
    } catch (error: any) {
      set({ isLoading: false });
      console.error("Get all subjects error:", error);
      throw error;
    }
  },

  createSubject: async (data: CreateSubjectRequest) => {
    set({ isLoading: true });
    try {
      const response = await SubjectService.createSubject(data);

      if (response.success && response.data.subject) {
        // Add new subject to current list
        set((state) => ({
          subjects: [response.data.subject, ...state.subjects],
          isLoading: false,
        }));

        toast.success(response.message || "Subject created successfully");
      } else {
        throw new Error(response.message || "Failed to create subject");
      }
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.message || "Failed to create subject");
      throw error;
    }
  },

  updateSubject: async (id: string, data: UpdateSubjectRequest) => {
    set({ isLoading: true });
    try {
      const response = await SubjectService.updateSubject(id, data);

      if (response.success && response.data.subject) {
        // Update subject in current list
        set((state) => ({
          subjects: state.subjects.map((subject) =>
            subject._id === id ? response.data.subject : subject
          ),
          isLoading: false,
        }));

        toast.success(response.message || "Subject updated successfully");
      } else {
        throw new Error(response.message || "Failed to update subject");
      }
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.message || "Failed to update subject");
      throw error;
    }
  },

  deleteSubject: async (id: string) => {
    set({ isLoading: true });
    try {
      const response = await SubjectService.deleteSubject(id);

      if (response.success) {
        // Remove subject from current list
        set((state) => ({
          subjects: state.subjects.filter((subject) => subject._id !== id),
          isLoading: false,
        }));

        toast.success(response.message || "Subject deleted successfully");
      } else {
        throw new Error(response.message || "Failed to delete subject");
      }
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.message || "Failed to delete subject");
      throw error;
    }
  },

  clearSubjects: () => {
    set({
      subjects: [],
      activeSubjects: [],
      pagination: null,
    });
  },
}));

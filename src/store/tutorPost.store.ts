import { create } from "zustand";
import toast from "react-hot-toast";
import TutorPostService from "../services/tutorPost.service";
import {PostService} from "../services/post.service";

import type {
  TutorPost,
  TutorPostSearchQuery,
  CreateTutorPostRequest,
  UpdateTutorPostRequest,
} from "../services/tutorPost.service";

interface TutorPostState {
  posts: TutorPost[];
  myPosts: TutorPost[];
  currentPost: TutorPost | null;
  isLoading: boolean;
  searchLoading: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  searchFilters: TutorPostSearchQuery | null;

  // Actions
  searchTutorPosts: (query?: TutorPostSearchQuery) => Promise<void>;
  getTutorPostById: (postId: string) => Promise<void>;
  incrementContactCount: (postId: string) => Promise<void>;
  createTutorPost: (data: CreateTutorPostRequest) => Promise<void>;
  getMyTutorPosts: (page?: number, limit?: number) => Promise<void>;
  updateTutorPost: (
    postId: string,
    data: UpdateTutorPostRequest
  ) => Promise<void>;
  activatePost: (postId: string) => Promise<void>;
  deactivatePost: (postId: string) => Promise<void>;
  deleteTutorPost: (postId: string) => Promise<void>;
  clearPosts: () => void;
  clearCurrentPost: () => void;
}

export const useTutorPostStore = create<TutorPostState>((set) => ({
  posts: [],
  myPosts: [],
  currentPost: null,
  isLoading: false,
  searchLoading: false,
  pagination: null,
  searchFilters: null,

  searchTutorPosts: async (query?: TutorPostSearchQuery) => {
    set({ searchLoading: true });
    try {
      const response = await TutorPostService.searchTutorPosts(query);

      if (response.success && response.data) {
        set({
          posts: response.data.posts,
          pagination: response.data.pagination,
          searchFilters: response.data.filters || query || null,
          searchLoading: false,
        });
      } else {
        throw new Error(response.message || "Failed to search tutor posts");
      }
    } catch (error: any) {
      set({ searchLoading: false });
      console.error("Search tutor posts error:", error);
      throw error;
    }
  },

  getTutorPostById: async (postId: string) => {
    set({ isLoading: true });
    try {
      const response = await TutorPostService.getTutorPostById(postId);

      if (response.success && response.data.tutorPost) {
        set({
          currentPost: response.data.tutorPost,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Failed to get tutor post");
      }
    } catch (error: any) {
      set({ isLoading: false });
      console.error("Get tutor post error:", error);
      throw error;
    }
  },

  incrementContactCount: async (postId: string) => {
    try {
      const response = await TutorPostService.incrementContactCount(postId);

      if (response.success) {
        // Update contact count in current post if it matches
        set((state) => ({
          currentPost:
            state.currentPost && state.currentPost._id === postId
              ? {
                  ...state.currentPost,
                  contactCount: state.currentPost.contactCount + 1,
                }
              : state.currentPost,
          posts: state.posts.map((post) =>
            post._id === postId
              ? { ...post, contactCount: post.contactCount + 1 }
              : post
          ),
        }));
      } else {
        throw new Error(
          response.message || "Failed to increment contact count"
        );
      }
    } catch (error: any) {
      console.error("Increment contact count error:", error);
      // Don't show toast for this as it's not critical
    }
  },

  createTutorPost: async (data: CreateTutorPostRequest) => {
    set({ isLoading: true });
    try {
      const response = await TutorPostService.createTutorPost(data);

      if (response.success && response.data.tutorPost) {
        // Add new post to my posts list
        set((state) => ({
          myPosts: [response.data.tutorPost, ...state.myPosts],
          isLoading: false,
        }));

        toast.success(response.message || "Tutor post created successfully");
      } else {
        throw new Error(response.message || "Failed to create tutor post");
      }
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.message || "Failed to create tutor post");
      throw error;
    }
  },

  getMyTutorPosts: async (page?: number, limit?: number) => {
    set({ isLoading: true });
    try {
      const response = await TutorPostService.getMyTutorPosts(page, limit);

      if (response.success && response.data) {
        set({
          myPosts: response.data.posts,
          pagination: response.data.pagination,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Failed to get my tutor posts");
      }
    } catch (error: any) {
      set({ isLoading: false });
      console.error("Get my tutor posts error:", error);
      throw error;
    }
  },

  updateTutorPost: async (postId: string, data: UpdateTutorPostRequest) => {
    set({ isLoading: true });
    try {
      const response = await TutorPostService.updateTutorPost(postId, data);

      if (response.success && response.data.tutorPost) {
        // Update post in my posts list
        set((state) => ({
          myPosts: state.myPosts.map((post) =>
            post._id === postId ? response.data.tutorPost : post
          ),
          currentPost:
            state.currentPost?._id === postId
              ? response.data.tutorPost
              : state.currentPost,
          isLoading: false,
        }));

        toast.success(response.message || "Tutor post updated successfully");
      } else {
        throw new Error(response.message || "Failed to update tutor post");
      }
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.message || "Failed to update tutor post");
      throw error;
    }
  },

  activatePost: async (postId: string) => {
    try {
      const response = await TutorPostService.activatePost(postId);

      if (response.success && response.data.tutorPost) {
        // Update post status in my posts list
        set((state) => ({
          myPosts: state.myPosts.map((post) =>
            post._id === postId ? response.data.tutorPost : post
          ),
          currentPost:
            state.currentPost?._id === postId
              ? response.data.tutorPost
              : state.currentPost,
        }));

        toast.success(response.message || "Post activated successfully");
      } else {
        throw new Error(response.message || "Failed to activate post");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to activate post");
      throw error;
    }
  },

  deactivatePost: async (postId: string) => {
    try {
      const response = await TutorPostService.deactivatePost(postId);

      if (response.success && response.data.tutorPost) {
        // Update post status in my posts list
        set((state) => ({
          myPosts: state.myPosts.map((post) =>
            post._id === postId ? response.data.tutorPost : post
          ),
          currentPost:
            state.currentPost?._id === postId
              ? response.data.tutorPost
              : state.currentPost,
        }));

        toast.success(response.message || "Post deactivated successfully");
      } else {
        throw new Error(response.message || "Failed to deactivate post");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to deactivate post");
      throw error;
    }
  },

  deleteTutorPost: async (postId: string) => {
    try {
      const response = await TutorPostService.deleteTutorPost(postId);

      if (response.success) {
        // Remove post from my posts list
        set((state) => ({
          myPosts: state.myPosts.filter((post) => post._id !== postId),
          currentPost:
            state.currentPost?._id === postId ? null : state.currentPost,
        }));

        toast.success(response.message || "Post deleted successfully");
      } else {
        throw new Error(response.message || "Failed to delete post");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete post");
      throw error;
    }
  },

  clearPosts: () => {
    set({
      posts: [],
      myPosts: [],
      pagination: null,
      searchFilters: null,
    });
  },

  clearCurrentPost: () => {
    set({ currentPost: null });
  },
}));

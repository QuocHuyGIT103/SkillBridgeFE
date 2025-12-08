import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import usePostStore from "../../store/post.store";
import TutorPostCard from "../../components/tutorPost/TutorPostCard";
import TutorPostFilter from "../../components/tutorPost/TutorPostFilter";
import ContactRequestForm from "../../components/student/ContactRequestForm";
import { debounce } from "../../utils/tutorUtils";
import toast from "react-hot-toast";
import { validate as validateUUID } from "uuid";
import SurveyService from "../../services/survey.service";
import TutorPostService from "../../services/tutorPost.service";
import type { TutorPost, TutorPostSearchQuery } from "../../services/tutorPost.service";
import { useAuthStore } from "../../store/auth.store";

// ==================== TYPES ====================
export interface SmartSearchQuery {
  subjects?: string[];
  teachingMode?: "ONLINE" | "OFFLINE" | "BOTH";
  studentLevel?: string[];
  priceMin?: number;
  priceMax?: number;
  province?: string;
  district?: string;
  ward?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "compatibility" | "createdAt" | "pricePerSession" | "viewCount";
  sortOrder?: "desc" | "asc";
}

type SearchMode = "survey" | "post";

// ==================== CACHE KEYS ====================
const CACHE_KEYS = {
  SURVEY_RECOMMENDATIONS: 'smart_search_survey_recommendations',
  ALL_TUTORS: 'smart_search_all_tutors',
  SMART_SEARCH_RESULTS: 'smart_search_results',
  FILTERS: 'smart_search_filters',
  MODE: 'smart_search_mode',
  SELECTED_POST_ID: 'smart_search_selected_post_id',
  SCROLL_POSITION: 'smart_search_scroll_position',
  SURVEY_PAGE: 'smart_search_survey_page',
  ALL_TUTORS_PAGE: 'smart_search_all_tutors_page',
  CACHE_TIMESTAMP: 'smart_search_cache_timestamp',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ==================== COMPONENT ====================
const StudentSmartSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Auth store for checking if user can send request
  const { user, isAuthenticated } = useAuthStore();

  // Store states
  const {
    posts: myStudentPosts,
    fetchMyPosts,
    smartSearchTutors,
    smartSearchResults,
    smartSearchPagination,
    smartSearchLoading,
    smartSearchError,
    loadMoreSmartSearchResults,
    clearSmartSearchResults,
    setSmartSearchError,
  } = usePostStore();

  // ==================== STATES ====================
  // Search mode: "survey" (default) or "post" (by student post)
  const [searchMode, setSearchMode] = useState<SearchMode>(() => {
    return searchParams.get("mode") === "post" ? "post" : "survey";
  });

  // Survey-based results
  const [surveyRecommendations, setSurveyRecommendations] = useState<TutorPost[]>([]);
  const [allTutors, setAllTutors] = useState<TutorPost[]>([]);
  const [allTutorsLoading, setAllTutorsLoading] = useState(false);
  const [surveyLoading, setSurveyLoading] = useState(true);
  const [hasSurvey, setHasSurvey] = useState(false);

  // Post-based search
  const [selectedPostId, setSelectedPostId] = useState<string | null>(
    searchParams.get("postId") || null
  );

  // Common states
  const [currentFilters, setCurrentFilters] = useState<SmartSearchQuery>(() => ({
    subjects: searchParams.getAll("subjects").filter(Boolean),
    teachingMode: (searchParams.get("teachingMode") as any) || undefined,
    studentLevel: searchParams.getAll("studentLevel").filter(Boolean),
    priceMin: searchParams.get("priceMin") ? Number(searchParams.get("priceMin")) : undefined,
    priceMax: searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : undefined,
    province: searchParams.get("province") || undefined,
    district: searchParams.get("district") || undefined,
    ward: searchParams.get("ward") || undefined,
    search: searchParams.get("search") || undefined,
    page: 1,
    limit: 4,
    sortBy: "compatibility",
    sortOrder: "desc",
  }));

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [myPostsLoaded, setMyPostsLoaded] = useState(false);
  
  // Pagination for survey mode
  const ITEMS_PER_PAGE = 4;
  const ALL_TUTORS_PER_PAGE = 2;
  const [surveyCurrentPage, setSurveyCurrentPage] = useState(1);
  const [allTutorsCurrentPage, setAllTutorsCurrentPage] = useState(1);
  
  const [allTutorsPagination, setAllTutorsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
  });

  // Contact Request Modal states
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedTutorPost, setSelectedTutorPost] = useState<TutorPost | null>(null);

  // Check if user can send contact request
  const canSendRequest = Boolean(
    isAuthenticated && user?.role === "STUDENT"
  );

  // ==================== CACHE HELPERS ====================
  const saveToCache = useCallback((key: string, data: any) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
      sessionStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error('Cache save error:', error);
    }
  }, []);

  const loadFromCache = useCallback((key: string) => {
    try {
      const timestamp = sessionStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
      if (timestamp && Date.now() - parseInt(timestamp) < CACHE_DURATION) {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }
      return null;
    } catch (error) {
      console.error('Cache load error:', error);
      return null;
    }
  }, []);

  const clearCache = useCallback(() => {
    Object.values(CACHE_KEYS).forEach(key => {
      sessionStorage.removeItem(key);
    });
  }, []);

  // Handle send request click
  const handleSendRequest = useCallback((post: any) => {
    if (!canSendRequest) {
      toast.error("Bạn cần đăng nhập với tài khoản học viên để gửi yêu cầu");
      return;
    }
    
    // Convert the card's post format to TutorPost format for ContactRequestForm
    const tutorPost: TutorPost = {
      _id: post._id || post.id,
      id: post.id || post._id,
      title: post.title,
      description: post.description,
      subjects: post.subjects,
      pricePerSession: post.pricePerSession,
      sessionDuration: post.sessionDuration,
      teachingMode: post.teachingMode,
      tutorId: post.tutorId,
      viewCount: post.viewCount,
      contactCount: post.contactCount,
      createdAt: post.createdAt,
      status: 'active',
    };
    
    setSelectedTutorPost(tutorPost);
    setShowContactModal(true);
  }, [canSendRequest]);

  // Handle contact request success
  const handleContactSuccess = useCallback(() => {
    setShowContactModal(false);
    setSelectedTutorPost(null);
    toast.success("Gửi yêu cầu học tập thành công!");
  }, []);

  // ==================== COMPUTED ====================
  const hasActiveFilters = useCallback(() => {
    return !!(
      currentFilters.subjects?.length ||
      currentFilters.teachingMode ||
      currentFilters.studentLevel?.length ||
      currentFilters.priceMin ||
      currentFilters.priceMax ||
      currentFilters.province ||
      currentFilters.district ||
      currentFilters.search
    );
  }, [currentFilters]);

  // ==================== FILTER LOGIC FOR SURVEY MODE ====================
  const getFilteredSurveyResults = useMemo(() => {
    // Guard against null/undefined arrays
    const recommendations = surveyRecommendations || [];
    
    // In survey mode, we ONLY show recommendations from the survey API
    // NO filtering applied - keep the order and results from the AI recommendation
    return recommendations;
  }, [surveyRecommendations]);

  // Paginated results for survey mode
  const surveyPaginatedResults = useMemo(() => {
    const allResults = getFilteredSurveyResults || [];
    const totalItems = allResults.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (surveyCurrentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedItems = allResults.slice(startIndex, endIndex);
    
    return {
      items: paginatedItems,
      pagination: {
        currentPage: surveyCurrentPage,
        totalPages,
        totalItems,
        hasNext: surveyCurrentPage < totalPages,
        hasPrev: surveyCurrentPage > 1,
      },
    };
  }, [getFilteredSurveyResults, surveyCurrentPage, ITEMS_PER_PAGE]);

  // ==================== URL UPDATE ====================
  const updateURL = useCallback(
    (filters: SmartSearchQuery, postId?: string | null, mode?: SearchMode) => {
      const params = new URLSearchParams();

      params.set("mode", mode || searchMode);
      if (mode === "post" && postId) {
        params.set("postId", postId);
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && !["page", "limit", "sortBy", "sortOrder"].includes(key)) {
          if (Array.isArray(value) && value.length > 0) {
            value.forEach(v => params.append(key, v.toString()));
          } else if (!Array.isArray(value)) {
            params.set(key, value.toString());
          }
        }
      });

      setSearchParams(params);
    },
    [setSearchParams, searchMode]
  );

  // ==================== FETCH ALL TUTORS WITH FILTERS ====================
  const fetchAllTutorsWithFilters = useCallback(
    async (filters: SmartSearchQuery = {}) => {
      setAllTutorsLoading(true);
      try {
        // Map sortBy field - "compatibility" only works with smart search
        // For regular search, use valid fields like "createdAt", "pricePerSession", "viewCount", etc.
        let sortBy = filters.sortBy || "createdAt";
        if (sortBy === "compatibility") {
          sortBy = "createdAt"; // Default to createdAt for all tutors listing
        }

        const searchQuery = {
          page: filters.page || 1,
          limit: 50,
          sortBy: sortBy,
          sortOrder: filters.sortOrder || "desc",
          ...(filters.subjects?.length && { subjects: filters.subjects }),
          ...(filters.teachingMode && { teachingMode: filters.teachingMode }),
          ...(filters.studentLevel?.length && { studentLevel: filters.studentLevel }),
          ...(filters.priceMin !== undefined && { priceMin: filters.priceMin }),
          ...(filters.priceMax !== undefined && { priceMax: filters.priceMax }),
          ...(filters.province && { province: filters.province }),
          ...(filters.district && { district: filters.district }),
          ...(filters.ward && { ward: filters.ward }),
          ...(filters.search?.trim() && { search: filters.search.trim() }),
        };

        const tutorsResponse = await TutorPostService.searchTutorPosts(searchQuery);
        if (tutorsResponse.success && tutorsResponse.data) {
          setAllTutors(tutorsResponse.data.posts || []);
          setAllTutorsPagination({
            currentPage: tutorsResponse.data.pagination?.currentPage || 1,
            totalPages: tutorsResponse.data.pagination?.totalPages || 1,
            totalItems: tutorsResponse.data.pagination?.totalItems || 0,
            hasNext: tutorsResponse.data.pagination?.hasNext || false,
          });
          setAllTutorsCurrentPage(1); // Reset to page 1 when filters change
        }
      } catch (error: any) {
        console.error("Fetch all tutors error:", error);
        toast.error("Không thể tải danh sách gia sư");
      } finally {
        setAllTutorsLoading(false);
      }
    },
    []
  );

  // ==================== DEBOUNCED SEARCH (for post mode) ====================
  const debouncedSmartSearch = useCallback(
    debounce(async (postId: string, query: SmartSearchQuery = {}) => {
      try {
        const smartQuery = {
          page: query.page || 1,
          limit: query.limit || 12,
          sortBy: query.sortBy || "compatibility",
          sortOrder: query.sortOrder || "desc",
          ...(query.subjects?.length && { subjects: query.subjects }),
          ...(query.teachingMode && { teachingMode: query.teachingMode }),
          ...(query.studentLevel?.length && { studentLevel: query.studentLevel }),
          ...(query.priceMin !== undefined && { priceMin: query.priceMin }),
          ...(query.priceMax !== undefined && { priceMax: query.priceMax }),
          ...(query.province && { province: query.province }),
          ...(query.district && { district: query.district }),
          ...(query.ward && { ward: query.ward }),
          ...(query.search?.trim() && { search: query.search.trim() }),
        };

        await smartSearchTutors(postId, smartQuery);
      } catch (error: any) {
        console.error("Smart search error:", error);
      }
    }, 300),
    [smartSearchTutors]
  );

  // ==================== HANDLERS ====================
  const handleFiltersChange = useCallback(
    (newFilters: TutorPostSearchQuery) => {
      const updatedFilters = { ...newFilters, page: 1 } as SmartSearchQuery;
      setCurrentFilters(updatedFilters);
      setSurveyCurrentPage(1); // Reset page when filters change

      if (searchMode === "post" && selectedPostId) {
        updateURL(updatedFilters, selectedPostId, "post");
        debouncedSmartSearch(selectedPostId, updatedFilters);
      } else if (searchMode === "post" && !selectedPostId) {
        // Post mode but no post selected - apply filters to all tutors
        updateURL(updatedFilters, null, "post");
        fetchAllTutorsWithFilters(updatedFilters);
      } else {
        updateURL(updatedFilters, null, "survey");
      }
    },
    [searchMode, selectedPostId, updateURL, debouncedSmartSearch, fetchAllTutorsWithFilters]
  );

  const handleSearch = useCallback(() => {
    setSurveyCurrentPage(1); // Reset page on search
    if (searchMode === "post" && selectedPostId) {
      debouncedSmartSearch(selectedPostId, currentFilters);
    } else if (searchMode === "post" && !selectedPostId) {
      fetchAllTutorsWithFilters(currentFilters);
    }
  }, [searchMode, selectedPostId, currentFilters, debouncedSmartSearch, fetchAllTutorsWithFilters]);

  const handleReset = useCallback(() => {
    const resetFilters: SmartSearchQuery = {
      page: 1,
      limit: 4,
      sortBy: searchMode === "post" && !selectedPostId ? "createdAt" : "compatibility",
      sortOrder: "desc",
    };

    setCurrentFilters(resetFilters);
    setSurveyCurrentPage(1); // Reset page on reset

    if (searchMode === "post" && selectedPostId) {
      updateURL(resetFilters, selectedPostId, "post");
      debouncedSmartSearch(selectedPostId, resetFilters);
    } else if (searchMode === "post" && !selectedPostId) {
      updateURL(resetFilters, null, "post");
      fetchAllTutorsWithFilters(resetFilters);
    } else {
      updateURL(resetFilters, null, "survey");
    }
    toast.success("Đã đặt lại bộ lọc");
  }, [searchMode, selectedPostId, updateURL, debouncedSmartSearch]);

  // Pagination handlers for survey mode
  const handleSurveyPageChange = useCallback((page: number) => {
    setSurveyCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Pagination handler for all tutors (post mode, no post selected)
  const handleAllTutorsPageChange = useCallback((page: number) => {
    setAllTutorsCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Switch mode handlers
  const handleSwitchToSurveyMode = useCallback(() => {
    setSearchMode("survey");
    setSelectedPostId(null);
    clearSmartSearchResults();
    updateURL(currentFilters, null, "survey");
  }, [currentFilters, updateURL, clearSmartSearchResults]);

  const handleSwitchToPostMode = useCallback(() => {
    const approvedPosts = myStudentPosts.filter((p: any) => p.status === "approved");
    if (approvedPosts.length === 0) {
      toast.error("Bạn chưa có bài đăng được duyệt");
      return;
    }
    setSearchMode("post");
    updateURL(currentFilters, null, "post");
  }, [myStudentPosts, currentFilters, updateURL]);

  // Post selection
  const handlePostSelect = useCallback(
    (postId: string | null) => {
      if (!postId || !postId.trim()) {
        setSelectedPostId(null);
        clearSmartSearchResults();
        return;
      }

      const trimmedPostId = postId.trim();
      if (!validateUUID(trimmedPostId)) {
        toast.error("ID bài đăng không đúng định dạng");
        return;
      }

      setSelectedPostId(trimmedPostId);
      const smartFilters = { ...currentFilters, page: 1 };
      setCurrentFilters(smartFilters);
      updateURL(smartFilters, trimmedPostId, "post");
      debouncedSmartSearch(trimmedPostId, smartFilters);
      toast.success("Đang tìm kiếm gia sư theo bài đăng...");
    },
    [currentFilters, updateURL, debouncedSmartSearch, clearSmartSearchResults]
  );

  // Post mode pagination handler
  const handlePostPageChange = useCallback((page: number) => {
    if (searchMode === "post" && selectedPostId) {
      const newFilters = { ...currentFilters, page };
      setCurrentFilters(newFilters);
      updateURL(newFilters, selectedPostId, "post");
      debouncedSmartSearch(selectedPostId, newFilters);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchMode, selectedPostId, currentFilters, updateURL, debouncedSmartSearch]);

  const handleTutorClick = useCallback(
    (tutorId: string) => {
      // Save current state to cache before navigating
      saveToCache(CACHE_KEYS.SCROLL_POSITION, window.scrollY);
      saveToCache(CACHE_KEYS.MODE, searchMode);
      saveToCache(CACHE_KEYS.SELECTED_POST_ID, selectedPostId);
      saveToCache(CACHE_KEYS.FILTERS, currentFilters);
      saveToCache(CACHE_KEYS.SURVEY_PAGE, surveyCurrentPage);
      saveToCache(CACHE_KEYS.ALL_TUTORS_PAGE, allTutorsCurrentPage);
      
      if (searchMode === 'survey') {
        saveToCache(CACHE_KEYS.SURVEY_RECOMMENDATIONS, surveyRecommendations);
      } else if (searchMode === 'post' && !selectedPostId) {
        saveToCache(CACHE_KEYS.ALL_TUTORS, allTutors);
      }
      
      navigate(`/tutors/${tutorId}`);
    },
    [navigate, searchMode, selectedPostId, currentFilters, surveyCurrentPage, allTutorsCurrentPage, surveyRecommendations, allTutors, saveToCache]
  );

  // ==================== EFFECTS ====================
  // Restore from cache on mount
  useEffect(() => {
    const cachedMode = loadFromCache(CACHE_KEYS.MODE);
    const cachedFilters = loadFromCache(CACHE_KEYS.FILTERS);
    const cachedPostId = loadFromCache(CACHE_KEYS.SELECTED_POST_ID);
    const cachedSurveyPage = loadFromCache(CACHE_KEYS.SURVEY_PAGE);
    const cachedAllTutorsPage = loadFromCache(CACHE_KEYS.ALL_TUTORS_PAGE);
    
    if (cachedMode) setSearchMode(cachedMode);
    if (cachedFilters) setCurrentFilters(cachedFilters);
    if (cachedPostId) setSelectedPostId(cachedPostId);
    if (cachedSurveyPage) setSurveyCurrentPage(cachedSurveyPage);
    if (cachedAllTutorsPage) setAllTutorsCurrentPage(cachedAllTutorsPage);
    
    // Restore scroll position
    const cachedScroll = loadFromCache(CACHE_KEYS.SCROLL_POSITION);
    if (cachedScroll) {
      setTimeout(() => {
        window.scrollTo(0, cachedScroll);
      }, 100);
    }
  }, [loadFromCache]);

  // Load initial data
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      setIsInitialLoading(true);
      setSurveyLoading(true);

      // 1. Fetch survey recommendations
      try {
        // Check cache first
        const cachedSurveyData = loadFromCache(CACHE_KEYS.SURVEY_RECOMMENDATIONS);
        if (cachedSurveyData && cachedSurveyData.length > 0) {
          if (isMounted) {
            setSurveyRecommendations(cachedSurveyData);
            setHasSurvey(true);
            setSurveyLoading(false);
          }
          // Still fetch in background to update cache
        }

        const surveyResponse = await SurveyService.getSurvey();
        if (isMounted && surveyResponse.success && surveyResponse.data) {
          // API có thể trả về data.recommendations hoặc data trực tiếp là mảng
          const responseData = surveyResponse.data;
          let rawRecommendations: any[] = [];
          
          if (Array.isArray(responseData)) {
            // data là mảng trực tiếp
            rawRecommendations = responseData;
          } else if (responseData.recommendations) {
            // data có property recommendations
            rawRecommendations = responseData.recommendations;
          }
          
          // Transform survey recommendations to TutorPost format
          // Survey format: { tutorId, tutor, tutorPost, matchScore, matchDetails }
          // TutorPost format: { _id, id, title, tutorId: {...}, subjects, ... }
          const transformedRecommendations: TutorPost[] = rawRecommendations.map((rec: any) => {
            // Nếu đã có format TutorPost (có title trực tiếp)
            if (rec.title && rec.tutorId && typeof rec.tutorId === 'object') {
              return rec as TutorPost;
            }
            
            // Nếu là format survey recommendation
            if (rec.tutorPost && rec.tutor) {
              return {
                _id: rec.tutorPost._id || rec.tutorPost.id || rec.tutorId,
                id: rec.tutorPost.id || rec.tutorPost._id || rec.tutorId,
                title: rec.tutorPost.title || 'Bài đăng gia sư',
                description: rec.tutorPost.description || '',
                subjects: rec.tutorPost.subjects || [],
                pricePerSession: rec.tutorPost.pricePerSession || 0,
                sessionDuration: rec.tutorPost.sessionDuration || 60,
                teachingMode: rec.tutorPost.teachingMode || 'ONLINE',
                studentLevel: rec.tutorPost.studentLevel || [],
                tutorId: {
                  _id: rec.tutorId || rec.tutor._id,
                  full_name: rec.tutor.name || rec.tutor.full_name || 'Gia sư',
                  email: rec.tutor.email || '',
                  avatar_url: rec.tutor.avatar || rec.tutor.avatar_url || '',
                  rating: rec.tutor.rating || { average: 0, count: 0 },
                  profile: {
                    headline: rec.tutor.headline || '',
                    introduction: rec.tutor.introduction || '',
                  },
                },
                viewCount: 0,
                contactCount: 0,
                createdAt: new Date().toISOString(),
                compatibility: rec.matchScore || 0,
                matchDetails: rec.matchDetails ? {
                  subjectMatch: rec.matchDetails.subjectMatch ? 100 : 0,
                  locationMatch: 0,
                  priceMatch: rec.matchDetails.priceMatch ? 100 : 0,
                  scheduleMatch: rec.matchDetails.scheduleMatch ? 100 : 0,
                  overallScore: rec.matchScore || 0,
                } : undefined,
              } as TutorPost;
            }
            
            // Fallback - return as is
            return rec as TutorPost;
          }).filter(Boolean);
          
          setSurveyRecommendations(transformedRecommendations);
          setHasSurvey(transformedRecommendations.length > 0 || !!responseData.survey);
          saveToCache(CACHE_KEYS.SURVEY_RECOMMENDATIONS, transformedRecommendations);
        }
      } catch {
        if (isMounted) setHasSurvey(false);
      }

      // 2. Fetch all tutors
      try {
        // Check cache first
        const cachedAllTutors = loadFromCache(CACHE_KEYS.ALL_TUTORS);
        if (cachedAllTutors && cachedAllTutors.length > 0) {
          if (isMounted) {
            setAllTutors(cachedAllTutors);
          }
        }

        const tutorsResponse = await TutorPostService.searchTutorPosts({
          page: 1,
          limit: 50,
          sortBy: "createdAt",
          sortOrder: "desc",
        });
        if (isMounted && tutorsResponse.success && tutorsResponse.data) {
          setAllTutors(tutorsResponse.data.posts || []);
          saveToCache(CACHE_KEYS.ALL_TUTORS, tutorsResponse.data.posts || []);
          setAllTutorsPagination({
            currentPage: 1,
            totalPages: tutorsResponse.data.pagination?.totalPages || 1,
            totalItems: tutorsResponse.data.pagination?.totalItems || 0,
            hasNext: tutorsResponse.data.pagination?.hasNext || false,
          });
        }
      } catch {
        if (isMounted) toast.error("Không thể tải danh sách gia sư");
      }

      // 3. Fetch my posts
      try {
        await fetchMyPosts();
        if (isMounted) setMyPostsLoaded(true);
      } catch {
        if (isMounted) toast.error("Không thể tải danh sách bài đăng của bạn");
      }

      if (isMounted) {
        setSurveyLoading(false);
        setIsInitialLoading(false);
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [fetchMyPosts, loadFromCache, saveToCache]);

  // Clear cache when navigating away (except to tutor detail)
  useEffect(() => {
    return () => {
      // Only clear cache if not going to tutor detail page
      const isTutorDetailNavigation = window.location.pathname.includes('/tutors/');
      if (!isTutorDetailNavigation) {
        clearCache();
      }
    };
  }, [clearCache]);

  // Handle URL post mode on mount
  useEffect(() => {
    if (!myPostsLoaded) return;

    const mode = searchParams.get("mode");
    const postId = searchParams.get("postId");

    if (mode === "post" && postId && validateUUID(postId)) {
      const postExists = myStudentPosts.some((p: any) => p.id === postId);
      if (postExists) {
        setSearchMode("post");
        setSelectedPostId(postId);
        debouncedSmartSearch(postId, currentFilters);
      }
    }
  }, [myPostsLoaded, myStudentPosts, searchParams, currentFilters, debouncedSmartSearch]);

  // ==================== COMPUTED RESULTS ====================
  // Use paginated results for survey mode
  const displayResults = searchMode === "survey" 
    ? surveyPaginatedResults.items 
    : (smartSearchResults || []);
  const displayLoading = searchMode === "survey" ? surveyLoading : smartSearchLoading;

  const getTotalText = () => {
    if (searchMode === "survey") {
      const { pagination } = surveyPaginatedResults;
      return `${pagination.totalItems} gia sư`;
    }
    return `${smartSearchPagination?.totalItems || displayResults?.length || 0} gia sư phù hợp`;
  };

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        
        {/* ==================== HEADER - Compact & Modern ==================== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100/50 p-5 mb-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tìm gia sư phù hợp</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {searchMode === "survey"
                    ? "Gia sư được đề xuất dựa trên khảo sát của bạn"
                    : "Tìm gia sư theo yêu cầu từ bài đăng"}
                </p>
              </div>
            </div>

            {/* Mode Switcher - Modern Pills */}
            <div className="flex items-center">
              <div className="bg-gray-100 rounded-full p-1 flex gap-1">
                <button
                  onClick={handleSwitchToSurveyMode}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    searchMode === "survey"
                      ? "bg-white text-blue-600 shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  📊 Theo khảo sát
                </button>
                <button
                  onClick={handleSwitchToPostMode}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    searchMode === "post"
                      ? "bg-white text-purple-600 shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  📝 Theo bài đăng
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ==================== POST SELECTOR (Post mode only) ==================== */}
        <AnimatePresence>
          {searchMode === "post" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-4 mb-5 overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-lg">📝</span>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Chọn bài đăng tìm gia sư
                  </label>
                  <select
                    value={selectedPostId || ""}
                    onChange={e => handlePostSelect(e.target.value || null)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all"
                    disabled={smartSearchLoading || !myPostsLoaded}
                  >
                    <option value="">
                      {myPostsLoaded ? "-- Chọn bài đăng --" : "Đang tải..."}
                    </option>
                    {myStudentPosts
                      .filter((p: any) => p.status === "approved")
                      .map((post: any) => (
                        <option key={post.id} value={post.id}>
                          {post.title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==================== FILTERS (Only in POST mode) ==================== */}
        {searchMode === "post" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 relative z-50"
          >
            <TutorPostFilter
              filters={currentFilters}
              onFiltersChange={handleFiltersChange}
              onSearch={handleSearch}
              onReset={handleReset}
              isLoading={displayLoading}
              disabled={false}
              isSmartSearchMode={searchMode === "post" && !!selectedPostId}
              resultCount={smartSearchPagination?.totalItems}
            />
          </motion.div>
        )}

        {/* ==================== RESULTS ==================== */}
        <AnimatePresence mode="wait">
          {/* Loading State */}
          {(isInitialLoading || displayLoading) && (displayResults?.length || 0) === 0 && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100/50 p-12"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="relative mb-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-100"></div>
                  <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-500 border-t-transparent absolute top-0"></div>
                </div>
                <span className="text-gray-600 font-medium">
                  {searchMode === "survey"
                    ? "Đang tải gia sư đề xuất..."
                    : "Đang tìm kiếm..."}
                </span>
              </div>
            </motion.div>
          )}

          {/* Survey Mode - No Survey Done */}
          {!isInitialLoading && searchMode === "survey" && !hasSurvey && (allTutors?.length || 0) === 0 && (
            <motion.div
              key="no-survey"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bạn chưa làm khảo sát</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Làm khảo sát để nhận đề xuất gia sư phù hợp nhất
              </p>
              <button
                onClick={() => navigate("/student/ai-survey")}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-md"
              >
                Làm khảo sát
              </button>
            </motion.div>
          )}

          {/* Post Mode - No Post Selected: Show latest tutors */}
          {!isInitialLoading && searchMode === "post" && !selectedPostId && (
            <motion.div
              key="no-post"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Info Banner */}
              <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-2xl shadow-sm border border-purple-200 p-6 mb-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-purple-900">Chọn bài đăng để tìm gia sư phù hợp</h3>
                    <p className="text-sm text-purple-700">
                      Hệ thống sẽ phân tích bài đăng và gợi ý gia sư phù hợp nhất với yêu cầu của bạn
                    </p>
                  </div>
                </div>
                {(myStudentPosts?.filter((p: any) => p.status === "approved")?.length || 0) === 0 && (
                  <button
                    onClick={() => navigate("/student/posts/create")}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-md"
                  >
                    Tạo bài đăng ngay
                  </button>
                )}
              </div>

              {/* Show Latest Tutors as Preview */}
              {allTutorsLoading ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100/50 p-12">
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative mb-6">
                      <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-100"></div>
                      <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-500 border-t-transparent absolute top-0"></div>
                    </div>
                    <span className="text-gray-600 font-medium">Đang tải danh sách gia sư...</span>
                  </div>
                </div>
              ) : allTutors && allTutors.length > 0 ? (() => {
                const totalItems = allTutors.length;
                const totalPages = Math.ceil(totalItems / ALL_TUTORS_PER_PAGE);
                const startIndex = (allTutorsCurrentPage - 1) * ALL_TUTORS_PER_PAGE;
                const endIndex = startIndex + ALL_TUTORS_PER_PAGE;
                const paginatedTutors = allTutors.slice(startIndex, endIndex);
                
                return (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        Gia sư mới đăng ký gần đây
                      </h3>
                      <span className="text-sm text-gray-500">
                        {allTutors.length} gia sư
                      </span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {paginatedTutors.map((tutor: TutorPost) => (
                        <TutorPostCard
                          key={tutor.id || tutor._id}
                          post={tutor}
                          showCompatibility={false}
                          onClick={() => handleTutorClick(tutor.id || tutor._id)}
                          onSendRequest={canSendRequest ? handleSendRequest : undefined}
                        />
                      ))}
                    </div>
                    
                    {/* Pagination Controls for All Tutors */}
                    {totalPages > 1 && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="flex flex-col items-center gap-3 pt-6 mt-6 border-t border-gray-100"
                      >
                        <div className="flex items-center gap-1.5 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
                          {/* Previous Button */}
                          <button
                            onClick={() => handleAllTutorsPageChange(allTutorsCurrentPage - 1)}
                            disabled={allTutorsCurrentPage <= 1}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          >
                            ← Trước
                          </button>

                          {/* Page Numbers */}
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(page => {
                                const current = allTutorsCurrentPage;
                                return page === 1 || 
                                       page === totalPages || 
                                       (page >= current - 1 && page <= current + 1);
                              })
                              .map((page, index, array) => {
                                const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                                return (
                                  <React.Fragment key={page}>
                                    {showEllipsisBefore && (
                                      <span className="px-1.5 text-gray-400 text-sm">...</span>
                                    )}
                                    <button
                                      onClick={() => handleAllTutorsPageChange(page)}
                                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                        page === allTutorsCurrentPage
                                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm"
                                          : "text-gray-600 hover:bg-gray-100"
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  </React.Fragment>
                                );
                              })}
                          </div>

                          {/* Next Button */}
                          <button
                            onClick={() => handleAllTutorsPageChange(allTutorsCurrentPage + 1)}
                            disabled={allTutorsCurrentPage >= totalPages}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          >
                            Sau →
                          </button>
                        </div>

                        {/* Pagination Info */}
                        <span className="text-xs text-gray-500">
                          Trang {allTutorsCurrentPage} / {totalPages}
                          {" • "}
                          {totalItems} gia sư
                        </span>
                      </motion.div>
                    )}
                  </div>
                );
              })() : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Không tìm thấy gia sư
                  </h3>
                  <p className="text-gray-500 mb-5 text-sm max-w-sm mx-auto">
                    Thử điều chỉnh bộ lọc để tìm thấy nhiều gia sư hơn
                  </p>
                  <button
                    onClick={handleReset}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-medium transition-all"
                  >
                    Đặt lại bộ lọc
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Error State */}
          {!isInitialLoading && smartSearchError && searchMode === "post" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-red-100 p-10 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                <span className="text-3xl">❌</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Đã xảy ra lỗi</h3>
              <p className="text-gray-500 mb-5 text-sm">{smartSearchError}</p>
              <button
                onClick={() => {
                  setSmartSearchError(null);
                  if (selectedPostId) {
                    debouncedSmartSearch(selectedPostId, currentFilters);
                  }
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-medium transition-all"
              >
                Thử lại
              </button>
            </motion.div>
          )}

          {/* Results */}
          {!isInitialLoading && !displayLoading && (displayResults?.length || 0) > 0 && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Results Grid - 2 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
                {displayResults.map((post: any, index: number) => {
                  // Check if this is a survey recommendation
                  const isSurveyRecommendation = searchMode === "survey" && 
                    (post.compatibility !== undefined || post.matchScore !== undefined);
                  
                  return (
                    <motion.div
                      key={post.id || post._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.3) }}
                      className="h-full"
                    >
                      <TutorPostCard
                        post={post}
                        showCompatibility={isSurveyRecommendation}
                        onClick={() => handleTutorClick(post.id || post._id)}
                        onSendRequest={canSendRequest ? handleSendRequest : undefined}
                      />
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination (Post mode) */}
              {searchMode === "post" && smartSearchPagination && smartSearchPagination.totalPages > 1 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex flex-col items-center gap-3 pt-4"
                >
                  {/* Pagination Controls */}
                  <div className="flex items-center gap-1.5 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePostPageChange((smartSearchPagination.currentPage || 1) - 1)}
                      disabled={!smartSearchPagination.currentPage || smartSearchPagination.currentPage <= 1 || smartSearchLoading}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      ← Trước
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: smartSearchPagination.totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          const current = smartSearchPagination.currentPage || 1;
                          const total = smartSearchPagination.totalPages;
                          return page === 1 || 
                                 page === total || 
                                 (page >= current - 1 && page <= current + 1);
                        })
                        .map((page, index, array) => {
                          const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                          return (
                            <React.Fragment key={page}>
                              {showEllipsisBefore && (
                                <span className="px-1.5 text-gray-400 text-sm">...</span>
                              )}
                              <button
                                onClick={() => handlePostPageChange(page)}
                                disabled={smartSearchLoading}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                  page === (smartSearchPagination.currentPage || 1)
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePostPageChange((smartSearchPagination.currentPage || 1) + 1)}
                      disabled={!smartSearchPagination.hasNext || smartSearchLoading}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      Sau →
                    </button>
                  </div>

                  {/* Pagination Info */}
                  <span className="text-xs text-gray-500">
                    Trang {smartSearchPagination.currentPage || 1} / {smartSearchPagination.totalPages}
                    {" • "}
                    {smartSearchPagination.totalItems} gia sư phù hợp
                  </span>
                </motion.div>
              )}

              {/* Pagination (Survey mode) */}
              {searchMode === "survey" && surveyPaginatedResults.pagination.totalPages > 1 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex flex-col items-center gap-3 pt-4"
                >
                  {/* Pagination Controls */}
                  <div className="flex items-center gap-1.5 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
                    {/* Previous Button */}
                    <button
                      onClick={() => handleSurveyPageChange(surveyCurrentPage - 1)}
                      disabled={!surveyPaginatedResults.pagination.hasPrev}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      ← Trước
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: surveyPaginatedResults.pagination.totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          const current = surveyCurrentPage;
                          const total = surveyPaginatedResults.pagination.totalPages;
                          return page === 1 || 
                                 page === total || 
                                 (page >= current - 1 && page <= current + 1);
                        })
                        .map((page, index, array) => {
                          const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                          return (
                            <React.Fragment key={page}>
                              {showEllipsisBefore && (
                                <span className="px-1.5 text-gray-400 text-sm">...</span>
                              )}
                              <button
                                onClick={() => handleSurveyPageChange(page)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                  page === surveyCurrentPage
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handleSurveyPageChange(surveyCurrentPage + 1)}
                      disabled={!surveyPaginatedResults.pagination.hasNext}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      Sau →
                    </button>
                  </div>

                  {/* Pagination Info */}
                  <span className="text-xs text-gray-500">
                    Trang {surveyPaginatedResults.pagination.currentPage} / {surveyPaginatedResults.pagination.totalPages}
                    {" • "}
                    {surveyPaginatedResults.pagination.totalItems} gia sư
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Empty State */}
          {!isInitialLoading &&
            !displayLoading &&
            displayResults.length === 0 &&
            ((searchMode === "survey" && surveyPaginatedResults.pagination.totalItems === 0) ||
              (searchMode === "post" && selectedPostId)) && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Không tìm thấy gia sư{hasActiveFilters() && " phù hợp"}
                </h3>
                <p className="text-gray-500 mb-5 text-sm max-w-sm mx-auto">
                  {hasActiveFilters()
                    ? "Thử bỏ bớt điều kiện lọc để tìm thấy nhiều gia sư hơn"
                    : "Không có gia sư nào phù hợp với yêu cầu"}
                </p>
                {hasActiveFilters() && (
                  <button
                    onClick={handleReset}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-medium transition-all"
                  >
                    Đặt lại bộ lọc
                  </button>
                )}
              </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Contact Request Modal */}
      <AnimatePresence>
        {showContactModal && selectedTutorPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <ContactRequestForm
                tutorPost={selectedTutorPost}
                onSuccess={handleContactSuccess}
                onCancel={() => setShowContactModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentSmartSearchPage;
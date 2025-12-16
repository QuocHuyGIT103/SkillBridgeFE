import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import TutorPostCard from "../../components/tutorPost/TutorPostCard";
import TutorPostFilter from "../../components/tutorPost/TutorPostFilter";
import ContactRequestForm from "../../components/student/ContactRequestForm";
import toast from "react-hot-toast";
import TutorPostService from "../../services/tutorPost.service";
import type {
  TutorPost,
  TutorPostSearchQuery,
} from "../../services/tutorPost.service";
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
  sortBy?: "createdAt" | "pricePerSession" | "viewCount";
  sortOrder?: "desc" | "asc";
}

// ==================== CACHE KEYS ====================
const CACHE_KEYS = {
  ALL_TUTORS: "smart_search_all_tutors",
  FILTERS: "smart_search_filters",
  SCROLL_POSITION: "smart_search_scroll_position",
  ALL_TUTORS_PAGE: "smart_search_all_tutors_page",
  CACHE_TIMESTAMP: "smart_search_cache_timestamp",
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ==================== COMPONENT ====================
const StudentSmartSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Auth store for checking if user can send request
  const { user, isAuthenticated } = useAuthStore();

  // ==================== STATES ====================
  // Tutor list states
  const [allTutors, setAllTutors] = useState<TutorPost[]>([]);
  const [allTutorsLoading, setAllTutorsLoading] = useState(false);

  // Common states
  const [currentFilters, setCurrentFilters] = useState<SmartSearchQuery>(
    () => ({
      subjects: searchParams.getAll("subjects").filter(Boolean),
      teachingMode: (searchParams.get("teachingMode") as any) || undefined,
      studentLevel: searchParams.getAll("studentLevel").filter(Boolean),
      priceMin: searchParams.get("priceMin")
        ? Number(searchParams.get("priceMin"))
        : undefined,
      priceMax: searchParams.get("priceMax")
        ? Number(searchParams.get("priceMax"))
        : undefined,
      province: searchParams.get("province") || undefined,
      district: searchParams.get("district") || undefined,
      ward: searchParams.get("ward") || undefined,
      search: searchParams.get("search") || undefined,
      page: 1,
      limit: 4,
      sortBy: "createdAt",
      sortOrder: "desc",
    })
  );

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Pagination
  const ALL_TUTORS_PER_PAGE = 4;
  const [allTutorsCurrentPage, setAllTutorsCurrentPage] = useState(1);

  const [_allTutorsPagination, setAllTutorsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
  });

  // Contact Request Modal states
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedTutorPost, setSelectedTutorPost] = useState<TutorPost | null>(
    null
  );

  // Check if user can send contact request
  const canSendRequest = Boolean(isAuthenticated && user?.role === "STUDENT");

  // ==================== CACHE HELPERS ====================
  const saveToCache = useCallback((key: string, data: any) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
      sessionStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error("Cache save error:", error);
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
      console.error("Cache load error:", error);
      return null;
    }
  }, []);

  const clearCache = useCallback(() => {
    Object.values(CACHE_KEYS).forEach((key) => {
      sessionStorage.removeItem(key);
    });
  }, []);

  // Handle send request click
  const handleSendRequest = useCallback(
    (post: any) => {
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
        studentLevel: post.studentLevel || [],
        pricePerSession: post.pricePerSession,
        sessionDuration: post.sessionDuration,
        teachingMode: post.teachingMode,
        teachingSchedule: post.teachingSchedule || [],
        tutorId: post.tutorId,
        viewCount: post.viewCount,
        contactCount: post.contactCount || 0,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt || post.createdAt,
        status: "ACTIVE" as const,
      };

      setSelectedTutorPost(tutorPost);
      setShowContactModal(true);
    },
    [canSendRequest]
  );

  // Handle contact request success
  const handleContactSuccess = useCallback(() => {
    setShowContactModal(false);
    setSelectedTutorPost(null);
    toast.success("Gửi yêu cầu học tập thành công!");
  }, []);

  // ==================== COMPUTED ====================

  // ==================== URL UPDATE ====================
  const updateURL = useCallback(
    (filters: SmartSearchQuery) => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          !["page", "limit", "sortBy", "sortOrder"].includes(key)
        ) {
          if (Array.isArray(value) && value.length > 0) {
            value.forEach((v) => params.append(key, v.toString()));
          } else if (!Array.isArray(value)) {
            params.set(key, value.toString());
          }
        }
      });

      setSearchParams(params);
    },
    [setSearchParams]
  );

  // ==================== FETCH ALL TUTORS WITH FILTERS ====================
  const fetchAllTutorsWithFilters = useCallback(
    async (filters: SmartSearchQuery = {}) => {
      setAllTutorsLoading(true);
      try {
        // Map sortBy field - "compatibility" only works with smart search
        // For regular search, use valid fields like "createdAt", "pricePerSession", "viewCount", etc.
        let sortBy: "createdAt" | "pricePerSession" | "viewCount" = "createdAt";
        const requestedSort = filters.sortBy;
        if (
          requestedSort === "pricePerSession" ||
          requestedSort === "viewCount"
        ) {
          sortBy = requestedSort;
        }

        const searchQuery = {
          page: filters.page || 1,
          limit: 50,
          sortBy: sortBy,
          sortOrder: filters.sortOrder || "desc",
          ...(filters.subjects?.length && { subjects: filters.subjects }),
          ...(filters.teachingMode && { teachingMode: filters.teachingMode }),
          ...(filters.studentLevel?.length && {
            studentLevel: filters.studentLevel,
          }),
          ...(filters.priceMin !== undefined && { priceMin: filters.priceMin }),
          ...(filters.priceMax !== undefined && { priceMax: filters.priceMax }),
          ...(filters.province && { province: filters.province }),
          ...(filters.district && { district: filters.district }),
          ...(filters.ward && { ward: filters.ward }),
          ...(filters.search?.trim() && { search: filters.search.trim() }),
        };

        const tutorsResponse = await TutorPostService.searchTutorPosts(
          searchQuery
        );
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

  // ==================== HANDLERS ====================
  const handleFiltersChange = useCallback(
    (newFilters: TutorPostSearchQuery) => {
      const updatedFilters = { ...newFilters, page: 1 } as SmartSearchQuery;
      setCurrentFilters(updatedFilters);
      setAllTutorsCurrentPage(1); // Reset page when filters change
      updateURL(updatedFilters);
      fetchAllTutorsWithFilters(updatedFilters);
    },
    [updateURL, fetchAllTutorsWithFilters]
  );

  const handleSearch = useCallback(() => {
    setAllTutorsCurrentPage(1); // Reset page on search
    fetchAllTutorsWithFilters(currentFilters);
  }, [currentFilters, fetchAllTutorsWithFilters]);

  const handleReset = useCallback(() => {
    const resetFilters: SmartSearchQuery = {
      page: 1,
      limit: 4,
      sortBy: "createdAt",
      sortOrder: "desc",
    };

    setCurrentFilters(resetFilters);
    setAllTutorsCurrentPage(1); // Reset page on reset
    updateURL(resetFilters);
    fetchAllTutorsWithFilters(resetFilters);
    toast.success("Đã đặt lại bộ lọc");
  }, [updateURL, fetchAllTutorsWithFilters]);

  // Pagination handler for all tutors
  const handleAllTutorsPageChange = useCallback((page: number) => {
    setAllTutorsCurrentPage(page);
  }, []);

  const handleTutorClick = useCallback(
    (tutorId: string) => {
      // Save current state to cache before navigating
      saveToCache(CACHE_KEYS.SCROLL_POSITION, window.scrollY);
      saveToCache(CACHE_KEYS.FILTERS, currentFilters);
      saveToCache(CACHE_KEYS.ALL_TUTORS_PAGE, allTutorsCurrentPage);
      saveToCache(CACHE_KEYS.ALL_TUTORS, allTutors);

      navigate(`/tutors/${tutorId}`);
    },
    [navigate, currentFilters, allTutorsCurrentPage, allTutors, saveToCache]
  );

  // ==================== EFFECTS ====================
  // Restore from cache on mount
  useEffect(() => {
    const cachedFilters = loadFromCache(CACHE_KEYS.FILTERS);
    const cachedAllTutorsPage = loadFromCache(CACHE_KEYS.ALL_TUTORS_PAGE);

    if (cachedFilters) setCurrentFilters(cachedFilters);
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

      // Fetch all tutors
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

      // 3. Finish loading
      if (isMounted) {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [loadFromCache, saveToCache]);

  // Clear cache when navigating away (except to tutor detail)
  useEffect(() => {
    return () => {
      // Only clear cache if not going to tutor detail page
      const isTutorDetailNavigation =
        window.location.pathname.includes("/tutors/");
      if (!isTutorDetailNavigation) {
        clearCache();
      }
    };
  }, [clearCache]);

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        {/* ==================== HEADER ==================== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-5 px-6 py-4"
        >
          <h1 className="text-xl font-bold text-gray-900 text-center">
            Tìm gia sư phù hợp
          </h1>
        </motion.div>

        {/* ==================== FILTERS ==================== */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 relative z-40"
        >
          <TutorPostFilter
            filters={currentFilters}
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
            onReset={handleReset}
            isLoading={allTutorsLoading}
            disabled={false}
            isSmartSearchMode={false}
            resultCount={allTutors?.length}
          />
        </motion.div>

        {/* ==================== RESULTS ==================== */}
        <AnimatePresence mode="wait">
          {/* Loading State */}
          {(isInitialLoading || allTutorsLoading) &&
            (allTutors?.length || 0) === 0 && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="relative mb-6">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-100"></div>
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
                  </div>
                  <span className="text-gray-700 font-semibold text-lg">
                    Đang tải danh sách gia sư...
                  </span>
                </div>
              </motion.div>
            )}

          {/* Tutor List */}
          {!isInitialLoading && (
            <motion.div
              key="tutor-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {allTutorsLoading ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative mb-6">
                      <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-100"></div>
                      <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-500 border-t-transparent absolute top-0"></div>
                    </div>
                    <span className="text-gray-600 font-medium">
                      Đang tải danh sách gia sư...
                    </span>
                  </div>
                </div>
              ) : allTutors && allTutors.length > 0 ? (
                (() => {
                  const totalItems = allTutors.length;
                  const totalPages = Math.ceil(
                    totalItems / ALL_TUTORS_PER_PAGE
                  );
                  const startIndex =
                    (allTutorsCurrentPage - 1) * ALL_TUTORS_PER_PAGE;
                  const endIndex = startIndex + ALL_TUTORS_PER_PAGE;
                  const paginatedTutors = allTutors.slice(startIndex, endIndex);

                  return (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                          Danh sách gia sư
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
                            onClick={() =>
                              handleTutorClick(tutor.id || tutor._id || "")
                            }
                            onSendRequest={
                              canSendRequest ? handleSendRequest : undefined
                            }
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
                              onClick={() =>
                                handleAllTutorsPageChange(
                                  allTutorsCurrentPage - 1
                                )
                              }
                              disabled={allTutorsCurrentPage <= 1}
                              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            >
                              ← Trước
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                              {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                              )
                                .filter((page) => {
                                  const current = allTutorsCurrentPage;
                                  return (
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= current - 1 && page <= current + 1)
                                  );
                                })
                                .map((page, index, array) => {
                                  const showEllipsisBefore =
                                    index > 0 && page - array[index - 1] > 1;
                                  return (
                                    <React.Fragment key={page}>
                                      {showEllipsisBefore && (
                                        <span className="px-1.5 text-gray-400 text-sm">
                                          ...
                                        </span>
                                      )}
                                      <button
                                        onClick={() =>
                                          handleAllTutorsPageChange(page)
                                        }
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
                              onClick={() =>
                                handleAllTutorsPageChange(
                                  allTutorsCurrentPage + 1
                                )
                              }
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
                })()
              ) : (
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
        </AnimatePresence>
      </div>

      {/* Contact Request Modal */}
      <AnimatePresence>
        {showContactModal && selectedTutorPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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

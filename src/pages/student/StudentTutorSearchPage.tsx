import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
// [THÊM] Import icon cho nút "Quay lại"
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useTutorPostStore } from "../../store/tutorPost.store";
import usePostStore from "../../store/post.store";
import TutorPostCard from "../../components/tutorPost/TutorPostCard";
import TutorPostFilter from "../../components/tutorPost/TutorPostFilter";
import { debounce } from "../../utils/tutorUtils";
import toast from "react-hot-toast";

export interface TutorPostSearchQuery {
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
  sortBy?: "createdAt" | "pricePerSession" | "viewCount" | "compatibility" | "rating";
  sortOrder?: "asc" | "desc";
  featured?: boolean;
  minRating?: number;
  minReviews?: number;
}

const StudentTutorSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ Store hooks
  const {
    posts,
    pagination,
    searchLoading,
    searchTutorPosts,
    loadMorePosts,
    clearPosts,
    error: tutorPostError,
    clearError,
  } = useTutorPostStore();

  const {
    posts: myStudentPosts,
    fetchMyPosts,
    smartSearchTutors,
    smartSearchResults,
    smartSearchPagination,
    smartSearchLoading,
    error: postStoreError,
  } = usePostStore();

  // ✅ Local state
  const [currentFilters, setCurrentFilters] = useState<TutorPostSearchQuery>(() => {
    // Initialize from URL params
    const urlFilters: TutorPostSearchQuery = {
      subjects: searchParams.getAll("subjects").filter(Boolean),
      teachingMode: (searchParams.get("teachingMode") as any) || undefined,
      studentLevel: searchParams.getAll("studentLevel").filter(Boolean),
      priceMin: searchParams.get("priceMin") ? Number(searchParams.get("priceMin")) : undefined,
      priceMax: searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : undefined,
      province: searchParams.get("province") || undefined,
      district: searchParams.get("district") || undefined,
      ward: searchParams.get("ward") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: 12,
      sortBy: (searchParams.get("sortBy") as any) || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as any) || "desc",
      featured: searchParams.get("featured") === "true",
      minRating: searchParams.get("minRating")
        ? Number(searchParams.get("minRating"))
        : undefined,
      minReviews: searchParams.get("minReviews")
        ? Number(searchParams.get("minReviews"))
        : undefined,
    };

    return urlFilters;
  });

  const [selectedPostId, setSelectedPostId] = useState<string | null>(searchParams.get("smartPost") || null);
  const [isSmartSearchMode, setIsSmartSearchMode] = useState(!!searchParams.get("smartPost"));
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  // ... (Các hàm xử lý logic khác không thay đổi)
  // ✅ Update URL when filters change
  const updateURL = useCallback(
    (filters: TutorPostSearchQuery, smartPostId?: string | null) => {
      const params = new URLSearchParams();

      // Add filter params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value) && value.length > 0) {
            value.forEach((v) => params.append(key, v.toString()));
          } else if (!Array.isArray(value)) {
            params.set(key, value.toString());
          }
        }
      });

      // Add smart search param
      if (smartPostId) {
        params.set("smartPost", smartPostId);
      }

      setSearchParams(params);
    },
    [setSearchParams]
  );

  // ✅ Debounced smart search function
  const debouncedSmartSearch = useCallback(
    debounce(async (postId: string, query: TutorPostSearchQuery = {}) => {
      try {
        clearError();
        console.log("🚀 Smart Search:", { postId, query });

        const smartQuery = {
          page: query.page || 1,
          limit: query.limit || 12,
          sortBy: "compatibility" as const,
          sortOrder: "desc" as const,
          // Include other filters for smart search
          subjects: query.subjects,
          teachingMode: query.teachingMode,
          studentLevel: query.studentLevel,
          priceMin: query.priceMin,
          priceMax: query.priceMax,
          province: query.province,
          district: query.district,
          ward: query.ward,
          search: query.search,
          minRating: query.minRating,
          minReviews: query.minReviews,
        };

        await smartSearchTutors(postId, smartQuery);
        setHasSearched(true);
        toast.success("Tìm kiếm gia sư thông minh thành công!");
      } catch (error: any) {
        console.error("Smart search error:", error);
        toast.error("Lỗi khi tìm kiếm gia sư thông minh");
      }
    }, 500),
    [smartSearchTutors, clearError]
  );

  // ✅ Debounced regular search function
  const debouncedSearch = useCallback(
    debounce(async (filters: TutorPostSearchQuery) => {
      try {
        clearError();
        console.log("🔍 Regular Search:", filters);
        await searchTutorPosts(filters);
        setHasSearched(true);
      } catch (error: any) {
        console.error("Search error:", error);
        toast.error("Lỗi khi tìm kiếm gia sư");
      }
    }, 500),
    [searchTutorPosts, clearError]
  );

  // ✅ Handle filters change
  const handleFiltersChange = useCallback(
    (newFilters: TutorPostSearchQuery) => {
      const updatedFilters = { ...newFilters, page: 1 };
      setCurrentFilters(updatedFilters);

      if (isSmartSearchMode && selectedPostId) {
        updateURL(updatedFilters, selectedPostId);
        debouncedSmartSearch(selectedPostId, updatedFilters);
      } else {
        updateURL(updatedFilters);
        debouncedSearch(updatedFilters);
      }
    },
    [isSmartSearchMode, selectedPostId, updateURL, debouncedSmartSearch, debouncedSearch]
  );

  // ✅ Handle search button click
  const handleSearch = useCallback(() => {
    if (isSmartSearchMode && selectedPostId) {
      debouncedSmartSearch(selectedPostId, currentFilters);
    } else {
      debouncedSearch(currentFilters);
    }
  }, [isSmartSearchMode, selectedPostId, currentFilters, debouncedSmartSearch, debouncedSearch]);

  // ✅ Handle reset filters
  const handleReset = useCallback(() => {
    const resetFilters: TutorPostSearchQuery = {
      page: 1,
      limit: 12,
      sortBy: "createdAt",
      sortOrder: "desc",
      minRating: undefined,
      minReviews: undefined,
    };

    setCurrentFilters(resetFilters);
    clearPosts();

    if (isSmartSearchMode && selectedPostId) {
      updateURL(resetFilters, selectedPostId);
      debouncedSmartSearch(selectedPostId, resetFilters);
    } else {
      updateURL(resetFilters);
      debouncedSearch(resetFilters);
    }
  }, [isSmartSearchMode, selectedPostId, clearPosts, updateURL, debouncedSmartSearch, debouncedSearch]);

  // ✅ Handle smart search mode toggle
  const handleSmartSearchToggle = useCallback(
    (postId: string | null) => {
      setSelectedPostId(postId);
      const newIsSmartMode = !!postId;
      setIsSmartSearchMode(newIsSmartMode);

      if (postId) {
        // Switch to smart search
        const smartFilters = {
          ...currentFilters,
          page: 1,
          sortBy: "compatibility" as const,
          sortOrder: "desc" as const,
        };
        setCurrentFilters(smartFilters);
        updateURL(smartFilters, postId);
        clearPosts();
        debouncedSmartSearch(postId, smartFilters);
        toast.success("Đã chuyển sang chế độ tìm kiếm thông minh");
      } else {
        // Switch to regular search
        const regularFilters = {
          ...currentFilters,
          page: 1,
          sortBy: "createdAt" as const,
          sortOrder: "desc" as const,
        };
        setCurrentFilters(regularFilters);
        updateURL(regularFilters);
        clearPosts();
        debouncedSearch(regularFilters);
        toast.success("Đã chuyển về tìm kiếm thông thường");
      }
    },
    [currentFilters, updateURL, clearPosts, debouncedSmartSearch, debouncedSearch]
  );

  // ✅ Handle load more
  const handleLoadMore = useCallback(async () => {
    const currentPag = isSmartSearchMode ? smartSearchPagination : pagination;

    if (!currentPag?.hasNext) return;

    try {
      const nextPage = (currentFilters.page || 1) + 1;
      const nextFilters = { ...currentFilters, page: nextPage };
      setCurrentFilters(nextFilters);

      if (isSmartSearchMode && selectedPostId) {
        await smartSearchTutors(selectedPostId, {
          ...nextFilters,
          sortBy: "compatibility",
          sortOrder: "desc",
        });
      } else {
        await loadMorePosts(nextFilters);
      }
    } catch (error: any) {
      console.error("Load more error:", error);
      toast.error("Không thể tải thêm gia sư");
    }
  }, [currentFilters, isSmartSearchMode, selectedPostId, pagination, smartSearchPagination, smartSearchTutors, loadMorePosts]);

  // ✅ Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsInitialLoading(true);

        // Load my posts for smart search
        await fetchMyPosts();

        // Perform search based on URL params
        if (selectedPostId && isSmartSearchMode) {
          await debouncedSmartSearch(selectedPostId, currentFilters);
        } else {
          await debouncedSearch(currentFilters);
        }
      } catch (error: any) {
        console.error("Initial load error:", error);
        toast.error("Không thể tải dữ liệu ban đầu");
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
  }, []); // Only run once on mount

  // ✅ Handle tutor card click
  const handleTutorClick = useCallback(
    (tutorId: string) => {
      navigate(`/tutors/${tutorId}`);
    },
    [navigate]
  );

  const currentPosts = isSmartSearchMode ? smartSearchResults : posts;
  const currentPagination = isSmartSearchMode ? smartSearchPagination : pagination;
  const currentLoading = isSmartSearchMode ? smartSearchLoading : searchLoading;
  const currentError = tutorPostError || postStoreError;

  const getTotalCount = () => {
    if (!currentPagination) return undefined;
    if ("totalItems" in currentPagination && typeof currentPagination.totalItems === "number") {
      return currentPagination.totalItems;
    }
    if ("total" in currentPagination && typeof currentPagination.total === "number") {
      return currentPagination.total;
    }
    return undefined;
  };

  const getTotalText = () => {
    const total = getTotalCount();
    if (typeof total !== "number") return "Đang tải...";
    return `Tìm thấy ${total.toLocaleString()} gia sư`;
  };

  const getCurrentPageNumber = () => {
    if (!currentPagination) return 1;
    if ("currentPage" in currentPagination && typeof currentPagination.currentPage === "number") {
      return currentPagination.currentPage;
    }
    if ("page" in currentPagination && typeof currentPagination.page === "number") {
      return currentPagination.page;
    }
    return 1;
  };

  const getTotalPagesNumber = () => {
    if (!currentPagination) return 1;
    if ("totalPages" in currentPagination && typeof currentPagination.totalPages === "number") {
      return currentPagination.totalPages;
    }
    if ("pages" in currentPagination && typeof currentPagination.pages === "number") {
      return currentPagination.pages;
    }
    return 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="content-wrapper py-6 lg:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 bg-white backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* [THÊM] Thêm nút quay lại và nhóm nó với tiêu đề */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                title="Về trang chủ"
              >
                <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
              </motion.button>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-3">
                  Tìm gia sư {isSmartSearchMode && "🤖"}
                </h1>
                <p className="text-base lg:text-lg text-gray-600 max-w-2xl">
                  {isSmartSearchMode
                    ? "AI đang phân tích và tìm kiếm gia sư phù hợp nhất với nhu cầu của bạn"
                    : "Khám phá hàng ngàn gia sư chất lượng được xác minh và đánh giá cao"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50 shadow-sm">
                <div className="text-sm font-semibold text-gray-900">{getTotalText()}</div>
              </div>

              {hasSearched && (
                <div className="flex items-center gap-3 bg-white/60 px-3 py-2 rounded-full border border-gray-200/50">
                  <div
                    className={`w-2 h-2 rounded-full ${currentLoading
                      ? "bg-gradient-to-r from-yellow-400 to-orange-400 animate-pulse shadow-yellow-200 shadow-md"
                      : "bg-gradient-to-r from-green-400 to-emerald-400 shadow-green-200 shadow-md"
                      }`}
                  ></div>
                  <span className="text-xs font-medium text-gray-600">
                    {currentLoading ? "Đang cập nhật..." : "Kết quả mới nhất"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ✅ FIXED: Main Layout Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* ✅ Left Sidebar - Fixed span */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            {/* [SỬA] Thêm max-h, overflow-y-auto và custom-scrollbar để cố định và cho phép cuộn */}
            <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
              {/* Smart Search Toggle */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50"
              >
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <h3 className="font-bold text-gray-900">AI Search</h3>
                </div>

                <select
                  value={selectedPostId || ""}
                  onChange={(e) => handleSmartSearchToggle(e.target.value || null)}
                  className="w-full p-3 border-2 border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/50 backdrop-blur-sm transition-all duration-200"
                  disabled={currentLoading}
                >
                  <option value="">🔍 Tìm kiếm thông thường</option>
                  {myStudentPosts
                    .filter((p: any) => p.status === "approved")
                    .map((post: any) => (
                      <option key={post.id} value={post.id}>
                        📝 {post.title}
                      </option>
                    ))}
                </select>

                {isSmartSearchMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200/50 rounded-xl"
                  >
                    <div className="flex items-center text-sm">
                      <span className="text-blue-600 mr-2">🎯</span>
                      <span className="text-blue-800 font-bold">AI đang hoạt động</span>
                    </div>
                    <div className="text-xs text-blue-600 mt-1 font-medium">Kết quả được xếp hạng theo độ phù hợp</div>
                  </motion.div>
                )}
              </motion.div>

              {/* Filters */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <TutorPostFilter
                  filters={currentFilters}
                  onFiltersChange={handleFiltersChange}
                  onSearch={handleSearch}
                  onReset={handleReset}
                  isLoading={currentLoading}
                  disabled={false}
                  isSmartSearchMode={isSmartSearchMode}
                  resultCount={getTotalCount()}
                />
              </motion.div>
            </div>
          </div>

          {/* ✅ Right Content - Fixed span */}
          {/* ... (Phần nội dung bên phải không thay đổi) */}
          <div className="xl:col-span-3 order-1 xl:order-2">
            <AnimatePresence mode="wait">
              {/* Initial Loading */}
              {isInitialLoading && (
                <motion.div
                  key="initial-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-12"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                    </div>
                    <span className="text-gray-700 mt-6 text-lg font-medium">Đang khởi tạo hệ thống tìm kiếm...</span>
                  </div>
                </motion.div>
              )}

              {/* Search Loading */}
              {!isInitialLoading && currentLoading && currentPosts.length === 0 && (
                <motion.div
                  key="search-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-12"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                    </div>
                    <span className="text-gray-700 mt-6 text-lg font-medium">
                      {isSmartSearchMode
                        ? "🤖 AI đang phân tích và tìm kiếm gia sư tối ưu..."
                        : "🔍 Đang tìm kiếm gia sư phù hợp..."}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Error State */}
              {!isInitialLoading && currentError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200/50 p-12 text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Đã xảy ra lỗi</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">{currentError}</p>
                  <button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105"
                  >
                    🔄 Thử lại
                  </button>
                </motion.div>
              )}

              {/* Results Grid */}
              {!isInitialLoading && !currentError && currentPosts.length > 0 && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  {/* Results Header */}
                  <div className="flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                    <div className="text-sm text-gray-600">
                      {currentLoading && currentPosts.length > 0 && (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-3"></div>
                          <span className="font-medium">Đang làm mới kết quả...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ✅ FIXED: Results Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentPosts.map((post: any, index: number) => (
                      <motion.div
                        key={post.id || post._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="h-full" // ✅ SỬ DỤNG h-full ĐỂ THẺ LẤP ĐẦY CHIỀU CAO Ô LƯỚI
                      >
                        <TutorPostCard
                          post={post}
                          showCompatibility={isSmartSearchMode}
                          onClick={() => handleTutorClick(post.id || post._id)}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Load More */}
                  {currentPagination?.hasNext && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center pt-8">
                      <button
                        onClick={handleLoadMore}
                        disabled={currentLoading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-10 py-4 rounded-xl font-bold transition-all duration-200 shadow-lg transform hover:scale-105 disabled:transform-none min-w-[200px]"
                      >
                        {currentLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                            Đang tải thêm...
                          </div>
                        ) : (
                          "📚 Xem thêm gia sư"
                        )}
                      </button>
                    </motion.div>
                  )}

                  {/* Pagination Info */}
                  {currentPagination && (
                    <div className="text-center bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                      <span className="text-sm text-gray-600 font-medium">
                        Trang {getCurrentPageNumber()} / {getTotalPagesNumber()}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Empty State */}
              {!isInitialLoading && !currentError && !currentLoading && currentPosts.length === 0 && hasSearched && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-16 text-center"
                >
                  <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                    {isSmartSearchMode ? (
                      <span className="text-6xl">🤖</span>
                    ) : (
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {isSmartSearchMode ? "🎯 AI chưa tìm thấy gia sư phù hợp" : "🔍 Không tìm thấy gia sư nào"}
                  </h3>
                  <p className="text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
                    {isSmartSearchMode
                      ? "Hãy thử chọn bài đăng khác, điều chỉnh bộ lọc hoặc chuyển về tìm kiếm thông thường để khám phá thêm nhiều lựa chọn"
                      : "Hãy thử điều chỉnh bộ lọc, thay đổi từ khóa tìm kiếm hoặc mở rộng tiêu chí để tìm được gia sư phù hợp"}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {isSmartSearchMode ? (
                      <>
                        <button
                          onClick={() => handleSmartSearchToggle(null)}
                          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105"
                        >
                          🔍 Tìm kiếm thông thường
                        </button>
                        <button
                          onClick={handleReset}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105"
                        >
                          🔄 Đặt lại bộ lọc
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleReset}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105"
                        >
                          🗑️ Xóa tất cả bộ lọc
                        </button>
                        {myStudentPosts.length > 0 && (
                          <button
                            onClick={() => {
                              const firstPost = myStudentPosts.find((p: any) => p.status === "approved");
                              if (firstPost) handleSmartSearchToggle(firstPost.id);
                            }}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105"
                          >
                            🤖 Thử AI Search
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTutorSearchPage;
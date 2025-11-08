import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useTutorPostStore } from "../store/tutorPost.store";
import TutorPostCard from "../components/tutorPost/TutorPostCard";
import TutorPostFilter from "../components/tutorPost/TutorPostFilter";
import { debounce } from "../utils/tutorUtils";
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
  sortBy?: "createdAt" | "pricePerSession" | "viewCount" | "compatibility";
  sortOrder?: "asc" | "desc";
  featured?: boolean;
}

const TutorSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    posts,
    pagination,
    searchLoading,
    searchTutorPosts,
    loadMorePosts,
    clearPosts,
    error,
    clearError,
  } = useTutorPostStore();

  const [currentFilters, setCurrentFilters] = useState<TutorPostSearchQuery>(() => {
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
    };
    return urlFilters;
  });

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  const updateURL = useCallback(
    (filters: TutorPostSearchQuery) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
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

  const handleFiltersChange = useCallback(
    (newFilters: TutorPostSearchQuery) => {
      const updatedFilters = { ...newFilters, page: 1 };
      setCurrentFilters(updatedFilters);
      updateURL(updatedFilters);
      debouncedSearch(updatedFilters);
    },
    [updateURL, debouncedSearch]
  );

  const handleSearch = useCallback(() => {
    debouncedSearch(currentFilters);
  }, [currentFilters, debouncedSearch]);

  const handleReset = useCallback(() => {
    const resetFilters: TutorPostSearchQuery = {
      page: 1,
      limit: 12,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setCurrentFilters(resetFilters);
    clearPosts();
    updateURL(resetFilters);
    debouncedSearch(resetFilters);
  }, [clearPosts, updateURL, debouncedSearch]);

  const handleLoadMore = useCallback(async () => {
    if (!pagination?.hasNext) return;
    try {
      const nextPage = (currentFilters.page || 1) + 1;
      const nextFilters = { ...currentFilters, page: nextPage };
      setCurrentFilters(nextFilters);
      await loadMorePosts(nextFilters);
    } catch (error: any) {
      console.error("Load more error:", error);
      toast.error("Không thể tải thêm gia sư");
    }
  }, [currentFilters, pagination, loadMorePosts]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsInitialLoading(true);
        await debouncedSearch(currentFilters);
      } catch (error: any) {
        console.error("Initial load error:", error);
        toast.error("Không thể tải dữ liệu ban đầu");
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleTutorClick = useCallback(
    (tutorId: string) => {
      navigate(`/tutors/${tutorId}`);
    },
    [navigate]
  );

  const getTotalText = () => {
    if (!pagination) return "Đang tải...";
    const total = pagination.totalItems || 0;
    return `Tìm thấy ${total.toLocaleString()} gia sư`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="content-wrapper py-6 lg:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200 mb-6 relative z-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                  Tìm gia sư
                </h1>
                <p className="text-base lg:text-lg text-gray-600 max-w-2xl">
                  Khám phá hàng ngàn gia sư chất lượng được xác minh và đánh giá cao
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
                    className={`w-2 h-2 rounded-full ${
                      searchLoading
                        ? "bg-gradient-to-r from-yellow-400 to-orange-400 animate-pulse shadow-yellow-200 shadow-md"
                        : "bg-gradient-to-r from-green-400 to-emerald-400 shadow-green-200 shadow-md"
                    }`}
                  ></div>
                  <span className="text-xs font-medium text-gray-600">
                    {searchLoading ? "Đang cập nhật..." : "Kết quả mới nhất"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Horizontal Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <TutorPostFilter
            filters={currentFilters}
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
            onReset={handleReset}
            isLoading={searchLoading}
            disabled={false}
            isSmartSearchMode={false}
            resultCount={pagination?.totalItems}
            className="w-full"
          />
        </motion.div>

        {/* Content Grid - Full Width */}
        <div className="w-full">
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
            {!isInitialLoading && searchLoading && posts.length === 0 && (
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
                    🔍 Đang tìm kiếm gia sư phù hợp...
                  </span>
                </div>
              </motion.div>
            )}

            {/* Error State */}
            {!isInitialLoading && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200/50 p-12 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Đã xảy ra lỗi</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
                <button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105"
                >
                  🔄 Thử lại
                </button>
              </motion.div>
            )}

            {/* Results Grid */}
            {!isInitialLoading && !error && posts.length > 0 && (
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
                    {searchLoading && posts.length > 0 && (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-3"></div>
                        <span className="font-medium">Đang làm mới kết quả...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Results Grid - More columns with horizontal layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {posts.map((post: any, index: number) => (
                    <motion.div
                      key={post.id || post._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="h-full"
                    >
                      <TutorPostCard
                        post={post}
                        showCompatibility={false}
                        onClick={() => handleTutorClick(post.id || post._id)}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Load More */}
                {pagination?.hasNext && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center pt-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={searchLoading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-10 py-4 rounded-xl font-bold transition-all duration-200 shadow-lg transform hover:scale-105 disabled:transform-none min-w-[200px]"
                    >
                      {searchLoading ? (
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
                {pagination && (
                  <div className="text-center bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                    <span className="text-sm text-gray-600 font-medium">
                      Trang {pagination.currentPage || 1} /{" "}
                      {pagination.totalPages || 1}
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Empty State */}
            {!isInitialLoading && !error && !searchLoading && posts.length === 0 && hasSearched && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-16 text-center"
              >
                <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">🔍 Không tìm thấy gia sư nào</h3>
                <p className="text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
                  Hãy thử điều chỉnh bộ lọc, thay đổi từ khóa tìm kiếm hoặc mở rộng tiêu chí để tìm được gia sư phù hợp
                </p>
                <button
                  onClick={handleReset}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105"
                >
                  🗑️ Xóa tất cả bộ lọc
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TutorSearchPage;

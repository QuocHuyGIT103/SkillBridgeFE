import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTutorPostStore } from "../../store/tutorPost.store";
import TutorPostCard from "../../components/tutorPost/TutorPostCard";
import SearchFilters from "../../components/tutorPost/SearchFilters";
import { debounce } from "../../utils/tutorUtils";

interface TutorPostSearchQuery {
  subjects?: string[];
  teachingMode?: "ONLINE" | "OFFLINE" | "BOTH";
  studentLevel?: string[];
  priceMin?: number;
  priceMax?: number;
  province?: string;
  district?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "pricePerSession" | "viewCount";
  sortOrder?: "asc" | "desc";
}

const StudentTutorSearchPage: React.FC = () => {
  const { posts, pagination, searchLoading, searchTutorPosts } =
    useTutorPostStore();
  const [currentFilters, setCurrentFilters] = useState<TutorPostSearchQuery>({
    page: 1,
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Debounced search function with error handling
  const debouncedSearch = debounce(async (filters: TutorPostSearchQuery) => {
    try {
      setError(null);
      await searchTutorPosts(filters);
    } catch (error) {
      console.error("Search error:", error);
      setError("Có lỗi xảy ra khi tìm kiếm gia sư. Vui lòng thử lại.");
    }
  }, 500);

  // Handle filters change
  const handleFiltersChange = (filters: TutorPostSearchQuery) => {
    const newFilters = { ...filters, page: 1 }; // Reset to page 1 when filters change
    setCurrentFilters(newFilters);
    debouncedSearch(newFilters);
  };

  // Load initial data with loading state
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsInitialLoading(true);
        setError(null);
        await searchTutorPosts(currentFilters);
      } catch (error) {
        console.error("Initial search error:", error);
        setError("Không thể tải danh sách gia sư. Vui lòng thử lại.");
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Handle pagination with error handling
  const handleLoadMore = async () => {
    if (pagination && pagination.hasNext) {
      try {
        setError(null);
        const newFilters = {
          ...currentFilters,
          page: (currentFilters.page || 1) + 1,
        };
        setCurrentFilters(newFilters);
        await searchTutorPosts(newFilters);
      } catch (error) {
        console.error("Load more error:", error);
        setError("Không thể tải thêm gia sư. Vui lòng thử lại.");
      }
    }
  };

  // Retry function
  const handleRetry = () => {
    setError(null);
    debouncedSearch(currentFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Tìm gia sư
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Tìm kiếm gia sư phù hợp với nhu cầu học tập của bạn
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end">
              <span className="text-sm text-gray-500">
                {pagination
                  ? `Tìm thấy ${pagination.totalItems} gia sư`
                  : "Đang tải..."}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 xl:gap-8">
          {/* Left Sidebar - Filters */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            <SearchFilters
              onFiltersChange={handleFiltersChange}
              isLoading={searchLoading}
            />
          </div>

          {/* Right Content - Results */}
          <div className="xl:col-span-4 order-1 xl:order-2">
            {/* Initial Loading State */}
            {isInitialLoading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">
                    Đang tải danh sách gia sư...
                  </span>
                </div>
              </div>
            )}

            {/* Search Loading State */}
            {!isInitialLoading && searchLoading && posts.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">
                    Đang tìm kiếm gia sư...
                  </span>
                </div>
              </div>
            )}

            {/* Error State */}
            {!isInitialLoading && error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Có lỗi xảy ra
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={handleRetry}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Thử lại
                </button>
              </motion.div>
            )}

            {/* Results Grid */}
            {!isInitialLoading &&
              !error &&
              !searchLoading &&
              posts.length > 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {posts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <TutorPostCard post={post} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {pagination && pagination.hasNext && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLoadMore}
                        disabled={searchLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                      >
                        {searchLoading ? "Đang tải..." : "Xem thêm gia sư"}
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Pagination Info */}
                  {pagination && (
                    <div className="text-center text-sm text-gray-500">
                      Trang {pagination.currentPage} / {pagination.totalPages}
                    </div>
                  )}
                </div>
              )}

            {/* Empty State */}
            {!isInitialLoading &&
              !error &&
              !searchLoading &&
              posts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
                >
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Không tìm thấy gia sư nào
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thử điều chỉnh bộ lọc tìm kiếm hoặc tìm kiếm với từ khóa
                    khác
                  </p>
                  <button
                    onClick={() =>
                      handleFiltersChange({
                        page: 1,
                        limit: 12,
                        sortBy: "createdAt",
                        sortOrder: "desc",
                      })
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Xóa bộ lọc
                  </button>
                </motion.div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTutorSearchPage;

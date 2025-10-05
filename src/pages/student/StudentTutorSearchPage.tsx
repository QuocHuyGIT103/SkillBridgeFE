import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTutorPostStore } from "../../store/tutorPost.store";
import usePostStore from "../../store/post.store";
import TutorPostCard from "../../components/tutorPost/TutorPostCard";
import SearchFilters from "../../components/tutorPost/SearchFilters";
import { debounce } from "../../utils/tutorUtils";
import toast from "react-hot-toast";

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
  sortBy?: "createdAt" | "pricePerSession" | "viewCount" | "compatibility";
  sortOrder?: "asc" | "desc";
}

const StudentTutorSearchPage: React.FC = () => {
  // ✅ Regular search from TutorPostStore
  const { posts, pagination, searchLoading, searchTutorPosts } = useTutorPostStore();
  
  // ✅ Smart search from PostStore
  const { 
    posts: myStudentPosts, 
    fetchMyPosts,
    smartSearchTutors,
    smartSearchResults,
    smartSearchPagination,
    smartSearchLoading,
    error: postStoreError
  } = usePostStore();

  const [currentFilters, setCurrentFilters] = useState<TutorPostSearchQuery>({
    page: 1,
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSmartSearchMode, setIsSmartSearchMode] = useState(false);

  // ✅ Debounced smart search function
  const debouncedSmartSearch = debounce(async (postId: string, query: any = {}) => {
    try {
      setError(null);
      console.log('🚀 Triggering Smart Search:', { postId, query });
      
      await smartSearchTutors(postId, {
        page: query.page || 1,
        limit: query.limit || 12,
        sortBy: query.sortBy || 'compatibility',
        sortOrder: query.sortOrder || 'desc'
      });
      
      toast.success('Tìm kiếm gia sư thông minh thành công!');
    } catch (error: any) {
      console.error("Smart search error:", error);
      setError("Có lỗi xảy ra khi tìm kiếm gia sư thông minh. Vui lòng thử lại.");
      toast.error("Lỗi khi tìm kiếm gia sư thông minh");
    }
  }, 500);

  // ✅ Debounced regular search function
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
    const newFilters = { ...filters, page: 1 };
    setCurrentFilters(newFilters);
    
    if (selectedPostId) {
      // ✅ Use smart search
      const smartQuery = {
        page: 1,
        limit: 12,
        sortBy: 'compatibility' as const,
        sortOrder: 'desc' as const
      };
      debouncedSmartSearch(selectedPostId, smartQuery);
    } else {
      // ✅ Use regular search
      debouncedSearch(newFilters);
    }
  };

  // Load initial data
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
  }, [searchTutorPosts]);

  // Load my posts
  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  // Handle pagination
  const handleLoadMore = async () => {
    const currentPag = isSmartSearchMode ? smartSearchPagination : pagination;
    
    if (currentPag && currentPag.hasNext) {
      try {
        setError(null);
        const newPage = (currentFilters.page || 1) + 1;
        const newFilters = { ...currentFilters, page: newPage };
        setCurrentFilters(newFilters);

        if (selectedPostId) {
          // ✅ Smart search pagination
          await smartSearchTutors(selectedPostId, {
            page: newPage,
            limit: newFilters.limit,
            sortBy: 'compatibility',
            sortOrder: 'desc'
          });
        } else {
          // ✅ Regular search pagination
          await searchTutorPosts(newFilters);
        }
      } catch (error) {
        console.error("Load more error:", error);
        setError("Không thể tải thêm gia sư. Vui lòng thử lại.");
      }
    }
  };

  // Retry function
  const handleRetry = () => {
    setError(null);
    if (selectedPostId) {
      debouncedSmartSearch(selectedPostId, {
        page: 1,
        limit: 12,
        sortBy: 'compatibility',
        sortOrder: 'desc'
      });
    } else {
      debouncedSearch(currentFilters);
    }
  };

  // ✅ Get current data based on search mode
  const currentPosts = isSmartSearchMode ? smartSearchResults : posts;
  const currentPagination = isSmartSearchMode ? smartSearchPagination : pagination;
  const currentLoading = isSmartSearchMode ? smartSearchLoading : searchLoading;

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
                Tìm gia sư {isSmartSearchMode && '🤖'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {isSmartSearchMode 
                  ? "Tìm kiếm gia sư thông minh dựa trên bài đăng của bạn"
                  : "Tìm kiếm gia sư phù hợp với nhu cầu học tập của bạn"
                }
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end">
              <span className="text-sm text-gray-500">
                {currentPagination
                  ? `Tìm thấy ${currentPagination.totalItems || currentPagination.total || 0} gia sư`
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
              isLoading={currentLoading}
              disabled={isSmartSearchMode} // ✅ Pass disabled prop
              isSmartSearchMode={isSmartSearchMode} // ✅ Pass smart search mode
            />
          </div>

          {/* Right Content - Results */}
          <div className="xl:col-span-4 order-1 xl:order-2">
            {/* Smart Search Selector */}
            <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium mb-2">
                🤖 Tìm gia sư thông minh dựa trên bài đăng của bạn
              </h3>
              <select
                value={selectedPostId || ''}
                onChange={(e) => {
                  const id = e.target.value || null;
                  setSelectedPostId(id);
                  setIsSmartSearchMode(!!id);
                  
                  if (id) {
                    // ✅ Switch to smart search mode
                    console.log('🎯 Switching to Smart Search Mode:', id);
                    const smartQuery = {
                      page: 1,
                      limit: 12,
                      sortBy: 'compatibility' as const,
                      sortOrder: 'desc' as const
                    };
                    setCurrentFilters(smartQuery);
                    debouncedSmartSearch(id, smartQuery);
                  } else {
                    // ✅ Switch back to regular search
                    console.log('🔄 Switching to Regular Search Mode');
                    setIsSmartSearchMode(false);
                    const regularQuery = {
                      page: 1,
                      limit: 12,
                      sortBy: 'createdAt' as const,
                      sortOrder: 'desc' as const
                    };
                    setCurrentFilters(regularQuery);
                    debouncedSearch(regularQuery);
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tìm kiếm thông thường (không dựa trên bài đăng)</option>
                {myStudentPosts
                  .filter((p: any) => p.status === 'approved')
                  .map((post: any) => (
                    <option key={post.id} value={post.id}>
                      📝 {post.title}
                    </option>
                  ))}
              </select>
              
              {/* ✅ Smart Search Mode Indicator */}
              {isSmartSearchMode && (
                <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center text-sm">
                    <span className="text-blue-600 mr-2">🎯</span>
                    <span className="text-blue-700 font-medium">
                      Chế độ tìm kiếm thông minh đang hoạt động
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Kết quả được sắp xếp theo độ phù hợp với bài đăng của bạn
                  </div>
                </div>
              )}
            </div>

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
            {!isInitialLoading && currentLoading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">
                    {isSmartSearchMode 
                      ? "🤖 Đang tìm gia sư thông minh..." 
                      : "Đang tìm kiếm gia sư..."
                    }
                  </span>
                </div>
              </div>
            )}

            {/* Error State */}
            {!isInitialLoading && (error || postStoreError) && (
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
                <p className="text-gray-600 mb-6">{error || postStoreError}</p>
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
              !postStoreError &&
              !currentLoading &&
              currentPosts.length > 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {currentPosts.map((post: any, index: number) => (
                      <motion.div
                        key={post.id || post._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <TutorPostCard 
                          post={post} 
                          showCompatibility={isSmartSearchMode} // ✅ Pass compatibility display flag
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {currentPagination && currentPagination.hasNext && (
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
                        disabled={currentLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                      >
                        {currentLoading ? "Đang tải..." : "Xem thêm gia sư"}
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Pagination Info */}
                  {currentPagination && (
                    <div className="text-center text-sm text-gray-500">
                      Trang {currentPagination.currentPage || currentPagination.page || 1} / {currentPagination.totalPages || currentPagination.pages || 1}
                    </div>
                  )}
                </div>
              )}

            {/* Empty State */}
            {!isInitialLoading &&
              !error &&
              !postStoreError &&
              !currentLoading &&
              currentPosts.length === 0 && (
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
                    {isSmartSearchMode 
                      ? "Không tìm thấy gia sư phù hợp 🤖"
                      : "Không tìm thấy gia sư nào"
                    }
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {isSmartSearchMode 
                      ? "Thử chọn bài đăng khác hoặc chuyển về tìm kiếm thông thường"
                      : "Thử điều chỉnh bộ lọc tìm kiếm hoặc tìm kiếm với từ khóa khác"
                    }
                  </p>
                  <div className="space-x-3">
                    {isSmartSearchMode && (
                      <button
                        onClick={() => {
                          setSelectedPostId(null);
                          setIsSmartSearchMode(false);
                          const regularQuery = {
                            page: 1,
                            limit: 12,
                            sortBy: "createdAt" as const,
                            sortOrder: "desc" as const,
                          };
                          setCurrentFilters(regularQuery);
                          debouncedSearch(regularQuery);
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Tìm kiếm thông thường
                      </button>
                    )}
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
                  </div>
                </motion.div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTutorSearchPage;
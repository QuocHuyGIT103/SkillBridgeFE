import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import usePostStore from "../../store/post.store";
import TutorPostCardHorizontal from "../../components/tutorPost/TutorPostCardHorizontal";
import TutorPostFilter from "../../components/tutorPost/TutorPostFilter";
import { debounce } from "../../utils/tutorUtils";
import toast from "react-hot-toast";
import { validate as validateUUID } from "uuid";

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

const StudentSmartSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    posts: myStudentPosts,
    fetchMyPosts,
    smartSearchTutors,
    smartSearchResults,
    smartSearchPagination,
    smartSearchLoading,
    smartSearchError,
    smartSearchAiAnalysis,
    loadMoreSmartSearchResults,
    clearSmartSearchResults,
    setSmartSearchError,
  } = usePostStore();

  const [currentFilters, setCurrentFilters] = useState<SmartSearchQuery>(() => {
    const urlFilters: SmartSearchQuery = {
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
      sortBy: "compatibility",
      sortOrder: "desc",
    };
    return urlFilters;
  });

  const [selectedPostId, setSelectedPostId] = useState<string | null>(searchParams.get("postId") || null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [myPostsLoaded, setMyPostsLoaded] = useState(false);
  
  // ✅ THÊM: Track xem đã hiện thông báo lần đầu chưa
  const [hasShownInitialToast, setHasShownInitialToast] = useState(false);
  const [isFirstSearch, setIsFirstSearch] = useState(true);

  // ✅ Check if has active filters
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

  // ✅ Update URL function
  const updateURL = useCallback(
    (filters: SmartSearchQuery, postId?: string | null) => {
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
      
      if (postId) {
        params.set("postId", postId);
      }
      setSearchParams(params);
    },
    [setSearchParams]
  );

  // ✅ FIXED: Enhanced debounced search - CHỈ HIỆN TOAST LẦN ĐẦU
  const debouncedSmartSearch = useCallback(
    debounce(async (postId: string, query: SmartSearchQuery = {}, showToast: boolean = false) => {
      try {
        const smartQuery = {
          page: query.page || 1,
          limit: query.limit || 12,
          sortBy: query.sortBy || "compatibility",
          sortOrder: query.sortOrder || "desc",
          
          // ✅ Filters - chỉ gửi khi có giá trị
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
        setHasSearched(true);
        
        // ✅ CHỈ HIỆN TOAST THEO YÊU CẦU
        if (showToast) {
          const filterCount = Object.keys(smartQuery).filter(key => 
            !['page', 'limit', 'sortBy', 'sortOrder'].includes(key)
          ).length;
          
          if (filterCount > 0) {
            toast.success(`🤖 AI đã áp dụng ${filterCount} bộ lọc và tìm thấy gia sư phù hợp!`);
          } else {
            toast.success('🤖 AI đã phân tích và tìm thấy gia sư phù hợp cho bạn!');
          }
        }
        
      } catch (error: any) {
        if (error.message.includes('Post ID')) {
          toast.error("Vui lòng chọn bài đăng hợp lệ để tìm kiếm");
        } else if (error.message.includes('không tìm thấy')) {
          toast.error("Không tìm thấy bài đăng. Vui lòng thử lại.");
        } else {
          toast.error("Lỗi AI: " + (error.message || "Không thể tìm kiếm"));
        }
      }
    }, 300),
    [smartSearchTutors] // ✅ REMOVED hasActiveFilters dependency
  );

  // ✅ Handle filters change - KHÔNG HIỆN TOAST
  const handleFiltersChange = useCallback(
    (newFilters: SmartSearchQuery) => {
      const updatedFilters = { ...newFilters, page: 1 };
      setCurrentFilters(updatedFilters);
      
      if (selectedPostId) {
        updateURL(updatedFilters, selectedPostId);
        // ✅ KHÔNG HIỆN TOAST khi filter change
        debouncedSmartSearch(selectedPostId, updatedFilters, false);
      }
    },
    [selectedPostId, updateURL, debouncedSmartSearch]
  );

  // ✅ Handle search - CHỈ HIỆN TOAST KHI CLICK NÚT TÌM KIẾM
  const handleSearch = useCallback(() => {
    if (selectedPostId) {
      // ✅ HIỆN TOAST khi click nút tìm kiếm
      debouncedSmartSearch(selectedPostId, currentFilters, true);
    } else {
      toast.error("Vui lòng chọn bài đăng để tìm kiếm thông minh");
    }
  }, [selectedPostId, currentFilters, debouncedSmartSearch]);

  // ✅ Handle clear results - HIỆN TOAST KHI RESET
  const handleReset = useCallback(() => {
    const resetFilters: SmartSearchQuery = {
      page: 1,
      limit: 12,
      sortBy: "compatibility",
      sortOrder: "desc",
    };
    
    setCurrentFilters(resetFilters);
    
    if (selectedPostId) {
      updateURL(resetFilters, selectedPostId);
      // ✅ HIỆN TOAST khi reset
      debouncedSmartSearch(selectedPostId, resetFilters, true);
      toast("🔄 Đã đặt lại bộ lọc");
    } else {
      clearSmartSearchResults();
    }
  }, [selectedPostId, updateURL, debouncedSmartSearch, clearSmartSearchResults]);

  // ✅ Post selection - CHỈ HIỆN TOAST LẦN ĐẦU
  const handlePostSelect = useCallback(
    (postId: string | null) => {
      if (!postId || !postId.trim()) {
        toast.error("Vui lòng chọn bài đăng hợp lệ");
        return;
      }

      const trimmedPostId = postId.trim();
      if (!validateUUID(trimmedPostId)) {
        toast.error("ID bài đăng không đúng định dạng UUID");
        return;
      }

      setSelectedPostId(trimmedPostId);
      setIsFirstSearch(true); // ✅ Reset first search flag
      
      const smartFilters = {
        ...currentFilters,
        page: 1,
        sortBy: "compatibility" as const,
        sortOrder: "desc" as const,
      };
      setCurrentFilters(smartFilters);
      updateURL(smartFilters, trimmedPostId);
      
      // ✅ HIỆN TOAST khi chọn post
      debouncedSmartSearch(trimmedPostId, smartFilters, true);
      toast.success("🎯 Đã chọn bài đăng để tìm kiếm thông minh");
    },
    [currentFilters, updateURL, debouncedSmartSearch]
  );

  // ✅ Handle load more - KHÔNG HIỆN TOAST
  const handleLoadMore = useCallback(async () => {
    if (!smartSearchPagination?.hasNext || !selectedPostId) return;
    
    try {
      const nextPage = (currentFilters.page || 1) + 1;
      const nextFilters = { 
        ...currentFilters, 
        page: nextPage,
        sort_by: currentFilters.sortBy,
        sort_order: currentFilters.sortOrder,
      };
      setCurrentFilters(nextFilters);
      
      // ✅ KHÔNG HIỆN TOAST khi load more
      await loadMoreSmartSearchResults(selectedPostId, nextFilters);
    } catch (error: any) {
      toast.error("Không thể tải thêm gia sư");
    }
  }, [currentFilters, selectedPostId, smartSearchPagination, loadMoreSmartSearchResults]);

  // ✅ Auto search khi search text thay đổi - KHÔNG HIỆN TOAST
  useEffect(() => {
    if (selectedPostId && currentFilters.search !== undefined) {
      const timer = setTimeout(() => {
        // ✅ KHÔNG HIỆN TOAST cho auto search
        debouncedSmartSearch(selectedPostId, currentFilters, false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [currentFilters.search, selectedPostId, debouncedSmartSearch]);

  // ✅ Load my posts ONLY ONCE at component mount
  useEffect(() => {
    let isMounted = true;
    const loadMyPostsOnce = async () => {
      if (myPostsLoaded) {
        return;
      }
      
      try {
        setIsInitialLoading(true);
        
        await fetchMyPosts();
        
        if (isMounted) {
          setMyPostsLoaded(true);
        }
      } catch (error: any) {
        if (isMounted) {
          toast.error("Không thể tải danh sách bài đăng của bạn");
        }
      } finally {
        if (isMounted) {
          setIsInitialLoading(false);
        }
      }
    };
    
    loadMyPostsOnce();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ Handle URL postId AFTER my posts are loaded - CHỈ HIỆN TOAST LẦN ĐẦU
  useEffect(() => {
    if (!myPostsLoaded || !myStudentPosts.length) return;
    
    const urlPostId = searchParams.get('postId');
    
    if (urlPostId && urlPostId !== selectedPostId) {
      if (!validateUUID(urlPostId)) {
        toast.error("ID bài đăng trong URL không hợp lệ");
        
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('postId');
        setSearchParams(newSearchParams, { replace: true });
        return;
      }

      const postExists = myStudentPosts.some(post => post.id === urlPostId);
      
      if (!postExists) {
        toast.error("Bài đăng không tồn tại hoặc không thuộc về bạn");
        
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('postId');
        setSearchParams(newSearchParams, { replace: true });
        return;
      }

      setSelectedPostId(urlPostId);
      
      // ✅ CHỈ HIỆN TOAST cho URL auto-load nếu chưa hiện lần nào
      const shouldShowToast = !hasShownInitialToast;
      if (shouldShowToast) {
        setHasShownInitialToast(true);
      }
      
      const urlFilters = currentFilters;
      debouncedSmartSearch(urlPostId, urlFilters, shouldShowToast);
    }
  }, [myPostsLoaded, myStudentPosts.length, searchParams, selectedPostId, currentFilters, debouncedSmartSearch, setSearchParams, hasShownInitialToast]);

  const handleTutorClick = useCallback(
    (tutorId: string) => {
      navigate(`/tutors/${tutorId}`);
    },
    [navigate]
  );

  const getTotalText = () => {
    if (!smartSearchPagination) return "Chưa tìm kiếm";
    const total = smartSearchPagination.totalItems || smartSearchPagination.total || 0;
    return `Tìm thấy ${total.toLocaleString()} gia sư phù hợp`;
  };

  // ✅ Sắp xếp kết quả
  const sortedSmartSearchResults = React.useMemo(() => {
    if (!smartSearchResults || smartSearchResults.length === 0) return [];
    
    return [...smartSearchResults].sort((a, b) => {
      const scoreA = a.compatibility || 0;
      const scoreB = b.compatibility || 0;
      return scoreB - scoreA;
    });
  }, [smartSearchResults]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
        
        {/* TOP SECTION */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-6" style={{ zIndex: 5 }}>
          
          {/* Post Selection */}
          <div className="xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white/60"
            >
              <div className="flex items-center mb-3">
                <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-2.5 flex-shrink-0">
                  <span className="text-white text-sm">🤖</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Tìm kiếm gia sư thông minh</h3>
              </div>

              <select
                value={selectedPostId || ""}
                onChange={(e) => handlePostSelect(e.target.value || null)}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all duration-200"
                disabled={smartSearchLoading || !myPostsLoaded}
              >
                <option value="">
                  {myPostsLoaded ? "Chọn bài đăng để tìm kiếm" : "Đang tải bài đăng..."}
                </option>
                {myStudentPosts
                  .filter((p: any) => p.status === "approved")
                  .map((post: any) => (
                    <option key={post.id} value={post.id}>
                      {post.title}
                    </option>
                  ))}
              </select>

              {/* Active state display */}
              {selectedPostId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 p-2.5 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex items-center text-xs mb-1">
                    <span className="text-blue-600 mr-1.5">🎯</span>
                    <span className="text-blue-800 font-bold">AI đang hoạt động</span>
                  </div>
                  <div className="text-xs text-blue-600 mb-1">
                    {getTotalText()}
                  </div>
                  {hasActiveFilters() && (
                    <div className="flex items-center text-xs mb-1">
                      <span className="text-green-600 mr-1.5">🔧</span>
                      <span className="text-green-700 font-medium">
                        Bộ lọc đã áp dụng ({Object.keys(currentFilters).filter(key => 
                          currentFilters[key as keyof SmartSearchQuery] !== undefined && 
                          currentFilters[key as keyof SmartSearchQuery] !== '' &&
                          !['page', 'limit', 'sortBy', 'sortOrder'].includes(key)
                        ).length})
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Filter Section */}
          <div className="xl:col-span-3">
            {selectedPostId && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full"
              >
                <TutorPostFilter
                  filters={currentFilters}
                  onFiltersChange={handleFiltersChange}
                  onSearch={handleSearch}
                  onReset={handleReset}
                  isLoading={smartSearchLoading}
                  disabled={false}
                  isSmartSearchMode={true}
                  resultCount={smartSearchPagination?.totalItems || smartSearchPagination?.total}
                  className="h-full"
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* RESULTS SECTION */}
        <div className="w-full" style={{ zIndex: 1 }}>
          <AnimatePresence mode="wait">
            {/* Initial Loading */}
            {isInitialLoading && (
              <motion.div
                key="initial-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/60 p-12"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="relative mb-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                  </div>
                  <span className="text-gray-700 text-lg font-medium">Đang khởi tạo AI tìm kiếm...</span>
                </div>
              </motion.div>
            )}

            {/* No Post Selected */}
            {!isInitialLoading && !selectedPostId && (
              <motion.div
                key="no-post"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/60 p-16 text-center"
              >
                <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-6xl">🤖</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">🎯 Chọn bài đăng để bắt đầu</h3>
                <p className="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
                  Hãy chọn một bài đăng của bạn để AI phân tích và tìm kiếm những gia sư phù hợp nhất
                </p>
                {myStudentPosts.filter((p: any) => p.status === "approved").length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-md mx-auto">
                    <p className="text-yellow-800 font-medium mb-4">
                      Bạn chưa có bài đăng nào được duyệt. Hãy tạo bài đăng mới để sử dụng tính năng tìm kiếm thông minh.
                    </p>
                    <button
                      onClick={() => navigate('/student/posts/create')}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
                    >
                      ➕ Tạo bài đăng
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Search Loading */}
            {!isInitialLoading && selectedPostId && smartSearchLoading && smartSearchResults.length === 0 && (
              <motion.div
                key="search-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/60 p-12"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="relative mb-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                  </div>
                  <span className="text-gray-700 text-lg font-medium">
                    🤖 AI đang phân tích và tìm kiếm gia sư tối ưu...
                  </span>
                  {hasActiveFilters() && (
                    <p className="text-blue-600 text-sm mt-2 font-medium">
                      Đang áp dụng bộ lọc của bạn...
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Error State */}
            {!isInitialLoading && smartSearchError && (
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
                <p className="text-gray-600 mb-8 max-w-md mx-auto">{smartSearchError}</p>
                <button
                  onClick={() => {
                    setSmartSearchError(null);
                    if (selectedPostId) {
                      debouncedSmartSearch(selectedPostId, currentFilters, true);
                    }
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105"
                >
                  🔄 Thử lại
                </button>
              </motion.div>
            )}

            {/* Results List */}
            {!isInitialLoading && selectedPostId && !smartSearchError && sortedSmartSearchResults.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Results List */}
                <div className="space-y-3">
                  {sortedSmartSearchResults.map((post: any, index: number) => (
                    <motion.div
                      key={post.id || post._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TutorPostCardHorizontal
                        post={post}
                        showCompatibility={true}
                        onClick={() => handleTutorClick(post.id || post._id)}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Load More Button */}
                {smartSearchPagination?.hasNext && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center pt-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={smartSearchLoading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-10 py-4 rounded-xl font-bold transition-all duration-200 shadow-lg transform hover:scale-105 disabled:transform-none min-w-[200px]"
                    >
                      {smartSearchLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                          AI đang {hasActiveFilters() ? 'lọc và ' : ''}tìm thêm...
                        </div>
                      ) : (
                        `🤖 Tìm thêm gia sư phù hợp${hasActiveFilters() ? ' (đã lọc)' : ''}`
                      )}
                    </button>
                  </motion.div>
                )}

                {/* Pagination Info */}
                {smartSearchPagination && (
                  <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/60">
                    <span className="text-sm text-gray-600 font-medium">
                      Trang {smartSearchPagination.currentPage || smartSearchPagination.page || 1} /{" "}
                      {smartSearchPagination.totalPages || smartSearchPagination.pages || 1}
                      {hasActiveFilters() && " • Đã áp dụng bộ lọc"}
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Enhanced Empty State */}
            {!isInitialLoading && selectedPostId && !smartSearchError && !smartSearchLoading && smartSearchResults.length === 0 && hasSearched && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/60 p-16 text-center"
              >
                <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-6xl">🤖</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  🎯 AI chưa tìm thấy gia sư phù hợp{hasActiveFilters() && ' với bộ lọc'}
                </h3>
                <p className="text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
                  {hasActiveFilters() 
                    ? `Không tìm thấy gia sư nào phù hợp với ${Object.keys(currentFilters).filter(key => 
                        currentFilters[key as keyof SmartSearchQuery] !== undefined && 
                        currentFilters[key as keyof SmartSearchQuery] !== '' &&
                        !['page', 'limit', 'sortBy', 'sortOrder'].includes(key)
                      ).length} bộ lọc hiện tại. Hãy thử điều chỉnh hoặc xóa bớt một số tiêu chí lọc.`
                    : "Hãy thử chọn bài đăng khác, điều chỉnh bộ lọc hoặc mở rộng tiêu chí để AI tìm được gia sư phù hợp hơn"
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleReset}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105"
                  >
                    🔄 Đặt lại bộ lọc
                  </button>
                  <button
                    onClick={() => navigate('/tutors')}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105"
                  >
                    🔍 Tìm kiếm thông thường
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default StudentSmartSearchPage;
import React, { useState, useEffect, useCallback } from "react";
import { useTutorPostStore } from "../../store/tutorPost.store";
import TutorPostCard from "./TutorPostCard";
import TutorPostFilter from "./TutorPostFilter";
import type { TutorPostSearchQuery } from "../../services/tutorPost.service";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import toast from "react-hot-toast";

interface TutorPostSearchProps {
  initialFilters?: Partial<TutorPostSearchQuery>;
  showFilters?: boolean;
  compact?: boolean;
  className?: string;
}

const DEFAULT_FILTERS: TutorPostSearchQuery = {
  page: 1,
  limit: 12,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const TutorPostSearch: React.FC<TutorPostSearchProps> = ({
  initialFilters = {},
  showFilters = true,
  compact = false,
  className = "",
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    posts,
    pagination,
    searchLoading,
    searchTutorPosts,
    incrementContactCount,
    clearPosts,
  } = useTutorPostStore();

  const [filters, setFilters] = useState<TutorPostSearchQuery>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  const [hasSearched, setHasSearched] = useState(false);

  // Auto search when component mounts or filters change
  const performSearch = useCallback(async () => {
    try {
      setHasSearched(true);
      await searchTutorPosts(filters);
    } catch (error) {
      console.error("Search error:", error);
    }
  }, [filters, searchTutorPosts]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      clearPosts();
    };
  }, [clearPosts]);

  const handleFiltersChange = (newFilters: TutorPostSearchQuery) => {
    setFilters({
      ...newFilters,
      page: 1, // Reset to first page when filters change
    });
  };

  const handleSearch = () => {
    performSearch();
  };

  const handleReset = () => {
    const resetFilters = { ...DEFAULT_FILTERS };
    setFilters(resetFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);

    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContactClick = async (tutorPost: any) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để liên hệ với gia sư");
      navigate("/auth/login");
      return;
    }

    if (user?.role === "TUTOR" && user?.id === tutorPost.tutorId._id) {
      toast.error("Bạn không thể liên hệ với chính mình");
      return;
    }

    try {
      await incrementContactCount(tutorPost._id);

      // Navigate to tutor post detail or show contact modal
      navigate(`/tutors/${tutorPost._id}`);
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const PaginationComponent = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { currentPage, totalPages, hasNext, hasPrev } = pagination;

    // Calculate page numbers to show
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push("...");
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push("...");
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push("...");
          for (let i = currentPage - 1; i <= currentPage + 1; i++)
            pages.push(i);
          pages.push("...");
          pages.push(totalPages);
        }
      }

      return pages;
    };

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrev || searchLoading}
          className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() =>
              typeof page === "number" ? handlePageChange(page) : undefined
            }
            disabled={searchLoading || page === "..."}
            className={`
              px-3 py-2 text-sm rounded transition-colors
              ${
                typeof page === "number" && page === currentPage
                  ? "bg-blue-600 text-white"
                  : page === "..."
                  ? "text-gray-400 cursor-default"
                  : "text-gray-700 hover:bg-gray-100"
              }
              ${searchLoading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNext || searchLoading}
          className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    );
  };

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="mb-4">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Không tìm thấy gia sư nào
      </h3>
      <p className="text-gray-500 mb-4">
        Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
      </p>
      <button
        onClick={handleReset}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Đặt lại bộ lọc
      </button>
    </div>
  );

  const LoadingState = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
        >
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded w-5/6"></div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="h-6 bg-gray-300 rounded w-20"></div>
            <div className="h-8 bg-gray-300 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <TutorPostFilter
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onSearch={handleSearch}
                onReset={handleReset}
                isLoading={searchLoading}
                resultCount={pagination?.totalItems}
              />
            </div>
          </div>
        )}

        {/* Results */}
        <div className={showFilters ? "lg:col-span-3" : "col-span-1"}>
          {/* Results Header */}
          {hasSearched && (
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Kết quả tìm kiếm
                </h2>
                {pagination && (
                  <p className="text-sm text-gray-600">
                    Hiển thị{" "}
                    {(pagination.currentPage - 1) * (filters.limit || 12) + 1} -{" "}
                    {Math.min(
                      pagination.currentPage * (filters.limit || 12),
                      pagination.totalItems
                    )}{" "}
                    trong {pagination.totalItems} gia sư
                  </p>
                )}
              </div>

              {!showFilters && (
                <select
                  value={`${filters.sortBy}_${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split("_");
                    handleFiltersChange({
                      ...filters,
                      sortBy: sortBy as any,
                      sortOrder: sortOrder as any,
                    });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="createdAt_desc">Mới nhất</option>
                  <option value="pricePerSession_asc">Giá thấp nhất</option>
                  <option value="pricePerSession_desc">Giá cao nhất</option>
                  <option value="viewCount_desc">Xem nhiều nhất</option>
                </select>
              )}
            </div>
          )}

          {/* Results Content */}
          {searchLoading ? (
            <LoadingState />
          ) : posts.length === 0 && hasSearched ? (
            <EmptyState />
          ) : (
            <>
              <div
                className={`
                grid gap-6
                ${
                  compact
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                }
              `}
              >
                {posts.map((post) => (
                  <TutorPostCard
                    key={post._id}
                    post={post}
                    
                  />
                ))}
              </div>
                
              <PaginationComponent />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorPostSearch;

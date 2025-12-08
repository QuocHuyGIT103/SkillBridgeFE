import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import usePostStore from "../../store/post.store";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import StudentPostCard from "../../components/tutor/StudentPostCard";

const TutorStudentPostsPage: React.FC = () => {
  const {
    tutorStudentPosts,
    tutorStudentPostsPagination,
    tutorStudentPostsLoading,
    tutorStudentPostsError,
    fetchTutorStudentPosts,
  } = usePostStore();

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [isOnline, setIsOnline] = useState<"all" | "true" | "false">("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(3);
  const [minRate, setMinRate] = useState<string>("");
  const [maxRate, setMaxRate] = useState<string>("");

  useEffect(() => {
    const baseQuery: any = { page, limit };
    if (search.trim()) baseQuery.search_term = search.trim();
    if (isOnline !== "all") baseQuery.is_online = isOnline === "true";
    if (minRate.trim()) baseQuery.min_hourly_rate = Number(minRate);
    if (maxRate.trim()) baseQuery.max_hourly_rate = Number(maxRate);

    fetchTutorStudentPosts(baseQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, isOnline, minRate, maxRate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const baseQuery: any = { page: 1, limit };
    if (search.trim()) baseQuery.search_term = search.trim();
    if (isOnline !== "all") baseQuery.is_online = isOnline === "true";
    if (minRate.trim()) baseQuery.min_hourly_rate = Number(minRate);
    if (maxRate.trim()) baseQuery.max_hourly_rate = Number(maxRate);

    console.log('[TutorStudentPostsPage] handleSearch query:', baseQuery);

    fetchTutorStudentPosts(baseQuery);
  };

  const handleReset = () => {
    setSearch("");
    setIsOnline("all");
    setMinRate("");
    setMaxRate("");
    setPage(1);
    fetchTutorStudentPosts({ page: 1, limit });
  };

  const loading = tutorStudentPostsLoading;
  const error = tutorStudentPostsError;
  const list = tutorStudentPosts;
  const pagination = tutorStudentPostsPagination;

  const handleViewDetail = (post: any) => {
    navigate(`/tutor/posts/student/${post.id || post._id}`);
  };

  const goToSendRequestPage = (studentPost: any) => {
    navigate(`/tutor/posts/student/${studentPost.id || studentPost._id}/request`);
  };

  return (
    <div className="space-y-6">
      {/* Header section similar to TutorDashboardOverview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 bg-primary"
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white/80">
          Bài đăng của học viên
        </h1>
        <p className="text-white/80 text-lg">
          Danh sách các bài đăng đã được Admin phê duyệt, chỉ hiển thị cho gia
          sư đã xác thực.
        </p>
      </motion.div>

      {/* Bộ lọc mở rộng */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-6 flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tiêu đề hoặc nội dung..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="md:col-span-2 flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Hình thức
            </label>
            <select
              value={isOnline}
              onChange={(e) => setIsOnline(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tất cả</option>
              <option value="true">Online</option>
              <option value="false">Offline</option>
            </select>
          </div>
          <div className="md:col-span-2 flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Học phí tối thiểu (VNĐ/giờ)
            </label>
            <select
              value={minRate}
              onChange={(e) => setMinRate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Không giới hạn</option>
              <option value="50000">50,000</option>
              <option value="80000">80,000</option>
              <option value="100000">100,000</option>
              <option value="150000">150,000</option>
              <option value="200000">200,000</option>
              <option value="300000">300,000</option>
              <option value="500000">500,000</option>
            </select>
          </div>
          <div className="md:col-span-2 flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Học phí tối đa (VNĐ/giờ)
            </label>
            <select
              value={maxRate}
              onChange={(e) => setMaxRate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Không giới hạn</option>
              <option value="80000">80,000</option>
              <option value="100000">100,000</option>
              <option value="150000">150,000</option>
              <option value="200000">200,000</option>
              <option value="300000">300,000</option>
              <option value="500000">500,000</option>
              <option value="1000000">1,000,000</option>
            </select>
          </div>
          <div className="md:col-span-2 flex items-end space-x-2">
            <button
              type="submit"
              className="bg-primary text-white rounded-lg px-4 py-2 hover:opacity-90 w-full"
            >
              Lọc
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-200 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-300 w-full"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="border rounded-xl p-6 animate-pulse bg-gray-50 flex flex-col gap-4 h-full"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded w-full"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-full mt-auto"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 text-lg font-semibold mb-2">⚠️ Lỗi</div>
            <div className="text-gray-600">{error}</div>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <div className="text-gray-600 text-lg font-medium mb-2">Không có bài đăng nào phù hợp</div>
            <div className="text-gray-500 text-sm">
              Hãy thử điều chỉnh bộ lọc hoặc bật tìm kiếm thông minh để tìm thêm kết quả
            </div>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">
                  📋 Danh sách học viên gần đây
                </h2>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  {pagination?.total || list.length} bài đăng
                </span>
              </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((post, index) => (
                <motion.div
                  key={post.id || post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="h-full"
                >
                  <StudentPostCard
                    post={post}
                    onClick={() => handleViewDetail(post)}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-8 pt-6 border-t gap-4">
            <div className="text-sm text-gray-600 order-2 md:order-1">
              Hiển thị <span className="font-semibold">{((pagination.page - 1) * pagination.limit) + 1}</span> -{' '}
              <span className="font-semibold">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              trong tổng số <span className="font-semibold">{pagination.total}</span> bài đăng
            </div>
            <div className="flex items-center gap-2 order-1 md:order-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={loading || pagination.page <= 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                ← Trước
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      disabled={loading}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        pagination.page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() =>
                  setPage((p) =>
                    pagination.page < pagination.pages ? p + 1 : p
                  )
                }
                disabled={loading || pagination.page >= pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorStudentPostsPage;

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import usePostStore from "../../store/post.store";
import { useTutorPostStore } from "../../store/tutorPost.store";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Một số hằng cho style chip
const chipBase =
  "inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 mr-2 mb-2";

const TutorStudentPostsPage: React.FC = () => {
  const {
    tutorStudentPosts,
    tutorStudentPostsPagination,
    tutorStudentPostsLoading,
    tutorStudentPostsError,
    fetchTutorStudentPosts,
    smartTutorStudentPosts,
    smartTutorStudentPostsPagination,
    smartTutorStudentPostsLoading,
    smartTutorStudentPostsError,
    smartSearchStudentPostsForTutor,
  } = usePostStore();

  const { myPosts, getMyTutorPosts, isLoading: myTutorPostsLoading } = useTutorPostStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [isOnline, setIsOnline] = useState<"all" | "true" | "false">("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [minRate, setMinRate] = useState<string>("");
  const [maxRate, setMaxRate] = useState<string>("");
  const [smartMode, setSmartMode] = useState<boolean>(false);
  const [selectedTutorPostId, setSelectedTutorPostId] = useState<string>("");

  useEffect(() => {
    // Load my tutor posts once for smart mode selector
    getMyTutorPosts(1, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const baseQuery: any = { page, limit };
    if (search.trim()) baseQuery.search_term = search.trim();
    if (isOnline !== "all") baseQuery.is_online = isOnline === "true";
    if (minRate.trim()) baseQuery.min_hourly_rate = Number(minRate);
    if (maxRate.trim()) baseQuery.max_hourly_rate = Number(maxRate);

    if (smartMode && selectedTutorPostId) {
      smartSearchStudentPostsForTutor({
        tutorPostId: selectedTutorPostId,
        ...baseQuery,
        sort_by: "compatibility",
        sort_order: "desc",
      });
    } else {
      fetchTutorStudentPosts(baseQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, isOnline, smartMode, selectedTutorPostId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const baseQuery: any = { page: 1, limit };
    if (search.trim()) baseQuery.search_term = search.trim();
    if (isOnline !== "all") baseQuery.is_online = isOnline === "true";
    if (minRate.trim()) baseQuery.min_hourly_rate = Number(minRate);
    if (maxRate.trim()) baseQuery.max_hourly_rate = Number(maxRate);

    if (smartMode && selectedTutorPostId) {
      smartSearchStudentPostsForTutor({
        tutorPostId: selectedTutorPostId,
        ...baseQuery,
        sort_by: "compatibility",
        sort_order: "desc",
      });
    } else {
      fetchTutorStudentPosts(baseQuery);
    }
  };

  const handleReset = () => {
    setSearch("");
    setIsOnline("all");
    setMinRate("");
    setMaxRate("");
    setPage(1);
    if (smartMode && selectedTutorPostId) {
      smartSearchStudentPostsForTutor({
        tutorPostId: selectedTutorPostId,
        page: 1,
        limit,
        sort_by: "compatibility",
        sort_order: "desc",
      });
    } else {
      fetchTutorStudentPosts({ page: 1, limit });
    }
  };

  const loading = smartMode ? smartTutorStudentPostsLoading : tutorStudentPostsLoading;
  const error = smartMode ? smartTutorStudentPostsError : tutorStudentPostsError;
  const list = smartMode ? smartTutorStudentPosts : tutorStudentPosts;
  const pagination = smartMode ? smartTutorStudentPostsPagination : tutorStudentPostsPagination;

  const handleViewDetail = (post: any) => {
    navigate(`/tutor/posts/student/${post.id || post._id}`);
  };

  const goToSendRequestPage = (studentPost: any) => {
    if (!smartMode) {
      toast("Hãy bật tìm kiếm thông minh để gửi đề nghị dạy.", { icon: "ℹ️" });
      return;
    }
    navigate(`/tutor/posts/student/${studentPost.id || studentPost._id}/request`, {
      state: { selectedTutorPostId },
    });
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
          <div className="md:col-span-3 flex items-center gap-3">
            <input
              id="smartMode"
              type="checkbox"
              checked={smartMode}
              onChange={(e) => setSmartMode(e.target.checked)}
              className="h-4 w-4 text-primary border-gray-300 rounded"
            />
            <label htmlFor="smartMode" className="text-sm font-medium text-gray-700">
              Bật tìm kiếm thông minh (dựa trên bài đăng của bạn)
            </label>
          </div>
          {smartMode && (
            <div className="md:col-span-3 flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">
                Chọn bài đăng của bạn
              </label>
              <select
                value={selectedTutorPostId}
                onChange={(e) => setSelectedTutorPostId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option key="placeholder" value="">
                  {myTutorPostsLoading ? "Đang tải..." : "— Chọn bài đăng —"}
                </option>
                {myPosts?.map((p) => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.title || "Bài đăng không tiêu đề"}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="md:col-span-4 flex flex-col">
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
              Học phí tối thiểu (VND)
            </label>
            <input
              type="number"
              min={0}
              step={1000}
              value={minRate}
              onChange={(e) => setMinRate(e.target.value)}
              onBlur={() => {
                if (!minRate) return;
                const num = Number(minRate);
                if (!isNaN(num)) {
                  const rounded = Math.round(num / 1000) * 1000;
                  setMinRate(String(rounded));
                }
              }}
              placeholder="VD: 80000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="md:col-span-2 flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Học phí tối đa (VND)
            </label>
            <input
              type="number"
              min={0}
              step={1000}
              value={maxRate}
              onChange={(e) => setMaxRate(e.target.value)}
              onBlur={() => {
                if (!maxRate) return;
                const num = Number(maxRate);
                if (!isNaN(num)) {
                  const rounded = Math.round(num / 1000) * 1000;
                  setMaxRate(String(rounded));
                }
              }}
              placeholder="VD: 150000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
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
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="border rounded-lg p-5 animate-pulse bg-gray-50 flex flex-col gap-3"
              >
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : list.length === 0 ? (
          <div className="text-gray-600">Không có bài đăng nào phù hợp.</div>
        ) : (
          <div className="space-y-4">
            {list.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="border rounded-xl p-5 hover:shadow-lg transition group relative overflow-hidden bg-white"
              >
                {/* Accent bar */}
                <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-primary to-secondary opacity-70" />
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 ring-1 ring-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                        {(() => {
                          const src =
                            (post.author_id as any)?.avatar_url ||
                            (post.author_id as any)?.avatarUrl ||
                            post.author_id?.avatar ||
                            "";
                          if (src) {
                            return (
                              <img
                                src={src}
                                alt="avatar"
                                className="w-full h-full object-cover"
                              />
                            );
                          }
                          const name = post.author_id?.full_name || "";
                          const initials = name
                            .split(" ")
                            .map((p: string) => p[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() || "U";
                          return <span>{initials}</span>;
                        })()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition line-clamp-1">
                          {post.title}
                        </h3>
                        <div className="text-xs text-gray-500 truncate">
                          Người đăng: {post.author_id?.full_name || "N/A"}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">{post.content}</p>
                    {/* Chips */}
                    <div className="flex flex-wrap mb-3">
                      {post.subjects?.slice(0, 6).map((s: string) => (
                        <span key={s} className={chipBase}>
                          {s}
                        </span>
                      ))}
                      {post.grade_levels?.slice(0, 6).map((g: string) => (
                        <span
                          key={g}
                          className={`${chipBase} bg-blue-50 text-blue-700`}
                        >
                          {g}
                        </span>
                      ))}
                      {post.is_online !== undefined && (
                        <span
                          className={`${chipBase} bg-purple-50 text-purple-700`}
                        >
                          {post.is_online ? "Online" : "Offline"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="md:w-60 flex-shrink-0 space-y-3">
                    {smartMode && typeof (post as any).compatibility === "number" && (
                      <div className="flex items-center justify-end">
                        <div className="relative inline-flex items-center justify-center">
                          <svg width="64" height="64" viewBox="0 0 36 36">
                            <path d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                            <path
                              d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32"
                              fill="none"
                              stroke="url(#grad)"
                              strokeWidth="4"
                              strokeDasharray={`${Math.max(0, Math.min(100, Math.round((post as any).compatibility)))}, 100`}
                              strokeLinecap="round"
                              transform="rotate(-90 18 18)"
                            />
                            <defs>
                              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#3b82f6" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-800">
                              {Math.round((post as any).compatibility)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    {post.hourly_rate && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                          Học phí mong muốn
                        </div>
                        <div className="font-semibold text-gray-800 text-sm">
                          {post.hourly_rate.min.toLocaleString()} -{" "}
                          {post.hourly_rate.max.toLocaleString()} VND/giờ
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => handleViewDetail(post)}
                        className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm rounded-lg px-3 py-2 transition"
                      >
                        Xem chi tiết
                      </button>
                      {smartMode && (
                        <button
                          type="button"
                          disabled={!selectedTutorPostId}
                          onClick={() => goToSendRequestPage(post)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-sm rounded-lg px-3 py-2 transition"
                        >
                          Gửi đề nghị dạy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-6 gap-3">
            <div className="text-sm text-gray-600 order-2 md:order-1">
              Trang {pagination.page} / {pagination.pages} • Tổng:{" "}
              {pagination.total}
            </div>
            <div className="flex items-center gap-2 order-1 md:order-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={loading || pagination.page <= 1}
                className="px-3 py-1.5 border rounded-lg disabled:opacity-40 text-sm hover:bg-gray-50"
              >
                Trước
              </button>
              <div className="text-xs text-gray-500 px-2">
                {pagination.page}
              </div>
              <button
                onClick={() =>
                  setPage((p) =>
                    pagination.page < pagination.pages ? p + 1 : p
                  )
                }
                disabled={loading || pagination.page >= pagination.pages}
                className="px-3 py-1.5 border rounded-lg disabled:opacity-40 text-sm hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorStudentPostsPage;

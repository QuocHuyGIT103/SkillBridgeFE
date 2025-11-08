import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import usePostStore from "../../store/post.store";

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
  } = usePostStore();

  const [search, setSearch] = useState("");
  const [isOnline, setIsOnline] = useState<"all" | "true" | "false">("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [minRate, setMinRate] = useState<string>("");
  const [maxRate, setMaxRate] = useState<string>("");

  useEffect(() => {
    const query: any = { page, limit };
    if (search.trim()) query.search_term = search.trim();
    if (isOnline !== "all") query.is_online = isOnline === "true";
    if (minRate.trim()) query.min_hourly_rate = Number(minRate);
    if (maxRate.trim()) query.max_hourly_rate = Number(maxRate);
    fetchTutorStudentPosts(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, isOnline]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const query: any = { page: 1, limit };
    if (search.trim()) query.search_term = search.trim();
    if (isOnline !== "all") query.is_online = isOnline === "true";
    if (minRate.trim()) query.min_hourly_rate = Number(minRate);
    if (maxRate.trim()) query.max_hourly_rate = Number(maxRate);
    fetchTutorStudentPosts(query);
  };

  const handleReset = () => {
    setSearch("");
    setIsOnline("all");
    setMinRate("");
    setMaxRate("");
    setPage(1);
    fetchTutorStudentPosts({ page: 1, limit });
  };

  const pagination = tutorStudentPostsPagination;

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
        {tutorStudentPostsLoading ? (
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
        ) : tutorStudentPostsError ? (
          <div className="text-red-600">{tutorStudentPostsError}</div>
        ) : tutorStudentPosts.length === 0 ? (
          <div className="text-gray-600">Không có bài đăng nào phù hợp.</div>
        ) : (
          <div className="space-y-4">
            {tutorStudentPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="border rounded-lg p-5 hover:shadow-md transition group relative overflow-hidden"
              >
                {/* Accent bar */}
                <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-primary to-secondary opacity-70" />
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-primary transition line-clamp-1">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {post.content}
                    </p>
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
                  <div className="md:w-52 flex-shrink-0 space-y-2">
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
                    <button
                      type="button"
                      className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm rounded-lg px-3 py-2 transition"
                    >
                      Xem chi tiết
                    </button>
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
                disabled={tutorStudentPostsLoading || pagination.page <= 1}
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
                disabled={
                  tutorStudentPostsLoading ||
                  pagination.page >= pagination.pages
                }
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

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardDocumentCheckIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
  DocumentTextIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CalendarIcon,
  EyeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import usePostStore from "../../../store/post.store";
import type { IPost, IPostReviewInput } from "../../../types";
import { toast } from "react-hot-toast";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const AdminPostReviewPage: React.FC = () => {
  const { posts, pagination, isLoading, fetchAllPostsForAdmin, reviewPost, deletePost } = usePostStore();
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<"approved" | "rejected" | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    status: "pending" as StatusFilter,
    studentId: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Load data on mount and when filters change
  useEffect(() => {
    fetchAllPostsForAdmin( 
      filters.status === "all" ? undefined : filters.status,
      currentPage,
    pageSize);
  }, [currentPage, filters.status, filters.studentId, fetchAllPostsForAdmin]);

  const handleReview = async () => {
    if (!selectedPost || !actionType) return;

    const reviewData: IPostReviewInput = { status: actionType };
    if (actionType === "rejected" && adminNote) {
      reviewData.admin_note = adminNote;
    }

    const success = await reviewPost(selectedPost.id, reviewData);
    if (success) {
      toast.success(`Bài đăng đã được ${actionType === "approved" ? "chấp thuận" : "từ chối"}.`);
      setSelectedPost(null);
      setAdminNote("");
      setShowModal(false);
      setActionType(null);
      fetchAllPostsForAdmin( 
        filters.status === "all" ? undefined : filters.status,
        currentPage,
        pageSize);
    } else {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: "pending", studentId: "", search: "" });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAction = (post: IPost, action: "approved" | "rejected") => {
    setSelectedPost(post);
    setActionType(action);
    setAdminNote("");
    setShowModal(true);
  };

  const handleDelete = async (post: IPost) => {
    const success = await deletePost(post.id);
    if (success) {
      toast.success("Bài đăng đã được xóa.");
      fetchAllPostsForAdmin( 
        filters.status === "all" ? undefined : filters.status,
        currentPage,
        pageSize);
    } else {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  // Filter posts based on search
  const filteredPosts = posts.filter((post) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      post.title?.toLowerCase().includes(searchLower) ||
      post.content?.toLowerCase().includes(searchLower) ||
      post.author_id.full_name?.toLowerCase().includes(searchLower) || // Sửa từ student.fullName
      post.id.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Đã từ chối";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ClipboardDocumentCheckIcon className="w-8 h-8 mr-3 text-orange-600" />
              Duyệt bài đăng
            </h1>
            <p className="text-gray-600 mt-1">Xem xét và phê duyệt các bài đăng của học viên</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => fetchAllPostsForAdmin(
                filters.status === "all" ? undefined : filters.status,
                currentPage,
                pageSize
              )}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span>Làm mới</span>
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-600">Tổng bài đăng chờ duyệt</p>
              <p className="text-2xl font-bold text-orange-600">
                {posts.filter((post) => post.status === "pending").length}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FunnelIcon className="w-5 h-5 mr-2" />
              Bộ lọc
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              <XMarkIcon className="w-4 h-4 mr-1" />
              Xóa bộ lọc
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tiêu đề, nội dung, tên học viên..."
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value as StatusFilter)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Đã từ chối</option>
                <option value="all">Tất cả</option>
              </select>
            </div>

            {/* Student ID Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Học viên</label>
              <input
                type="text"
                value={filters.studentId}
                onChange={(e) => handleFilterChange("studentId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập ID học viên..."
              />
            </div>

            {/* Results count */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600">Hiển thị {filteredPosts.length} kết quả</div>
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {posts.filter((p) => p.status === "pending").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-green-600">
                  {posts.filter((p) => p.status === "approved").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XMarkIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã từ chối</p>
                <p className="text-2xl font-bold text-red-600">
                  {posts.filter((p) => p.status === "rejected").length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Posts List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <ChatBubbleLeftRightIcon className="w-6 h-6 text-orange-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <UserIcon className="w-4 h-4" />
                              <span>{post.author_id.full_name || "Học viên"}</span> {/* Sửa từ student.fullName */}
                            </div>
                            <div className="flex items-center space-x-1">
                              <CalendarIcon className="w-4 h-4" />
                              <span>{new Date(post.created_at).toLocaleDateString("vi-VN")}</span> {/* Sửa từ createdAt */}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(post.status)}`}
                        >
                          {getStatusText(post.status)}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-700 line-clamp-3">{post.content}</p>
                      </div>

                      {post.admin_note && (
                        <div className="mb-4 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                          <p className="font-bold text-sm">Ghi chú của Admin:</p>
                          <p className="text-sm">{post.admin_note}</p>
                        </div>
                      )}
                    </div>

                    {post.status === "pending" && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>Chi tiết</span>
                        </button>
                        <button
                          onClick={() => handleDelete(post)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-1"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          <span>Xóa</span>
                        </button>
                        <button
                          onClick={() => handleAction(post, "approved")}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-1"
                        >
                          <CheckIcon className="w-4 h-4" />
                          <span>Duyệt</span>
                        </button>
                        <button
                          onClick={() => handleAction(post, "rejected")}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-1"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          <span>Từ chối</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardDocumentCheckIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Không có bài đăng nào</p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị {(currentPage - 1) * pageSize + 1} đến{" "}
                  {Math.min(currentPage * pageSize, pagination.total)} trong tổng số{" "}
                  {pagination.total} kết quả
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter((page) => page === 1 || page === pagination.pages || Math.abs(page - currentPage) <= 2)
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 text-sm rounded-lg ${
                            page === currentPage ? "bg-orange-600 text-white" : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Modal for post detail and action confirmation */}
        {showModal && selectedPost && actionType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4"
            >
              <h3 className="text-lg font-semibold mb-4">
                {actionType === "approved" ? "Duyệt bài đăng" : "Từ chối bài đăng"}
              </h3>
              <div className="mb-4">
                <h4 className="font-medium text-gray-900">Tiêu đề:</h4>
                <p className="text-gray-700">{selectedPost.title}</p>
              </div>
              <div className="mb-4">
                <h4 className="font-medium text-gray-900">Nội dung:</h4>
                <p className="text-gray-700">{selectedPost.content}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú {actionType === "rejected" ? "(bắt buộc)" : "(tùy chọn)"}
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={
                    actionType === "approved"
                      ? "Ghi chú thêm về việc duyệt..."
                      : "Lý do từ chối (bắt buộc)..."
                  }
                />
              </div>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReview}
                  disabled={actionType === "rejected" && !adminNote.trim()}
                  className={`px-4 py-2 text-sm text-white rounded-lg ${
                    actionType === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {actionType === "approved" ? "Duyệt" : "Từ chối"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal for viewing post details */}
        {selectedPost && !actionType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">Chi tiết bài đăng</h3>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(selectedPost.status)}`}
                  >
                    {getStatusText(selectedPost.status)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Đăng ngày {new Date(selectedPost.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{selectedPost.title}</h4>
                <p className="text-gray-700 whitespace-pre-wrap mb-4">{selectedPost.content}</p>
              </div>

              <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Thông tin học viên:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Tên:</span> {selectedPost.author_id.full_name || "Không có thông tin"}
                  </div>
                  <div>
                    <span className="font-medium">ID:</span> {selectedPost.author_id._id || "Không có thông tin"}
                  </div>
                </div>
              </div>

              {selectedPost.admin_note && (
                <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                  <p className="font-bold">Ghi chú của Admin:</p>
                  <p>{selectedPost.admin_note}</p>
                </div>
              )}

              {selectedPost.status === "pending" && (
                <div className="flex space-x-3 justify-end mt-4">
                  <button
                    onClick={() => handleAction(selectedPost, "approved")}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-1"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>Duyệt</span>
                  </button>
                  <button
                    onClick={() => handleAction(selectedPost, "rejected")}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-1"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Từ chối</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminPostReviewPage;
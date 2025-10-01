import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTutorPostStore } from "../../store/tutorPost.store";
import toast from "react-hot-toast";

const TutorPostListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    myPosts,
    pagination,
    getMyTutorPosts,
    activatePost,
    deactivatePost,
    deleteTutorPost,
    isLoading,
  } = useTutorPostStore();

  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getMyTutorPosts(currentPage, 10);
  }, [currentPage, getMyTutorPosts]);

  // Show success message if redirected from create/edit
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      // Clear the message from location state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const handleCreateNew = () => {
    navigate("/tutor/posts/create");
  };

  const handleEdit = (postId: string) => {
    navigate(`/tutor/posts/edit/${postId}`);
  };

  const handleView = (postId: string) => {
    navigate(`/tutors/${postId}`);
  };

  const handleActivate = async (postId: string) => {
    try {
      await activatePost(postId);
      toast.success("Kích hoạt bài đăng thành công");
      getMyTutorPosts(currentPage, 10); // Refresh list
    } catch (error) {
      toast.error("Có lỗi xảy ra khi kích hoạt bài đăng");
    }
  };

  const handleDeactivate = async (postId: string) => {
    try {
      await deactivatePost(postId);
      toast.success("Tạm dừng bài đăng thành công");
      getMyTutorPosts(currentPage, 10); // Refresh list
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạm dừng bài đăng");
    }
  };

  const handleDelete = (postId: string) => {
    setSelectedPost(postId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedPost) return;

    try {
      await deleteTutorPost(selectedPost);
      toast.success("Xóa bài đăng thành công");
      setShowDeleteModal(false);
      setSelectedPost(null);
      getMyTutorPosts(currentPage, 10); // Refresh list
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa bài đăng");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Đang hoạt động";
      case "PENDING":
        return "Chờ duyệt";
      case "INACTIVE":
        return "Tạm dừng";
      default:
        return "Không xác định";
    }
  };

  const PostActionsDropdown = ({ post }: { post: any }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
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
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
              <div className="py-1">
                <button
                  onClick={() => {
                    handleView(post._id);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Xem chi tiết
                </button>

                <button
                  onClick={() => {
                    handleEdit(post._id);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Chỉnh sửa
                </button>

                {post.status === "ACTIVE" ? (
                  <button
                    onClick={() => {
                      handleDeactivate(post._id);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-gray-100"
                  >
                    Tạm dừng
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleActivate(post._id);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                  >
                    Kích hoạt
                  </button>
                )}

                <div className="border-t border-gray-100">
                  <button
                    onClick={() => {
                      handleDelete(post._id);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Xóa bài đăng
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const DeleteConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Xác nhận xóa bài đăng
          </h3>

          <p className="text-sm text-gray-600 mb-6">
            Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn
            tác.
          </p>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedPost(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const PaginationComponent = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Hiển thị {(pagination.currentPage - 1) * 10 + 1} -{" "}
          {Math.min(pagination.currentPage * 10, pagination.totalItems)} trong{" "}
          {pagination.totalItems} bài đăng
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!pagination.hasPrev || isLoading}
            className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>

          <span className="px-3 py-2 text-sm text-gray-700">
            {pagination.currentPage} / {pagination.totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!pagination.hasNext || isLoading}
            className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <nav className="flex text-sm text-gray-500 mb-4">
              <button
                onClick={() => navigate("/tutor/dashboard")}
                className="hover:text-gray-700"
              >
                Dashboard
              </button>
              <span className="mx-2">/</span>
              <span className="text-gray-900">Quản lý bài đăng</span>
            </nav>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Quản lý bài đăng
                </h1>
                <p className="mt-2 text-gray-600">
                  Tạo và quản lý các bài đăng gia sư của bạn để thu hút học
                  viên.
                </p>
              </div>

              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Tạo bài đăng mới
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-2xl font-bold text-gray-900">
                {myPosts.length}
              </div>
              <div className="text-sm text-gray-600">Tổng bài đăng</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-2xl font-bold text-green-600">
                {myPosts.filter((p) => p.status === "ACTIVE").length}
              </div>
              <div className="text-sm text-gray-600">Đang hoạt động</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-2xl font-bold text-yellow-600">
                {myPosts.filter((p) => p.status === "PENDING").length}
              </div>
              <div className="text-sm text-gray-600">Chờ duyệt</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-2xl font-bold text-blue-600">
                {myPosts.reduce((sum, post) => sum + post.viewCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Tổng lượt xem</div>
            </div>
          </div>

          {/* Posts List */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : myPosts.length === 0 ? (
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có bài đăng nào
              </h3>
              <p className="text-gray-500 mb-4">
                Tạo bài đăng đầu tiên để bắt đầu thu hút học viên
              </p>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tạo bài đăng mới
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {myPosts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                              {post.title}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                post.status
                              )}`}
                            >
                              {getStatusText(post.status)}
                            </span>
                          </div>

                          <p className="text-gray-600 line-clamp-2 mb-4">
                            {post.description}
                          </p>

                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              {post.viewCount} lượt xem
                            </div>
                            <div className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              {post.contactCount} liên hệ
                            </div>
                            <div>
                              Tạo:{" "}
                              {new Date(post.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                          </div>
                        </div>

                        <PostActionsDropdown post={post} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <PaginationComponent />
            </>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && <DeleteConfirmModal />}
    </div>
  );
};

export default TutorPostListPage;

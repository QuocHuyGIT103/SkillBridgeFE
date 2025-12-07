import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTutorPostStore } from "../../store/tutorPost.store";
import toast from "react-hot-toast";
import DashboardStats from "../../components/dashboard/DashboardStats";
import type { StatItem } from "../../components/dashboard/DashboardStats";
import { DocumentTextIcon, CheckCircleIcon, ClockIcon, EyeIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

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
    if (postId && postId !== "undefined") {
      navigate(`/tutor/posts/edit/${postId}`);
    } else {
      toast.error("Không tìm thấy ID bài đăng");
    }
  };

  const handleView = (postId: string) => {
    if (postId && postId !== "undefined") {
      navigate(`/tutors/${postId}`);
    } else {
      toast.error("Không tìm thấy ID bài đăng");
    }
  };

  const handleActivate = async (postId: string) => {
    if (!postId || postId === "undefined") {
      toast.error("Không tìm thấy ID bài đăng");
      return;
    }

    try {
      await activatePost(postId);
      toast.success("Kích hoạt bài đăng thành công");
      getMyTutorPosts(currentPage, 10); // Refresh list
    } catch (error) {
      toast.error("Có lỗi xảy ra khi kích hoạt bài đăng");
    }
  };

  const handleDeactivate = async (postId: string) => {
    if (!postId || postId === "undefined") {
      toast.error("Không tìm thấy ID bài đăng");
      return;
    }

    try {
      await deactivatePost(postId);
      toast.success("Tạm dừng bài đăng thành công");
      getMyTutorPosts(currentPage, 10); // Refresh list
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạm dừng bài đăng");
    }
  };

  const handleDelete = (postId: string) => {
    if (!postId || postId === "undefined") {
      toast.error("Không tìm thấy ID bài đăng");
      return;
    }

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
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "INACTIVE":
        return "bg-slate-50 text-slate-600 border border-slate-200";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-200";
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
                    handleView(post.id);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Xem chi tiết
                </button>

                <button
                  onClick={() => {
                    handleEdit(post.id);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Chỉnh sửa
                </button>

                {post.status === "ACTIVE" ? (
                  <button
                    onClick={() => {
                      handleDeactivate(post.id);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-gray-100"
                  >
                    Tạm dừng
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleActivate(post.id);
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
                      handleDelete(post.id);
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
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Quản lý bài đăng
                </h1>
                <p className="mt-2 text-gray-600">
                  Tạo và quản lý các bài đăng gia sư của bạn để thu hút học
                  viên.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center shadow-md hover:shadow-lg transition-all"
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
          </div>

          {/* Dashboard Stats */}
          <DashboardStats
            title="Tổng quan bài đăng"
            description="Thống kê tổng quan về các bài đăng gia sư của bạn"
            stats={[
              {
                label: "Tổng bài đăng",
                value: myPosts.length,
                icon: DocumentTextIcon,
                color: "blue",
                description: `${pagination?.totalItems || 0} bài đăng tổng cộng`,
              },
              {
                label: "Đang hoạt động",
                value: myPosts.filter((p) => p.status === "ACTIVE").length,
                icon: CheckCircleIcon,
                color: "green",
                description: "Bài đăng đang hiển thị",
              },
              {
                label: "Chờ duyệt",
                value: myPosts.filter((p) => p.status === "PENDING").length,
                icon: ClockIcon,
                color: "yellow",
                description: "Đang chờ phê duyệt",
              },
              {
                label: "Tổng lượt xem",
                value: myPosts.reduce((sum, post) => sum + (post.viewCount || 0), 0).toLocaleString('vi-VN'),
                icon: EyeIcon,
                color: "purple",
                description: "Lượt xem tất cả bài đăng",
              },
            ]}
            className="mb-8"
          />

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
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {myPosts.map((post, index) => (
                  <div
                    key={post.id || `post-${index}`}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:border-blue-300 group"
                  >
                    {/* Status Banner */}
                    <div className={`h-1.5 ${post.status === 'ACTIVE' ? 'bg-gradient-to-r from-green-400 to-emerald-500' : post.status === 'PENDING' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`} />
                    
                    <div className="p-5">
                      {/* Header with Title and Status */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${getStatusColor(
                                post.status
                              )}`}
                            >
                              {getStatusText(post.status)}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {post.title}
                          </h3>
                        </div>
                        <PostActionsDropdown post={post} />
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 line-clamp-2 mb-4 text-sm leading-relaxed">
                        {post.description}
                      </p>

                      {/* Post Details Grid */}
                      <div className="space-y-3 mb-4 pb-4 border-b border-gray-100">
                        {/* Subjects */}
                        {post.subjects && post.subjects.length > 0 && (
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 mb-1">Môn học</p>
                              <div className="flex flex-wrap gap-1">
                                {post.subjects.slice(0, 3).map((subject: any, idx: number) => (
                                  <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">
                                    {subject.name}
                                  </span>
                                ))}
                                {post.subjects.length > 3 && (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                                    +{post.subjects.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Price and Duration */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2.5 border border-green-200">
                            <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600">Giá/buổi</p>
                              <p className="text-sm font-bold text-green-700">{(post.pricePerSession || 0).toLocaleString('vi-VN')}đ</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2.5 border border-purple-200">
                            <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600">Thời lượng</p>
                              <p className="text-sm font-bold text-purple-700">{post.sessionDuration || 0} phút</p>
                            </div>
                          </div>
                        </div>

                        {/* Teaching Mode */}
                        {post.teachingMode && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-700">
                              {post.teachingMode === 'ONLINE' ? '💻 Trực tuyến' : post.teachingMode === 'OFFLINE' ? '🏠 Tại nhà' : '🔄 Linh hoạt'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleView(post.id)}
                          className="px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:shadow-sm transition-all flex items-center justify-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Xem</span>
                        </button>
                        <button
                          onClick={() => handleEdit(post.id)}
                          className="px-3 py-2 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 hover:shadow-sm transition-all flex items-center justify-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Sửa</span>
                        </button>
                        <Link
                          to={`/tutor/ai-recommendations?tutorPostId=${post.id || post._id}`}
                          className="px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 hover:shadow-md transition-all flex items-center justify-center gap-1 shadow-sm"
                        >
                          <SparklesIcon className="w-3.5 h-3.5" />
                          <span>AI</span>
                        </Link>
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

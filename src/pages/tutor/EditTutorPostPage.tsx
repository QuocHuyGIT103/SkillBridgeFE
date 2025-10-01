import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorPostForm from "../../components/tutorPost/TutorPostForm";
import { useTutorPostStore } from "../../store/tutorPost.store";
import toast from "react-hot-toast";

const EditTutorPostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { currentPost, getTutorPostById } = useTutorPostStore();
  const [isLoadingPost, setIsLoadingPost] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        navigate("/tutor/posts");
        return;
      }

      try {
        await getTutorPostById(postId);
        setIsLoadingPost(false);
      } catch (error) {
        toast.error("Không tìm thấy bài đăng");
        navigate("/tutor/posts");
      }
    };

    fetchPost();
  }, [postId, getTutorPostById, navigate]);

  const handleSuccess = () => {
    navigate("/tutor/posts", {
      replace: true,
      state: { message: "Cập nhật bài đăng thành công!" },
    });
  };

  const handleCancel = () => {
    navigate("/tutor/posts");
  };

  if (isLoadingPost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài đăng...</p>
        </div>
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy bài đăng
          </h2>
          <button
            onClick={() => navigate("/tutor/posts")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

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
              <button
                onClick={() => navigate("/tutor/posts")}
                className="hover:text-gray-700"
              >
                Quản lý bài đăng
              </button>
              <span className="mx-2">/</span>
              <span className="text-gray-900">Chỉnh sửa bài đăng</span>
            </nav>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Chỉnh sửa bài đăng
                </h1>
                <p className="mt-2 text-gray-600">
                  Cập nhật thông tin bài đăng để thu hút học viên phù hợp hơn.
                </p>
              </div>

              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Hủy
              </button>
            </div>
          </div>

          {/* Form */}
          <TutorPostForm
            mode="edit"
            tutorPost={currentPost}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default EditTutorPostPage;

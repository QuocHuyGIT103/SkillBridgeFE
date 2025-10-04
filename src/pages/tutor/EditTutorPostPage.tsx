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
      if (!postId || postId === "undefined") {
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

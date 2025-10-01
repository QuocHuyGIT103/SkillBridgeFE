import React, { useState, useEffect } from "react";
import TutorPostForm from "../../components/tutorPost/TutorPostForm";
import TutorPostEligibilityCheck, {
  getMockEligibilityData,
} from "../../components/tutorPost/TutorPostEligibilityCheck";
import { useNavigate } from "react-router-dom";

const CreateTutorPostPage: React.FC = () => {
  const navigate = useNavigate();
  const [showEligibilityCheck, setShowEligibilityCheck] = useState(true);
  const [eligibilityData, setEligibilityData] = useState<{
    isEligible: boolean;
    requirements: Array<{
      id: string;
      title: string;
      description: string;
      status: "completed" | "pending" | "missing";
      actionText?: string;
      actionPath?: string;
    }>;
  } | null>(null);

  useEffect(() => {
    // Load eligibility data when component mounts
    const data = getMockEligibilityData();
    setEligibilityData(data);

    // If eligible, can skip the check
    if (data.isEligible) {
      setShowEligibilityCheck(false);
    }
  }, []);

  const handleSuccess = () => {
    navigate("/tutor/posts", {
      replace: true,
      state: { message: "Tạo bài đăng thành công!" },
    });
  };

  const handleCancel = () => {
    navigate("/tutor/posts");
  };

  const handleProceedToCreate = () => {
    setShowEligibilityCheck(false);
  };

  // Show eligibility check modal if needed
  if (showEligibilityCheck && eligibilityData) {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Tạo bài đăng mới
                </h1>
                <p className="text-gray-600">
                  Đang kiểm tra điều kiện đủ để tạo bài đăng...
                </p>
              </div>
            </div>
          </div>
        </div>

        <TutorPostEligibilityCheck
          isEligible={eligibilityData.isEligible}
          requirements={eligibilityData.requirements}
          onClose={() => navigate("/tutor/posts")}
          onProceed={handleProceedToCreate}
        />
      </>
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
              <span className="text-gray-900">Tạo bài đăng mới</span>
            </nav>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Tạo bài đăng mới
                </h1>
                <p className="mt-2 text-gray-600">
                  Tạo một bài đăng để thu hút học viên phù hợp với khả năng
                  giảng dạy của bạn.
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

          {/* Eligibility Warning */}
          {eligibilityData && !eligibilityData.isEligible && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Lưu ý về điều kiện đăng bài
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Một số yêu cầu chưa được hoàn thành. Bạn vẫn có thể tạo bài
                    đăng nhưng nó sẽ ở trạng thái "Chờ duyệt" cho đến khi các
                    yêu cầu được đáp ứng.
                  </p>
                  <button
                    onClick={() => setShowEligibilityCheck(true)}
                    className="mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                  >
                    Xem chi tiết yêu cầu
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <TutorPostForm
            mode="create"
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateTutorPostPage;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTutorPostStore } from "../../store/tutorPost.store";
import { useAuthStore } from "../../store/auth.store";
import {
  formatShortAddress,
  formatAddressDisplay,
} from "../../utils/addressUtils";
import toast from "react-hot-toast";

const TutorPostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { currentPost, getTutorPostById, incrementContactCount, isLoading } =
    useTutorPostStore();
  const { user, isAuthenticated } = useAuthStore();
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (postId) {
      getTutorPostById(postId);
    }
  }, [postId, getTutorPostById]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
            onClick={() => navigate("/tutors")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDayName = (dayOfWeek: number): string => {
    const days = [
      "Chủ nhật",
      "Thứ hai",
      "Thứ ba",
      "Thứ tư",
      "Thứ năm",
      "Thứ sáu",
      "Thứ bảy",
    ];
    return days[dayOfWeek];
  };

  const getLocationText = () => {
    if (currentPost.teachingMode === "ONLINE") return "Trực tuyến";
    if (currentPost.teachingMode === "OFFLINE" && currentPost.address) {
      return formatShortAddress(currentPost.address);
    }
    if (currentPost.teachingMode === "BOTH") return "Cả hai hình thức";
    return "Linh hoạt";
  };

  const handleContactClick = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để liên hệ với gia sư");
      navigate("/auth/login");
      return;
    }

    if (user?.role === "TUTOR" && user?.id === currentPost.tutorId._id) {
      toast.error("Bạn không thể liên hệ với chính mình");
      return;
    }

    try {
      await incrementContactCount(currentPost._id);
      setShowContactModal(true);
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const ContactModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Thông tin liên hệ</h3>

        <div className="space-y-3 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Tên gia sư:
            </label>
            <p className="text-gray-900">{currentPost.tutorId.name}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email:</label>
            {isAuthenticated && currentPost.tutorId.email ? (
              <p className="text-gray-900">{currentPost.tutorId.email}</p>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="w-2 h-3 bg-gray-300 rounded"></div>
                  ))}
                </div>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            {!isAuthenticated && (
              <p className="text-xs text-gray-500 mt-1">
                Đăng nhập để xem email liên hệ
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Môn dạy:
            </label>
            <p className="text-gray-900">
              {currentPost.subjects
                .map((s) => (typeof s === "string" ? s : s.name))
                .join(", ")}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Học phí:
            </label>
            <p className="text-gray-900">
              {formatPrice(currentPost.pricePerSession)}/
              {currentPost.sessionDuration} phút
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowContactModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Đóng
          </button>

          {isAuthenticated && currentPost.tutorId.email && (
            <a
              href={`mailto:${currentPost.tutorId.email}?subject=Liên hệ về bài đăng: ${currentPost.title}`}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
            >
              Gửi Email
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 flex-1 mr-4">
                  {currentPost.title}
                </h1>
                <span
                  className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${
                    currentPost.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : currentPost.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }
                `}
                >
                  {currentPost.status === "ACTIVE"
                    ? "Đang hoạt động"
                    : currentPost.status === "PENDING"
                    ? "Chờ duyệt"
                    : "Tạm dừng"}
                </span>
              </div>

              {/* Tutor Info */}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {currentPost.tutorId.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">
                    {currentPost.tutorId.name}
                  </h3>
                  {currentPost.tutorId.gender && (
                    <p className="text-sm text-gray-500">
                      {currentPost.tutorId.gender === "male" ? "Nam" : "Nữ"}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
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
                  {currentPost.viewCount} lượt xem
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
                  {currentPost.contactCount} liên hệ
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Mô tả
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="whitespace-pre-line text-gray-700">
                  {currentPost.description}
                </p>
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Kinh nghiệm
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="whitespace-pre-line text-gray-700">
                  {currentPost.experience}
                </p>
              </div>
            </div>

            {/* Video Introduction */}
            {currentPost.videoIntroUrl && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Video giới thiệu
                </h2>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={currentPost.videoIntroUrl}
                    title="Video giới thiệu"
                    className="w-full h-64 rounded-lg"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Achievements & Certifications - Only show when logged in */}
            {isAuthenticated && (
              <>
                {/* Achievements Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Thành tích
                    </h2>
                    {!isAuthenticated && (
                      <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Đăng nhập để xem chi tiết
                      </div>
                    )}
                  </div>

                  {isAuthenticated ? (
                    <div className="space-y-4">
                      {/* Mock achievements - Replace with real data */}
                      <div className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-8 h-8 text-yellow-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900">
                                Giải nhất Olympic Toán học
                              </h3>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Quốc gia
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Đại học Bách Khoa Hà Nội • 2023
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              Giải nhất cuộc thi Olympic Toán học cấp quốc gia
                              dành cho sinh viên
                            </p>

                            {/* Image only visible to post owner and admin */}
                            {(user?.id === currentPost.tutorId._id ||
                              user?.role === "ADMIN") && (
                              <div className="mt-3">
                                <img
                                  src="/placeholder-certificate.jpg"
                                  alt="Chứng nhận thành tích"
                                  className="w-32 h-24 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80"
                                  onClick={() => {
                                    /* Open full image modal */
                                  }}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Chỉ bạn và quản trị viên có thể xem hình ảnh
                                  này
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">
                          {user?.id === currentPost.tutorId._id
                            ? "Bạn có thể thêm thành tích khác trong phần quản lý hồ sơ"
                            : "Gia sư này có 1 thành tích đã được xác thực"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Thông tin bảo mật
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Đăng nhập để xem thành tích của gia sư
                      </p>
                    </div>
                  )}
                </div>

                {/* Certificates Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Chứng chỉ
                    </h2>
                    {!isAuthenticated && (
                      <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Đăng nhập để xem chi tiết
                      </div>
                    )}
                  </div>

                  {isAuthenticated ? (
                    <div className="space-y-4">
                      {/* Mock certificates - Replace with real data */}
                      <div className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-8 h-8 text-green-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900">
                                Chứng chỉ Sư phạm Toán học
                              </h3>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Đã xác thực
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Trường Đại học Sư phạm Hà Nội • Cấp: 15/06/2022
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              Chứng chỉ nghiệp vụ sư phạm chuyên ngành Toán học
                            </p>

                            {/* Image only visible to post owner and admin */}
                            {(user?.id === currentPost.tutorId._id ||
                              user?.role === "ADMIN") && (
                              <div className="mt-3">
                                <img
                                  src="/placeholder-certificate.jpg"
                                  alt="Chứng chỉ"
                                  className="w-32 h-24 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80"
                                  onClick={() => {
                                    /* Open full image modal */
                                  }}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Chỉ bạn và quản trị viên có thể xem hình ảnh
                                  này
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">
                          {user?.id === currentPost.tutorId._id
                            ? "Bạn có thể thêm chứng chỉ khác trong phần quản lý hồ sơ"
                            : "Gia sư này có 1 chứng chỉ đã được xác thực"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Thông tin bảo mật
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Đăng nhập để xem chứng chỉ của gia sư
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price & Contact */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {formatPrice(currentPost.pricePerSession)}
                </div>
                <div className="text-sm text-gray-500">
                  /{currentPost.sessionDuration} phút
                </div>
              </div>

              <button
                onClick={handleContactClick}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Liên hệ gia sư
              </button>

              <div className="text-xs text-gray-500 text-center mt-3 space-y-1">
                <p>
                  {isAuthenticated
                    ? "Click để xem thông tin liên hệ"
                    : "Đăng nhập để xem thông tin liên hệ"}
                </p>
                {!isAuthenticated && (
                  <div className="flex items-center justify-center space-x-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Thông tin được bảo vệ</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Thông tin nhanh
              </h3>

              <div className="space-y-4">
                {/* Subjects */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Môn học:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentPost.subjects.map((subject, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded"
                      >
                        {typeof subject === "string" ? subject : subject.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Student Levels */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Đối tượng:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentPost.studentLevel.map((level, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-50 text-green-700 text-sm rounded"
                      >
                        {level}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Teaching Mode */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Hình thức:
                  </label>
                  <span
                    className={`
                    px-3 py-1 rounded text-sm
                    ${
                      currentPost.teachingMode === "ONLINE"
                        ? "bg-green-100 text-green-800"
                        : currentPost.teachingMode === "OFFLINE"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }
                  `}
                  >
                    {getLocationText()}
                  </span>
                </div>

                {/* Location */}
                {currentPost.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Địa điểm:
                    </label>
                    <p className="text-gray-900 text-sm">
                      {isAuthenticated
                        ? formatAddressDisplay(currentPost.address, true)
                        : formatShortAddress(currentPost.address)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Lịch dạy</h3>

              {currentPost.teachingSchedule.length > 0 ? (
                <div className="space-y-3">
                  {currentPost.teachingSchedule
                    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                    .map((slot, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <span className="font-medium text-gray-700 text-sm">
                          {getDayName(slot.dayOfWeek)}
                        </span>
                        <span className="text-gray-900 text-sm font-mono">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Chưa có lịch dạy cố định
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && <ContactModal />}
    </div>
  );
};

export default TutorPostDetail;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { useTutorPostStore } from "../../store/tutorPost.store";
import { useAuthStore } from "../../store/auth.store";
import toast from "react-hot-toast";
import {
  formatShortAddress,
  formatAddressDisplay,
} from "../../utils/addressUtils";
import {
  translateStudentLevel,
  translateEducationLevel,
  translateVerificationStatus,
} from "../../utils/enumTranslations";

interface TutorPostDetailProps {
  onContactClick?: () => void;
  canSendRequest?: boolean;
}

const TutorPostDetail: React.FC<TutorPostDetailProps> = ({
  onContactClick,
  canSendRequest = false,
}) => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { currentPost, getTutorPostById, incrementContactCount, isLoading } =
    useTutorPostStore();
  const { user, isAuthenticated } = useAuthStore();
  const [showContactModal, setShowContactModal] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    if (postId && postId !== "undefined") {
      getTutorPostById(postId);
    } else {
      // Redirect to tutors list if no valid postId
      navigate("/tutors");
    }
  }, [postId, getTutorPostById, navigate]);

  // Check if current user is the tutor of this post
  const isOwnPost = currentPost && user?.id === currentPost.tutorId._id;

  // Mark as viewed after a delay to prevent multiple increments
  useEffect(() => {
    if (currentPost && isAuthenticated && !isOwnPost && !hasViewed) {
      const timer = setTimeout(() => {
        setHasViewed(true);
      }, 2000); // Wait 2 seconds before marking as viewed

      return () => clearTimeout(timer);
    }
  }, [currentPost, isAuthenticated, isOwnPost, hasViewed]);

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

  // ✅ FIX: Thêm kiểm tra `currentPost`
  const getLocationText = () => {
    if (!currentPost) return "Linh hoạt"; // Guard clause
    if (currentPost.teachingMode === "ONLINE") return "Trực tuyến";
    if (currentPost.teachingMode === "OFFLINE" && currentPost.address) {
      return "Tại nhà";
    }
    if (currentPost.teachingMode === "BOTH") return "Cả hai hình thức";
    return "Linh hoạt";
  };

  const handleContactClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để liên hệ với gia sư");
      navigate("/auth/login");
      return;
    }

    if (user?.role !== "STUDENT") {
      toast.error("Chỉ học viên mới có thể gửi yêu cầu học tập");
      return;
    }

    if (user?.id === currentPost?.tutorId._id) {
      toast.error("Bạn không thể gửi yêu cầu đến chính mình");
      return;
    }

    // Use the new contact request flow
    if (onContactClick) {
      onContactClick();
    } else {
      // Fallback to old contact modal
      if (!currentPost) return; // Guard clause
      try {
        await incrementContactCount(currentPost._id || currentPost.id || "");
        setShowContactModal(true);
      } catch (error) {
        toast.error("Có lỗi xảy ra, vui lòng thử lại");
      }
    }
  };

  const ContactModal = () => {
    // ✅ FIX: Thêm kiểm tra `currentPost` ở đầu component
    if (!currentPost) {
      return null; // Không render gì cả nếu không có post
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Thông tin liên hệ</h3>

          <div className="space-y-3 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Tên gia sư:
              </label>
              <p className="text-gray-900">
                {currentPost.tutorId.full_name || "Gia sư"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Email:
              </label>
              {isAuthenticated && currentPost.tutorId.email ? (
                <p className="text-gray-900">{currentPost.tutorId.email}</p>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-3 bg-gray-300 rounded"
                      ></div>
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
  };

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

  // Từ đây trở xuống, `currentPost` chắc chắn không phải là null
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
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

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-4 space-y-8">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-start justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex-1 mr-6 leading-tight">
                  {currentPost.title}
                </h1>
                <span
                  className={`
                  px-4 py-2 rounded-full text-sm font-semibold
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

              {/* Stats */}
              <div className="flex items-center space-x-8 text-base text-gray-600">
                <div className="flex items-center">
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span className="font-medium">
                    {currentPost.viewCount} lượt xem
                    {isOwnPost && (
                      <span className="text-xs text-gray-500 ml-1">
                        (không tính lượt xem của bạn)
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center">
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="font-medium">
                    {currentPost.contactCount} liên hệ
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Mô tả bài học
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="whitespace-pre-line text-gray-700 text-lg leading-relaxed">
                  {currentPost.description}
                </p>
              </div>
            </div>

            {/* Tutor Detailed Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Thông tin gia sư
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  {/* Avatar and Basic Info */}
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center shadow-sm">
                      {currentPost.tutorId.avatar_url ? (
                        <img
                          src={currentPost.tutorId.avatar_url}
                          alt="Avatar"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-medium text-2xl">
                          {(
                            currentPost.tutorId.full_name ||
                            currentPost.tutorId._id ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {currentPost.tutorId.full_name || "Gia sư"}
                      </h3>
                      <div className="space-y-1">
                        {currentPost.tutorId.gender && (
                          <p className="text-base text-gray-600">
                            <span className="font-medium">Giới tính:</span>{" "}
                            {currentPost.tutorId.gender === "male"
                              ? "Nam"
                              : "Nữ"}
                          </p>
                        )}
                        {currentPost.tutorId.structured_address
                          ?.province_name && (
                          <p className="text-base text-gray-600">
                            <span className="font-medium">Đến từ:</span>{" "}
                            {
                              currentPost.tutorId.structured_address
                                .province_name
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profile Information */}
                  {currentPost.tutorId.profile && (
                    <div className="space-y-3">
                      {currentPost.tutorId.profile.headline && (
                        <div>
                          <label className="text-base font-semibold text-gray-800">
                            Tiêu đề:
                          </label>
                          <p className="text-gray-900 text-base mt-1 text-justify">
                            {currentPost.tutorId.profile.headline}
                          </p>
                        </div>
                      )}

                      {currentPost.tutorId.profile.introduction && (
                        <div>
                          <label className="text-base font-semibold text-gray-800">
                            Giới thiệu:
                          </label>
                          <p className="text-gray-900 text-base mt-1 whitespace-pre-line text-justify">
                            {currentPost.tutorId.profile.introduction}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column - Professional Info */}
                <div className="space-y-4">
                  {/* Teaching Experience */}
                  {currentPost.tutorId.profile?.teaching_experience && (
                    <div>
                      <label className="text-base font-semibold text-gray-800">
                        Kinh nghiệm giảng dạy:
                      </label>
                      <p className="text-gray-900 text-base mt-1 whitespace-pre-line text-justify">
                        {currentPost.tutorId.profile.teaching_experience}
                      </p>
                    </div>
                  )}

                  {/* Student Levels */}
                  {currentPost.tutorId.profile?.student_levels && (
                    <div>
                      <label className="text-base font-semibold text-gray-800">
                        Trình độ học viên phù hợp:
                      </label>
                      <p className="text-gray-900 text-base mt-1">
                        {currentPost.tutorId.profile.student_levels}
                      </p>
                    </div>
                  )}

                  {/* Video Introduction */}
                  {currentPost.tutorId.profile?.video_intro_link && (
                    <div>
                      <label className="text-base font-semibold text-gray-800">
                        Video giới thiệu:
                      </label>
                      <div className="mt-2">
                        <iframe
                          src={currentPost.tutorId.profile.video_intro_link}
                          title="Video giới thiệu"
                          className="w-full h-48 rounded-lg"
                          frameBorder="0"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Education Section */}
            {currentPost.tutorId.education &&
              currentPost.tutorId.education.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Trình độ học vấn
                  </h2>
                  <div className="space-y-6">
                    {currentPost.tutorId.education.map((edu) => (
                      <div
                        key={edu._id}
                        className="border border-gray-200 rounded-xl p-6 shadow-sm bg-gray-50"
                      >
                        <div className="flex items-start space-x-6">
                          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <svg
                              className="w-6 h-6 text-blue-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 14l9-5-9-5-9 5 9 5z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-bold text-gray-900">
                                {translateEducationLevel(edu.level)}
                              </h3>
                              <span
                                className={`text-sm px-3 py-1 rounded-full font-medium ${
                                  edu.status === "VERIFIED"
                                    ? "bg-green-100 text-green-800"
                                    : edu.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {translateVerificationStatus(edu.status)}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <p className="text-base text-gray-700">
                                <span className="font-semibold">Trường:</span>{" "}
                                {edu.school}
                              </p>
                              <p className="text-base text-gray-700">
                                <span className="font-semibold">
                                  Chuyên ngành:
                                </span>{" "}
                                {edu.major}
                              </p>
                              <p className="text-base text-gray-700">
                                <span className="font-semibold">
                                  Thời gian học:
                                </span>{" "}
                                {edu.startYear} - {edu.endYear}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Certificates Section */}
            {currentPost.tutorId.certificates &&
              currentPost.tutorId.certificates.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Chứng chỉ
                  </h2>
                  <div className="space-y-6">
                    {currentPost.tutorId.certificates.map((cert) => (
                      <div
                        key={cert._id}
                        className="border border-gray-200 rounded-xl p-6 shadow-sm bg-gray-50"
                      >
                        <div className="flex items-start space-x-6">
                          <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <svg
                              className="w-6 h-6 text-green-600"
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
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-bold text-gray-900">
                                {cert.name}
                              </h3>
                              <span
                                className={`text-sm px-3 py-1 rounded-full font-medium ${
                                  cert.status === "VERIFIED"
                                    ? "bg-green-100 text-green-800"
                                    : cert.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {cert.status === "VERIFIED"
                                  ? "Đã xác thực"
                                  : cert.status === "PENDING"
                                  ? "Chờ xác thực"
                                  : "Chưa xác thực"}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <p className="text-base text-gray-700">
                                <span className="font-semibold">
                                  Tổ chức cấp:
                                </span>{" "}
                                {cert.issuingOrganization}
                              </p>
                              <p className="text-base text-gray-700">
                                <span className="font-semibold">Ngày cấp:</span>{" "}
                                {new Date(cert.issueDate).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Achievements Section */}
            {currentPost.tutorId.achievements &&
              currentPost.tutorId.achievements.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Thành tích
                  </h2>
                  <div className="space-y-6">
                    {currentPost.tutorId.achievements.map((achievement) => (
                      <div
                        key={achievement._id}
                        className="border border-gray-200 rounded-xl p-6 shadow-sm bg-gray-50"
                      >
                        <div className="flex items-start space-x-6">
                          <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <svg
                              className="w-6 h-6 text-yellow-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-bold text-gray-900">
                                {achievement.name}
                              </h3>
                              <span
                                className={`text-sm px-3 py-1 rounded-full font-medium ${
                                  achievement.status === "VERIFIED"
                                    ? "bg-green-100 text-green-800"
                                    : achievement.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {achievement.status === "VERIFIED"
                                  ? "Đã xác thực"
                                  : achievement.status === "PENDING"
                                  ? "Chờ xác thực"
                                  : "Chưa xác thực"}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <p className="text-base text-gray-700">
                                <span className="font-semibold">
                                  Tổ chức trao:
                                </span>{" "}
                                {achievement.awardingOrganization}
                              </p>
                              <p className="text-base text-gray-700">
                                <span className="font-semibold">Cấp độ:</span>{" "}
                                {achievement.level}
                              </p>
                              <p className="text-base text-gray-700">
                                <span className="font-semibold">Ngày đạt:</span>{" "}
                                {new Date(
                                  achievement.achievedDate
                                ).toLocaleDateString("vi-VN")}
                              </p>
                              {achievement.description && (
                                <div className="mt-3 p-3 bg-white rounded-lg border">
                                  <p className="text-sm font-medium text-gray-700 mb-1">
                                    Mô tả:
                                  </p>
                                  <p className="text-sm text-gray-600 whitespace-pre-line">
                                    {achievement.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Price & Contact */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sticky top-6">
              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {formatPrice(currentPost.pricePerSession)}
                </div>
                <div className="text-lg text-gray-600 font-medium">
                  /{currentPost.sessionDuration} phút
                </div>
              </div>

              {isOwnPost ? (
                <button
                  onClick={() =>
                    navigate(
                      `/tutor/posts/${currentPost._id || currentPost.id}/edit`
                    )
                  }
                  className="w-full px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg shadow-md hover:shadow-lg"
                >
                  Chỉnh sửa bài đăng
                </button>
              ) : (
                <div className="space-y-3">
                  {/* New Contact Request Button */}
                  {canSendRequest ? (
                    <button
                      onClick={handleContactClick}
                      className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
                      <span>Gửi yêu cầu học tập</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleContactClick}
                      className="w-full px-6 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-semibold text-lg shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                    >
                      <ChatBubbleLeftRightIcon className="w-5 h-5" />
                      <span>Xem thông tin liên hệ</span>
                    </button>
                  )}

                  {/* Quick Contact Actions */}
                  {isAuthenticated && currentPost.tutorId.email && (
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`mailto:${currentPost.tutorId.email}?subject=Liên hệ về bài đăng: ${currentPost.title}`}
                        className="flex items-center justify-center space-x-1 px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                      >
                        <EnvelopeIcon className="w-4 h-4" />
                        <span>Email</span>
                      </a>

                      {currentPost.tutorId.phone_number && (
                        <a
                          href={`tel:${currentPost.tutorId.phone_number}`}
                          className="flex items-center justify-center space-x-1 px-3 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm"
                        >
                          <PhoneIcon className="w-4 h-4" />
                          <span>Gọi</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="text-sm text-gray-500 text-center mt-4 space-y-2">
                {isOwnPost ? (
                  <p>Đây là bài đăng của bạn</p>
                ) : canSendRequest ? (
                  <div>
                    <p className="font-medium text-blue-600">
                      Gửi yêu cầu học tập để kết nối với gia sư
                    </p>
                    <p className="text-xs">
                      Gia sư sẽ nhận được thông báo và phản hồi cho bạn
                    </p>
                  </div>
                ) : (
                  <>
                    <p>
                      {isAuthenticated
                        ? user?.role === "TUTOR"
                          ? "Chỉ học viên mới có thể gửi yêu cầu"
                          : "Click để xem thông tin liên hệ"
                        : "Đăng nhập để gửi yêu cầu học tập"}
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
                  </>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Thông tin nhanh
              </h3>

              <div className="space-y-6">
                {/* Subjects */}
                <div>
                  <label className="text-base font-semibold text-gray-900 block mb-3">
                    Môn học
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentPost.subjects.map((subject, index) => (
                      <span
                        key={subject._id || index}
                        className="px-3 py-2 bg-blue-100 text-blue-800 text-sm rounded-lg font-medium"
                      >
                        {typeof subject === "string" ? subject : subject.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Student Levels */}
                <div>
                  <label className="text-base font-semibold text-gray-900 block mb-3">
                    Đối tượng học viên
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentPost.studentLevel.map((level, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-green-100 text-green-800 text-sm rounded-lg font-medium"
                      >
                        {translateStudentLevel(level)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Teaching Mode */}
                <div>
                  <label className="text-base font-semibold text-gray-900 block mb-3">
                    Hình thức dạy học
                  </label>
                  <span
                    className={`
                    px-4 py-2 rounded-lg text-sm font-medium
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
                    <label className="text-base font-semibold text-gray-900 block mb-3">
                      Địa chỉ:
                    </label>
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                      {isAuthenticated
                        ? formatAddressDisplay(currentPost.address, true)
                        : formatShortAddress(currentPost.address)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Lịch dạy</h3>

              {currentPost.teachingSchedule.length > 0 ? (
                <div className="space-y-4">
                  {currentPost.teachingSchedule
                    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                    .map((slot, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <span className="font-semibold text-gray-800 text-base">
                          {getDayName(slot.dayOfWeek)}
                        </span>
                        <span className="text-gray-700 text-base font-mono bg-white px-3 py-1 rounded">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-base text-center py-4 bg-gray-50 rounded-lg">
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

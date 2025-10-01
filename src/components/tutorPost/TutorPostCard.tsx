import React from "react";
import { useNavigate } from "react-router-dom";
import type { TutorPost } from "../../services/tutorPost.service";

interface TutorPostCardProps {
  tutorPost: TutorPost;
  onContactClick?: (tutorPost: TutorPost) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

const TutorPostCard: React.FC<TutorPostCardProps> = ({
  tutorPost,
  onContactClick,
  showActions = true,
  compact = false,
  className = "",
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/tutors/${tutorPost._id}`);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContactClick?.(tutorPost);
  };

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getScheduleSummary = () => {
    if (tutorPost.teachingSchedule.length === 0) return "Chưa có lịch dạy";

    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const scheduleByDay: Record<number, string[]> = {};

    tutorPost.teachingSchedule.forEach((slot) => {
      if (!scheduleByDay[slot.dayOfWeek]) {
        scheduleByDay[slot.dayOfWeek] = [];
      }
      scheduleByDay[slot.dayOfWeek].push(`${slot.startTime}-${slot.endTime}`);
    });

    const summary = Object.entries(scheduleByDay)
      .sort(([a], [b]) => Number(a) - Number(b))
      .slice(0, 3) // Show only first 3 days
      .map(([day, times]) => `${dayNames[Number(day)]}: ${times.join(", ")}`)
      .join(" • ");

    const totalDays = Object.keys(scheduleByDay).length;
    return totalDays > 3 ? `${summary} +${totalDays - 3} ngày khác` : summary;
  };

  const getLocationText = () => {
    if (tutorPost.teachingMode === "ONLINE") return "Trực tuyến";
    if (tutorPost.teachingMode === "OFFLINE") {
      if (tutorPost.address) {
        return `${tutorPost.address.district}, ${tutorPost.address.province}`;
      }
      return "Trực tiếp";
    }
    return "Cả hai hình thức";
  };

  const getTeachingModeColor = () => {
    switch (tutorPost.teachingMode) {
      case "ONLINE":
        return "bg-green-100 text-green-800";
      case "OFFLINE":
        return "bg-blue-100 text-blue-800";
      case "BOTH":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = () => {
    switch (tutorPost.status) {
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

  if (compact) {
    return (
      <div
        className={`
          bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer
          ${className}
        `}
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
              {tutorPost.title}
            </h4>
            <p className="text-xs text-gray-600 mb-2">
              {tutorPost.tutorId.name}
            </p>
            <div className="flex items-center space-x-2 text-xs">
              <span
                className={`px-2 py-1 rounded-full ${getTeachingModeColor()}`}
              >
                {getLocationText()}
              </span>
              <span className="text-gray-500">
                {formatPrice(tutorPost.pricePerSession)}/
                {tutorPost.sessionDuration}p
              </span>
            </div>
          </div>

          {showActions && (
            <button
              onClick={handleContactClick}
              className="ml-3 text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex-shrink-0"
            >
              Liên hệ
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer
        ${className}
      `}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="p-6">
        {/* Title and Status */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
            {tutorPost.title}
          </h3>
          <span
            className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
          >
            {tutorPost.status === "ACTIVE"
              ? "Đang hoạt động"
              : tutorPost.status === "PENDING"
              ? "Chờ duyệt"
              : "Tạm dừng"}
          </span>
        </div>

        {/* Tutor Info */}
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium text-sm">
              {tutorPost.tutorId.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-900">
              {tutorPost.tutorId.name}
            </p>
            {tutorPost.tutorId.email && (
              <p className="text-sm text-gray-500">{tutorPost.tutorId.email}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
          {tutorPost.description}
        </p>

        {/* Subjects */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {tutorPost.subjects.slice(0, 3).map((subject, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {typeof subject === "string" ? subject : subject.name}
              </span>
            ))}
            {tutorPost.subjects.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{tutorPost.subjects.length - 3} môn khác
              </span>
            )}
          </div>
        </div>

        {/* Student Level */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Đối tượng học viên:</p>
          <div className="flex flex-wrap gap-1">
            {tutorPost.studentLevel.slice(0, 3).map((level, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded"
              >
                {level}
              </span>
            ))}
            {tutorPost.studentLevel.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{tutorPost.studentLevel.length - 3} cấp khác
              </span>
            )}
          </div>
        </div>

        {/* Teaching Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Hình thức dạy:</p>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getTeachingModeColor()}`}
            >
              {getLocationText()}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Thời lượng buổi:</p>
            <span className="text-sm font-medium text-gray-900">
              {tutorPost.sessionDuration} phút
            </span>
          </div>
        </div>

        {/* Schedule Summary */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Lịch dạy:</p>
          <p className="text-sm text-gray-700">{getScheduleSummary()}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
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
            <span>{tutorPost.viewCount} lượt xem</span>
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
            <span>{tutorPost.contactCount} liên hệ</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              {formatPrice(tutorPost.pricePerSession)}
            </p>
            <p className="text-xs text-gray-500">
              /{tutorPost.sessionDuration} phút
            </p>
          </div>

          {showActions && (
            <button
              onClick={handleContactClick}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Liên hệ ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorPostCard;

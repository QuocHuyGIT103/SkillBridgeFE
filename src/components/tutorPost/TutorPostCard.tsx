import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

interface TutorPostCardProps {
  post: {
    _id?: string;
    id?: string;
    title: string;
    description: string;
    subjects: Array<{ _id?: string; name: string; category: string }>;
    pricePerSession: number;
    sessionDuration: number;
    teachingMode: "ONLINE" | "OFFLINE" | "BOTH";
    tutorId: {
      _id?: string;
      full_name: string;
      email?: string;
      date_of_birth?: string;
      avatar_url?: string;
      gender?: string;
      structured_address?: {
        province_code?: string;
        district_code?: string;
        ward_code?: string;
        detail_address?: string;
        province_name?: string;
        district_name?: string;
        ward_name?: string;
      };
      profile?: {
        headline?: string;
        introduction?: string;
        teaching_experience?: string;
        student_levels?: string;
        video_intro_link?: string;
        status?: string;
      };
    };
    address?: any;
    viewCount: number;
    contactCount: number;
    createdAt: string;
  };
}

const TutorPostCard: React.FC<TutorPostCardProps> = ({ post }) => {
  // Guard clause to prevent rendering if post or tutorId is undefined
  if (!post || !post.tutorId) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-start space-x-4 mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const navigate = useNavigate();

  // Utility functions
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getTeachingModeText = (mode: string): string => {
    switch (mode) {
      case "ONLINE":
        return "Trực tuyến";
      case "OFFLINE":
        return "Tại nhà";
      case "BOTH":
        return "Cả hai hình thức";
      default:
        return "Linh hoạt";
    }
  };

  const getTeachingModeColor = (mode: string): string => {
    switch (mode) {
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

  const getLocationText = (): string => {
    if (post.teachingMode === "ONLINE") return "Trực tuyến";
    if (post.teachingMode === "BOTH") return "Linh hoạt";
    if (post.address?.province?.name) {
      return post.address?.province?.name;
    }
    return "Linh hoạt";
  };

  const handleViewDetails = () => {
    navigate(`/tutors/${post._id || post.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      <div className="p-6">
        {/* Header with Avatar and Basic Info */}
        <div className="flex items-start space-x-4 mb-4">
          {/* Avatar */}
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
            {post.tutorId.avatar_url ? (
              <img
                src={post.tutorId.avatar_url}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-600 font-medium text-xl">
                {post.tutorId.full_name?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>

          {/* Tutor Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {post.tutorId.full_name || "Gia sư"}
            </h3>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              {post.tutorId.date_of_birth && (
                <span className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-1" />
                  {calculateAge(post.tutorId.date_of_birth)} tuổi
                </span>
              )}
              {post.tutorId.gender && (
                <span className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-1" />
                  {post.tutorId.gender === "male"
                    ? "Nam"
                    : post.tutorId.gender === "female"
                    ? "Nữ"
                    : "Khác"}
                </span>
              )}
              <span className="flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1" />
                {getLocationText()}
              </span>
            </div>
          </div>

          {/* Teaching Mode Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getTeachingModeColor(
              post.teachingMode
            )}`}
          >
            {getTeachingModeText(post.teachingMode)}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {post.title}
        </h2>

        {/* Description - Show TutorProfile introduction if available, otherwise post description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {truncateText(
            post.tutorId.profile?.introduction || post.description,
            150
          )}
        </p>

        {/* Subjects */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <BookOpenIcon className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Môn học:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.subjects.map((subject, index) => (
              <span
                key={subject._id || subject.name || index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg font-medium"
              >
                {subject.name}
              </span>
            ))}
          </div>
        </div>

        {/* Price and Duration */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-lg font-bold text-green-600">
            <CurrencyDollarIcon className="w-5 h-5 mr-1" />
            {formatPrice(post.pricePerSession)}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="w-4 h-4 mr-1" />
            {post.sessionDuration} phút/buổi
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{post.viewCount} lượt xem</span>
          <span>{post.contactCount} liên hệ</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleViewDetails}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center"
        >
          Xem chi tiết
        </button>
      </div>
    </motion.div>
  );
};

export default TutorPostCard;

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  BookOpenIcon,
  EyeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import TutorReviewsModal from "./TutorReviewsModal";

interface TutorPostCardHorizontalProps {
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
      rating?: {
        average?: number;
        count?: number;
        badges?: string[];
        lastReviewAt?: string | null;
      };
    };
    address?: any;
    viewCount: number;
    contactCount: number;
    createdAt: string;
    compatibility?: number;
    matchDetails?: {
      subjectMatch: number;
      locationMatch: number;
      priceMatch: number;
      scheduleMatch: number;
      overallScore: number;
    };
  };
  showCompatibility?: boolean;
  onClick?: () => void;
}

const TutorPostCardHorizontal: React.FC<TutorPostCardHorizontalProps> = ({
  post,
  showCompatibility = false,
  onClick,
}) => {
  // Hooks must be called before any conditional returns (Rules of Hooks)
  const navigate = useNavigate();
  // Reviews modal state can be added if needed
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Guard clause to prevent rendering if post or tutorId is undefined
  if (!post || !post.tutorId) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-40">
        <div className="animate-pulse h-full flex">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div className="flex-1 ml-6 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

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
        return "Cả hai";
      default:
        return "Linh hoạt";
    }
  };

  const getTeachingModeConfig = (mode: string) => {
    switch (mode) {
      case "ONLINE":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: "💻",
        };
      case "OFFLINE":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: "🏠",
        };
      case "BOTH":
        return {
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: "🔄",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "📍",
        };
    }
  };

  const getLocationText = (): string => {
    if (post.teachingMode === "ONLINE") return "Trực tuyến";
    if (post.teachingMode === "BOTH") return "Linh hoạt";
    if (post.address?.province?.name) {
      return post.address?.province?.name;
    }
    if (post.tutorId.structured_address?.province_name) {
      return post.tutorId.structured_address.province_name;
    }
    return "Linh hoạt";
  };

  // ✅ Compatibility score utilities - SỬA LẠI PHẦN TRĂM
  const getCompatibilityPercentage = (score: number): number => {
    // Nếu score đã là phần trăm (0-100)
    if (score <= 1) {
      return Math.round(score * 100);
    }
    // Nếu score đã là số lớn, chia cho 100
    if (score > 100) {
      return Math.round(score / 100);
    }
    // Nếu score trong khoảng 1-100
    return Math.round(score);
  };

  const getCompatibilityColor = (score: number): string => {
    const percentage = getCompatibilityPercentage(score);
    if (percentage >= 90)
      return "bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-300";
    if (percentage >= 80)
      return "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 border-blue-300";
    if (percentage >= 70)
      return "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-800 border-yellow-300";
    if (percentage >= 60)
      return "bg-gradient-to-r from-orange-50 to-red-50 text-orange-800 border-orange-300";
    return "bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border-red-300";
  };

  const getCompatibilityIcon = (score: number): string => {
    const percentage = getCompatibilityPercentage(score);
    if (percentage >= 90) return "🎯";
    if (percentage >= 80) return "✅";
    if (percentage >= 70) return "👍";
    if (percentage >= 60) return "👌";
    return "🤔";
  };

  const getCompatibilityText = (score: number): string => {
    const percentage = getCompatibilityPercentage(score);
    if (percentage >= 90) return "Rất phù hợp";
    if (percentage >= 80) return "Phù hợp cao";
    if (percentage >= 70) return "Phù hợp";
    if (percentage >= 60) return "Tương đối phù hợp";
    return "Ít phù hợp";
  };

  const handleViewDetails = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/tutors/${post._id || post.id}`);
    }
  };

  const modeConfig = getTeachingModeConfig(post.teachingMode);
  const ratingAverage = post.tutorId?.rating?.average || 0;
  const ratingCount = post.tutorId?.rating?.count || 0;
  const showRating = ratingCount > 0;
  const tutorUserId =
    post.tutorId?._id ||
    (post.tutorId as any)?.id ||
    (post as any)?.tutorUserId ||
    undefined;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleViewDetails}
        className={`
        group cursor-pointer bg-white rounded-xl shadow-sm border hover:shadow-lg 
        transition-all duration-300 overflow-hidden
        ${
          showCompatibility &&
          post.compatibility &&
          getCompatibilityPercentage(post.compatibility) >= 80
            ? "border-blue-300 ring-1 ring-blue-100"
            : "border-gray-200 hover:border-gray-300"
        }
      `}
      >
        {/* ✅ LAYOUT NGANG CẢI THIỆN - CÂN ĐỐI HỚN */}
        <div className="p-5 flex items-center gap-5">
          {/* Left - Avatar Section */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white overflow-hidden">
                {post.tutorId.avatar_url ? (
                  <img
                    src={post.tutorId.avatar_url}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600 font-bold text-lg">
                    {post.tutorId.full_name?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
              {/* Online status indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
          </div>

          {/* Middle - Main Content */}
          <div className="flex-1 min-w-0 space-y-2.5">
            {/* ✅ Header Row - Name và Compatibility cùng hàng */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {post.tutorId.full_name || "Gia sư"}
                </h3>
              </div>

              {/* ✅ Compatibility Score - SỬA LẠI PHẦN TRĂM */}
              {showCompatibility && post.compatibility !== undefined && (
                <div
                  className={`flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold border ${getCompatibilityColor(
                    post.compatibility
                  )} flex-shrink-0`}
                >
                  <span className="mr-1.5">
                    {getCompatibilityIcon(post.compatibility)}
                  </span>
                  <span>
                    {getCompatibilityText(post.compatibility)}:{" "}
                    {getCompatibilityPercentage(post.compatibility)}%
                  </span>
                </div>
              )}
            </div>

            {/* ✅ Info Row - Tuổi, Giới tính, Địa điểm */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {post.tutorId.date_of_birth && (
                <>
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>{calculateAge(post.tutorId.date_of_birth)} tuổi</span>
                </>
              )}
              {post.tutorId.gender && post.tutorId.date_of_birth && (
                <span>•</span>
              )}
              {post.tutorId.gender && (
                <span>
                  {post.tutorId.gender === "male"
                    ? "Nam"
                    : post.tutorId.gender === "female"
                    ? "Nữ"
                    : "Khác"}
                </span>
              )}
              <span>•</span>
              <MapPinIcon className="w-3.5 h-3.5" />
              <span className="truncate">{getLocationText()}</span>
            </div>

            {/* Rating */}
            {showRating && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!tutorUserId) return;
                  setIsReviewModalOpen(true);
                }}
                disabled={!tutorUserId}
                className={`flex items-center text-xs font-semibold text-yellow-700 hover:text-yellow-800 gap-1 ${
                  !tutorUserId ? "cursor-not-allowed opacity-60" : ""
                }`}
              >
                <StarIconSolid className="w-4 h-4 text-yellow-400" />
                <span>{ratingAverage.toFixed(1)}</span>
                <span className="text-gray-500">
                  ({ratingCount.toLocaleString("vi-VN")})
                </span>
              </button>
            )}

            {/* ✅ Title */}
            <h2 className="text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {post.title}
            </h2>

            {/* ✅ Description */}
            <p className="text-gray-600 text-sm line-clamp-1 leading-relaxed">
              {truncateText(
                post.tutorId.profile?.introduction || post.description,
                80
              )}
            </p>

            {/* ✅ Subjects Row */}
            <div className="flex items-center gap-2">
              <BookOpenIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 flex-shrink-0">
                Môn học:
              </span>
              <div className="flex flex-wrap gap-1 min-w-0">
                {(post.subjects || []).slice(0, 3).map((subject, index) => (
                  <span
                    key={subject._id || subject.name || index}
                    className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-md font-medium border border-blue-200 flex-shrink-0"
                  >
                    {subject.name}
                  </span>
                ))}
                {(post.subjects?.length || 0) > 3 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium flex-shrink-0">
                    +{(post.subjects?.length || 0) - 3}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ✅ Right - Action Section - CẢI THIỆN LAYOUT */}
          <div className="flex-shrink-0 flex flex-col items-end gap-3 min-w-0">
            {/* Teaching Mode Badge */}
            <div
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${modeConfig.color} flex items-center flex-shrink-0`}
            >
              <span className="mr-1">{modeConfig.icon}</span>
              <span>{getTeachingModeText(post.teachingMode)}</span>
            </div>

            {/* ✅ Price and Duration - CẢI THIỆN */}
            <div className="text-right space-y-1.5">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-lg min-w-0">
                <div className="flex items-center text-sm font-bold">
                  <CurrencyDollarIcon className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {formatPrice(post.pricePerSession)}
                  </span>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
                <ClockIcon className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                <span>{post.sessionDuration}min</span>
              </div>
            </div>

            {/* ✅ Stats - CẢI THIỆN */}
            <div className="text-right space-y-1">
              <div className="flex items-center text-xs text-gray-500 justify-end">
                <EyeIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                <span>{post.viewCount} lượt xem</span>
              </div>
              <div className="flex items-center text-xs text-gray-500 justify-end">
                <PhoneIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                <span>{post.contactCount} liên hệ</span>
              </div>
            </div>

            {/* ✅ Action Button - CẢI THIỆN */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
              className={`
              px-4 py-2 rounded-lg transition-all duration-200 font-semibold text-sm min-w-0 whitespace-nowrap
              ${
                showCompatibility &&
                post.compatibility &&
                getCompatibilityPercentage(post.compatibility) >= 80
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg"
                  : "bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 shadow-md hover:shadow-lg"
              }
            `}
            >
              {showCompatibility &&
              post.compatibility &&
              getCompatibilityPercentage(post.compatibility) >= 90
                ? "🎯 Liên hệ ngay"
                : showCompatibility &&
                  post.compatibility &&
                  getCompatibilityPercentage(post.compatibility) >= 80
                ? "✨ Xem chi tiết"
                : "Xem chi tiết"}
            </button>
          </div>
        </div>

        {/* ✅ Match Details - Expandable - CẢI THIỆN */}
        {showCompatibility && post.matchDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="px-5 pb-3 border-t border-gray-100"
          >
            <div className="pt-2.5 grid grid-cols-2 md:grid-cols-4 gap-3">
              {post.matchDetails.subjectMatch > 0 && (
                <div className="flex items-center text-xs text-gray-600">
                  <BookOpenIcon className="w-3 h-3 mr-1 text-blue-500 flex-shrink-0" />
                  <span className="truncate">
                    Môn: {Math.round(post.matchDetails.subjectMatch)}%
                  </span>
                </div>
              )}
              {post.matchDetails.locationMatch > 0 && (
                <div className="flex items-center text-xs text-gray-600">
                  <MapPinIcon className="w-3 h-3 mr-1 text-red-500 flex-shrink-0" />
                  <span className="truncate">
                    Vị trí: {Math.round(post.matchDetails.locationMatch)}%
                  </span>
                </div>
              )}
              {post.matchDetails.priceMatch > 0 && (
                <div className="flex items-center text-xs text-gray-600">
                  <CurrencyDollarIcon className="w-3 h-3 mr-1 text-green-500 flex-shrink-0" />
                  <span className="truncate">
                    Giá: {Math.round(post.matchDetails.priceMatch)}%
                  </span>
                </div>
              )}
              {post.matchDetails.scheduleMatch > 0 && (
                <div className="flex items-center text-xs text-gray-600">
                  <ClockIcon className="w-3 h-3 mr-1 text-purple-500 flex-shrink-0" />
                  <span className="truncate">
                    Lịch: {Math.round(post.matchDetails.scheduleMatch)}%
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
      <TutorReviewsModal
        tutorId={tutorUserId}
        tutorName={post.tutorId.full_name}
        open={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </>
  );
};

export default TutorPostCardHorizontal;

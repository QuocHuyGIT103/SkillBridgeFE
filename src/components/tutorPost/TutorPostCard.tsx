import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  BookOpenIcon,
  FireIcon,
  EyeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import TutorReviewsModal from "./TutorReviewsModal";

interface TutorPostCardProps {
  post: {
    _id?: string;
    s_id?: string;
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

const TutorPostCard: React.FC<TutorPostCardProps> = ({
  post,
  showCompatibility = false,
  onClick
}) => {
  // Guard clause to prevent rendering if post or tutorId is undefined
  if (!post || !post.tutorId) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-96">
        <div className="animate-pulse h-full flex flex-col">
          <div className="flex items-start space-x-4 mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded"></div>
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
          icon: "💻"
        };
      case "OFFLINE":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: "🏠"
        };
      case "BOTH":
        return {
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: "🔄"
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "📍"
        };
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

  // ✅ Compatibility score utilities
  const getCompatibilityColor = (score: number): string => {
    if (score >= 90) return "bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-300";
    if (score >= 80) return "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 border-blue-300";
    if (score >= 70) return "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-800 border-yellow-300";
    if (score >= 60) return "bg-gradient-to-r from-orange-50 to-red-50 text-orange-800 border-orange-300";
    return "bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border-red-300";
  };

  const getCompatibilityIcon = (score: number): string => {
    if (score >= 90) return "🎯";
    if (score >= 80) return "✅";
    if (score >= 70) return "👍";
    if (score >= 60) return "👌";
    return "🤔";
  };

  const getCompatibilityText = (score: number): string => {
    if (score >= 90) return "Rất phù hợp";
    if (score >= 80) return "Phù hợp cao";
    if (score >= 70) return "Phù hợp";
    if (score >= 60) return "Tương đối phù hợp";
    return "Ít phù hợp";
  };

  const getBadgeConfig = (badge?: string) => {
    if (!badge) return null;

    switch (badge) {
      case "TOP_RATED":
        return {
          label: "Top Rated",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      case "HIGHLY_RATED":
        return {
          label: "Được yêu thích",
          className: "bg-emerald-100 text-emerald-800 border-emerald-200",
        };
      default:
        return null;
    }
  };

  const handleViewDetails = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/tutors/${post._id || post.id}`);
    }
  };

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const modeConfig = getTeachingModeConfig(post.teachingMode);
  const ratingAverage = post.tutorId.rating?.average || 0;
  const ratingCount = post.tutorId.rating?.count || 0;
  const showRating = ratingCount > 0;
  const badgeConfig = getBadgeConfig(post.tutorId.rating?.badges?.[0]);
  const tutorUserId =
    post.tutorId._id ||
    (post.tutorId as any).id ||
    (post as any).tutorUserId ||
    undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleViewDetails}
      className={`
        group cursor-pointer bg-white rounded-2xl shadow-sm border hover:shadow-xl 
        transition-all duration-300 overflow-hidden h-full flex flex-col
        ${showCompatibility && post.compatibility && post.compatibility >= 80
          ? 'border-blue-300 ring-2 ring-blue-100 shadow-blue-100'
          : 'border-gray-200 hover:border-gray-300'
        }
      `}
    >
      {/* ✅ Fixed Height Container */}
      <div className="p-5 flex flex-col h-full">
        {/* ✅ Compatibility Score Badge - Top Priority */}
        {showCompatibility && post.compatibility !== undefined && (
          <div className="mb-4 flex-shrink-0">
            <div className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-bold border-2 shadow-sm ${getCompatibilityColor(post.compatibility)}`}>
              <span className="mr-2 text-base">{getCompatibilityIcon(post.compatibility)}</span>
              <span className="font-semibold">{getCompatibilityText(post.compatibility)}: {post.compatibility}%</span>
              {post.compatibility >= 90 && (
                <FireIcon className="w-4 h-4 ml-2 text-red-500 animate-pulse" />
              )}
            </div>
          </div>
        )}

        {/* Header with Avatar and Basic Info - Fixed Height */}
        <div className="flex items-start space-x-4 mb-4 flex-shrink-0">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-md flex-shrink-0 ring-2 ring-white">
              {post.tutorId.avatar_url ? (
                <img
                  src={post.tutorId.avatar_url}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-bold text-xl">
                  {post.tutorId.full_name?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>
            {/* Online status indicator */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>

          {/* Tutor Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
              {post.tutorId.full_name || "Gia sư"}
            </h3>
            <div className="space-y-1">
              <div className="flex items-center text-xs text-gray-600">
                {post.tutorId.date_of_birth && (
                  <>
                    <UserIcon className="w-3 h-3 mr-1" />
                    <span>{calculateAge(post.tutorId.date_of_birth)} tuổi</span>
                  </>
                )}
                {post.tutorId.gender && post.tutorId.date_of_birth && (
                  <span className="mx-2">•</span>
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
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <MapPinIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{getLocationText()}</span>
              </div>
              {showRating && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!tutorUserId) {
                      return;
                    }
                    setIsReviewModalOpen(true);
                  }}
                  disabled={!tutorUserId}
                  className={`flex items-center text-xs font-semibold text-yellow-700 hover:text-yellow-800 ${!tutorUserId ? "cursor-not-allowed opacity-60" : ""
                    }`}
                  title="Xem các đánh giá của học viên"
                >
                  <StarIconSolid className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>{ratingAverage.toFixed(1)}</span>
                  <span className="ml-1 text-gray-500">
                    ({ratingCount.toLocaleString("vi-VN")})
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Teaching Mode Badge */}
          <div className="flex-shrink-0">
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${modeConfig.color} flex items-center`}>
              <span className="mr-1">{modeConfig.icon}</span>
              <span className="hidden sm:inline">{getTeachingModeText(post.teachingMode)}</span>
            </div>
          </div>
        </div>

        {badgeConfig && (
          <div className="mb-3 flex items-center">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${badgeConfig.className}`}
            >
              {badgeConfig.label}
            </span>
          </div>
        )}

        <TutorReviewsModal
          tutorId={tutorUserId}
          tutorName={post.tutorId.full_name}
          open={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
        />

        {/* Title - Fixed Height */}
        <div className="mb-3 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
            {post.title}
          </h2>
        </div>

        {/* Description - Fixed Height */}
        <div className="mb-4 flex-shrink-0">
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {truncateText(
              post.tutorId.profile?.introduction || post.description,
              100
            )}
          </p>
        </div>

        {/* Subjects - Fixed Height */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center mb-2">
            <BookOpenIcon className="w-4 h-4 text-blue-500 mr-1 flex-shrink-0" />
            <span className="text-sm font-semibold text-gray-700">Môn học:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {post.subjects.slice(0, 3).map((subject, index) => (
              <span
                key={subject._id || subject.name || index}
                className="px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs rounded-lg font-medium border border-blue-200"
              >
                {subject.name}
              </span>
            ))}
            {post.subjects.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                +{post.subjects.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Flex spacer to push content to bottom */}
        <div className="flex-1"></div>

        {/* Price and Duration - Fixed at Bottom */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-lg">
              <div className="flex items-center text-sm font-bold">
                <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                <span>{formatPrice(post.pricePerSession)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
            <ClockIcon className="w-4 h-4 mr-1" />
            <span>{post.sessionDuration}min</span>
          </div>
        </div>

        {/* Stats - Fixed at Bottom */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 flex-shrink-0">
          <div className="flex items-center">
            <EyeIcon className="w-3 h-3 mr-1" />
            <span>{post.viewCount} lượt xem</span>
          </div>
          <div className="flex items-center">
            <PhoneIcon className="w-3 h-3 mr-1" />
            <span>{post.contactCount} liên hệ</span>
          </div>
        </div>

        {/* Action Button - Fixed at Bottom */}
        <div className="flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Ngăn sự kiện chạy 2 lần
              handleViewDetails();
            }}
            className={`
              w-full px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm
              ${showCompatibility && post.compatibility && post.compatibility >= 80
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 shadow-md hover:shadow-lg transform hover:scale-[1.02]'
              }
            `}
          >
            {showCompatibility && post.compatibility && post.compatibility >= 90
              ? '🎯 Liên hệ ngay'
              : showCompatibility && post.compatibility && post.compatibility >= 80
                ? '✨ Xem chi tiết'
                : 'Xem chi tiết'
            }
          </button>
        </div>

        {/* Match Details - Expandable */}
        {showCompatibility && post.matchDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-gray-100 flex-shrink-0"
          >
            <div className="grid grid-cols-2 gap-2">
              {post.matchDetails.subjectMatch > 0 && (
                <div className="flex items-center text-xs text-gray-600">
                  <BookOpenIcon className="w-3 h-3 mr-1 text-blue-500" />
                  <span>Môn: {post.matchDetails.subjectMatch}%</span>
                </div>
              )}
              {post.matchDetails.locationMatch > 0 && (
                <div className="flex items-center text-xs text-gray-600">
                  <MapPinIcon className="w-3 h-3 mr-1 text-red-500" />
                  <span>Vị trí: {post.matchDetails.locationMatch}%</span>
                </div>
              )}
              {post.matchDetails.priceMatch > 0 && (
                <div className="flex items-center text-xs text-gray-600">
                  <CurrencyDollarIcon className="w-3 h-3 mr-1 text-green-500" />
                  <span>Giá: {post.matchDetails.priceMatch}%</span>
                </div>
              )}
              {post.matchDetails.scheduleMatch > 0 && (
                <div className="flex items-center text-xs text-gray-600">
                  <ClockIcon className="w-3 h-3 mr-1 text-purple-500" />
                  <span>Lịch: {post.matchDetails.scheduleMatch}%</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TutorPostCard;

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
  PaperAirplaneIcon,
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
    teachingSchedule?: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }>;
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
  onSendRequest?: (post: TutorPostCardProps['post']) => void;
}

const TutorPostCard: React.FC<TutorPostCardProps> = ({
  post,
  showCompatibility = false,
  onClick,
  onSendRequest
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

  const getDayName = (dayOfWeek: number): string => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return days[dayOfWeek];
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
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={handleViewDetails}
      className={`
        group cursor-pointer bg-white rounded-2xl shadow-lg border-2 hover:shadow-2xl 
        transition-all duration-300 overflow-hidden h-full flex flex-col
        relative
        ${showCompatibility && post.compatibility && post.compatibility >= 80
          ? 'border-blue-400 ring-4 ring-blue-100 shadow-blue-200'
          : 'border-gray-200 hover:border-blue-300 hover:ring-2 hover:ring-blue-50'
        }
      `}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-blue-50/30 group-hover:via-purple-50/30 group-hover:to-pink-50/30 transition-all duration-500 pointer-events-none" />
      {/* ✅ Fixed Height Container */}
      <div className="p-5 flex flex-col h-full relative z-10">
        {/* Header with Avatar and Basic Info */}
        <div className="flex items-start space-x-3 mb-4 flex-shrink-0">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white group-hover:ring-blue-100 transition-all duration-300 transform group-hover:scale-105">
              {post.tutorId.avatar_url ? (
                <img
                  src={post.tutorId.avatar_url}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xl">
                  {post.tutorId.full_name?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>
            {/* Online status indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
          </div>

          {/* Tutor Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {post.tutorId.full_name || "Gia sư"}
              </h3>
              {/* Teaching Mode Badge */}
              <div className={`px-2 py-1 rounded-lg text-xs font-semibold border ${modeConfig.color} flex items-center flex-shrink-0`}>
                <span className="text-sm">{modeConfig.icon}</span>
              </div>
            </div>
            
            <div className="space-y-0.5 mt-1">
              <div className="flex items-center text-xs text-gray-600">
                {post.tutorId.date_of_birth && (
                  <>
                    <UserIcon className="w-3 h-3 mr-1" />
                    <span>{calculateAge(post.tutorId.date_of_birth)} tuổi</span>
                  </>
                )}
                {post.tutorId.gender && post.tutorId.date_of_birth && (
                  <span className="mx-1.5">•</span>
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
                  <StarIconSolid className="w-3.5 h-3.5 text-yellow-400 mr-1" />
                  <span>{ratingAverage.toFixed(1)}</span>
                  <span className="ml-1 text-gray-500">
                    ({ratingCount})
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        <TutorReviewsModal
          tutorId={tutorUserId}
          tutorName={post.tutorId.full_name}
          open={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
        />

        {/* Title */}
        <div className="mb-3 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
            {post.title}
          </h2>
        </div>

        {/* Description */}
        <div className="mb-3 flex-shrink-0">
          <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">
            {truncateText(
              post.tutorId.profile?.introduction || post.description,
              100
            )}
          </p>
        </div>

        {/* Subjects & Schedule Grid */}
        <div className="mb-3 flex-shrink-0 space-y-3">
          {/* Môn học */}
          <div>
            <div className="flex items-center mb-2">
              <BookOpenIcon className="w-4 h-4 text-blue-600 mr-1.5" />
              <span className="text-xs font-bold text-gray-700">Môn học</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {post.subjects.slice(0, 2).map((subject, index) => (
                <span
                  key={subject._id || subject.name || index}
                  className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium border border-blue-200"
                >
                  {subject.name}
                </span>
              ))}
              {post.subjects.length > 2 && (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium border border-gray-200">
                  +{post.subjects.length - 2}
                </span>
              )}
            </div>
          </div>

          {/* Lịch dạy */}
          {post.teachingSchedule && post.teachingSchedule.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <ClockIcon className="w-4 h-4 text-purple-600 mr-1.5" />
                <span className="text-xs font-bold text-gray-700">Lịch dạy</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {post.teachingSchedule.slice(0, 2).map((schedule, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-lg font-medium border border-purple-200"
                  >
                    {getDayName(schedule.dayOfWeek)}: {schedule.startTime} - {schedule.endTime}
                  </span>
                ))}
                {post.teachingSchedule.length > 2 && (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium border border-gray-200">
                    +{post.teachingSchedule.length - 2}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Flex spacer to push content to bottom */}
        <div className="flex-1"></div>

        {/* Price and Duration */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg shadow-md">
              <div className="flex items-center text-sm font-bold">
                <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                <span>{formatPrice(post.pricePerSession)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center text-xs font-semibold text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm">
            <ClockIcon className="w-3.5 h-3.5 mr-1 text-blue-500" />
            <span>{post.sessionDuration} phút</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex gap-2">
          {onSendRequest && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                onSendRequest(post);
              }}
              className="flex-1 px-4 py-2.5 rounded-lg transition-all duration-300 font-semibold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <PaperAirplaneIcon className="w-4 h-4 mr-1.5" />
              Gửi yêu cầu
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            className={`
              ${onSendRequest ? 'flex-1' : 'w-full'} px-4 py-2.5 rounded-lg transition-all duration-300 font-semibold text-sm
              bg-gray-800 text-white hover:bg-gray-900 shadow-md hover:shadow-lg flex items-center justify-center
            `}
          >
            <span className="mr-1.5">👁️</span> Xem chi tiết
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default TutorPostCard;

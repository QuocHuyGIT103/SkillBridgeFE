import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  SparklesIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import type {
  SmartRecommendation,
  TutorInfo,
  MatchDetails,
} from "../../services/ai.service";
import { AIService } from "../../services/ai.service";
import TutorReviewsModal from "../tutorPost/TutorReviewsModal";
import ContactRequestForm from "../student/ContactRequestForm";
import { useAuthStore } from "../../store/auth.store";
import toast from "react-hot-toast";

interface SmartRecommendationCardProps {
  recommendation: SmartRecommendation;
  matchPercentage?: number; // Match percentage to display instead of rank
  onClick?: () => void;
  isTopMatch?: boolean; // Indicates if this is the card with the highest match score
  postId?: string; // Student post ID for contact request
  hideExplanation?: boolean; // Hide "Lý do AI gợi ý" section
}

const SmartRecommendationCard: React.FC<SmartRecommendationCardProps> = ({
  recommendation,
  matchPercentage,
  onClick,
  isTopMatch = false,
  postId,
  hideExplanation = false,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // On-demand explanation states
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(false);
  const [onDemandExplanation, setOnDemandExplanation] = useState<string | null>(
    null
  );
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    const postId = tutorPost.id || tutorPost._id;
    if (postId) {
      navigate(`/tutors/${postId}`);
    }
  };

  // Fetch on-demand explanation when user clicks
  const handleToggleExplanation = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // If already expanded with explanation, just collapse
    if (isExplanationExpanded && (explanation || onDemandExplanation)) {
      setIsExplanationExpanded(false);
      return;
    }

    // If auto-generated explanation exists, show it
    if (explanation) {
      setIsExplanationExpanded(true);
      return;
    }

    // If already fetched, show it
    if (onDemandExplanation) {
      setIsExplanationExpanded(true);
      return;
    }

    // Otherwise, fetch from API
    if (!postId) {
      toast.error("Thiếu thông tin bài đăng");
      return;
    }

    // Check if user is authenticated before making request
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Vui lòng đăng nhập lại để sử dụng tính năng này");
      return;
    }

    setIsLoadingExplanation(true);
    setIsExplanationExpanded(true);

    try {
      const response = await AIService.getOnDemandExplanation(
        recommendation.tutorId,
        postId
      );
      setOnDemandExplanation(response.data.explanation);
    } catch (error: any) {
      console.error("Failed to fetch explanation:", error);

      // Handle different error types
      let errorMessage = "Không thể tạo giải thích AI";
      if (error.status === 401) {
        errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
      } else if (error.status === 403) {
        errorMessage = "Bạn không có quyền xem thông tin này";
      } else if (error.status === 404) {
        errorMessage = "Không tìm thấy thông tin gia sư";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      setIsExplanationExpanded(false);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTeachingModeIcon = (mode: string) => {
    switch (mode) {
      case "ONLINE":
        return "💻";
      case "OFFLINE":
        return "🏠";
      case "BOTH":
        return "🌐";
      default:
        return "📚";
    }
  };

  const getTeachingModeText = (mode: string): string => {
    switch (mode) {
      case "ONLINE":
        return "Trực tuyến";
      case "OFFLINE":
        return "Tại nhà";
      case "BOTH":
        return "Linh hoạt";
      default:
        return mode;
    }
  };

  const {
    tutor: tutorRaw,
    tutorPost: tutorPostRaw,
    explanation,
    matchDetails,
  } = recommendation;

  const fallbackTutor: TutorInfo = {
    name: "Gia sư ẩn danh",
    email: "",
    phone: "",
    avatar: "",
    headline: "",
    introduction: "",
    rating: {
      average: 0,
      count: 0,
      badges: [],
      lastReviewAt: null,
    },
  };

  const tutor = {
    ...fallbackTutor,
    ...tutorRaw,
    rating: {
      ...fallbackTutor.rating!,
      ...tutorRaw?.rating,
    },
  };

  const fallbackTutorPost = {
    id: "",
    _id: "",
    title: "Thông tin bài đăng không khả dụng",
    description: "",
    subjects: [],
    pricePerSession: 0,
    sessionDuration: 60,
    teachingMode: "ONLINE",
    studentLevel: [],
  };

  const tutorPost = {
    ...fallbackTutorPost,
    ...tutorPostRaw,
    subjects: tutorPostRaw?.subjects || [],
    studentLevel: tutorPostRaw?.studentLevel || [],
  };

  const normalizedMatchDetails: MatchDetails = {
    subjectMatch: !!matchDetails?.subjectMatch,
    levelMatch: !!matchDetails?.levelMatch,
    priceMatch: !!matchDetails?.priceMatch,
    scheduleMatch: !!matchDetails?.scheduleMatch,
    semanticScore: matchDetails?.semanticScore ?? 0,
  };
  const ratingAverage = tutor.rating?.average || 0;
  const ratingCount = tutor.rating?.count || 0;
  const showRating = ratingCount > 0;

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden
                 flex flex-col h-full
                 ${
                   isTopMatch
                     ? "border-purple-400 shadow-lg hover:shadow-2xl hover:border-purple-500 ring-2 ring-purple-200"
                     : "border-gray-200 hover:border-blue-400 hover:shadow-xl"
                 }`}
    >
      {/* Match Percentage Badge */}
      {matchPercentage !== undefined && (
        <div className="absolute top-3 left-3 z-10">
          <div
            className={`
            flex items-center justify-center px-2.5 py-1 rounded-full font-bold text-xs shadow-lg
            ${
              matchPercentage >= 80
                ? "bg-gradient-to-br from-green-400 to-green-600 text-white"
                : ""
            }
            ${
              matchPercentage >= 60 && matchPercentage < 80
                ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
                : ""
            }
            ${
              matchPercentage >= 40 && matchPercentage < 60
                ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"
                : ""
            }
            ${
              matchPercentage < 40
                ? "bg-gradient-to-br from-gray-400 to-gray-600 text-white"
                : ""
            }
          `}
          >
            {matchPercentage}% phù hợp
          </div>
        </div>
      )}

      {/* Highlight Banner for Top Match */}
      {isTopMatch && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
      )}

      <div
        className={`p-4 flex flex-col flex-grow ${
          matchPercentage !== undefined ? "pt-12" : "pt-4"
        }`}
      >
        {/* Tutor Info - Compact */}
        <div className="flex items-start space-x-3 mb-3">
          <div className="relative">
            <img
              src={tutor.avatar || "https://via.placeholder.com/80"}
              alt={tutor.name}
              className={`w-12 h-12 rounded-full object-cover border-2 transition-colors ${
                isTopMatch
                  ? "border-purple-400 group-hover:border-purple-500 shadow-sm"
                  : "border-gray-200 group-hover:border-blue-400"
              }`}
            />
            {isTopMatch && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center bg-purple-500">
                <CheckCircleIcon className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`text-sm font-bold truncate transition-colors ${
                isTopMatch
                  ? "text-gray-900 group-hover:text-purple-600"
                  : "text-gray-900 group-hover:text-blue-600"
              }`}
            >
              {tutor.name}
            </h3>
            {tutor.headline && (
              <p
                className={`text-xs line-clamp-1 ${
                  isTopMatch ? "text-gray-700 font-medium" : "text-gray-600"
                }`}
              >
                {tutor.headline}
              </p>
            )}
            {showRating && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsReviewModalOpen(true);
                }}
                className={`mt-1 flex items-center gap-1 text-xs font-semibold hover:text-yellow-800 ${
                  isTopMatch ? "text-yellow-700" : "text-yellow-600"
                }`}
              >
                <StarIconSolid className="w-3.5 h-3.5 text-yellow-400" />
                <span>{ratingAverage.toFixed(1)}</span>
                <span className="text-gray-500 text-xs">
                  ({ratingCount.toLocaleString("vi-VN")})
                </span>
              </button>
            )}
          </div>
        </div>

        {/* AI Explanation - On-Demand Toggle Button (hidden when hideExplanation is true) */}
        {!hideExplanation && (
          <div className="mb-3 min-h-[32px]">
            <button
              type="button"
              onClick={handleToggleExplanation}
              className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${
                isTopMatch
                  ? "bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-purple-200 hover:border-purple-300"
                  : "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100 hover:border-purple-200"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-purple-900">
                  {isLoadingExplanation
                    ? "AI đang phân tích..."
                    : "Lý do AI gợi ý"}
                </span>
              </div>
              {isLoadingExplanation ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent" />
              ) : isExplanationExpanded ? (
                <ChevronUpIcon className="w-4 h-4 text-purple-600" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 text-purple-600" />
              )}
            </button>

            {/* Collapsible Explanation Content with reserved space */}
            <div
              className={
                isExplanationExpanded && (explanation || onDemandExplanation)
                  ? ""
                  : "h-0"
              }
            >
              <AnimatePresence>
                {isExplanationExpanded &&
                  (explanation || onDemandExplanation) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div
                        className={`mt-2 p-2.5 rounded-lg border ${
                          isTopMatch
                            ? "bg-white/50 border-purple-200"
                            : "bg-white/50 border-purple-100"
                        }`}
                      >
                        <p className="text-xs leading-relaxed text-purple-700">
                          {explanation || onDemandExplanation}
                        </p>
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Tutor Post Info - Compact with highlighted important fields */}
        <div className="space-y-2.5 mb-3 flex-grow">
          <h4 className="font-semibold line-clamp-2 text-sm text-gray-900">
            {tutorPost.title}
          </h4>

          {/* Highlighted: Subjects */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <AcademicCapIcon className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                Môn dạy
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {tutorPost.subjects.map((subject, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-white text-blue-700 text-xs font-semibold rounded-md shadow-sm border border-blue-200"
                >
                  {subject.name}
                </span>
              ))}
            </div>
          </div>

          {/* Highlighted: Price & Duration - Compact */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-2 border border-emerald-100">
              <div className="flex items-center gap-1 mb-0.5">
                <CurrencyDollarIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-600">
                  Học phí
                </span>
              </div>
              <p className="text-sm font-bold text-emerald-700">
                {formatPrice(tutorPost.pricePerSession)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-2 border border-amber-100">
              <div className="flex items-center gap-1 mb-0.5">
                <ClockIcon className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-medium text-amber-600">
                  Thời lượng
                </span>
              </div>
              <p className="text-sm font-bold text-amber-700">
                {tutorPost.sessionDuration} phút
              </p>
            </div>
          </div>

          {/* Teaching Mode & Levels - Compact */}
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-md border border-purple-200">
              <MapPinIcon className="w-3 h-3" />
              {getTeachingModeIcon(tutorPost.teachingMode)}{" "}
              {getTeachingModeText(tutorPost.teachingMode)}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-md border border-gray-200">
              <AcademicCapIcon className="w-3 h-3" />
              {tutorPost.studentLevel.length} cấp độ
            </span>
          </div>
        </div>

        {/* Match Details - Compact */}
        <div
          className={`border-t pt-2 mt-auto ${
            isTopMatch ? "border-gray-200" : "border-gray-100"
          }`}
        >
          <div className="flex flex-wrap gap-1">
            {normalizedMatchDetails.subjectMatch && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded-full bg-green-50 text-green-700 border border-green-200">
                <CheckCircleIcon className="w-2.5 h-2.5" />
                <span>Môn</span>
              </span>
            )}
            {normalizedMatchDetails.levelMatch && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded-full bg-green-50 text-green-700 border border-green-200">
                <CheckCircleIcon className="w-2.5 h-2.5" />
                <span>Cấp độ</span>
              </span>
            )}
            {normalizedMatchDetails.priceMatch && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded-full bg-green-50 text-green-700 border border-green-200">
                <CheckCircleIcon className="w-2.5 h-2.5" />
                <span>Giá</span>
              </span>
            )}
            {normalizedMatchDetails.scheduleMatch && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded-full bg-green-50 text-green-700 border border-green-200">
                <ClockIcon className="w-2.5 h-2.5" />
                <span>Lịch</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons - Send Request + View Details - Compact */}
        <div className="mt-3 flex gap-2">
          {user?.role?.toUpperCase() === "STUDENT" && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setShowContactModal(true);
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 
                        bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-semibold rounded-lg 
                        hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <PaperAirplaneIcon className="w-3.5 h-3.5" />
              Gửi yêu cầu
            </button>
          )}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleCardClick();
            }}
            className={`${
              user?.role?.toUpperCase() === "STUDENT" ? "flex-1" : "w-full"
            } inline-flex items-center justify-center gap-1.5 px-3 py-2 
                      text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                        isTopMatch
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                          : "bg-white text-gray-700 border border-gray-200 hover:border-blue-400 hover:text-blue-600"
                      }`}
          >
            {isTopMatch ? "✨ Chi tiết" : "Chi tiết"}
          </button>
        </div>
      </div>

      {/* Review Modal */}
      <TutorReviewsModal
        tutorId={recommendation.tutorId}
        tutorName={tutor.name}
        open={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />

      {/* Contact Request Modal */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowContactModal(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <ContactRequestForm
                tutorPost={
                  {
                    ...tutorPost,
                    id: tutorPost.id || tutorPost._id,
                    _id: tutorPost._id || tutorPost.id,
                    teachingSchedule: [],
                    status: "ACTIVE" as const,
                    viewCount: 0,
                    contactCount: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    tutorId: {
                      _id: recommendation.tutorId,
                      full_name: tutor.name,
                      email: tutor.email || "",
                      avatar_url: tutor.avatar,
                    } as any,
                    subjects: tutorPost.subjects as any,
                  } as any
                }
                onSuccess={() => {
                  setShowContactModal(false);
                }}
                onCancel={() => setShowContactModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartRecommendationCard;

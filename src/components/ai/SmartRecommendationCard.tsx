import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SparklesIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import type { SmartRecommendation, TutorInfo, MatchDetails } from '../../services/ai.service';
import TutorReviewsModal from '../tutorPost/TutorReviewsModal';

interface SmartRecommendationCardProps {
  recommendation: SmartRecommendation;
  rank?: number;
  onClick?: () => void;
  isTopMatch?: boolean; // Indicates if this is the card with the highest match score
}

const SmartRecommendationCard: React.FC<SmartRecommendationCardProps> = ({
  recommendation,
  rank,
  onClick,
  isTopMatch = false,
}) => {
  const navigate = useNavigate();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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

  const getMatchScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getMatchScoreLabel = (score: number): string => {
    if (score >= 80) return 'Rất phù hợp';
    if (score >= 60) return 'Phù hợp';
    if (score >= 40) return 'Tương đối';
    return 'Có thể phù hợp';
  };

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTeachingModeIcon = (mode: string) => {
    switch (mode) {
      case 'ONLINE':
        return '💻';
      case 'OFFLINE':
        return '🏠';
      case 'BOTH':
        return '🌐';
      default:
        return '📚';
    }
  };

  const getTeachingModeText = (mode: string): string => {
    switch (mode) {
      case 'ONLINE':
        return 'Trực tuyến';
      case 'OFFLINE':
        return 'Tại nhà';
      case 'BOTH':
        return 'Linh hoạt';
      default:
        return mode;
    }
  };

  const { tutor: tutorRaw, tutorPost: tutorPostRaw, matchScore, explanation, matchDetails } = recommendation;

  const fallbackTutor: TutorInfo = {
    name: 'Gia sư ẩn danh',
    email: '',
    phone: '',
    avatar: '',
    headline: '',
    introduction: '',
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
    id: '',
    _id: '',
    title: 'Thông tin bài đăng không khả dụng',
    description: '',
    subjects: [],
    pricePerSession: 0,
    sessionDuration: 60,
    teachingMode: 'ONLINE',
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
                 ${isTopMatch 
                   ? 'border-purple-400 shadow-lg hover:shadow-2xl hover:border-purple-500 ring-2 ring-purple-200' 
                   : 'border-gray-200 hover:border-blue-400 hover:shadow-xl'
                 }`}
    >
      {/* Rank Badge (if provided) */}
      {rank && rank <= 3 && (
        <div className="absolute top-4 left-4 z-10">
          <div
            className={`
            flex items-center justify-center w-10 h-10 rounded-full font-bold text-white text-lg shadow-lg
            ${rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : ''}
            ${rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : ''}
            ${rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : ''}
          `}
          >
            {rank}
          </div>
        </div>
      )}

      {/* Highlight Banner for Top Match */}
      {isTopMatch && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
      )}

      <div className="p-6 pt-16 flex flex-col flex-grow">
        {/* Match Score - Enhanced for Top Match */}
        <div className={`mb-4 ${isTopMatch ? 'pb-3 border-b border-gray-100' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isTopMatch ? 'text-gray-700 font-semibold' : 'text-gray-600'}`}>
              Độ phù hợp
            </span>
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-bold border-2 ${
                isTopMatch
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600 shadow-md'
                  : getMatchScoreColor(matchScore)
              }`}
            >
              {Math.round(matchScore)}% • {getMatchScoreLabel(matchScore)}
            </span>
          </div>
          
          {/* Match Score Bar - Enhanced */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isTopMatch
                  ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 shadow-lg'
                  : matchScore >= 60
                  ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                  : matchScore >= 40
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                  : 'bg-gradient-to-r from-gray-400 to-gray-600'
              }`}
              style={{ width: `${matchScore}%` }}
            />
          </div>
        </div>

        {/* Tutor Info - Enhanced for Top Match */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative">
            <img
              src={tutor.avatar || 'https://via.placeholder.com/80'}
              alt={tutor.name}
              className={`w-16 h-16 rounded-full object-cover border-2 transition-colors ${
                isTopMatch
                  ? 'border-purple-400 group-hover:border-purple-500 shadow-md'
                  : 'border-gray-200 group-hover:border-blue-400'
              }`}
            />
            {isTopMatch && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center bg-purple-500">
                <CheckCircleIcon className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-bold truncate transition-colors ${
              isTopMatch 
                ? 'text-gray-900 group-hover:text-purple-600' 
                : 'text-gray-900 group-hover:text-blue-600'
            }`}>
              {tutor.name}
            </h3>
            {tutor.headline && (
              <p className={`text-sm line-clamp-1 ${isTopMatch ? 'text-gray-700 font-medium' : 'text-gray-600'}`}>
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
                className={`mt-2 flex items-center gap-1 text-xs font-semibold hover:text-yellow-800 ${
                  isTopMatch ? 'text-yellow-700' : 'text-yellow-600'
                }`}
              >
                <StarIconSolid className="w-4 h-4 text-yellow-400" />
                <span>{ratingAverage.toFixed(1)}</span>
                <span className="text-gray-500">
                  ({ratingCount.toLocaleString('vi-VN')})
                </span>
              </button>
            )}
          </div>
        </div>

        {/* AI Explanation - Enhanced for Top Match */}
        {explanation && (
          <div className={`mb-4 p-4 rounded-lg border ${
            isTopMatch
              ? 'bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-purple-300 shadow-sm'
              : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
          }`}>
            <div className="flex items-start space-x-2">
              <SparklesIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isTopMatch ? 'text-purple-600' : 'text-purple-600'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1 text-purple-900">
                  Lý do AI gợi ý:
                </p>
                <p className="text-sm leading-relaxed text-purple-800">
                  {explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tutor Post Info */}
        <div className="space-y-3 mb-4 flex-grow">
          <h4 className={`font-semibold line-clamp-2 ${
            isTopMatch ? 'text-gray-900 text-base' : 'text-gray-900'
          }`}>
            {tutorPost.title}
          </h4>

          {/* Subjects */}
          <div className="flex flex-wrap gap-2">
            {tutorPost.subjects.slice(0, 3).map((subject, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full
                          border border-blue-200"
              >
                {subject.name}
              </span>
            ))}
            {tutorPost.subjects.length > 3 && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                +{tutorPost.subjects.length - 3} môn
              </span>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <CurrencyDollarIcon className="w-4 h-4" />
              <span className="font-medium">{formatPrice(tutorPost.pricePerSession)}</span>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <ClockIcon className="w-4 h-4" />
              <span>{tutorPost.sessionDuration} phút</span>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <MapPinIcon className="w-4 h-4" />
              <span>
                {getTeachingModeIcon(tutorPost.teachingMode)} {getTeachingModeText(tutorPost.teachingMode)}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <AcademicCapIcon className="w-4 h-4" />
              <span>{tutorPost.studentLevel.length} cấp độ</span>
            </div>
          </div>
        </div>

        {/* Match Details - Enhanced for Top Match */}
        <div className={`border-t pt-4 mt-auto ${isTopMatch ? 'border-gray-200' : 'border-gray-100'}`}>
          <p className={`text-xs font-medium mb-2 ${
            isTopMatch ? 'text-gray-700 font-semibold' : 'text-gray-600'
          }`}>
            Chi tiết khớp:
          </p>
          <div className="flex flex-wrap gap-2">
            {normalizedMatchDetails.subjectMatch && (
              <span className={`flex items-center space-x-1 px-2.5 py-1 text-xs rounded-full border ${
                isTopMatch
                  ? 'bg-green-100 text-green-800 border-green-300 font-medium'
                  : 'bg-green-50 text-green-700 border-green-200'
              }`}>
                <CheckCircleIcon className="w-3.5 h-3.5" />
                <span>Môn học</span>
              </span>
            )}
            {normalizedMatchDetails.levelMatch && (
              <span className={`flex items-center space-x-1 px-2.5 py-1 text-xs rounded-full border ${
                isTopMatch
                  ? 'bg-green-100 text-green-800 border-green-300 font-medium'
                  : 'bg-green-50 text-green-700 border-green-200'
              }`}>
                <CheckCircleIcon className="w-3.5 h-3.5" />
                <span>Cấp độ</span>
              </span>
            )}
            {normalizedMatchDetails.priceMatch && (
              <span className={`flex items-center space-x-1 px-2.5 py-1 text-xs rounded-full border ${
                isTopMatch
                  ? 'bg-green-100 text-green-800 border-green-300 font-medium'
                  : 'bg-green-50 text-green-700 border-green-200'
              }`}>
                <CheckCircleIcon className="w-3.5 h-3.5" />
                <span>Giá</span>
              </span>
            )}
            {normalizedMatchDetails.semanticScore > 0 && (
              <span className={`flex items-center space-x-1 px-2.5 py-1 text-xs rounded-full border ${
                isTopMatch
                  ? 'bg-purple-100 text-purple-800 border-purple-300 font-medium'
                  : 'bg-purple-50 text-purple-700 border-purple-200'
              }`}>
                <StarIcon className="w-3.5 h-3.5" />
                <span>AI: {Math.round(matchDetails.semanticScore * 100)}%</span>
              </span>
            )}
          </div>
        </div>

        {/* View Button - Enhanced for Top Match */}
        <div className="mt-4">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleCardClick();
            }}
            className={`w-full px-4 py-2.5 text-white font-medium rounded-lg 
                      transition-all duration-200 shadow-md hover:shadow-lg ${
                        isTopMatch
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                      }`}
          >
            {isTopMatch ? '✨ Xem chi tiết gia sư' : 'Xem chi tiết gia sư'}
          </button>
        </div>
      </div>
      <TutorReviewsModal
        tutorId={recommendation.tutorId}
        tutorName={tutor.name}
        open={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </div>
  );
};

export default SmartRecommendationCard;

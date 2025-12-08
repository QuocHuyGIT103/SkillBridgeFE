import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  SparklesIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  StarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesSolidIcon } from '@heroicons/react/24/solid';
import type { SmartStudentRecommendation } from '../../services/ai.service';
import AIService from '../../services/ai.service';

interface SmartStudentRecommendationCardProps {
  recommendation: SmartStudentRecommendation;
  rank?: number;
  onClick?: () => void;
  tutorPostId?: string;
}

const SmartStudentRecommendationCard: React.FC<SmartStudentRecommendationCardProps> = ({
  recommendation,
  rank,
  onClick,
  tutorPostId,
}) => {
  const navigate = useNavigate();
  
  // On-demand explanation states
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(false);
  const [onDemandExplanation, setOnDemandExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to student post detail with tutorPostId in state
      navigate(`/tutor/posts/student/${recommendation.postId}`, {
        state: { tutorPostId, fromAIRecommendations: true }
      });
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
    
    // Fetch from API
    if (!tutorPostId || !recommendation.postId) {
      toast.error('Thiếu thông tin bài đăng');
      return;
    }
    
    setIsLoadingExplanation(true);
    setIsExplanationExpanded(true);
    
    try {
      const response = await AIService.generateMatchExplanation(
        tutorPostId,
        recommendation.postId,
        matchScore / 100
      );
      setOnDemandExplanation(response.data.explanation);
    } catch (error: any) {
      console.error('Failed to fetch explanation:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo giải thích AI');
      setIsExplanationExpanded(false);
    } finally {
      setIsLoadingExplanation(false);
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

  const formatPrice = (min?: number, max?: number): string => {
    if (min !== undefined && max !== undefined) {
      return `${min.toLocaleString('vi-VN')} - ${max.toLocaleString('vi-VN')} VNĐ/giờ`;
    } else if (min !== undefined) {
      return `Từ ${min.toLocaleString('vi-VN')} VNĐ/giờ`;
    } else if (max !== undefined) {
      return `Đến ${max.toLocaleString('vi-VN')} VNĐ/giờ`;
    }
    return 'Thỏa thuận';
  };

  const { studentPost, matchScore, explanation, matchDetails } = recommendation;
  
  // Check if this is the best match (rank 1)
  const isBestMatch = rank === 1;

  return (
    <div
      className="group relative rounded-xl border-2 bg-white border-gray-200 hover:border-blue-400 
                 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* Rank Badge */}
      {rank && rank <= 3 && (
        <div className="absolute top-4 left-4 z-10">
          <div
            className={`
            flex items-center justify-center rounded-full font-bold text-white text-lg shadow-lg
            ${rank === 1 ? 'w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 ring-4 ring-yellow-200' : 'w-10 h-10'}
            ${rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : ''}
            ${rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : ''}
          `}
          >
            {rank === 1 ? '⭐' : rank}
          </div>
        </div>
      )}

      <div className={`p-6 flex flex-col flex-grow ${rank && rank <= 3 ? 'pt-16' : ''}`}>
        {/* Header with Match Score */}
        <div className="flex items-start justify-between mb-4">
          <h4 className={`text-gray-900 line-clamp-2 flex-1 ${isBestMatch ? 'font-bold text-lg' : 'font-semibold text-base'}`}>
            {studentPost.title}
          </h4>
          <div className="ml-3 flex-shrink-0">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getMatchScoreColor(
                matchScore
              )}`}
            >
              {matchScore}%
            </span>
          </div>
        </div>

        {/* Match Score Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                matchScore >= 80
                  ? 'bg-gradient-to-r from-green-400 to-green-600'
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

        {/* Student Post Info */}
        <div className="space-y-3 mb-4">
          {/* Content Preview */}
          {studentPost.content && (
            <p className={`text-sm text-gray-600 line-clamp-2 ${isBestMatch ? 'font-semibold' : ''}`}>
              {studentPost.content}
            </p>
          )}

          {/* AI Explanation - On Demand */}
          <div className="min-h-[32px]">
            <button
              onClick={handleToggleExplanation}
              className="w-full text-left p-3 rounded-lg border-2 border-purple-200 hover:border-purple-400 
                         transition-all duration-200 bg-gradient-to-r from-purple-50 to-pink-50"
            >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">
                  {isLoadingExplanation ? 'Đang tạo giải thích...' : 'Lý do AI gợi ý'}
                </span>
              </div>
              {!isLoadingExplanation && (
                <svg
                  className={`w-4 h-4 text-purple-600 transition-transform duration-200 ${
                    isExplanationExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
            </button>
            
            {isExplanationExpanded && (explanation || onDemandExplanation) && (
              <div className="mt-2 p-3 rounded-lg border border-purple-200 bg-white/50">
                <p className="text-sm leading-relaxed text-purple-800">
                  {onDemandExplanation || explanation}
                </p>
              </div>
            )}
          </div>

          {/* Subjects */}
          <div className="flex flex-wrap gap-2">
            {studentPost.subjects.slice(0, 3).map((subject, idx) => (
              <span
                key={idx}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all
                  ${
                    matchDetails.subjectMatch
                      ? isBestMatch 
                        ? 'bg-green-100 text-green-900 border-green-400 font-extrabold text-sm shadow-md'
                        : 'bg-green-100 text-green-800 border-green-300 font-bold'
                      : 'bg-blue-50 text-blue-700 border-blue-200 font-medium'
                  }`}
              >
                {subject.name}
                {matchDetails.subjectMatch && ' ✓'}
              </span>
            ))}
            {studentPost.subjects.length > 3 && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                +{studentPost.subjects.length - 3}
              </span>
            )}
          </div>

          {/* Details Grid - Cleaner Layout */}
          <div className="space-y-2 text-sm">
            {/* Grade Levels */}
            <div className={`flex items-center space-x-2 p-2.5 rounded-lg border
                ${matchDetails.levelMatch
                  ? isBestMatch 
                    ? 'bg-green-100 border-green-400 font-extrabold text-green-900'
                    : 'bg-green-50 border-green-200 font-bold text-green-800'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}>
              <AcademicCapIcon className={`w-5 h-5 flex-shrink-0 ${matchDetails.levelMatch ? 'text-green-600' : 'text-gray-500'}`} />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-gray-600">Cấp độ:</span>
                <p className={`truncate ${matchDetails.levelMatch && isBestMatch ? 'text-sm' : 'text-xs'}`}>
                  {studentPost.grade_levels.join(', ')}
                  {matchDetails.levelMatch && ' ✓'}
                </p>
              </div>
            </div>

            {/* Price */}
            <div className={`flex items-center space-x-2 p-2.5 rounded-lg border
                ${matchDetails.priceMatch
                  ? isBestMatch
                    ? 'bg-green-100 border-green-400 font-extrabold text-green-900'
                    : 'bg-green-50 border-green-200 font-bold text-green-800'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}>
              <CurrencyDollarIcon className={`w-5 h-5 flex-shrink-0 ${matchDetails.priceMatch ? 'text-green-600' : 'text-gray-500'}`} />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-gray-600">Học phí:</span>
                <p className={`truncate ${matchDetails.priceMatch && isBestMatch ? 'text-sm' : 'text-xs'}`}>
                  {formatPrice(studentPost.hourly_rate?.min, studentPost.hourly_rate?.max)}
                  {matchDetails.priceMatch && ' ✓'}
                </p>
              </div>
            </div>

            {/* Teaching Mode & Location */}
            <div className={`flex items-center space-x-2 p-2.5 rounded-lg border
                ${matchDetails.scheduleMatch
                  ? isBestMatch
                    ? 'bg-green-100 border-green-400 font-extrabold text-green-900'
                    : 'bg-green-50 border-green-200 font-bold text-green-800'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}>
              <MapPinIcon className={`w-5 h-5 flex-shrink-0 ${matchDetails.scheduleMatch ? 'text-green-600' : 'text-gray-500'}`} />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-gray-600">Hình thức:</span>
                <p className={`truncate ${matchDetails.scheduleMatch && isBestMatch ? 'text-sm' : 'text-xs'}`}>
                  {studentPost.is_online ? '💻 Online' : '🏠 Offline'}
                  {studentPost.location && !studentPost.is_online && ` • ${studentPost.location}`}
                  {matchDetails.scheduleMatch && ' ✓'}
                </p>
              </div>
            </div>

            {/* Student Info */}
            {studentPost.author && (
              <div className="flex items-center space-x-2 p-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700">
                <UserIcon className="w-5 h-5 flex-shrink-0 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-medium">{studentPost.author.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Button */}
        <div className="mt-auto pt-4 border-t">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 
                      hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg 
                      transition-all duration-200 shadow-md hover:shadow-lg
                      flex items-center justify-center space-x-2"
          >
            <span>Xem chi tiết</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartStudentRecommendationCard;


import React from 'react';
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
import { SparklesIcon as SparklesSolidIcon } from '@heroicons/react/24/solid';
import type { SmartRecommendation } from '../../services/ai.service';

interface SmartRecommendationCardProps {
  recommendation: SmartRecommendation;
  rank?: number;
  onClick?: () => void;
}

const SmartRecommendationCard: React.FC<SmartRecommendationCardProps> = ({
  recommendation,
  rank,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to tutor post detail - use id from tutorPost
      const postId = recommendation.tutorPost.id;
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

  const { tutor, tutorPost, matchScore, explanation, matchDetails } = recommendation;

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 
                 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
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

      {/* AI Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 
                        rounded-full shadow-lg">
          <SparklesSolidIcon className="w-4 h-4 text-white" />
          <span className="text-white text-xs font-semibold">AI Match</span>
        </div>
      </div>

      <div className="p-6 pt-16">
        {/* Match Score */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Độ phù hợp</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getMatchScoreColor(
                matchScore
              )}`}
            >
              {matchScore}% • {getMatchScoreLabel(matchScore)}
            </span>
          </div>
          
          {/* Match Score Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
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

        {/* Tutor Info */}
        <div className="flex items-start space-x-4 mb-4">
          <img
            src={tutor.avatar || 'https://via.placeholder.com/80'}
            alt={tutor.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 
                       group-hover:border-blue-400 transition-colors"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 
                          transition-colors">
              {tutor.name}
            </h3>
            {tutor.headline && (
              <p className="text-sm text-gray-600 line-clamp-1">{tutor.headline}</p>
            )}
          </div>
        </div>

        {/* AI Explanation */}
        {explanation && (
          <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-start space-x-2">
              <SparklesIcon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-900 mb-1">Lý do AI gợi ý:</p>
                <p className="text-sm text-purple-800 leading-relaxed">{explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tutor Post Info */}
        <div className="space-y-3 mb-4">
          <h4 className="font-semibold text-gray-900 line-clamp-2">{tutorPost.title}</h4>

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

        {/* Match Details */}
        <div className="border-t pt-4">
          <p className="text-xs font-medium text-gray-600 mb-2">Chi tiết khớp:</p>
          <div className="flex flex-wrap gap-2">
            {matchDetails.subjectMatch && (
              <span className="flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 
                              text-xs rounded-full border border-green-200">
                <CheckCircleIcon className="w-3 h-3" />
                <span>Môn học</span>
              </span>
            )}
            {matchDetails.levelMatch && (
              <span className="flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 
                              text-xs rounded-full border border-green-200">
                <CheckCircleIcon className="w-3 h-3" />
                <span>Cấp độ</span>
              </span>
            )}
            {matchDetails.priceMatch && (
              <span className="flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 
                              text-xs rounded-full border border-green-200">
                <CheckCircleIcon className="w-3 h-3" />
                <span>Giá</span>
              </span>
            )}
            {matchDetails.semanticScore > 0 && (
              <span className="flex items-center space-x-1 px-2 py-1 bg-purple-50 text-purple-700 
                              text-xs rounded-full border border-purple-200">
                <StarIcon className="w-3 h-3" />
                <span>AI: {Math.round(matchDetails.semanticScore * 100)}%</span>
              </span>
            )}
          </div>
        </div>

        {/* View Button */}
        <div className="mt-4">
          <button
            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 
                      text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 
                      transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Xem chi tiết gia sư
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartRecommendationCard;

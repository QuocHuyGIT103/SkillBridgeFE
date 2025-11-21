import React from 'react';
import { useNavigate } from 'react-router-dom';
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
      className={`group relative rounded-xl border-2 transition-all duration-300 overflow-hidden flex flex-col h-full
        ${
          isBestMatch
            ? 'bg-gradient-to-br from-yellow-50 via-white to-yellow-50 border-yellow-400 shadow-2xl hover:shadow-3xl hover:border-yellow-500'
            : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-xl'
        }`}
    >
      {/* Rank Badge (if provided) */}
      {rank && rank <= 3 && (
        <div className="absolute top-4 left-4 z-10">
          <div
            className={`
            flex items-center justify-center rounded-full font-bold text-white text-lg shadow-lg
            ${rank === 1 ? 'w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 ring-4 ring-yellow-200 animate-pulse' : 'w-10 h-10'}
            ${rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : ''}
            ${rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : ''}
          `}
          >
            {rank === 1 ? '⭐' : rank}
          </div>
        </div>
      )}
      
      {/* Best Match Banner */}
      {isBestMatch && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-center py-1.5 text-xs font-bold shadow-md z-10">
          🏆 PHÙ HỢP NHẤT
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

      <div className={`p-6 flex flex-col flex-grow ${isBestMatch ? 'pt-20' : 'pt-16'}`}>
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

        {/* Student Post Info */}
        <div className="space-y-3 mb-4">
          <h4 className="font-semibold text-gray-900 line-clamp-2">{studentPost.title}</h4>

          {/* AI Explanation */}
          {explanation && (
            <div
              className={`p-3 rounded-lg border
                ${
                  isBestMatch
                    ? 'bg-gradient-to-r from-yellow-50 to-purple-50 border-yellow-300'
                    : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                }`}
            >
              <div className="flex items-start space-x-2">
                <SparklesIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isBestMatch ? 'text-yellow-600' : 'text-purple-600'}`} />
                <p className={`text-sm leading-relaxed ${isBestMatch ? 'text-yellow-900 font-medium' : 'text-purple-800'}`}>
                  {explanation}
                </p>
              </div>
            </div>
          )}

          {/* Content Preview */}
          {studentPost.content && (
            <p className="text-sm text-gray-600 line-clamp-2">{studentPost.content}</p>
          )}

          {/* Subjects */}
          <div className="flex flex-wrap gap-2">
            {studentPost.subjects.slice(0, 3).map((subject, idx) => (
              <span
                key={idx}
                className={`px-2.5 py-1 text-xs font-medium rounded-full border
                  ${
                    matchDetails.subjectMatch
                      ? 'bg-green-100 text-green-800 border-green-300 font-bold shadow-sm'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
              >
                {subject.name}
                {matchDetails.subjectMatch && ' ✓'}
              </span>
            ))}
            {studentPost.subjects.length > 3 && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                +{studentPost.subjects.length - 3} môn
              </span>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div
              className={`flex items-center space-x-2 rounded-lg p-2 transition-all
                ${
                  matchDetails.levelMatch
                    ? 'bg-green-50 text-green-800 font-semibold border border-green-200'
                    : 'text-gray-600'
                }`}
            >
              <AcademicCapIcon className={`w-4 h-4 ${matchDetails.levelMatch ? 'text-green-600' : ''}`} />
              <span className="line-clamp-1">
                {studentPost.grade_levels.join(', ')}
                {matchDetails.levelMatch && ' ✓'}
              </span>
            </div>

            <div
              className={`flex items-center space-x-2 rounded-lg p-2 transition-all
                ${
                  matchDetails.priceMatch
                    ? 'bg-green-50 text-green-800 font-semibold border border-green-200'
                    : 'text-gray-600'
                }`}
            >
              <CurrencyDollarIcon className={`w-4 h-4 ${matchDetails.priceMatch ? 'text-green-600' : ''}`} />
              <span className="text-xs">
                {formatPrice(studentPost.hourly_rate?.min, studentPost.hourly_rate?.max)}
                {matchDetails.priceMatch && ' ✓'}
              </span>
            </div>

            <div
              className={`flex items-center space-x-2 rounded-lg p-2 transition-all
                ${
                  matchDetails.scheduleMatch
                    ? 'bg-green-50 text-green-800 font-semibold border border-green-200'
                    : 'text-gray-600'
                }`}
            >
              <MapPinIcon className={`w-4 h-4 ${matchDetails.scheduleMatch ? 'text-green-600' : ''}`} />
              <span className="text-xs">
                {studentPost.is_online ? '💻 Online' : '🏠 Offline'}
                {studentPost.location && !studentPost.is_online && ` • ${studentPost.location}`}
                {matchDetails.scheduleMatch && ' ✓'}
              </span>
            </div>

            {studentPost.author && (
              <div className="flex items-center space-x-2 text-gray-600">
                <UserIcon className="w-4 h-4" />
                <span className="text-xs truncate">{studentPost.author.name}</span>
              </div>
            )}
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
        <div className="mt-auto pt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className={`w-full px-4 py-2.5 text-white font-medium rounded-lg 
                      transition-all duration-200 shadow-md hover:shadow-lg
                      ${
                        isBestMatch
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 font-bold'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                      }`}
          >
            {isBestMatch ? '⭐ Xem chi tiết bài đăng phù hợp nhất' : 'Xem chi tiết bài đăng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartStudentRecommendationCard;


import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPinIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  UserIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { IPost } from '../../types/post.types';

interface StudentPostCardProps {
  post: IPost & {
    compatibility?: number;
    matchDetails?: {
      subjectMatch?: number;
      levelMatch?: number;
      priceMatch?: number;
      modeMatch?: number;
    };
  };
  onClick?: () => void;
  showCompatibility?: boolean;
  rank?: number;
}

const StudentPostCard: React.FC<StudentPostCardProps> = ({
  post,
  onClick,
  showCompatibility = false,
  rank,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/tutor/posts/student/${post.id || post._id}`);
    }
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

  const getCompatibilityColor = (score?: number): string => {
    if (!score) return 'text-gray-600 bg-gray-50 border-gray-200';
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getInitials = (name?: string): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const avatarUrl =
    (post.author_id as any)?.avatar_url ||
    (post.author_id as any)?.avatarUrl ||
    (post.author_id as any)?.avatar ||
    '';

  const authorName = (post.author_id as any)?.full_name || 'N/A';

  const isBestMatch = rank === 1 && showCompatibility;

  return (
    <div
      className={`group relative rounded-xl border-2 transition-all duration-300 overflow-hidden flex flex-col h-full
        ${
          isBestMatch
            ? 'bg-gradient-to-br from-yellow-50 via-white to-yellow-50 border-yellow-400 shadow-2xl hover:shadow-3xl hover:border-yellow-500'
            : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-xl'
        }`}
    >
      {/* Rank Badge */}
      {rank && rank <= 3 && showCompatibility && (
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

      {/* Compatibility Badge */}
      {showCompatibility && post.compatibility !== undefined && (
        <div className="absolute top-4 right-4 z-10">
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${getCompatibilityColor(
              post.compatibility
            )}`}
          >
            {post.compatibility}%
          </div>
        </div>
      )}

      <div className={`p-6 flex flex-col flex-grow ${isBestMatch ? 'pt-20' : 'pt-16'}`}>
        {/* Header with Avatar and Title */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden flex-shrink-0 ring-2 ring-gray-200 flex items-center justify-center text-sm font-bold text-white shadow-md">
            {avatarUrl ? (
              <img src={avatarUrl} alt={authorName} className="w-full h-full object-cover" />
            ) : (
              <span>{getInitials(authorName)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition line-clamp-2 mb-1">
              {post.title}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <UserIcon className="w-3.5 h-3.5" />
              <span className="truncate">{authorName}</span>
            </div>
          </div>
        </div>

        {/* Content Preview */}
        {post.content && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">{post.content}</p>
        )}

        {/* Subjects and Grade Levels */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.subjects?.slice(0, 3).map((subject, idx) => {
            const subjectName = typeof subject === 'string' ? subject : (subject as any)?.name || subject;
            const isMatched = showCompatibility && post.matchDetails?.subjectMatch === 100;
            return (
              <span
                key={idx}
                className={`px-2.5 py-1 text-xs font-medium rounded-full border
                  ${
                    isMatched
                      ? 'bg-green-100 text-green-800 border-green-300 font-bold shadow-sm'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
              >
                {subjectName}
                {isMatched && ' ✓'}
              </span>
            );
          })}
          {post.subjects && post.subjects.length > 3 && (
            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              +{post.subjects.length - 3} môn
            </span>
          )}
          {post.grade_levels?.slice(0, 2).map((level, idx) => {
            const isMatched = showCompatibility && post.matchDetails?.levelMatch === 100;
            return (
              <span
                key={idx}
                className={`px-2.5 py-1 text-xs font-medium rounded-full border
                  ${
                    isMatched
                      ? 'bg-green-100 text-green-800 border-green-300 font-bold shadow-sm'
                      : 'bg-purple-50 text-purple-700 border-purple-200'
                  }`}
              >
                {level}
                {isMatched && ' ✓'}
              </span>
            );
          })}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div
            className={`flex items-center space-x-2 rounded-lg p-2 transition-all
              ${
                showCompatibility && post.matchDetails?.levelMatch === 100
                  ? 'bg-green-50 text-green-800 font-semibold border border-green-200'
                  : 'text-gray-600'
              }`}
          >
            <AcademicCapIcon
              className={`w-4 h-4 ${showCompatibility && post.matchDetails?.levelMatch === 100 ? 'text-green-600' : ''}`}
            />
            <span className="text-xs line-clamp-1">
              {post.grade_levels?.join(', ') || 'N/A'}
              {showCompatibility && post.matchDetails?.levelMatch === 100 && ' ✓'}
            </span>
          </div>

          <div
            className={`flex items-center space-x-2 rounded-lg p-2 transition-all
              ${
                showCompatibility && post.matchDetails?.priceMatch === 100
                  ? 'bg-green-50 text-green-800 font-semibold border border-green-200'
                  : 'text-gray-600'
              }`}
          >
            <CurrencyDollarIcon
              className={`w-4 h-4 ${showCompatibility && post.matchDetails?.priceMatch === 100 ? 'text-green-600' : ''}`}
            />
            <span className="text-xs">
              {formatPrice(post.hourly_rate?.min, post.hourly_rate?.max)}
              {showCompatibility && post.matchDetails?.priceMatch === 100 && ' ✓'}
            </span>
          </div>

          <div
            className={`flex items-center space-x-2 rounded-lg p-2 transition-all
              ${
                showCompatibility && post.matchDetails?.modeMatch === 100
                  ? 'bg-green-50 text-green-800 font-semibold border border-green-200'
                  : 'text-gray-600'
              }`}
          >
            <MapPinIcon
              className={`w-4 h-4 ${showCompatibility && post.matchDetails?.modeMatch === 100 ? 'text-green-600' : ''}`}
            />
            <span className="text-xs">
              {post.is_online ? '💻 Online' : '🏠 Offline'}
              {post.location && !post.is_online && ` • ${post.location}`}
              {showCompatibility && post.matchDetails?.modeMatch === 100 && ' ✓'}
            </span>
          </div>

          {post.created_at && (
            <div className="flex items-center space-x-2 text-gray-600">
              <ClockIcon className="w-4 h-4" />
              <span className="text-xs">
                {new Date(post.created_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
          )}
        </div>

        {/* Match Details (if smart mode) */}
        {showCompatibility && post.matchDetails && (
          <div className="border-t pt-3 mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Chi tiết khớp:</p>
            <div className="flex flex-wrap gap-2">
              {post.matchDetails.subjectMatch === 100 && (
                <span className="flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                  <span>✓</span>
                  <span>Môn học</span>
                </span>
              )}
              {post.matchDetails.levelMatch === 100 && (
                <span className="flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                  <span>✓</span>
                  <span>Cấp độ</span>
                </span>
              )}
              {post.matchDetails.priceMatch === 100 && (
                <span className="flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                  <span>✓</span>
                  <span>Giá</span>
                </span>
              )}
              {post.matchDetails.modeMatch === 100 && (
                <span className="flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                  <span>✓</span>
                  <span>Hình thức</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto pt-4 border-t">
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

export default StudentPostCard;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import SmartRecommendationCard from '../../components/ai/SmartRecommendationCard';
import AIService from '../../services/ai.service';
import type { SmartRecommendation, SmartRecommendationQuery } from '../../services/ai.service';
import usePostStore from '../../store/post.store';
import toast from 'react-hot-toast';

const AISmartRecommendationsPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { getPostById, selectedPost } = usePostStore();

  // State
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiAvailable, setAiAvailable] = useState(true);

  // Query parameters - minScore 0 để hiển thị tất cả gia sư được gợi ý
  // includeExplanations: false để tiết kiệm chi phí (dùng on-demand thày vì)
  const [query, setQuery] = useState<SmartRecommendationQuery>({
    limit: 10,
    minScore: 0,
    includeExplanations: false, // ⭐ CHANGED: Dùng on-demand API thay vì auto-generate
  });

  // Fetch student post details
  useEffect(() => {
    if (postId) {
      getPostById(postId);
    }
  }, [postId, getPostById]);

  // Check AI status
  useEffect(() => {
    checkAIStatus();
  }, []);

  // Fetch recommendations
  useEffect(() => {
    if (postId && aiAvailable) {
      fetchRecommendations();
    }
  }, [postId, query, aiAvailable]);

  const checkAIStatus = async () => {
    try {
      const response = await AIService.checkAIStatus();
      if (response.data) {
        setAiAvailable(response.data.geminiAvailable);
        if (!response.data.geminiAvailable) {
          toast.error('Tính năng AI chưa được kích hoạt');
        }
      }
    } catch (error) {
      console.error('Failed to check AI status:', error);
      setAiAvailable(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!postId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await AIService.getSmartRecommendations(postId, query);
      
      if (response.success && response.data) {
        // Sort recommendations by matchScore descending
        const sortedRecommendations = [...response.data.recommendations].sort(
          (a, b) => b.matchScore - a.matchScore
        );
        setRecommendations(sortedRecommendations);
        
        if (response.data.recommendations.length === 0) {
          toast('Không tìm thấy gia sư phù hợp', {
            icon: '🔍',
          });
        } else {
          toast.success(`Tìm thấy ${response.data.total} gia sư phù hợp!`);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch smart recommendations:', error);
      setError(error.message || 'Không thể tải gợi ý gia sư');
      toast.error('Không thể tải gợi ý gia sư');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchRecommendations();
  };

  const handleQueryChange = (newQuery: Partial<SmartRecommendationQuery>) => {
    setQuery((prev) => ({ ...prev, ...newQuery }));
  };

  // AI Status Banner
  const AIStatusBanner = () => {
    if (aiAvailable) {
      return (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-purple-900">
                🤖 AI Smart Recommendations Đang Hoạt Động
              </h3>
              <p className="text-xs text-purple-700 mt-1">
                Được hỗ trợ bởi Google Gemini AI - Tìm kiếm ngữ nghĩa thông minh với độ chính xác cao
              </p>
              <p className="text-xs text-purple-600 mt-1 font-medium">
                💸 Tiết kiệm 90% chi phí với on-demand explanations
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <XCircleIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-yellow-900">
              AI Chưa Được Kích Hoạt
            </h3>
            <p className="text-xs text-yellow-700 mt-1">
              Tính năng gợi ý thông minh chưa sẵn sàng. Vui lòng liên hệ quản trị viên.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Loading State
  if (isLoading && recommendations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4 animate-pulse">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              AI đang phân tích bài đăng của bạn...
            </h2>
            <p className="text-gray-600">
              Đang tìm kiếm các gia sư phù hợp nhất với yêu cầu của bạn
            </p>
            <div className="mt-6 flex justify-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !aiAvailable) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
          >
            <span>←</span>
            <span>Quay lại</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
                <SparklesIcon className="w-8 h-8 text-purple-600" />
                <span>Gợi Ý Gia Sư Thông Minh</span>
              </h1>
              {selectedPost && (
                <p className="text-gray-600">
                  Dành cho bài đăng: <span className="font-semibold">{selectedPost.title}</span>
                </p>
              )}
            </div>

            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-300 
                        rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* AI Status Banner */}
        <AIStatusBanner />

        {/* Controls */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Bộ lọc:</span>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Số lượng:</label>
              <select
                value={query.limit}
                onChange={(e) => handleQueryChange({ limit: Number(e.target.value) })}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 
                          focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Điểm tối thiểu:</label>
              <select
                value={query.minScore}
                onChange={(e) => handleQueryChange({ minScore: Number(e.target.value) })}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 
                          focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>0% - Tất cả</option>
                <option value={0.3}>30% - Thấp</option>
                <option value={0.5}>50% - Trung bình</option>
                <option value={0.6}>60% - Khá</option>
                <option value={0.7}>70% - Tốt</option>
                <option value={0.8}>80% - Rất tốt</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            Tìm thấy <span className="font-bold text-blue-600">{recommendations.length}</span> gia sư phù hợp
          </p>
        </div>

        {/* Recommendations Grid - 2 columns for better visibility */}
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
            <AnimatePresence>
              {(() => {
                // Calculate max score once
                const maxScore = recommendations.length > 0 
                  ? Math.max(...recommendations.map(r => r.matchScore))
                  : 0;
                
                return recommendations.map((rec, index) => {
                  const isTopMatch = rec.matchScore === maxScore;
                  
                  return (
                    <motion.div
                      key={rec.tutorId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="h-full"
                    >
                      <SmartRecommendationCard 
                        recommendation={rec} 
                        rank={index + 1}
                        isTopMatch={isTopMatch}
                        postId={postId}
                      />
                    </motion.div>
                  );
                });
              })()}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
            <SparklesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy gia sư phù hợp
            </h3>
            <p className="text-gray-600 mb-4">
              Thử giảm điểm tối thiểu hoặc điều chỉnh yêu cầu trong bài đăng
            </p>
            <button
              onClick={() => handleQueryChange({ minScore: 0 })}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Xem tất cả kết quả
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISmartRecommendationsPage;

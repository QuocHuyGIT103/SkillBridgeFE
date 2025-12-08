import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import SmartStudentRecommendationCard from '../../components/ai/SmartStudentRecommendationCard';
import AIService from '../../services/ai.service';
import { PostService } from '../../services/post.service';
import TutorPostService from '../../services/tutorPost.service';
import type { SmartStudentRecommendation, SmartRecommendationQuery } from '../../services/ai.service';
import { useAuthStore } from '../../store/auth.store';
import toast from 'react-hot-toast';

const TutorAISmartRecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();

  // Get tutorPostId from URL query params
  const tutorPostId = searchParams.get('tutorPostId');

  // State
  const [recommendations, setRecommendations] = useState<SmartStudentRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiAvailable, setAiAvailable] = useState(true);
  const [tutorPostTitle, setTutorPostTitle] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Query parameters
  const [query, setQuery] = useState<SmartRecommendationQuery>({
    limit: 10,
    minScore: 0,
  });

  // Check AI status
  useEffect(() => {
    checkAIStatus();
  }, []);

  // Fetch tutor post title if tutorPostId is provided
  useEffect(() => {
    if (tutorPostId) {
      fetchTutorPostTitle();
    }
  }, [tutorPostId]);

  // Fetch recommendations
  useEffect(() => {
    if (user?.id && aiAvailable) {
      fetchRecommendations();
    }
  }, [user?.id, query, aiAvailable, tutorPostId]);

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

  const fetchTutorPostTitle = async () => {
    if (!tutorPostId) return;
    
    try {
      const response = await TutorPostService.getTutorPostById(tutorPostId);
      if (response.success && response.data?.tutorPost) {
        setTutorPostTitle(response.data.tutorPost.title || 'Bài đăng gia sư');
      }
    } catch (error) {
      console.error('Failed to fetch tutor post title:', error);
      setTutorPostTitle(null);
    }
  };

  const fetchRecommendations = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      let response;
      
      // If tutorPostId is provided, use the smart search API with tutorPostId
      if (tutorPostId) {
        const smartQuery: any = {
          tutorPostId,
          limit: query.limit || 10,
          sort_by: 'compatibility',
          sort_order: 'desc',
        };
        
        response = await PostService.smartSearchStudentPostsForTutor(smartQuery);
        
        if (response.success && response.data) {
          // Helper function to generate detailed explanation
          const generateDetailedExplanation = (compatibility: number, matchDetails: any, studentPost: any) => {
            const reasons: string[] = [];
            
            // Subject match
            if (matchDetails?.subjectMatch === 100) {
              const subjectNames = (studentPost.subjects || []).map((s: any) => s.name || s).join(', ');
              reasons.push(`Môn học khớp hoàn toàn (${subjectNames})`);
            } else if (matchDetails?.subjectMatch >= 50) {
              reasons.push('Môn học có phần khớp');
            }
            
            // Level match
            if (matchDetails?.levelMatch === 100) {
              const levels = (studentPost.grade_levels || []).join(', ');
              reasons.push(`Cấp độ phù hợp (${levels})`);
            } else if (matchDetails?.levelMatch >= 50) {
              reasons.push('Cấp độ tương đối phù hợp');
            }
            
            // Price match
            if (matchDetails?.priceMatch === 100) {
              const minPrice = studentPost.hourly_rate?.min?.toLocaleString('vi-VN') || '';
              const maxPrice = studentPost.hourly_rate?.max?.toLocaleString('vi-VN') || '';
              if (minPrice && maxPrice) {
                reasons.push(`Mức giá trong khoảng mong muốn (${minPrice} - ${maxPrice} VNĐ/giờ)`);
              } else {
                reasons.push('Mức giá trong khoảng mong muốn');
              }
            } else if (matchDetails?.priceMatch >= 50) {
              reasons.push('Mức giá gần với mong muốn');
            }
            
            // Schedule/Mode match
            if (matchDetails?.modeMatch === 100) {
              const mode = studentPost.is_online ? 'Online' : 'Offline';
              reasons.push(`Hình thức học phù hợp (${mode})`);
            }
            
            // Overall compatibility
            let baseExplanation = '';
            if (compatibility >= 80) {
              baseExplanation = 'Rất phù hợp với bài đăng gia sư của bạn';
            } else if (compatibility >= 60) {
              baseExplanation = 'Khá phù hợp với bài đăng gia sư của bạn';
            } else if (compatibility >= 40) {
              baseExplanation = 'Có một số điểm phù hợp';
            } else {
              baseExplanation = 'Có thể phù hợp với một số điều kiện';
            }
            
            // Combine base explanation with detailed reasons
            if (reasons.length > 0) {
              return `${baseExplanation}. ${reasons.join('. ')}.`;
            }
            
            return baseExplanation;
          };
          
          // Transform the response to match SmartStudentRecommendation format
          let transformedRecommendations = await Promise.all(
            response.data.posts.map(async (post: any) => {
              // Generate detailed explanation based on compatibility and match details
              const compatibility = post.compatibility || 0;
              const matchDetails = post.matchDetails || {};
              
              const studentPostData = {
                subjects: post.subjects || [],
                grade_levels: post.grade_levels || [],
                hourly_rate: post.hourly_rate,
                is_online: post.is_online || false,
              };
              
              // Generate explanation based on checkbox setting
              // For performance: Always use rule-based first, AI generates on-demand when user views detail
              const explanation = generateDetailedExplanation(compatibility, matchDetails, studentPostData);

              return {
                postId: post._id || post.id,
                matchScore: compatibility,
                explanation,
                studentPost: {
                  id: post._id || post.id,
                  title: post.title,
                  content: post.content || post.description,
                  subjects: post.subjects || [],
                  grade_levels: post.grade_levels || [],
                  hourly_rate: post.hourly_rate,
                  is_online: post.is_online || false,
                  location: post.location,
                  requirements: post.requirements,
                  availability: post.availability,
                  author: {
                    name: post.authorId?.full_name || post.author?.full_name || 'Học viên',
                    email: post.authorId?.email || post.author?.email || '',
                    phone: post.authorId?.phone_number || post.author?.phone_number,
                    avatar: post.authorId?.avatar_url || post.author?.avatar_url,
                  },
                },
                matchDetails: {
                  subjectMatch: matchDetails.subjectMatch === 100,
                  levelMatch: matchDetails.levelMatch === 100,
                  priceMatch: matchDetails.priceMatch === 100,
                  scheduleMatch: matchDetails.modeMatch === 100,
                  semanticScore: compatibility / 100,
                },
              };
            })
          );
          
          // Apply minScore filter (filter by compatibility percentage)
          const minScorePercentage = (query.minScore || 0) * 100;
          transformedRecommendations = transformedRecommendations.filter(
            (rec) => rec.matchScore >= minScorePercentage
          );
          
          // Apply limit
          transformedRecommendations = transformedRecommendations.slice(0, query.limit || 10);
          
          setRecommendations(transformedRecommendations);
          
          const totalCount = response.data.pagination?.total || transformedRecommendations.length;
          
          if (transformedRecommendations.length === 0) {
            toast('Không tìm thấy bài đăng phù hợp', {
              icon: '🔍',
            });
          } else {
            toast.success(`Tìm thấy ${totalCount} bài đăng phù hợp!`);
          }
        }
      } else {
        // Fallback to AI service (general recommendations based on tutor profile)
        response = await AIService.getSmartStudentRecommendations(user.id, query);
        
        if (response.success && response.data) {
          setRecommendations(response.data.recommendations);
          
          const totalCount = response.data.total || response.data.recommendations.length;
          
          if (response.data.recommendations.length === 0) {
            toast('Không tìm thấy bài đăng phù hợp', {
              icon: '🔍',
            });
          } else {
            toast.success(`Tìm thấy ${totalCount} bài đăng phù hợp!`);
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch smart student recommendations:', error);
      setError(error.message || 'Không thể tải gợi ý bài đăng');
      toast.error('Không thể tải gợi ý bài đăng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchRecommendations();
  };

  const handleQueryChange = (newQuery: Partial<SmartRecommendationQuery>) => {
    setQuery((prev) => ({ ...prev, ...newQuery }));
    setCurrentPage(1); // Reset to first page when query changes
  };

  // Calculate pagination
  const totalPages = Math.ceil(recommendations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecommendations = recommendations.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              AI đang phân tích hồ sơ của bạn...
            </h2>
            <p className="text-gray-600">
              Đang tìm kiếm các bài đăng tìm gia sư phù hợp nhất với khả năng dạy của bạn
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center space-x-3">
                <SparklesIcon className="w-8 h-8 text-purple-600" />
                <span>Gợi Ý Bài Đăng Tìm Gia Sư</span>
              </h1>
              {tutorPostId && tutorPostTitle && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg border-2 border-blue-400">
                  <p className="text-sm text-blue-100 mb-2 font-medium">
                    Bài đăng gia sư đang chọn:
                  </p>
                  <p className="text-2xl font-bold text-white drop-shadow-md">{tutorPostTitle}</p>
                </div>
              )}
              <p className="text-gray-600">
                {tutorPostId 
                  ? 'AI sẽ tìm các bài đăng phù hợp với bài đăng gia sư của bạn'
                  : 'AI sẽ tìm các bài đăng phù hợp với hồ sơ và khả năng dạy của bạn'}
              </p>
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
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Tìm thấy <span className="font-bold text-blue-600">{recommendations.length}</span> bài đăng phù hợp
            {recommendations.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                (Trang {currentPage} / {totalPages})
              </span>
            )}
          </p>
        </div>

        {/* Recommendations Grid */}
        {recommendations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 auto-rows-fr">
              <AnimatePresence>
                {currentRecommendations.map((rec, index) => {
                  const globalIndex = startIndex + index;
                  return (
                    <motion.div
                      key={rec.postId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="h-full"
                    >
                      <SmartStudentRecommendationCard 
                        recommendation={rec} 
                        rank={globalIndex + 1}
                        tutorPostId={tutorPostId || undefined}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg 
                            hover:border-blue-500 hover:text-blue-600 transition-all
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-700"
                >
                  ← Trước
                </button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        page === currentPage
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg 
                            hover:border-blue-500 hover:text-blue-600 transition-all
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-700"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
            <SparklesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy bài đăng phù hợp
            </h3>
            <p className="text-gray-600 mb-4">
              Thử giảm điểm tối thiểu hoặc cập nhật hồ sơ gia sư của bạn
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

export default TutorAISmartRecommendationsPage;


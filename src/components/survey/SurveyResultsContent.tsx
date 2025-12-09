import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import SurveyService from '../../services/survey.service';
import SmartRecommendationCard from '../ai/SmartRecommendationCard';
import type { SurveySubmitResponse } from '../../types/survey.types';
import { STUDY_CHALLENGE_LABELS } from '../../types/survey.types';
import type { SmartRecommendation } from '../../services/ai.service';

interface SurveyResultsContentProps {
  surveyResults: SurveySubmitResponse;
  onRetake: () => void;
}

const SurveyResultsContent: React.FC<SurveyResultsContentProps> = ({
  surveyResults,
  onRetake,
}) => {
  const { survey, recommendations, aiAnalysis } = surveyResults;
  const challengeLabels =
    survey.currentChallenges?.map(
      (challenge) => STUDY_CHALLENGE_LABELS[challenge] || challenge
    ) || [];

  const formatSubjects = (subjects: string[]) => subjects.join(', ');
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [recommendedExercises, setRecommendedExercises] = useState<any[] | null>(null);

  const handleLoadExercises = async () => {
    try {
      setLoadingExercises(true);
      const res = await SurveyService.getExerciseRecommendations();
      if (res.success && res.data?.templates) {
        setRecommendedExercises(res.data.templates);
      } else if (res.data?.data?.templates) {
        setRecommendedExercises(res.data.data.templates);
      } else {
        setRecommendedExercises([]);
      }
    } catch (error) {
      console.error('Failed to load exercise recommendations:', error);
    } finally {
      setLoadingExercises(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircleIcon className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎉 Khảo sát hoàn thành!
          </h1>
          <p className="text-lg text-gray-600">
            AI đã phân tích và tìm ra{' '}
            <strong className="text-purple-600">
              {recommendations.length} gia sư
            </strong>{' '}
            phù hợp nhất cho bạn
          </p>
        </motion.div>

        {aiAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <SparklesIcon className="w-8 h-8 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Phân Tích AI Của Bạn
              </h2>
            </div>

            {aiAnalysis.learningProfile && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Phong Cách Học Tập
                </h3>
                <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-200">
                  {aiAnalysis.learningProfile}
                </p>
              </div>
            )}

            {aiAnalysis.recommendedTutorTypes &&
              aiAnalysis.recommendedTutorTypes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <UserGroupIcon className="w-5 h-5 mr-2 text-green-600" />
                    Loại Gia Sư Phù Hợp
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis.recommendedTutorTypes.map((type, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-300"
                      >
                        ✓ {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {aiAnalysis.studyPlanSuggestion && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <SparklesIcon className="w-5 h-5 mr-2 text-purple-600" />
                  Lộ Trình Học Đề Xuất
                </h3>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-gray-700 whitespace-pre-line">
                    {aiAnalysis.studyPlanSuggestion}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb  -4">
            <div className="flex items-center space-x-3">
              <BookOpenIcon className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-800">
                Gợi ý bài tập phù hợp từ AI
              </h3>
            </div>
            <button
              onClick={handleLoadExercises}
              disabled={loadingExercises}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingExercises ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang tải...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Xem gợi ý bài tập
                </>
              )}
            </button>
          </div>

          {recommendedExercises && (
            <div className="mt-4 space-y-3">
              {recommendedExercises.length === 0 ? (
                <p className="text-sm text-gray-600">
                  Chưa tìm được bài tập nào phù hợp. Hãy thử lại sau khi hệ thống có thêm nội dung.
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {recommendedExercises.slice(0, 6).map((tpl, index) => (
                    <div
                      key={tpl.id || tpl._id || index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-400 hover:shadow-md transition-all"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {tpl.title}
                      </p>
                      {tpl.content?.prompt && (
                        <p className="mt-1 text-xs text-gray-600 line-clamp-3">
                          {tpl.content.prompt}
                        </p>
                      )}
                      {Array.isArray(tpl.tags) && tpl.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {tpl.tags.slice(0, 4).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Tóm Tắt Khảo Sát
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-1">Lớp học</p>
              <p className="font-semibold text-gray-800">{survey.gradeLevel}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-1">Môn học</p>
              <p className="font-semibold text-gray-800">
                {formatSubjects(survey.subjects)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-1">Hình thức</p>
              <p className="font-semibold text-gray-800">
                {survey.teachingMode === 'ONLINE'
                  ? 'Trực tuyến'
                  : survey.teachingMode === 'OFFLINE'
                  ? 'Tại nhà'
                  : 'Linh hoạt'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-1">Ngân sách</p>
              <p className="font-semibold text-gray-800">
                {survey.budgetRange.min.toLocaleString('vi-VN')} -{' '}
                {survey.budgetRange.max.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-1">Tốc độ học</p>
              <p className="font-semibold text-gray-800">
                {survey.learningPace === 'fast_learner'
                  ? 'Tiếp thu nhanh'
                  : survey.learningPace === 'self_learner'
                  ? 'Tự học tốt'
                  : survey.learningPace === 'need_guidance'
                  ? 'Cần hướng dẫn'
                  : 'Học chậm nhưng chắc'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-1">Số gia sư phù hợp</p>
              <p className="font-semibold text-purple-600 text-2xl">
                {recommendations.length}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-1">Số buổi mỗi tuần</p>
              <p className="font-semibold text-gray-800">
                {survey.studyFrequency ? `${survey.studyFrequency} buổi` : 'Không có dữ liệu'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
              <p className="text-gray-600 mb-1">Khó khăn lớn nhất</p>
              {challengeLabels.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {challengeLabels.map((label, index) => (
                    <span
                      key={label + index}
                      className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="font-semibold text-gray-800">Không có dữ liệu</p>
              )}
            </div>
          </div>
        </motion.div>

        {challengeLabels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-red-50"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <ArrowRightIcon className="w-5 h-5 mr-2 text-red-500" />
              Những điều gia sư cần lưu ý
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {challengeLabels.map((label, index) => (
                <li key={label + index} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-red-400" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <SparklesIcon className="w-7 h-7 mr-2 text-purple-600" />
              Gia Sư Được Đề Xuất
            </h2>
            <div className="flex gap-3 flex-wrap justify-end">
              <Link
                to="/student/dashboard"
                className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
              >
                <ArrowRightIcon className="w-5 h-5" />
                <span>Xem trên Dashboard</span>
              </Link>
              <button
                onClick={onRetake}
                className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-all font-semibold"
              >
                <ArrowPathIcon className="w-5 h-5" />
                <span>Làm lại khảo sát</span>
              </button>
            </div>
          </div>

          {recommendations.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((recommendation: any, index: number) => (
                <motion.div
                  key={recommendation.tutorId || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <SmartRecommendationCard
                    recommendation={recommendation as SmartRecommendation}
                    matchPercentage={Math.round(recommendation.matchScore || 0)}
                    hideExplanation={true}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <p className="text-xl text-gray-600 mb-4">
                Không tìm thấy gia sư phù hợp
              </p>
              <p className="text-gray-500 mb-6">
                Vui lòng thử điều chỉnh tiêu chí tìm kiếm
              </p>
              <button
                onClick={onRetake}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold"
              >
                Làm lại khảo sát
              </button>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/student/dashboard"
            className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold text-center"
          >
            Về Dashboard
          </Link>
          <Link
            to="/student/my-posts"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold flex items-center justify-center space-x-2 shadow-lg"
          >
            <span>Xem bài đăng của tôi</span>
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default SurveyResultsContent;


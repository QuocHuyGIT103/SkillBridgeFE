import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import SurveyProgress from './SurveyProgress';
import GradeLevelQuestion from './questions/GradeLevelQuestion';
import SubjectsQuestion from './questions/SubjectsQuestion';
import GoalsQuestion from './questions/GoalsQuestion';
import ChallengesQuestion from './questions/ChallengesQuestion';
import TeachingModeQuestion from './questions/TeachingModeQuestion';
import StylesQuestion from './questions/StylesQuestion';
import AvailableTimeQuestion from './questions/AvailableTimeQuestion';
import BudgetQuestion from './questions/BudgetQuestion';
import LearningPaceQuestion from './questions/LearningPaceQuestion';
import PrioritiesQuestion from './questions/PrioritiesQuestion';
import StudyFrequencyQuestion from './questions/StudyFrequencyQuestion';
import type { SurveyData } from '../../types/survey.types';

interface SurveyQuestionsProps {
  onSubmit: (data: SurveyData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const SurveyQuestions: React.FC<SurveyQuestionsProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    gradeLevel: '',
    subjects: [],
    goals: [],
    currentChallenges: [],
    teachingMode: 'BOTH',
    preferredTeachingStyle: [],
    availableTime: [],
    budgetRange: { min: 100000, max: 200000 },
    learningPace: '',
    studyFrequency: 2,
    priorities: {
      experience: 3,
      communication: 3,
      qualification: 3,
      price: 3,
      location: 3,
    },
  });

  const totalSteps = 11;

  const stepTitles = [
    'Lớp học',
    'Môn học',
    'Mục tiêu',
    'Khó khăn',
    'Hình thức',
    'Phong cách',
    'Thời gian',
    'Ngân sách',
    'Số buổi/tuần',
    'Tốc độ',
    'Ưu tiên',
  ];

  // Validation rules for each step
  const validateStep = (step: number): { valid: boolean; message?: string } => {
    switch (step) {
      case 0: // Grade Level
        if (!surveyData.gradeLevel) {
          return { valid: false, message: 'Vui lòng chọn lớp học' };
        }
        break;
      case 1: // Subjects
        if (surveyData.subjects.length === 0) {
          return { valid: false, message: 'Vui lòng chọn ít nhất 1 môn học' };
        }
        break;
      case 2: // Goals
        if (surveyData.goals.length === 0) {
          return { valid: false, message: 'Vui lòng chọn ít nhất 1 mục tiêu' };
        }
        break;
      case 3: // Challenges
        if (surveyData.currentChallenges.length === 0) {
          return { valid: false, message: 'Vui lòng chọn ít nhất 1 khó khăn' };
        }
        break;
      case 4: // Teaching Mode
        if (!surveyData.teachingMode) {
          return { valid: false, message: 'Vui lòng chọn hình thức học' };
        }
        break;
      case 5: // Teaching Styles
        if (surveyData.preferredTeachingStyle.length === 0) {
          return { valid: false, message: 'Vui lòng chọn ít nhất 1 phong cách' };
        }
        break;
      case 6: // Available Time
        if (surveyData.availableTime.length === 0) {
          return { valid: false, message: 'Vui lòng chọn ít nhất 1 khung giờ' };
        }
        break;
      case 7: // Budget
        if (surveyData.budgetRange.min >= surveyData.budgetRange.max) {
          return { valid: false, message: 'Ngân sách tối thiểu phải nhỏ hơn tối đa' };
        }
        break;
      case 8: // Study frequency
        if (!surveyData.studyFrequency) {
          return { valid: false, message: 'Vui lòng chọn số buổi học mỗi tuần' };
        }
        break;
      case 9: // Learning Pace
        if (!surveyData.learningPace) {
          return { valid: false, message: 'Vui lòng chọn tốc độ học' };
        }
        break;
      case 10: // Priorities - all must be rated
        const priorities = surveyData.priorities;
        if (Object.values(priorities).some((v) => v === 0)) {
          return { valid: false, message: 'Vui lòng đánh giá tất cả các tiêu chí' };
        }
        break;
    }
    return { valid: true };
  };

  const handleNext = () => {
    const validation = validateStep(currentStep);
    
    if (!validation.valid) {
      toast.error(validation.message || 'Vui lòng hoàn thành câu hỏi này');
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Last step - submit
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Final validation
    for (let i = 0; i < totalSteps; i++) {
      const validation = validateStep(i);
      if (!validation.valid) {
        toast.error(`Bước ${i + 1}: ${validation.message}`);
        setCurrentStep(i);
        return;
      }
    }

    onSubmit(surveyData);
  };

  const updateSurveyData = (field: string, value: any) => {
    setSurveyData((prev) => ({ ...prev, [field]: value }));
  };

  const renderQuestion = () => {
    const questionProps = {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -50 },
      transition: { duration: 0.3 },
    };

    switch (currentStep) {
      case 0:
        return (
          <motion.div {...questionProps}>
            <GradeLevelQuestion
              value={surveyData.gradeLevel}
              onChange={(value) => updateSurveyData('gradeLevel', value)}
            />
          </motion.div>
        );
      case 1:
        return (
          <motion.div {...questionProps}>
            <SubjectsQuestion
              value={surveyData.subjects}
              onChange={(value) => updateSurveyData('subjects', value)}
            />
          </motion.div>
        );
      case 2:
        return (
          <motion.div {...questionProps}>
            <GoalsQuestion
              value={surveyData.goals}
              onChange={(value) => updateSurveyData('goals', value)}
            />
          </motion.div>
        );
      case 3:
        return (
          <motion.div {...questionProps}>
            <ChallengesQuestion
              value={surveyData.currentChallenges}
              onChange={(value) => updateSurveyData('currentChallenges', value)}
            />
          </motion.div>
        );
      case 4:
        return (
          <motion.div {...questionProps}>
            <TeachingModeQuestion
              value={surveyData.teachingMode}
              onChange={(value) => updateSurveyData('teachingMode', value)}
            />
          </motion.div>
        );
      case 5:
        return (
          <motion.div {...questionProps}>
            <StylesQuestion
              value={surveyData.preferredTeachingStyle}
              onChange={(value) => updateSurveyData('preferredTeachingStyle', value)}
            />
          </motion.div>
        );
      case 6:
        return (
          <motion.div {...questionProps}>
            <AvailableTimeQuestion
              value={surveyData.availableTime}
              onChange={(value) => updateSurveyData('availableTime', value)}
            />
          </motion.div>
        );
      case 7:
        return (
          <motion.div {...questionProps}>
            <BudgetQuestion
              value={surveyData.budgetRange}
              onChange={(value) => updateSurveyData('budgetRange', value)}
            />
          </motion.div>
        );
      case 8:
        return (
          <motion.div {...questionProps}>
            <StudyFrequencyQuestion
              value={surveyData.studyFrequency}
              onChange={(value) => updateSurveyData('studyFrequency', value)}
            />
          </motion.div>
        );
      case 9:
        return (
          <motion.div {...questionProps}>
            <LearningPaceQuestion
              value={surveyData.learningPace}
              onChange={(value) => updateSurveyData('learningPace', value)}
            />
          </motion.div>
        );
      case 10:
        return (
          <motion.div {...questionProps}>
            <PrioritiesQuestion
              value={surveyData.priorities}
              onChange={(value) => updateSurveyData('priorities', value)}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <SurveyProgress
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepTitles={stepTitles}
        />

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <AnimatePresence mode="wait">{renderQuestion()}</AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={currentStep === 0 ? onCancel : handlePrevious}
            disabled={isSubmitting}
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>{currentStep === 0 ? 'Hủy' : 'Quay lại'}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg flex items-center space-x-2 disabled:opacity-50"
          >
            <span>
              {currentStep === totalSteps - 1
                ? isSubmitting
                  ? 'Đang xử lý...'
                  : 'Hoàn thành'
                : 'Tiếp theo'}
            </span>
            {!isSubmitting && currentStep < totalSteps - 1 && (
              <ArrowRightIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyQuestions;

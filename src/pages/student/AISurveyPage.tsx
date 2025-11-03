import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSurveyStore } from '../../store/survey.store';
import { useAuthStore } from '../../store/auth.store';
import WelcomeScreen from '../../components/survey/WelcomeScreen';
import SurveyQuestions from '../../components/survey/SurveyQuestions';
import ProcessingScreen from '../../components/survey/ProcessingScreen';
import type { SurveyData } from '../../types/survey.types';

type SurveyStage = 'welcome' | 'questions' | 'processing' | 'completed';

const AISurveyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    submitSurvey,
    checkSurveyStatus,
    isSubmitting,
    hasCompletedSurvey,
    surveyResults,
    error,
    clearError,
  } = useSurveyStore();

  const [stage, setStage] = useState<SurveyStage>('welcome');

  // Check survey status on mount
  useEffect(() => {
    checkSurveyStatus();
  }, [checkSurveyStatus]);

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để làm khảo sát');
      navigate('/login');
    }
  }, [user, navigate]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
      // If error during processing, go back to questions
      if (stage === 'processing') {
        setStage('questions');
      }
    }
  }, [error, clearError, stage]);

  // Navigate to results when survey is completed
  useEffect(() => {
    if (stage === 'completed' && surveyResults) {
      navigate('/student/ai-survey/results');
    }
  }, [stage, surveyResults, navigate]);

  const handleStart = () => {
    setStage('questions');
  };

  const handleSkip = () => {
    toast.success('Bạn có thể làm khảo sát bất cứ lúc nào!');
    navigate('/student/dashboard');
  };

  const handleCancel = () => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-medium text-gray-800">
          Bạn có chắc muốn hủy khảo sát?
        </p>
        <div className="flex gap-3">
          <button
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold transition-colors"
            onClick={() => {
              toast.dismiss(t.id);
              navigate('/student/dashboard');
            }}
          >
            Xác nhận
          </button>
          <button
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-semibold transition-colors"
            onClick={() => toast.dismiss(t.id)}
          >
            Tiếp tục làm
          </button>
        </div>
      </div>
    ));
  };

  const handleSubmit = async (data: SurveyData) => {
    try {
      console.log('📋 Submitting survey:', data);
      setStage('processing');

      await submitSurvey(data);

      // Processing screen will auto-transition after animations
      setTimeout(() => {
        setStage('completed');
      }, 8000); // 8 seconds for processing animations
    } catch (error: any) {
      console.error('Survey submission error:', error);
      // Error handling is done in useEffect
    }
  };

  const handleProcessingComplete = () => {
    setStage('completed');
  };

  return (
    <AnimatePresence mode="wait">
      {stage === 'welcome' && (
        <motion.div
          key="welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <WelcomeScreen onStart={handleStart} onSkip={handleSkip} />
        </motion.div>
      )}

      {stage === 'questions' && (
        <motion.div
          key="questions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <SurveyQuestions
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </motion.div>
      )}

      {stage === 'processing' && (
        <motion.div
          key="processing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ProcessingScreen onComplete={handleProcessingComplete} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AISurveyPage;

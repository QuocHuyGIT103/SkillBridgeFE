import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSurveyStore } from '../../store/survey.store';
import { useAuthStore } from '../../store/auth.store';
import WelcomeScreen from '../../components/survey/WelcomeScreen';
import SurveyQuestions from '../../components/survey/SurveyQuestions';
import ProcessingScreen from '../../components/survey/ProcessingScreen';
import SurveyResultsContent from '../../components/survey/SurveyResultsContent';
import type { SurveyData } from '../../types/survey.types';

type SurveyStage = 'welcome' | 'questions' | 'processing' | 'completed' | 'summary';

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
    getSurvey,
    clearResults,
    isLoading,
  } = useSurveyStore();

  const [stage, setStage] = useState<SurveyStage>('welcome');
  const [isForceRetake, setIsForceRetake] = useState(() => {
    const shouldRetake = sessionStorage.getItem('surveyRetake') === 'true';
    if (shouldRetake) {
      sessionStorage.removeItem('surveyRetake');
    }
    return shouldRetake;
  });

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

  useEffect(() => {
    if (hasCompletedSurvey && !isForceRetake) {
      if (!surveyResults) {
        getSurvey();
      }
      setStage('summary');
    } else if (isForceRetake) {
      setStage('questions');
    } else {
      setStage('welcome');
    }
  }, [
    hasCompletedSurvey,
    isForceRetake,
    surveyResults,
    getSurvey,
  ]);

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

  // Navigate to dashboard when survey is completed so students immediately see matches
  useEffect(() => {
    if (stage === 'completed' && surveyResults) {
      navigate('/student/dashboard', {
        state: { showFreshResults: true },
        replace: true,
      });
    }
  }, [stage, surveyResults, navigate]);

  const handleStart = () => {
    setIsForceRetake(false);
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
      setIsForceRetake(false);
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

  const handleSummaryRetake = () => {
    setIsForceRetake(true);
    clearResults();
    setStage('questions');
  };

  if (stage === 'summary') {
    if (isLoading || !surveyResults) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500" />
        </div>
      );
    }

    return (
      <SurveyResultsContent
        surveyResults={surveyResults}
        onRetake={handleSummaryRetake}
      />
    );
  }

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

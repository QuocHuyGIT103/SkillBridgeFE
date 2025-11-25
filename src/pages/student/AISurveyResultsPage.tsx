import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyStore } from '../../store/survey.store';
import SurveyResultsContent from '../../components/survey/SurveyResultsContent';

const AISurveyResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { surveyResults, clearResults, getSurvey, isLoading } = useSurveyStore();

  useEffect(() => {
    if (!surveyResults) {
      getSurvey();
    }
  }, [surveyResults, getSurvey]);

  useEffect(() => {
    if (!isLoading && !surveyResults) {
      navigate('/student/ai-survey');
    }
  }, [surveyResults, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!surveyResults) {
    return null;
  }

  const handleRetakeSurvey = () => {
    sessionStorage.setItem('surveyRetake', 'true');
    clearResults();
    navigate('/student/ai-survey');
  };

  return <SurveyResultsContent surveyResults={surveyResults} onRetake={handleRetakeSurvey} />;
};

export default AISurveyResultsPage;

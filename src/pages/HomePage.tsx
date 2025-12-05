import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../layouts/Header";
import Hero from "../components/sections/Hero";
import Features from "../components/sections/Features";
import Testimonials from "../components/sections/Testimonials";
import Footer from "../layouts/Footer";
import { useAuthStore } from "../store/auth.store";
import { useSurveyStore } from "../store/survey.store";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const {
    hasCompletedSurvey,
    isCheckingStatus,
    checkSurveyStatus,
  } = useSurveyStore();
  const statusRequestedRef = useRef(false);

  const isStudent =
    isAuthenticated && user?.role?.toLowerCase() === "student";

  useEffect(() => {
    if (!isStudent || hasCompletedSurvey) {
      return;
    }

    if (!statusRequestedRef.current) {
      statusRequestedRef.current = true;
      checkSurveyStatus().catch(() => null);
    }
  }, [isStudent, hasCompletedSurvey, checkSurveyStatus]);

  useEffect(() => {
    if (!isStudent) {
      return;
    }

    if (!isCheckingStatus && !hasCompletedSurvey) {
      navigate("/student/ai-survey", { replace: true });
    }
  }, [isStudent, isCheckingStatus, hasCompletedSurvey, navigate]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;

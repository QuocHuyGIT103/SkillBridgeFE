import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/auth.store";
import { useSurveyStore } from "../store/survey.store";
import StudentDashboardSidebar from "./StudentDashboardSidebar";
import DashboardHeader from "./DashboardHeader";

const StudentDashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const {
    hasCompletedSurvey,
    surveyResults,
    getSurvey,
  } = useSurveyStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role?.toLowerCase() !== "student") {
      navigate("/");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch latest survey detail so dashboard widgets & summary always have data
  useEffect(() => {
    if (
      !isAuthenticated ||
      user?.role?.toLowerCase() !== "student" ||
      !hasCompletedSurvey ||
      surveyResults
    ) {
      return;
    }

    getSurvey().catch(() => null);
  }, [
    isAuthenticated,
    user,
    hasCompletedSurvey,
    surveyResults,
    getSurvey,
  ]);

  // NOTE: Removed forced navigation to survey - students can now skip survey
  // and access all features without completing AI onboarding survey

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isAuthenticated || user?.role?.toLowerCase() !== "student") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // NOTE: Removed survey blocking logic - students can now access dashboard without completing survey

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Student Sidebar */}
      <StudentDashboardSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main content area */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Header */}
        <DashboardHeader
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Main content */}
        <main className="p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboardLayout;

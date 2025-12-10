import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyOTPPage from "./pages/auth/VerifyOTPPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import TutorDashboardLayout from "./layouts/TutorDashboardLayout";
import TutorDashboardOverview from "./pages/tutor/TutorDashboardOverview";
import TutorProfilePage from "./pages/tutor/TutorProfilePage";
import TutorPersonalProfilePage from "./pages/tutor/TutorPersonalProfilePage";
import TutorEducationPage from "./pages/tutor/TutorEducationPage";
import TutorSchedulePage from "./pages/tutor/TutorSchedulePage";
import TutorAssignmentsPage from "./pages/tutor/TutorAssignmentsPage";
import TutorExerciseBankPage from "./pages/tutor/TutorExerciseBankPage";

import CreateTutorPostPage from "./pages/tutor/CreateTutorPostPage";
import EditTutorPostPage from "./pages/tutor/EditTutorPostPage";
import TutorPostListPage from "./pages/tutor/TutorPostListPage";
import TutorStudentPostsPage from "./pages/tutor/TutorStudentPostsPage";
import TutorStudentPostDetailPage from "./pages/tutor/TutorStudentPostDetailPage";
import CreateTeachRequestPage from "./pages/tutor/CreateTeachRequestPage";
import TutorSearchPage from "./pages/TutorSearchPage";
import TutorPostDetailPage from "./pages/TutorPostDetailPage";
import StudentDashboardLayout from "./layouts/StudentDashboardLayout";
import NewStudentDashboard from "./pages/student/NewStudentDashboard";
import StudentSchedulePage from "./pages/student/StudentSchedulePage";
import StudentMessagesPage from "./pages/student/StudentMessagesPage";
import StudentAssignmentsPage from "./pages/student/StudentAssignmentsPage";

// ✅ Thêm Student Profile Pages
import StudentProfilePage from "./pages/student/profile/StudentProfilePage";
import StudentPersonalProfilePage from "./pages/student/profile/StudentPersonalProfilePage";
import StudentPreferencesPage from "./pages/student/profile/StudentPreferencesPage";
import StudentContactRequestsPage from "./pages/student/StudentContactRequestsPage";
import StudentContractsPage from "./pages/student/StudentContractsPage";
import StudentContractDetailPage from "./pages/student/StudentContractDetailPage";

// ✅ AI Survey Pages
import AISurveyPage from "./pages/student/AISurveyPage";
import AISurveyResultsPage from "./pages/student/AISurveyResultsPage";

import AdminDashboardLayout from "./layouts/AdminDashboardLayout";
import AdminDashboardOverview from "./pages/admin/AdminDashboardOverview";
import UsersManagement from "./pages/admin/UsersManagement";
import VerificationApprovalPage from "./pages/admin/authentication/VerificationApprovalPage";
import TransactionsManagement from "./pages/admin/TransactionsManagement";
import SessionReportsManagement from "./pages/admin/SessionReportsManagement";
import BulkNotifications from "./pages/admin/BulkNotifications";
import ToastProvider from "./components/ToastProvider";
import { NotificationProvider } from "./contexts/NotificationContext";
import { useAuthStore } from "./store/auth.store";
import { useFirebase } from "./hooks/useFirebase";
import MyPostsPage from "./pages/student/MyPostsPage";
import PostFormPage from "./pages/student/PostFormPage";
import AdminPostReviewPage from "./pages/admin/posts/AdminPostReviewPage";
import PostDetailPage from "./pages/student/PostDetailPage";
import StudentSmartSearchPage from "./pages/student/StudentSmartSearchPage";
import AISmartRecommendationsPage from "./pages/student/AISmartRecommendationsPage";
import TutorAISmartRecommendationsPage from "./pages/tutor/TutorAISmartRecommendationsPage";
import ContactRequestDetail from "./components/contactRequest/ContactRequestDetail";
import TutorContactRequestsPage from "./pages/tutor/TutorContactRequestsPage";
import StudentClassesPage from "./pages/student/StudentClassesPage";
import StudentClassDetailPage from "./pages/student/StudentClassDetailPage";
import StudentClassSchedulePage from "./pages/student/StudentClassSchedulePage";
import StudentPaymentPage from "./pages/student/StudentPaymentPage";
import StudentPaymentHistoryPage from "./pages/student/StudentPaymentHistoryPage";
import PaymentSuccessPage from "./pages/student/PaymentSuccessPage";
import PaymentFailurePage from "./pages/student/PaymentFailurePage";
import StudentFinanceOverviewPage from "./pages/student/StudentFinanceOverviewPage";
import StudentFinancePaymentPage from "./pages/student/StudentFinancePaymentPage";
import TutorClassesPage from "./pages/tutor/TutorClassesPage";
import TutorClassDetailPage from "./pages/tutor/TutorClassDetailPage";
import TutorClassSchedulePage from "./pages/tutor/TutorClassSchedulePage";
import TutorMessagesPage from "./pages/tutor/TutorMessagesPage";
import TutorFinancePage from "./pages/tutor/TutorFinancePage";
import RequireTutorOperate from "./features/tutor/RequireTutorOperate";

// Protected Route wrapper for role-based access
const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: string;
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    requiredRole &&
    user?.role?.toUpperCase() !== requiredRole.toUpperCase()
  ) {
    // Redirect to appropriate dashboard based on user role
    switch (user?.role?.toUpperCase()) {
      case "ADMIN":
        return <Navigate to="/admin/dashboard" replace />;
      case "TUTOR":
        return <Navigate to="/tutor/dashboard" replace />;
      case "STUDENT":
        return <Navigate to="/student/dashboard" replace />;
      case "PARENT":
        return <Navigate to="/parent/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

// Redirect authenticated users based on their role
const RoleBasedRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user?.role) {
    switch (user.role.toUpperCase()) {
      case "TUTOR":
        return <Navigate to="/tutor/dashboard" replace />;
      case "ADMIN":
        return <Navigate to="/admin/dashboard" replace />;
      case "STUDENT":
        return <Navigate to="/student/dashboard" replace />;
      case "PARENT":
        return <Navigate to="/parent/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Navigate to="/" replace />;
};

function App() {
  useFirebase();

  return (
    <NotificationProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tutors" element={<TutorSearchPage />} />
            <Route path="/tutors/:postId" element={<TutorPostDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Role-based redirect route */}
            <Route path="/dashboard" element={<RoleBasedRedirect />} />

            {/* Student Dashboard Routes */}
            <Route
              path="/student/*"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<NewStudentDashboard />} />
              <Route path="smart-search" element={<StudentSmartSearchPage />} />
              <Route
                path="ai-recommendations/:postId"
                element={<AISmartRecommendationsPage />}
              />

              {/* ✅ AI Survey Routes */}
              <Route path="ai-survey" element={<AISurveyPage />} />
              <Route
                path="ai-survey/results"
                element={<AISurveyResultsPage />}
              />

              <Route path="schedule" element={<StudentSchedulePage />} />
              <Route path="messages" element={<StudentMessagesPage />} />
              <Route path="posts/create" element={<PostFormPage />} />
              <Route path="posts/edit/:id" element={<PostFormPage />} />
              <Route path="my-posts" element={<MyPostsPage />} />
              <Route path="posts/:id" element={<PostDetailPage />} />

              {/* ✅ Thêm Contact Requests routes cho Student */}
              <Route
                path="contact-requests"
                element={<StudentContactRequestsPage />}
              />
              <Route
                path="contact-requests/:requestId"
                element={<ContactRequestDetail />}
              />

              {/* Student Contracts Routes */}
              <Route path="contracts" element={<StudentContractsPage />} />
              <Route
                path="contracts/:contractId"
                element={<StudentContractDetailPage />}
              />

              {/* Student Profile Routes */}
              <Route path="profile" element={<StudentProfilePage />} />
              <Route
                path="profile/personal"
                element={<StudentPersonalProfilePage />}
              />
              <Route
                path="profile/preferences"
                element={<StudentPreferencesPage />}
              />

              {/* Student Classes Routes */}
              <Route path="classes" element={<StudentClassesPage />} />
              <Route
                path="classes/:classId"
                element={<StudentClassDetailPage />}
              />
              <Route
                path="classes/:classId/schedule"
                element={<StudentClassSchedulePage />}
              />
              <Route
                path="classes/:classId/payment"
                element={<StudentPaymentPage />}
              />

              {/* Finance Management Routes */}
              <Route
                path="finance/overview"
                element={<StudentFinanceOverviewPage />}
              />
              <Route
                path="finance/payment"
                element={<StudentFinancePaymentPage />}
              />

              {/* Payment Routes */}
              <Route
                path="payments/history"
                element={<StudentPaymentHistoryPage />}
              />
              <Route path="payment/success" element={<PaymentSuccessPage />} />
              <Route path="payment/failure" element={<PaymentFailurePage />} />
              <Route path="assignments" element={<StudentAssignmentsPage />} />
              <Route
                path="ratings"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Ratings - Coming Soon
                  </div>
                }
              />
              <Route
                path="ai-suggestions"
                element={
                  <div className="text-center py-8 text-gray-500">
                    AI Suggestions - Coming Soon
                  </div>
                }
              />
              <Route
                path="settings"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Settings - Coming Soon
                  </div>
                }
              />
            </Route>

            {/* Tutor Dashboard Routes */}
            <Route
              path="/tutor/*"
              element={
                <ProtectedRoute requiredRole="tutor">
                  <TutorDashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<TutorDashboardOverview />} />
              <Route
                path="ai-recommendations"
                element={<TutorAISmartRecommendationsPage />}
              />
              <Route path="profile" element={<TutorProfilePage />} />
              <Route
                path="profile/personal"
                element={<TutorPersonalProfilePage />}
              />
              <Route
                path="profile/education"
                element={<TutorEducationPage />}
              />
              <Route path="profile/*" element={<TutorProfilePage />} />
              <Route path="schedule" element={<TutorSchedulePage />} />
              <Route path="schedule/*" element={<TutorSchedulePage />} />
              <Route path="assignments" element={<TutorAssignmentsPage />} />
              <Route path="exercise-bank" element={<TutorExerciseBankPage />} />

              {/* ✅ Thêm Contact Requests routes cho Tutor */}
              <Route
                path="contact-requests"
                element={<TutorContactRequestsPage />}
              />
              <Route
                path="contact-requests/:requestId"
                element={<ContactRequestDetail />}
              />
              <Route path="classes" element={<TutorClassesPage />} />
              <Route
                path="classes/:classId"
                element={<TutorClassDetailPage />}
              />
              <Route
                path="classes/:classId/schedule"
                element={<TutorClassSchedulePage />}
              />

              <Route
                path="academics"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Academic Affairs - Coming Soon
                  </div>
                }
              />
              <Route
                path="academics/*"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Academic Affairs - Coming Soon
                  </div>
                }
              />
              <Route
                path="posts"
                element={
                  <RequireTutorOperate>
                    <TutorPostListPage />
                  </RequireTutorOperate>
                }
              />
              <Route
                path="posts/student"
                element={
                  <RequireTutorOperate>
                    <TutorStudentPostsPage />
                  </RequireTutorOperate>
                }
              />
              <Route
                path="posts/student/:id"
                element={
                  <RequireTutorOperate>
                    <TutorStudentPostDetailPage />
                  </RequireTutorOperate>
                }
              />
              <Route
                path="posts/student/:id/request"
                element={
                  <RequireTutorOperate>
                    <CreateTeachRequestPage />
                  </RequireTutorOperate>
                }
              />
              <Route
                path="posts/create"
                element={
                  <RequireTutorOperate>
                    <CreateTutorPostPage />
                  </RequireTutorOperate>
                }
              />
              <Route
                path="posts/edit/:postId"
                element={
                  <RequireTutorOperate>
                    <EditTutorPostPage />
                  </RequireTutorOperate>
                }
              />
              <Route path="messages" element={<TutorMessagesPage />} />
              <Route path="messages/*" element={<TutorMessagesPage />} />
              <Route path="finance" element={<TutorFinancePage />} />
            </Route>

            {/* Admin Dashboard Routes - giữ nguyên như cũ */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Admin routes giữ nguyên */}
              <Route path="dashboard" element={<AdminDashboardOverview />} />

              {/* User Management */}
              <Route path="users" element={<UsersManagement />} />
              <Route path="posts/review" element={<AdminPostReviewPage />} />

              {/* Authentication & Quality */}
              <Route
                path="verification-approval"
                element={<VerificationApprovalPage />}
              />

              {/* Transaction Management */}
              <Route path="transactions" element={<TransactionsManagement />} />

              {/* Session Reports Management */}
              <Route
                path="session-reports"
                element={<SessionReportsManagement />}
              />

              {/* Bulk Notifications */}
              <Route path="notifications" element={<BulkNotifications />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </NotificationProvider>
  );
}

export default App;

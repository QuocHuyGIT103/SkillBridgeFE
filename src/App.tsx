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
import TutorSchedulePage from "./pages/tutor/TutorSchedulePage";
import TutorChatPage from "./pages/tutor/TutorChatPage";
import ToastProvider from "./components/ToastProvider";
import { useAuthStore } from "./store/auth.store";
// import CoursesPage from './components/pages/CoursesPage';
// import AboutPage from './components/pages/AboutPage';

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
    user?.role?.toLowerCase() !== requiredRole.toLowerCase()
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Redirect authenticated users based on their role
const RoleBasedRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user?.role?.toLowerCase() === "tutor") {
    return <Navigate to="/tutor/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Role-based redirect route */}
          <Route path="/dashboard" element={<RoleBasedRedirect />} />

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
            <Route path="profile" element={<TutorProfilePage />} />
            <Route path="profile/*" element={<TutorProfilePage />} />
            <Route path="schedule" element={<TutorSchedulePage />} />
            <Route path="schedule/*" element={<TutorSchedulePage />} />
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
            <Route path="chat" element={<TutorChatPage />} />
            <Route path="chat/*" element={<TutorChatPage />} />
            <Route
              path="finance"
              element={
                <div className="text-center py-8 text-gray-500">
                  Finance Management - Coming Soon
                </div>
              }
            />
            <Route
              path="finance/*"
              element={
                <div className="text-center py-8 text-gray-500">
                  Finance Management - Coming Soon
                </div>
              }
            />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />

          {/* <Route path="/courses" element={<CoursesPage />} />
          <Route path="/about" element={<AboutPage />} /> */}
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;

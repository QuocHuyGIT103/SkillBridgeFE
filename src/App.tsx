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
import TutorChatPage from "./pages/tutor/TutorChatPage";
import AdminDashboardLayout from "./layouts/AdminDashboardLayout";
import AdminDashboardOverview from "./pages/admin/AdminDashboardOverview";
import UserManagementList from "./pages/admin/users/UserManagementList";
import TutorApprovalPage from "./pages/admin/authentication/TutorApprovalPage";
import TransactionManagement from "./pages/admin/transactions/TransactionManagement";
import ComplaintManagement from "./pages/admin/complaints/ComplaintManagement";
import SystemConfiguration from "./pages/admin/config/SystemConfiguration";
import ToastProvider from "./components/ToastProvider";
import { NotificationProvider } from "./contexts/NotificationContext";
import { useAuthStore } from "./store/auth.store";
import { useFirebase } from "./hooks/useFirebase";
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

  if (isAuthenticated && user?.role?.toLowerCase() === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
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

            {/* Admin Dashboard Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboardOverview />} />

              {/* User Management */}
              <Route path="users/list" element={<UserManagementList />} />
              <Route path="users/students" element={<UserManagementList />} />
              <Route path="users/tutors" element={<UserManagementList />} />
              <Route path="users/blocked" element={<UserManagementList />} />
              <Route path="users/reports" element={<UserManagementList />} />

              {/* Authentication & Quality */}
              <Route
                path="authentication/tutor-approval"
                element={<TutorApprovalPage />}
              />
              <Route
                path="authentication/certificates"
                element={<TutorApprovalPage />}
              />
              <Route
                path="authentication/history"
                element={<TutorApprovalPage />}
              />
              <Route
                path="authentication/quality"
                element={<TutorApprovalPage />}
              />

              {/* Operations Management */}
              <Route
                path="operations/sessions"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Session Management - Coming Soon
                  </div>
                }
              />
              <Route
                path="operations/sessions/ongoing"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Ongoing Sessions - Coming Soon
                  </div>
                }
              />
              <Route
                path="operations/sessions/history"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Session History - Coming Soon
                  </div>
                }
              />
              <Route
                path="operations/analytics"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Session Analytics - Coming Soon
                  </div>
                }
              />

              {/* Transaction Management */}
              <Route
                path="transactions/overview"
                element={<TransactionManagement />}
              />
              <Route
                path="transactions/payments"
                element={<TransactionManagement />}
              />
              <Route
                path="transactions/withdrawals"
                element={<TransactionManagement />}
              />
              <Route
                path="transactions/refunds"
                element={<TransactionManagement />}
              />
              <Route
                path="transactions/commission"
                element={<TransactionManagement />}
              />
              <Route
                path="transactions/reports"
                element={<TransactionManagement />}
              />

              {/* Complaints Management */}
              <Route
                path="complaints/pending"
                element={<ComplaintManagement />}
              />
              <Route
                path="complaints/investigating"
                element={<ComplaintManagement />}
              />
              <Route
                path="complaints/resolved"
                element={<ComplaintManagement />}
              />
              <Route
                path="complaints/dismissed"
                element={<ComplaintManagement />}
              />
              <Route
                path="complaints/analytics"
                element={<ComplaintManagement />}
              />

              {/* Reports & Analytics */}
              <Route
                path="reports/revenue"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Revenue Reports - Coming Soon
                  </div>
                }
              />
              <Route
                path="reports/users"
                element={
                  <div className="text-center py-8 text-gray-500">
                    User Analytics - Coming Soon
                  </div>
                }
              />
              <Route
                path="reports/sessions"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Session Statistics - Coming Soon
                  </div>
                }
              />
              <Route
                path="reports/growth"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Growth Metrics - Coming Soon
                  </div>
                }
              />
              <Route
                path="reports/performance"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Performance Dashboard - Coming Soon
                  </div>
                }
              />
              <Route
                path="reports/custom"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Custom Reports - Coming Soon
                  </div>
                }
              />

              {/* Content Management */}
              <Route
                path="content/pages"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Static Pages Management - Coming Soon
                  </div>
                }
              />
              <Route
                path="content/privacy"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Privacy Policy - Coming Soon
                  </div>
                }
              />
              <Route
                path="content/terms"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Terms of Service - Coming Soon
                  </div>
                }
              />
              <Route
                path="content/faq"
                element={
                  <div className="text-center py-8 text-gray-500">
                    FAQ Management - Coming Soon
                  </div>
                }
              />
              <Route
                path="content/announcements"
                element={
                  <div className="text-center py-8 text-gray-500">
                    System Announcements - Coming Soon
                  </div>
                }
              />

              {/* System Configuration */}
              <Route path="config/system" element={<SystemConfiguration />} />
              <Route
                path="config/commission"
                element={<SystemConfiguration />}
              />
              <Route path="config/payment" element={<SystemConfiguration />} />
              <Route path="config/refund" element={<SystemConfiguration />} />
              <Route
                path="config/notifications"
                element={<SystemConfiguration />}
              />
              <Route path="config/security" element={<SystemConfiguration />} />

              {/* Mass Notifications */}
              <Route
                path="notifications/send"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Send Mass Notifications - Coming Soon
                  </div>
                }
              />
              <Route
                path="notifications/templates"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Notification Templates - Coming Soon
                  </div>
                }
              />
              <Route
                path="notifications/history"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Notification History - Coming Soon
                  </div>
                }
              />
              <Route
                path="notifications/analytics"
                element={
                  <div className="text-center py-8 text-gray-500">
                    Notification Analytics - Coming Soon
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
    </NotificationProvider>
  );
}

export default App;

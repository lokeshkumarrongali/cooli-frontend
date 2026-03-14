import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import Navbar from "./components/Navbar";
import { RoleProvider } from "./context/RoleContext";
import { UserProfileProvider } from "./context/UserProfileContext";
import { ToastContainer } from "./components/ToastNotifications";

// Auth pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import AuthDashboard from "./pages/Dashboard";

// Role pages (Phase 1)
import RoleDashboard from "./pages/dashboard/RoleDashboard";
import WorkerHome from "./pages/worker/WorkerHome";
import WorkerProfile from "./pages/worker/WorkerProfile";
import EmployerHome from "./pages/employer/EmployerHome";
import EmployerProfile from "./pages/employer/EmployerProfile";

// Job Marketplace Pages (Phase 6)
import JobDetails from "./pages/JobDetails";
import WorkerJobs from "./pages/worker/WorkerJobs";
import EmployerJobs from "./pages/employer/EmployerJobs";
import EmployerPostJob from "./pages/employer/EmployerPostJob";
import EmployerApplicant from "./pages/employer/EmployerApplicant";
import LeaveReview from "./pages/LeaveReview";
import Workers from "./pages/employer/Workers";
import Messages from "./pages/messages/Messages";
import ChatPage from "./pages/messages/ChatPage";
import SavedJobs from "./pages/worker/SavedJobs";
import WorkerProfilePage from "./pages/employer/WorkerProfilePage";

// Auth paths where the Navbar must NOT appear
const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/verify-email"];

function App() {
  const location = useLocation();
  const showNavbar = !AUTH_PATHS.includes(location.pathname);

  return (
    <UserProfileProvider>
      <RoleProvider>
        {showNavbar && <Navbar />}
        <ToastContainer />

        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected Main Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Role-Specific Routes */}
          <Route
            path="/worker/home"
            element={
              <ProtectedRoute>
                <WorkerHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/profile"
            element={
              <ProtectedRoute>
                <WorkerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/home"
            element={
              <ProtectedRoute>
                <EmployerHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/profile"
            element={
              <ProtectedRoute>
                <EmployerProfile />
              </ProtectedRoute>
            }
          />

          {/* Job Marketplace Routes */}
          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute>
                <JobDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/jobs"
            element={
              <ProtectedRoute>
                <WorkerJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/jobs"
            element={
              <ProtectedRoute>
                <EmployerJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/post-job"
            element={
              <ProtectedRoute>
                <EmployerPostJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/jobs/:id/applicants"
            element={
              <ProtectedRoute>
                <EmployerApplicant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews/new"
            element={
              <ProtectedRoute>
                <LeaveReview />
              </ProtectedRoute>
            }
          />
          
          {/* Messaging System */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:conversationId"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workers"
            element={
              <ProtectedRoute>
                <Workers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workers/:id"
            element={
              <ProtectedRoute>
                <WorkerProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/saved-jobs"
            element={
              <ProtectedRoute>
                <SavedJobs />
              </ProtectedRoute>
            }
          />

          {/* General Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </RoleProvider>
    </UserProfileProvider>
  );
}

export default App;

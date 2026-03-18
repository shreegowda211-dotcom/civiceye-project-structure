// removed placeholder toaster/sonner/tooltip providers
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Citizen Pages
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import CitizenProfile from "./pages/citizen/CitizenProfile";
import CitizenNotifications from "./pages/citizen/CitizenNotifications";
import CitizenFeedback from "./pages/citizen/CitizenFeedback";
import ReportIssue from "./pages/citizen/ReportIssue";
import AllIssues from "./pages/citizen/AllIssues";
import IssueTracking from "./pages/citizen/IssueTracking";

// Officer Pages
import OfficerDashboard from "./pages/officer/OfficerDashboard";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAreas from "./pages/admin/AdminAreas";
import AdminCategoryDashboard from "./pages/admin/AdminCategoryDashboard";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminEscalatedComplaints from "./pages/admin/EscalatedComplaints";
import AdminFeedbackMonitoring from "./pages/admin/AdminFeedbackMonitoring";
import AdminHelp from "./pages/admin/AdminHelp";
import AdminManageOfficers from "./pages/admin/AdminManageOfficers";
import AdminReports from "./pages/admin/AdminReports";
import AdminServices from "./pages/admin/AdminServices";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAllIssues from "./pages/admin/AllIssues";

const queryClient = new QueryClient();

// Protected Route Component
/**
 * @param {{ children: React.ReactNode; allowedRoles: string[] }} props
 */
function ProtectedRoute({ 
  children, 
  allowedRoles 
}) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role?.toLowerCase())) {
    // Redirect to appropriate dashboard based on role
    switch (user.role?.toLowerCase()) {
      case 'citizen':
        return <Navigate to="/citizen" replace />;
      case 'officer':
        return <Navigate to="/officer" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to={
              user?.role?.toLowerCase() === 'citizen' ? '/citizen' :
              user?.role?.toLowerCase() === 'officer' ? '/officer' :
              user?.role?.toLowerCase() === 'admin' ? '/admin' : '/'
            } replace />
          ) : (
            <Landing />
          )
        } 
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Citizen Routes */}
      <Route
        path="/citizen"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/report"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <ReportIssue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/issues"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <AllIssues />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/track"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <IssueTracking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/track/:issueId"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <IssueTracking />
          </ProtectedRoute>
        }
      />      <Route
        path="/citizen/dashboard"
        element={
          <ProtectedRoute allowedRoles={["citizen"]}>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/profile"
        element={
          <ProtectedRoute allowedRoles={["citizen"]}>
            <CitizenProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/notifications"
        element={
          <ProtectedRoute allowedRoles={["citizen"]}>
            <CitizenNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/feedback"
        element={
          <ProtectedRoute allowedRoles={["citizen"]}>
            <CitizenFeedback />
          </ProtectedRoute>
        }
      />
      {/* Officer Routes */}
      <Route
        path="/officer"
        element={
          <ProtectedRoute allowedRoles={['officer']}>
            <OfficerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer/issues"
        element={
          <ProtectedRoute allowedRoles={['officer']}>
            <OfficerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer/update"
        element={
          <ProtectedRoute allowedRoles={['officer']}>
            <OfficerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCategoryDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/issues"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAllIssues />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-officer"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Navigate to="/admin/manage-officers" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDepartments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/areas"
        element={
          <ProtectedRoute allowedRoles={[ 'admin' ]}>
            <AdminAreas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute allowedRoles={[ 'admin' ]}>
            <AdminCategoryDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/help"
        element={
          <ProtectedRoute allowedRoles={[ 'admin' ]}>
            <AdminHelp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/manage-officers"
        element={
          <ProtectedRoute allowedRoles={[ 'admin' ]}>
            <AdminManageOfficers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={[ 'admin' ]}>
            <AdminReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/services"
        element={
          <ProtectedRoute allowedRoles={[ 'admin' ]}>
            <AdminServices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={[ 'admin' ]}>
            <AdminSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/escalated"
        element={
          <ProtectedRoute allowedRoles={[ 'admin' ]}>
            <AdminEscalatedComplaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/feedback"
        element={
          <ProtectedRoute allowedRoles={[ 'admin' ]}>
            <AdminFeedbackMonitoring />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppRoutes />
  </QueryClientProvider>
);

export default App;




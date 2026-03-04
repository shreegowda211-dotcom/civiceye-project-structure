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
import ReportIssue from "./pages/citizen/ReportIssue";
import IssueTracking from "./pages/citizen/IssueTracking";

// Officer Pages
import OfficerDashboard from "./pages/officer/OfficerDashboard";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import TransparencyDashboard from "./pages/admin/TransparencyDashboard";

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
            <CitizenDashboard />
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
            <TransparencyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/issues"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
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




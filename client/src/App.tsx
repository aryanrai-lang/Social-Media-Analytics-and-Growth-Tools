import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import OAuthCallback from "@/pages/OAuthCallback";
import WorkspaceList from "@/pages/WorkspaceList";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Overview from "@/pages/dashboard/Overview";
import Competitors from "@/pages/dashboard/Competitors";
import AIInsights from "@/pages/dashboard/AIInsights";
import ContentPlan from "@/pages/dashboard/ContentPlan";
import WorkspaceSettings from "@/pages/dashboard/Settings";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />

          {/* Protected routes */}
          <Route
            path="/workspaces"
            element={
              <ProtectedRoute>
                <WorkspaceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspaces/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="competitors" element={<Competitors />} />
            <Route path="ai-insights" element={<AIInsights />} />
            <Route path="content-plan" element={<ContentPlan />} />
            <Route path="settings" element={<WorkspaceSettings />} />
          </Route>

          <Route path="/" element={<Navigate to="/workspaces" replace />} />
          <Route path="*" element={<Navigate to="/workspaces" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;


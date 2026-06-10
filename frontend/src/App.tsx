import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store';


// Layouts
import Layout from './components/Layout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Private Pages
import DashboardPage from './pages/DashboardPage';
import KycPage from './pages/KycPage';
import CreditScorePage from './pages/CreditScorePage';
import LoanEligibilityPage from './pages/LoanEligibilityPage';
import LoanApplicationPage from './pages/LoanApplicationPage';
import AiRecommendationsPage from './pages/AiRecommendationsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';

// Admin Guard Component
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useSelector((state: RootState) => state.auth);
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Rendered inside Layout (without auth checks) */}
        <Route element={<Layout requireAuth={false} />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Protected User Routes - Rendered inside Layout (with auth checks) */}
        <Route element={<Layout requireAuth={true} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/kyc" element={<KycPage />} />
          <Route path="/credit-score" element={<CreditScorePage />} />
          <Route path="/eligibility" element={<LoanEligibilityPage />} />
          <Route path="/applications" element={<LoanApplicationPage />} />
          <Route path="/recommendations" element={<AiRecommendationsPage />} />
          <Route path="/settings" element={<ProfileSettingsPage />} />

          {/* Admin Protected Routes */}
          <Route 
            path="/admin" 
            element={
              <AdminGuard>
                <AdminDashboardPage />
              </AdminGuard>
            } 
          />
        </Route>

        {/* Catch all redirects to Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

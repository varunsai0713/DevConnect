import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DevConnectProvider } from './context/DevConnectContext';

// Import Pages
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <DevConnectProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Landing Route */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Paths */}
          <Route path="/login" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Configuration Setup Attributes */}
          <Route path="/profile-setup" element={<CompleteProfilePage />} />

          {/* Core Member Dashboard Hub */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Redirection Fallbacks */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DevConnectProvider>
  );
}

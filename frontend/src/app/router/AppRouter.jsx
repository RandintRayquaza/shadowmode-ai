import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/app/providers/AuthContext'
import ProtectedRoute from '@/app/router/ProtectedRoute'
import { Toaster } from '@/shared/components/ui/sonner'

// Pages
import LandingPage from '@/features/landing/ui/LandingPage'
import LoginPage from '@/features/auth/ui/LoginPage'
import SignupPage from '@/features/auth/ui/SignupPage'
import ForgotPasswordPage from '@/features/auth/ui/ForgotPasswordPage'
import OtpPage from '@/features/auth/ui/OtpPage'
import DashboardPage from '@/features/dashboard/ui/DashboardPage'
import AnalysisPage from '@/features/ai-analysis/ui/AnalysisPage'
import HistoryPage from '@/features/history/ui/HistoryPage'
import SettingsPage from '@/features/settings/ui/SettingsPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<OtpPage />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/analyze" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
          <Route path="/analyze/:id" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}

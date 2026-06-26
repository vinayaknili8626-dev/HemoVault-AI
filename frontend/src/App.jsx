import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout Components
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';

// Pages - Auth
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Pages - Common & Public
import LandingPage from './pages/Common/LandingPage';
import VerifyReportQR from './pages/Common/VerifyReportQR';
import HospitalFinder from './pages/Common/HospitalFinder';
import FAQ from './pages/Common/FAQ';

// Pages - Patient
import PatientDashboard from './pages/Patient/Dashboard';
import MyReports from './pages/Patient/MyReports';
import ReportDetails from './pages/Patient/ReportDetails';
import HealthAnalytics from './pages/Patient/HealthAnalytics';
import HealthTimeline from './pages/Patient/HealthTimeline';
import Profile from './pages/Patient/Profile';

// Pages - Doctor
import DoctorDashboard from './pages/Doctor/Dashboard';
import PatientsDirectory from './pages/Doctor/PatientsDirectory';
import PatientMedicalRecord from './pages/Doctor/PatientMedicalRecord';
import DoctorSchedule from './pages/Doctor/DoctorSchedule';

// Pages - Lab
import LabDashboard from './pages/Laboratory/Dashboard';
import UploadReport from './pages/Laboratory/UploadReport';
import LabDoctorDirectory from './pages/Laboratory/LabDoctorDirectory';

// Pages - Admin
import AdminDashboard from './pages/Admin/Dashboard';
import ManageUsers from './pages/Admin/ManageUsers';
import AuditLogs from './pages/Admin/AuditLogs';

// Protecting routes with Role Based Access Control
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-screen h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
        <span className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Loading your profile...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to default home based on actual role
    const homeRedirect = {
      patient: '/dashboard',
      doctor: '/doctor/dashboard',
      laboratory: '/lab/dashboard',
      hospital_admin: '/admin/dashboard',
      super_admin: '/admin/dashboard'
    };
    return <Navigate to={homeRedirect[user.role] || '/login'} replace />;
  }

  return children;
};

// Logged-in shell wrapping layout elements
const DashboardShell = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setIsMobileOpen={setIsMobileOpen} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/verify-report/:token" element={<VerifyReportQR />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Patient Panel (Also general report pages) */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <DashboardShell><PatientDashboard /></DashboardShell>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['patient', 'laboratory']}>
              <DashboardShell><MyReports /></DashboardShell>
            </ProtectedRoute>
          } />
          <Route path="/reports/:id" element={
            <ProtectedRoute allowedRoles={['patient', 'doctor', 'laboratory', 'super_admin']}>
              <DashboardShell><ReportDetails /></DashboardShell>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <DashboardShell><HealthAnalytics /></DashboardShell>
            </ProtectedRoute>
          } />
          <Route path="/timeline" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <DashboardShell><HealthTimeline /></DashboardShell>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <DashboardShell><Profile /></DashboardShell>
            </ProtectedRoute>
          } />
          <Route path="/hospital-finder" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <DashboardShell><HospitalFinder /></DashboardShell>
            </ProtectedRoute>
          } />

          {/* Doctor Panel */}
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DashboardShell><DoctorDashboard /></DashboardShell>
            </ProtectedRoute>
          } />
          <Route path="/doctor/patients" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DashboardShell><PatientsDirectory /></DashboardShell>
            </ProtectedRoute>
          } />
          <Route path="/doctor/patients/:id" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DashboardShell><PatientMedicalRecord /></DashboardShell>
            </ProtectedRoute>
          } />
          <Route path="/doctor/schedule" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DashboardShell><DoctorSchedule /></DashboardShell>
            </ProtectedRoute>
          } />

          {/* Laboratory Panel */}
          <Route path="/lab/dashboard" element={
            <ProtectedRoute allowedRoles={['laboratory']}>
              <DashboardShell><LabDashboard /></DashboardShell>
            </ProtectedRoute>
          } />
          <Route path="/lab/upload" element={
            <ProtectedRoute allowedRoles={['laboratory']}>
              <DashboardShell><UploadReport /></DashboardShell>
            </ProtectedRoute>
          } />
          <Route path="/lab/doctors" element={
            <ProtectedRoute allowedRoles={['laboratory']}>
              <DashboardShell><LabDoctorDirectory /></DashboardShell>
            </ProtectedRoute>
          } />

          {/* Hospital/Super Admin Panel */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['hospital_admin', 'super_admin']}>
              <DashboardShell><AdminDashboard /></DashboardShell>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['hospital_admin', 'super_admin']}>
              <DashboardShell><ManageUsers /></DashboardShell>
            </ProtectedRoute>
          } />
          <Route path="/admin/logs" element={
            <ProtectedRoute allowedRoles={['hospital_admin', 'super_admin']}>
              <DashboardShell><AuditLogs /></DashboardShell>
            </ProtectedRoute>
          } />

          {/* Common General Pages */}
          <Route path="/faq" element={
            <ProtectedRoute allowedRoles={['patient', 'doctor', 'laboratory', 'hospital_admin', 'super_admin']}>
              <DashboardShell><FAQ /></DashboardShell>
            </ProtectedRoute>
          } />

          {/* Fallbacks */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;

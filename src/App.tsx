import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';

const LandingPage = lazy(() => import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const RoleSelect = lazy(() => import('@/pages/RoleSelect').then((m) => ({ default: m.RoleSelect })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage').then((m) => ({ default: m.FeedbackPage })));
const StudentHome = lazy(() => import('@/pages/StudentHome').then((m) => ({ default: m.StudentHome })));
const HeadDashboard = lazy(() => import('@/pages/HeadDashboard').then((m) => ({ default: m.HeadDashboard })));
const CounsellorDetail = lazy(() => import('@/pages/CounsellorDetail').then((m) => ({ default: m.CounsellorDetail })));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const ManageCounsellors = lazy(() => import('@/pages/ManageCounsellors').then((m) => ({ default: m.ManageCounsellors })));
const ManageStudents = lazy(() => import('@/pages/ManageStudents').then((m) => ({ default: m.ManageStudents })));
const Approvals = lazy(() => import('@/pages/Approvals').then((m) => ({ default: m.Approvals })));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword').then((m) => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('@/pages/ResetPassword').then((m) => ({ default: m.ResetPassword })));
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })));

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/role-select" element={<RoleSelect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute roles={['student']}>
                <FeedbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/home"
            element={
              <ProtectedRoute roles={['student']}>
                <StudentHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/head/dashboard"
            element={
              <ProtectedRoute roles={['head_counsellor']}>
                <HeadDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/counsellor/:id"
            element={
              <ProtectedRoute roles={['admin', 'head_counsellor']}>
                <CounsellorDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/counsellors"
            element={
              <ProtectedRoute roles={['admin', 'head_counsellor']}>
                <ManageCounsellors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/approvals"
            element={
              <ProtectedRoute roles={['admin']}>
                <Approvals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute roles={['admin', 'head_counsellor']}>
                <ManageStudents />
              </ProtectedRoute>
            }
          />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
      <Toaster />
    </Layout>
  );
}

export default App;

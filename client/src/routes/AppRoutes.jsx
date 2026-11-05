import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import ClubsPage from '../pages/public/ClubsPage';
import ClubDetailPage from '../pages/public/ClubDetailPage';
import EventsPage from '../pages/public/EventsPage';
import EventDetailPage from '../pages/public/EventDetailPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import MyClubsPage from '../pages/student/MyClubsPage';
import MyEventsPage from '../pages/student/MyEventsPage';
import AttendanceHistoryPage from '../pages/student/AttendanceHistoryPage';

// President Pages
import PresidentDashboard from '../pages/president/PresidentDashboard';
import ClubSettingsPage from '../pages/president/ClubSettingsPage';
import MembersManagementPage from '../pages/president/MembersManagementPage';
import PresidentEventsPage from '../pages/president/PresidentEventsPage';
import AttendanceManagerPage from '../pages/president/AttendanceManagerPage';
import AnnouncementsPage from '../pages/president/AnnouncementsPage';

// Faculty Pages
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import EventApprovalsPage from '../pages/faculty/EventApprovalsPage';
import AssignedClubsPage from '../pages/faculty/AssignedClubsPage';
import ParticipationAnalyticsPage from '../pages/faculty/ParticipationAnalyticsPage';

// Common Authenticated Pages
import ProfilePage from '../pages/common/ProfilePage';
import NotificationsPage from '../pages/common/NotificationsPage';
import NotFoundPage from '../pages/common/NotFoundPage';

// Role Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to their respective dashboard
    if (user?.role === 'club_president') return <Navigate to="/dashboard/president" replace />;
    if (user?.role === 'faculty_advisor') return <Navigate to="/dashboard/faculty" replace />;
    return <Navigate to="/dashboard/student" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        {/* First page shows Login */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/clubs/:id" element={<ClubDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Authenticated Dashboard Pages */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Common Authenticated */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Student Routes */}
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/my-clubs"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <MyClubsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/events"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <MyEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/attendance"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AttendanceHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* Club President Routes */}
        <Route
          path="/dashboard/president"
          element={
            <ProtectedRoute allowedRoles={['club_president']}>
              <PresidentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/president/club"
          element={
            <ProtectedRoute allowedRoles={['club_president']}>
              <ClubSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/president/members"
          element={
            <ProtectedRoute allowedRoles={['club_president']}>
              <MembersManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/president/events"
          element={
            <ProtectedRoute allowedRoles={['club_president']}>
              <PresidentEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/president/attendance"
          element={
            <ProtectedRoute allowedRoles={['club_president']}>
              <AttendanceManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/president/announcements"
          element={
            <ProtectedRoute allowedRoles={['club_president']}>
              <AnnouncementsPage />
            </ProtectedRoute>
          }
        />

        {/* Faculty Advisor Routes */}
        <Route
          path="/dashboard/faculty"
          element={
            <ProtectedRoute allowedRoles={['faculty_advisor']}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/faculty/approvals"
          element={
            <ProtectedRoute allowedRoles={['faculty_advisor']}>
              <EventApprovalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/faculty/clubs"
          element={
            <ProtectedRoute allowedRoles={['faculty_advisor']}>
              <AssignedClubsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/faculty/analytics"
          element={
            <ProtectedRoute allowedRoles={['faculty_advisor']}>
              <ParticipationAnalyticsPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import {
  Layers,
  Calendar,
  CheckSquare,
  Clock,
  Compass,
  ArrowRight,
  Bell,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/student');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <SkeletonCard />
      </div>
    );
  }

  const stats = data?.stats || {
    joinedClubsCount: 0,
    upcomingRegisteredCount: 0,
    attendedCount: 0,
    attendanceRate: 100,
    pendingRequestsCount: 0,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 text-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-brand-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Student Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-brand-100 text-xs sm:text-sm mt-1 max-w-xl">
            {user?.department} • ID: {user?.studentId || 'Enrolled Student'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/clubs">
            <Button size="md" className="bg-white text-brand-900 hover:bg-brand-50 shadow-none">
              Explore Clubs
            </Button>
          </Link>
          <Link to="/events">
            <Button
              size="md"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 shadow-none"
            >
              Browse Events
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Joined Clubs */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Joined Clubs</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.joinedClubsCount}
            </p>
            <Link
              to="/dashboard/student/my-clubs"
              className="text-[11px] font-semibold text-brand-600 hover:underline mt-1 inline-flex items-center gap-0.5"
            >
              View memberships <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Registered Events */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Upcoming Events</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.upcomingRegisteredCount}
            </p>
            <Link
              to="/dashboard/student/events"
              className="text-[11px] font-semibold text-brand-600 hover:underline mt-1 inline-flex items-center gap-0.5"
            >
              My schedule <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Attendance Rate</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {stats.attendanceRate}%
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {stats.attendedCount} events attended
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Requests */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Pending Requests</span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {stats.pendingRequestsCount}
            </p>
            <Link
              to="/dashboard/student/my-clubs"
              className="text-[11px] font-semibold text-amber-700 hover:underline mt-1 inline-flex items-center gap-0.5"
            >
              Track status <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Registered Events & Joined Clubs */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Registered Events */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Your Upcoming Registered Events
                </h3>
                <p className="text-xs text-slate-500">
                  Confirmed seats for upcoming campus activities
                </p>
              </div>
              <Link
                to="/dashboard/student/events"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                View all
              </Link>
            </div>

            {(!data?.upcomingRegisteredEvents || data.upcomingRegisteredEvents.length === 0) ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">
                  No upcoming registered events
                </p>
                <Link to="/events" className="mt-2 inline-block">
                  <Button size="sm">Browse Campus Calendar</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.upcomingRegisteredEvents.map((r) => {
                  const ev = r.eventId;
                  if (!ev) return null;
                  return (
                    <div
                      key={r._id}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-brand-100 text-brand-700 shrink-0 text-center font-bold text-xs leading-none">
                          <span>{new Date(ev.eventDate).getDate()}</span>
                          <span className="block text-[9px] uppercase mt-0.5">
                            {new Date(ev.eventDate).toLocaleDateString([], { month: 'short' })}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <Link to={`/events/${ev._id}`}>
                            <h4 className="text-xs font-bold text-slate-900 hover:text-brand-600 truncate">
                              {ev.title}
                            </h4>
                          </Link>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" /> {ev.startTime}
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-slate-400" /> {ev.venue}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Badge variant="success" size="sm">
                        Registered
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Joined Clubs */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Your Enrolled Clubs
                </h3>
                <p className="text-xs text-slate-500">
                  Student organizations where you have active membership
                </p>
              </div>
              <Link
                to="/dashboard/student/my-clubs"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Manage
              </Link>
            </div>

            {(!data?.joinedMemberships || data.joinedMemberships.length === 0) ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">
                  You have not joined any clubs yet
                </p>
                <Link to="/clubs" className="mt-2 inline-block">
                  <Button size="sm">Explore Available Clubs</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.joinedMemberships.map((m) => {
                  const club = m.clubId;
                  if (!club) return null;
                  return (
                    <div
                      key={m._id}
                      className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-brand-300 transition-all flex items-start gap-3"
                    >
                      {club.logo ? (
                        <img
                          src={club.logo}
                          alt={club.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0">
                          {club.name?.charAt(0) || 'C'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <Link to={`/clubs/${club._id}`}>
                          <h4 className="text-xs font-bold text-slate-900 hover:text-brand-600 truncate">
                            {club.name}
                          </h4>
                        </Link>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {club.meetingSchedule}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant="primary" size="sm">
                            {m.role === 'core_team' ? 'Core Team' : 'Member'}
                          </Badge>
                          <Link
                            to={`/clubs/${club._id}`}
                            className="text-[11px] font-semibold text-brand-600 hover:underline"
                          >
                            Club Page →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recommended Clubs & Notifications */}
        <div className="space-y-8">
          {/* Recommended Clubs */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Recommended For You
              </h3>
              <Link
                to="/clubs"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                All clubs
              </Link>
            </div>

            <div className="space-y-3">
              {data?.recommendedClubs?.map((club) => (
                <div
                  key={club._id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {club.logo ? (
                      <img
                        src={club.logo}
                        alt={club.name}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0">
                        {club.name?.charAt(0) || 'C'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <Link to={`/clubs/${club._id}`}>
                        <h4 className="text-xs font-bold text-slate-900 hover:text-brand-600 truncate">
                          {club.name}
                        </h4>
                      </Link>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {club.category}
                      </p>
                    </div>
                  </div>

                  <Link to={`/clubs/${club._id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Recent Updates
              </h3>
              <Link
                to="/notifications"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                All
              </Link>
            </div>

            <div className="space-y-3">
              {(!data?.recentNotifications || data.recentNotifications.length === 0) ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No recent notifications
                </p>
              ) : (
                data.recentNotifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-3 rounded-xl border text-xs leading-relaxed ${
                      !n.isRead
                        ? 'border-brand-200 bg-brand-50/40 text-brand-950 font-medium'
                        : 'border-slate-100 text-slate-600'
                    }`}
                  >
                    <p className="font-semibold text-slate-900 text-xs">
                      {n.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <span className="text-[9px] text-slate-400 mt-1 block">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

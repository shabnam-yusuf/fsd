import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import {
  ShieldCheck,
  FileCheck2,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  BarChart3,
  Layers
} from 'lucide-react';

export const FacultyDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacultyAnalytics();
  }, []);

  const fetchFacultyAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/faculty');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
    assignedClubsCount: 0,
    pendingApprovalsCount: 0,
    totalApprovedEvents: 0,
    totalMembers: 0,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-purple-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Faculty Oversight Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-purple-200 text-xs sm:text-sm mt-1 max-w-xl">
            {user?.department} • Institutional Extracurricular Governance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard/faculty/approvals">
            <Button
              size="md"
              icon={FileCheck2}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-none"
            >
              Review Pending Approvals ({stats.pendingApprovalsCount})
            </Button>
          </Link>
          <Link to="/dashboard/faculty/clubs">
            <Button
              size="md"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 shadow-none"
            >
              Assigned Clubs
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assigned Clubs */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Supervised Clubs</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.assignedClubsCount}
            </p>
            <Link
              to="/dashboard/faculty/clubs"
              className="text-[11px] font-semibold text-purple-700 hover:underline mt-1 inline-flex items-center gap-0.5"
            >
              View clubs <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Pending Event Proposals</span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {stats.pendingApprovalsCount}
            </p>
            <Link
              to="/dashboard/faculty/approvals"
              className="text-[11px] font-semibold text-amber-700 hover:underline mt-1 inline-flex items-center gap-0.5"
            >
              Review queue <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Approved Events */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Approved Events</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {stats.totalApprovedEvents}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">Active on calendar</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Active Students */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Student Participants</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.totalMembers}
            </p>
            <Link
              to="/dashboard/faculty/analytics"
              className="text-[11px] font-semibold text-brand-600 hover:underline mt-1 inline-flex items-center gap-0.5"
            >
              Engagement stats <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Approvals Queue & Club Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Pending Event Proposals Queue */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Event Proposals Awaiting Your Review
                </h3>
                <p className="text-xs text-slate-500">
                  Review student club proposals before they are published to campus
                </p>
              </div>
              <Link
                to="/dashboard/faculty/approvals"
                className="text-xs font-semibold text-purple-700 hover:text-purple-800"
              >
                Review All ({data?.pendingEvents?.length || 0})
              </Link>
            </div>

            {(!data?.pendingEvents || data.pendingEvents.length === 0) ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-700">
                  Approval Queue is Clear!
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  All event proposals submitted by your assigned student clubs have been reviewed.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.pendingEvents.map((ev) => (
                  <div
                    key={ev._id}
                    className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="warning" size="sm">
                          Pending Approval
                        </Badge>
                        <span className="text-xs font-semibold text-slate-600">
                          {ev.clubId?.name}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {ev.title}
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span>
                          {new Date(ev.eventDate).toLocaleDateString()}
                        </span>
                        <span>• {ev.startTime}</span>
                        <span>• {ev.venue}</span>
                        <span>• Capacity: {ev.capacity || 100}</span>
                      </div>
                    </div>

                    <Link to="/dashboard/faculty/approvals">
                      <Button size="sm">Review Proposal</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Club Performance Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Supervised Club Performance
                </h3>
                <p className="text-xs text-slate-500">
                  Member rosters and event activity across your forums
                </p>
              </div>
              <Link
                to="/dashboard/faculty/clubs"
                className="text-xs font-semibold text-purple-700 hover:text-purple-800"
              >
                View details
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data?.clubPerformance?.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-purple-300 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {c.name}
                    </h4>
                    <Badge variant="default" size="sm">
                      {c.category}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    President: <strong>{c.president}</strong>
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>
                      👥 <strong>{c.memberCount}</strong> Members
                    </span>
                    <span>
                      📅 <strong>{c.eventsCount}</strong> Approved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Approved Events & Fast Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Upcoming Approved Events
            </h3>

            {(!data?.upcomingEvents || data.upcomingEvents.length === 0) ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No upcoming events scheduled currently.
              </p>
            ) : (
              <div className="space-y-3">
                {data.upcomingEvents.map((ev) => (
                  <div
                    key={ev._id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/60"
                  >
                    <span className="text-[10px] font-semibold text-purple-700 block">
                      {ev.clubId?.name}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                      {ev.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {new Date(ev.eventDate).toLocaleDateString()} • {ev.venue}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-purple-50/70 rounded-2xl border border-purple-200/80 p-5 space-y-3">
            <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">
              Faculty Governance Quick Access
            </h4>
            <div className="space-y-2">
              <Link
                to="/dashboard/faculty/approvals"
                className="block p-2.5 rounded-xl bg-white border border-purple-100 hover:border-purple-300 text-xs font-semibold text-purple-900"
              >
                → Pending Approvals Queue
              </Link>
              <Link
                to="/dashboard/faculty/analytics"
                className="block p-2.5 rounded-xl bg-white border border-purple-100 hover:border-purple-300 text-xs font-semibold text-purple-900"
              >
                → Student Participation Analytics
              </Link>
              <Link
                to="/dashboard/faculty/clubs"
                className="block p-2.5 rounded-xl bg-white border border-purple-100 hover:border-purple-300 text-xs font-semibold text-purple-900"
              >
                → Supervised Club Rosters
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;

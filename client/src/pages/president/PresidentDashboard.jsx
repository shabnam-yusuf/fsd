import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Plus,
  ArrowRight,
  Sparkles,
  Megaphone,
  CheckSquare,
  Settings,
  MapPin,
  Ticket,
  Check,
  X
} from 'lucide-react';

export const PresidentDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Event Registration Action state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedEventRegId, setSelectedEventRegId] = useState(null);
  const [eventRejectionReason, setEventRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Membership Action state
  const [membershipRejectModalOpen, setMembershipRejectModalOpen] = useState(false);
  const [selectedMembershipId, setSelectedMembershipId] = useState(null);
  const [membershipRejectionReason, setMembershipRejectionReason] = useState('');
  const [selectedClubId, setSelectedClubId] = useState('');

  useEffect(() => {
    fetchPresidentAnalytics();
  }, [selectedClubId]);

  const fetchPresidentAnalytics = async (clubIdOverride) => {
    try {
      setLoading(true);
      const params = {};
      const targetClubId = clubIdOverride !== undefined ? clubIdOverride : selectedClubId;
      if (targetClubId) params.clubId = targetClubId;
      const res = await api.get('/analytics/president', { params });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMembership = async (membershipId) => {
    try {
      setActionLoading(true);
      const res = await api.put(`/memberships/${membershipId}/status`, { status: 'approved' });
      if (res.data.success) {
        toast.success('Club membership approved successfully!');
        fetchPresidentAnalytics();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve membership');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectMembershipSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMembershipId) return;
    try {
      setActionLoading(true);
      const res = await api.put(`/memberships/${selectedMembershipId}/status`, {
        status: 'rejected',
        rejectionReason: membershipRejectionReason,
      });
      if (res.data.success) {
        toast.success('Membership request declined');
        setMembershipRejectModalOpen(false);
        setMembershipRejectionReason('');
        setSelectedMembershipId(null);
        fetchPresidentAnalytics();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveEventReg = async (regId) => {
    try {
      setActionLoading(true);
      const res = await api.put(`/registrations/${regId}/status`, { status: 'approved' });
      if (res.data.success) {
        toast.success('Event participation request approved!');
        fetchPresidentAnalytics();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectEventRegSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEventRegId) return;
    try {
      setActionLoading(true);
      const res = await api.put(`/registrations/${selectedEventRegId}/status`, {
        status: 'rejected',
        rejectionReason: eventRejectionReason,
      });
      if (res.data.success) {
        toast.success('Event participation request declined');
        setRejectModalOpen(false);
        setEventRejectionReason('');
        setSelectedEventRegId(null);
        fetchPresidentAnalytics();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
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

  const club = data?.club;
  const stats = data?.stats || {
    totalMembers: 0,
    pendingMembershipRequests: 0,
    totalEvents: 0,
    upcomingEventsCount: 0,
    pendingEventApprovals: 0,
    overallAttendanceRate: 0,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 text-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {club?.logo ? (
            <img
              src={club.logo}
              alt={club.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20 bg-white shadow-md shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
              {club?.name?.charAt(0) || 'C'}
            </div>
          )}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-brand-200 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Club President Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {club ? club.name : 'Welcome, Club President!'}
            </h1>
            <p className="text-brand-100 text-xs mt-0.5">
              Lead: {user?.name} • Category: {club?.category || 'General'}
            </p>
            {data?.allClubs && data.allClubs.length > 1 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] text-brand-200 font-medium">Active Club:</span>
                <select
                  value={selectedClubId || club?._id || ''}
                  onChange={(e) => setSelectedClubId(e.target.value)}
                  className="bg-white/10 text-white text-xs rounded-lg px-2.5 py-1 border border-white/20 focus:outline-none focus:ring-1 focus:ring-brand-400"
                >
                  {data.allClubs.map((c) => (
                    <option key={c._id} value={c._id} className="text-slate-900 bg-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard/president/events">
            <Button size="md" icon={Plus} className="bg-brand-500 hover:bg-brand-600 shadow-none">
              Create Event
            </Button>
          </Link>
          <Link to="/dashboard/president/club">
            <Button
              size="md"
              variant="outline"
              icon={Settings}
              className="border-white/20 text-white hover:bg-white/10 shadow-none"
            >
              Club Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Club Members</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.totalMembers}
            </p>
            <Link
              to="/dashboard/president/members"
              className="text-[11px] font-semibold text-brand-600 hover:underline mt-1 inline-flex items-center gap-0.5"
            >
              View members <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Membership Requests */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Membership Requests</span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {stats.pendingMembershipRequests}
            </p>
            <Link
              to="/dashboard/president/members"
              className="text-[11px] font-semibold text-amber-700 hover:underline mt-1 inline-flex items-center gap-0.5"
            >
              Review pending <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Event Registration Requests */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Event Registrations</span>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">
              {stats.pendingEventRegistrationsCount || 0}
            </p>
            <span className="text-[11px] font-semibold text-indigo-700 mt-1 inline-flex items-center gap-0.5">
              Pending review
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        {/* Total Events Organized */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Events Organized</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.totalEvents}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {stats.overallAttendanceRate}% overall attendance
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Requests & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Membership Requests & Upcoming Events */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Membership Requests */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Pending Membership Applications
                </h3>
                <p className="text-xs text-slate-500">
                  Students requesting to join your club
                </p>
              </div>
              <Link
                to="/dashboard/president/members"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Manage all ({stats.pendingMembershipRequests})
              </Link>
            </div>

            {(!data?.recentRequests || data.recentRequests.length === 0) ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">
                  No pending membership requests
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  New student applications will appear here for review.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentRequests.map((req) => {
                  const s = req.studentId;
                  const studentName = s?.name || req.studentName || 'Student Applicant';
                  const studentEmail = s?.email || req.studentEmail || '';
                  const studentDept = s?.department || req.studentDepartment || 'General';
                  const studentCollegeId = s?.studentId || req.studentCollegeId || '';

                  return (
                    <div
                      key={req._id}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={s?.avatar}
                          name={studentName}
                          size="md"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">
                              Student: {studentName}
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              {studentDept} • {studentCollegeId}
                            </span>
                            <Badge variant="warning" size="sm">
                              Pending
                            </Badge>
                          </div>
                          <p className="text-xs text-brand-600 mt-0.5 font-medium">
                            Email: {studentEmail}
                          </p>
                          <p className="text-xs font-bold text-brand-800 mt-0.5">
                            Club: {req.clubName || req.clubId?.name || club?.name || 'Campus Club'}
                          </p>
                          {req.joinReason && (
                            <p className="text-[11px] text-slate-600 italic mt-1 max-w-md line-clamp-1">
                              "{req.joinReason}"
                            </p>
                          )}
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Requested on {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-rose-600 hover:bg-rose-50 border-rose-200"
                          disabled={actionLoading}
                          onClick={() => {
                            setSelectedMembershipId(req._id);
                            setMembershipRejectionReason('');
                            setMembershipRejectModalOpen(true);
                          }}
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="success"
                          disabled={actionLoading}
                          onClick={() => handleApproveMembership(req._id)}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Event Registration Requests (Student Participation Approval) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Event Registration Requests
                </h3>
                <p className="text-xs text-slate-500">
                  Student participation requests awaiting your approval
                </p>
              </div>
              <Badge variant={stats.pendingEventRegistrationsCount > 0 ? 'warning' : 'default'} size="sm">
                {stats.pendingEventRegistrationsCount || 0} Pending
              </Badge>
            </div>

            {(!data?.recentEventRequests || data.recentEventRequests.length === 0) ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Ticket className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">
                  No pending event registration requests
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  When students request to participate in your club events, review them here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentEventRequests.map((req) => {
                  const s = req.studentId;
                  const ev = req.eventId;
                  if (!s || !ev) return null;
                  return (
                    <div
                      key={req._id}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={s.avatar}
                          name={s.name}
                          size="md"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">
                              {s.name}
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              {s.department} • {s.studentId}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-brand-700 mt-0.5">
                            Event: {ev.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {new Date(ev.eventDate).toLocaleDateString()} • {ev.venue}
                          </p>
                          {req.notes && (
                            <p className="text-[11px] text-slate-600 italic mt-1">
                              "{req.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-rose-600 hover:bg-rose-50 border-rose-200"
                          disabled={actionLoading}
                          onClick={() => {
                            setSelectedEventRegId(req._id);
                            setEventRejectionReason('');
                            setRejectModalOpen(true);
                          }}
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={actionLoading}
                          onClick={() => handleApproveEventReg(req._id)}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Upcoming Club Events
                </h3>
                <p className="text-xs text-slate-500">
                  Scheduled workshops and competitions organized by your club
                </p>
              </div>
              <Link
                to="/dashboard/president/events"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                View all events
              </Link>
            </div>

            {(!data?.upcomingEvents || data.upcomingEvents.length === 0) ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">
                  No upcoming events scheduled
                </p>
                <Link to="/dashboard/president/events" className="mt-2 inline-block">
                  <Button size="sm" icon={Plus}>Create Event Proposal</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.upcomingEvents.map((ev) => (
                  <div
                    key={ev._id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            ev.status === 'approved'
                              ? 'success'
                              : ev.status === 'pending_approval'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {ev.status === 'approved'
                            ? 'Approved & Published'
                            : ev.status === 'pending_approval'
                            ? 'Awaiting Faculty Review'
                            : 'Declined'}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {ev.category}
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
                      </div>
                    </div>

                    <Link to="/dashboard/president/attendance">
                      <Button variant="outline" size="sm">
                        Attendance Sheet
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions & Operations */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              President Operations
            </h3>

            <div className="space-y-2">
              <Link
                to="/dashboard/president/events"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-brand-600">
                      Submit Event Proposal
                    </p>
                    <p className="text-[10px] text-slate-400">Requires faculty approval</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/dashboard/president/attendance"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-600">
                      Record Attendance
                    </p>
                    <p className="text-[10px] text-slate-400">Mark registered check-ins</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/dashboard/president/announcements"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-purple-600">
                      Post Notice / Bulletin
                    </p>
                    <p className="text-[10px] text-slate-400">Notifies all approved members</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/dashboard/president/club"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-slate-900">
                      Edit Club Profile
                    </p>
                    <p className="text-[10px] text-slate-400">Schedule, banner, links</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Assigned Faculty Advisor Contact */}
          {club?.facultyAdvisorId && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 block mb-2">
                Your Assigned Faculty Advisor
              </span>
              <div className="flex items-center gap-3">
                <Avatar
                  src={club.facultyAdvisorId.avatar}
                  name={club.facultyAdvisorId.name}
                  size="md"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {club.facultyAdvisorId.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {club.facultyAdvisorId.department}
                  </p>
                  <p className="text-[11px] text-purple-600 font-medium truncate mt-0.5">
                    {club.facultyAdvisorId.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Rejection Modal for Membership Request */}
      <Modal
        isOpen={membershipRejectModalOpen}
        onClose={() => setMembershipRejectModalOpen(false)}
        title="Decline Membership Request"
        subtitle="Provide a reason for not approving this club application."
      >
        <form onSubmit={handleRejectMembershipSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Declining (Optional)
            </label>
            <textarea
              rows={3}
              value={membershipRejectionReason}
              onChange={(e) => setMembershipRejectionReason(e.target.value)}
              placeholder="e.g. Club intake limit reached, requires completion of introductory workshop..."
              className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMembershipRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white"
              disabled={actionLoading}
            >
              Confirm Decline
            </Button>
          </div>
        </form>
      </Modal>

      {/* Rejection Modal for Event Registration */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Decline Event Registration"
        subtitle="Provide a reason for not approving this student participation request."
      >
        <form onSubmit={handleRejectEventRegSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Declining (Optional)
            </label>
            <textarea
              rows={3}
              value={eventRejectionReason}
              onChange={(e) => setEventRejectionReason(e.target.value)}
              placeholder="e.g. Event reached seating limit, prerequisite not met..."
              className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white"
              disabled={actionLoading}
            >
              Confirm Decline
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PresidentDashboard;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Video,
  ArrowLeft,
  Share2,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export const EventDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [userRegistration, setUserRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [unregisterConfirmOpen, setUnregisterConfirmOpen] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id, isAuthenticated, user]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${id}`);
      if (res.data.success) {
        setEvent(res.data.event);
        setRegistrationsCount(res.data.registrationsCount);
        setUserRegistration(res.data.userRegistration);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in as a student to register');
      return;
    }
    if (user?.role !== 'student') {
      toast.warning('Only student accounts can register for college events');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.post('/registrations/register', { eventId: id });
      if (res.data.success) {
        toast.success(res.data.message || 'You have successfully registered!');
        setUserRegistration(res.data.registration);
        setRegistrationsCount((prev) => prev + 1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnregister = async () => {
    try {
      setActionLoading(true);
      const res = await api.post('/registrations/unregister', { eventId: id });
      if (res.data.success) {
        toast.info('You have unregistered from this event');
        setUserRegistration(null);
        setRegistrationsCount((prev) => Math.max(0, prev - 1));
        setUnregisterConfirmOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unregister');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
        <SkeletonCard />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <EmptyState
          title="Event Not Found"
          description="The requested event does not exist or has been removed."
          actionText="Back to Events"
          onAction={() => (window.location.href = '/events')}
        />
      </div>
    );
  }

  const isPast = new Date(event.eventDate) < new Date(new Date().setHours(0, 0, 0, 0));
  const isApproved = userRegistration && (userRegistration.status === 'approved' || userRegistration.status === 'registered');
  const isPending = userRegistration && userRegistration.status === 'pending';
  const isRejected = userRegistration && userRegistration.status === 'rejected';
  const capacityPercent = event.capacity
    ? Math.min(100, Math.round((registrationsCount / event.capacity) * 100))
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events Calendar</span>
      </Link>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
        {/* Banner */}
        <div className="h-64 sm:h-80 w-full relative bg-slate-900">
          <img
            src={
              event.bannerImage ||
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
            }
            alt={event.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge variant="default" className="bg-white/95 backdrop-blur-sm text-slate-900 font-bold">
              {event.category}
            </Badge>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="space-y-2 flex-1">
              <Link
                to={`/clubs/${event.clubId?._id}`}
                className="text-xs font-bold text-brand-600 hover:underline uppercase tracking-wider block"
              >
                Organized by {event.clubId?.name}
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {event.title}
              </h1>
            </div>

            {/* Action Box */}
            <div className="shrink-0 flex items-center gap-3">
              {isPast ? (
                <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">
                  Event Finished
                </span>
              ) : isApproved ? (
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Participation Approved</span>
                  </div>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setUnregisterConfirmOpen(true)}
                  >
                    Withdraw
                  </Button>
                </div>
              ) : isPending ? (
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-sm font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Pending President Approval</span>
                  </div>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setUnregisterConfirmOpen(true)}
                  >
                    Withdraw Request
                  </Button>
                </div>
              ) : isRejected ? (
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-sm font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Request Declined</span>
                  </div>
                  <Button
                    size="md"
                    variant="primary"
                    onClick={handleRegister}
                    isLoading={actionLoading}
                  >
                    Re-apply
                  </Button>
                </div>
              ) : (
                <Button
                  size="lg"
                  variant="primary"
                  onClick={handleRegister}
                  isLoading={actionLoading}
                >
                  Register for Event
                </Button>
              )}
            </div>
          </div>

          {/* Quick Schedule Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Date & Day</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                  {new Date(event.eventDate).toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Timing</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                  {event.startTime} - {event.endTime}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Location</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                  {event.venue}
                </span>
                {event.locationType === 'online' && event.meetingLink && (
                  <a
                    href={event.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 font-semibold underline mt-0.5 block"
                  >
                    Join Video Call
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-600" />
                Registrations Capacity
              </span>
              <span className="font-bold text-slate-900">
                {registrationsCount} / {event.capacity || 100} seats filled ({capacityPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  capacityPercent >= 90 ? 'bg-rose-500' : 'bg-brand-600'
                }`}
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Event Overview</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* User Registration Status Banner */}
          {userRegistration && (
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                isApproved
                  ? 'bg-emerald-50 border-emerald-200'
                  : isPending
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-rose-50 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white ${
                    isApproved
                      ? 'bg-emerald-600'
                      : isPending
                      ? 'bg-amber-600'
                      : 'bg-rose-600'
                  }`}
                >
                  {isApproved ? (
                    <UserCheck className="w-5 h-5" />
                  ) : isPending ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-xs font-bold ${
                      isApproved
                        ? 'text-emerald-950'
                        : isPending
                        ? 'text-amber-950'
                        : 'text-rose-950'
                    }`}
                  >
                    Participation Request:{' '}
                    {isApproved
                      ? 'APPROVED & CONFIRMED'
                      : isPending
                      ? 'PENDING CLUB PRESIDENT APPROVAL'
                      : 'DECLINED'}
                  </p>
                  {isRejected && userRegistration.rejectionReason && (
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      Feedback: {userRegistration.rejectionReason}
                    </p>
                  )}
                  {isApproved && (
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Attendance Record:{' '}
                      <strong>
                        {userRegistration.attendanceStatus
                          ? userRegistration.attendanceStatus.toUpperCase()
                          : 'PENDING EVENT CHECK-IN'}
                      </strong>
                    </p>
                  )}
                  {isPending && (
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Your request is with the Club President. You will receive a notification once approved.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Organizer Card */}
          {event.clubId && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {event.clubId.logo ? (
                  <img
                    src={event.clubId.logo}
                    alt={event.clubId.name}
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-white shadow-sm bg-white"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-brand-50 border border-brand-100 ring-2 ring-white shadow-sm flex items-center justify-center text-brand-700 font-bold text-base">
                    {event.clubId.name?.charAt(0) || 'C'}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {event.clubId.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Category: {event.clubId.category}
                  </p>
                </div>
              </div>
              <Link to={`/clubs/${event.clubId._id}`}>
                <Button variant="outline" size="sm">
                  Visit Club Page
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Unregister Confirmation Dialog */}
      <ConfirmDialog
        isOpen={unregisterConfirmOpen}
        onClose={() => setUnregisterConfirmOpen(false)}
        onConfirm={handleUnregister}
        title="Cancel Event Registration?"
        message="Are you sure you want to unregister from this event? Your reserved seat will be released."
        confirmText="Yes, Unregister"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default EventDetailPage;

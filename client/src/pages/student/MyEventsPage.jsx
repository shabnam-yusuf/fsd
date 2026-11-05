import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const MyEventsPage = () => {
  const toast = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnregisterId, setSelectedUnregisterId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/registrations/my');
      if (res.data.success) {
        setRegistrations(res.data.registrations);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load registered events');
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!selectedUnregisterId) return;
    try {
      setActionLoading(true);
      const res = await api.post('/registrations/unregister', {
        eventId: selectedUnregisterId,
      });
      if (res.data.success) {
        toast.info('Unregistered successfully');
        setRegistrations((prev) =>
          prev.filter((r) => r.eventId && r.eventId._id !== selectedUnregisterId)
        );
        setSelectedUnregisterId(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unregister');
    } finally {
      setActionLoading(false);
    }
  };

  const now = new Date();
  const upcomingEvents = registrations.filter(
    (r) => r.eventId && new Date(r.eventId.eventDate) >= new Date(now.setHours(0, 0, 0, 0))
  );
  const pastEvents = registrations.filter(
    (r) => r.eventId && new Date(r.eventId.eventDate) < new Date(now.setHours(0, 0, 0, 0))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Registered Events
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Keep track of your workshop registrations and check-in attendance records
          </p>
        </div>
        <Link to="/events">
          <Button icon={Sparkles} size="sm">
            Find More Events
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : registrations.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No registered events"
          description="You haven't signed up for any campus events yet. Explore upcoming workshops and hackathons."
          actionText="Browse Events"
          onAction={() => (window.location.href = '/events')}
        />
      ) : (
        <div className="space-y-8">
          {/* Upcoming Registrations */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Upcoming Events</span>
              <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs">
                {upcomingEvents.length}
              </span>
            </h3>

            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-slate-400 bg-white p-6 rounded-2xl border border-slate-200 text-center">
                No upcoming events registered currently.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingEvents.map((r) => {
                  const ev = r.eventId;
                  if (!ev) return null;
                  const isApproved = r.status === 'approved' || r.status === 'registered';
                  const isPending = r.status === 'pending';
                  const isRejected = r.status === 'rejected';

                  return (
                    <div
                      key={r._id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <Badge variant="primary" size="sm">
                            {ev.category}
                          </Badge>
                          <Badge
                            variant={
                              isApproved
                                ? 'success'
                                : isPending
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {isApproved
                              ? 'Confirmed & Approved'
                              : isPending
                              ? 'Pending President Review'
                              : 'Request Declined'}
                          </Badge>
                        </div>

                        <Link to={`/events/${ev._id}`}>
                          <h4 className="text-base font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1">
                            {ev.title}
                          </h4>
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {ev.clubId?.name}
                        </p>

                        {isRejected && r.rejectionReason && (
                          <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-100 text-[11px] text-rose-700">
                            <strong>Note:</strong> {r.rejectionReason}
                          </div>
                        )}

                        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-brand-600" />
                            <span>
                              {new Date(ev.eventDate).toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-brand-600" />
                            <span>{ev.startTime} - {ev.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-brand-600" />
                            <span className="truncate">{ev.venue}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <Link to={`/events/${ev._id}`}>
                          <Button variant="secondary" size="sm">
                            View Details
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-rose-600 hover:bg-rose-50 border-rose-200"
                          onClick={() => setSelectedUnregisterId(ev._id)}
                        >
                          Cancel Registration
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Events & Attendance Results */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Past Events & Attendance Records</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs">
                {pastEvents.length}
              </span>
            </h3>

            {pastEvents.length === 0 ? (
              <p className="text-xs text-slate-400 bg-white p-6 rounded-2xl border border-slate-200 text-center">
                No past event history recorded yet.
              </p>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {pastEvents.map((r) => {
                    const ev = r.eventId;
                    if (!ev) return null;

                    const isPresent = r.attendanceStatus === 'present';
                    const isAbsent = r.attendanceStatus === 'absent';

                    return (
                      <div
                        key={r._id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {ev.title}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({ev.clubId?.name})
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-3">
                            <span>
                              {new Date(ev.eventDate).toLocaleDateString()}
                            </span>
                            <span>• {ev.venue}</span>
                          </p>
                        </div>

                        <div>
                          {isPresent ? (
                            <Badge variant="success">Present & Attended</Badge>
                          ) : isAbsent ? (
                            <Badge variant="danger">Marked Absent</Badge>
                          ) : (
                            <Badge variant="warning">Attendance Pending</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unregister Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!selectedUnregisterId}
        onClose={() => setSelectedUnregisterId(null)}
        onConfirm={handleUnregister}
        title="Cancel Registration?"
        message="Are you sure you want to cancel your seat registration for this event?"
        confirmText="Confirm Unregister"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default MyEventsPage;

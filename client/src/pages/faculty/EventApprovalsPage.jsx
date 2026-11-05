import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  Check,
  X,
  AlertTriangle,
  Send,
  Building
} from 'lucide-react';

export const EventApprovalsPage = () => {
  const toast = useToast();
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('approved'); // 'approved' | 'rejected'
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events/faculty/pending');
      if (res.data.success) {
        setPendingEvents(res.data.events);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (event, decision) => {
    setSelectedEvent(event);
    setReviewDecision(decision);
    setRejectionReason('');
    setModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    if (reviewDecision === 'rejected' && (!rejectionReason || !rejectionReason.trim())) {
      toast.error('Please specify a rejection reason for the club president');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.put(`/events/${selectedEvent._id}/review`, {
        status: reviewDecision,
        rejectionReason: reviewDecision === 'rejected' ? rejectionReason : '',
      });

      if (res.data.success) {
        toast.success(
          `Event "${selectedEvent.title}" has been ${reviewDecision}!`
        );
        setPendingEvents((prev) =>
          prev.filter((ev) => ev._id !== selectedEvent._id)
        );
        setModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Event Approvals & Governance Queue
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, approve, or provide structured revision feedback on proposals submitted by student clubs
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : pendingEvents.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All event proposals reviewed"
          description="There are currently no pending event requests awaiting faculty approval."
        />
      ) : (
        <div className="space-y-6">
          {pendingEvents.map((ev) => (
            <div
              key={ev._id}
              className="bg-white rounded-2xl border border-amber-200 shadow-soft p-6 space-y-6"
            >
              {/* Event Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="warning" size="sm">
                      Pending Faculty Approval
                    </Badge>
                    <span className="text-xs font-bold text-purple-700">
                      {ev.clubId?.name}
                    </span>
                    <span className="text-xs text-slate-400">• Category: {ev.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Submitted by Club President: <strong>{ev.submittedBy?.name}</strong> ({ev.submittedBy?.email})
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-rose-600 hover:bg-rose-50 border-rose-200"
                    icon={X}
                    onClick={() => openReviewModal(ev, 'rejected')}
                  >
                    Decline / Reject
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    icon={Check}
                    onClick={() => openReviewModal(ev, 'approved')}
                  >
                    Approve Event
                  </Button>
                </div>
              </div>

              {/* Event Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Proposed Date</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    {new Date(ev.eventDate).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Timing</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    {ev.startTime} - {ev.endTime}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Venue Location</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block truncate">
                    {ev.venue}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Target Capacity</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    {ev.capacity || 100} Attendees
                  </span>
                </div>
              </div>

              {/* Full Description & Rationale */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">
                  Proposal Description & Agenda:
                </span>
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                  {ev.description}
                </p>
              </div>

              {ev.tags && ev.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400">Tags:</span>
                  {ev.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          reviewDecision === 'approved'
            ? `Approve Event: "${selectedEvent?.title}"`
            : `Decline Proposal: "${selectedEvent?.title}"`
        }
        subtitle={
          reviewDecision === 'approved'
            ? 'Approving publishes this event to the campus calendar and enables student registrations.'
            : 'Please specify the exact feedback/policy reason so the club president can rectify it.'
        }
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          {reviewDecision === 'approved' ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
              ✅ You are endorsing this event for official collegiate participation. An approval notification will be dispatched to the club president.
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mandatory Rejection / Revision Reason *
              </label>
              <textarea
                rows={4}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Venue scheduling conflict with Departmental Exam, or event requires security clearance..."
                className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={reviewDecision === 'approved' ? 'success' : 'danger'}
              isLoading={submitting}
            >
              {reviewDecision === 'approved' ? 'Confirm Approval' : 'Decline Proposal'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EventApprovalsPage;

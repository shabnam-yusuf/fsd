import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Avatar from '../../components/common/Avatar';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Trash2,
  Edit3,
  Users,
  CheckSquare,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';

const CATEGORIES = [
  'Workshop',
  'Hackathon',
  'Seminar',
  'Competition',
  'Cultural Fest',
  'Sports Meet',
  'Webinar',
  'Orientation',
  'Networking',
];

export const PresidentEventsPage = () => {
  const toast = useToast();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit modal
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete confirm
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Registrations modal
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [selectedEventForRegs, setSelectedEventForRegs] = useState(null);
  const [eventRegistrationsList, setEventRegistrationsList] = useState([]);
  const [regsLoading, setRegsLoading] = useState(false);

  const initialForm = {
    title: '',
    description: '',
    category: 'Workshop',
    eventDate: '',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    venue: '',
    locationType: 'on_campus',
    meetingLink: '',
    capacity: 100,
    registrationDeadline: '',
    tags: '',
    bannerImage: '',
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchClubAndEvents();
  }, []);

  const fetchClubAndEvents = async () => {
    try {
      setLoading(true);
      const clubRes = await api.get('/clubs/president/my-club');
      if (clubRes.data.success) {
        setClub(clubRes.data.club);
        const eventsRes = await api.get('/events/president/my-events');
        if (eventsRes.data.success) {
          setEvents(eventsRes.data.events);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load club events');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingEventId(null);
    setFormData(initialForm);
    setEventModalOpen(true);
  };

  const openEditModal = (ev) => {
    setIsEditing(true);
    setEditingEventId(ev._id);
    setFormData({
      title: ev.title || '',
      description: ev.description || '',
      category: ev.category || 'Workshop',
      eventDate: ev.eventDate ? new Date(ev.eventDate).toISOString().split('T')[0] : '',
      startTime: ev.startTime || '10:00 AM',
      endTime: ev.endTime || '01:00 PM',
      venue: ev.venue || '',
      locationType: ev.locationType || 'on_campus',
      meetingLink: ev.meetingLink || '',
      capacity: ev.capacity || 100,
      registrationDeadline: ev.registrationDeadline
        ? new Date(ev.registrationDeadline).toISOString().split('T')[0]
        : '',
      tags: ev.tags ? ev.tags.join(', ') : '',
      bannerImage: ev.bannerImage || '',
    });
    setEventModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!club) return;

    try {
      setFormSubmitting(true);
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        ...formData,
        clubId: club._id,
        tags: tagsArray,
        capacity: Number(formData.capacity),
      };

      if (isEditing) {
        const res = await api.put(`/events/${editingEventId}`, payload);
        if (res.data.success) {
          toast.success('Event proposal updated and resubmitted for faculty review!');
          fetchClubAndEvents();
          setEventModalOpen(false);
        }
      } else {
        const res = await api.post('/events', payload);
        if (res.data.success) {
          toast.success('Event submitted to Faculty Advisor for review!');
          fetchClubAndEvents();
          setEventModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setDeleteLoading(true);
      const res = await api.delete(`/events/${deletingId}`);
      if (res.data.success) {
        toast.info('Event removed');
        setEvents((prev) => prev.filter((ev) => ev._id !== deletingId));
        setDeleteConfirmOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete event');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openRegistrationsModal = async (ev) => {
    setSelectedEventForRegs(ev);
    setRegModalOpen(true);
    fetchEventRegistrationsList(ev._id);
  };

  const fetchEventRegistrationsList = async (eventId) => {
    try {
      setRegsLoading(true);
      const res = await api.get(`/registrations/event/${eventId}`);
      if (res.data.success) {
        setEventRegistrationsList(res.data.registrations);
      }
    } catch (err) {
      toast.error('Failed to load event registrations');
    } finally {
      setRegsLoading(false);
    }
  };

  const handleUpdateRegStatus = async (regId, status) => {
    try {
      const res = await api.put(`/registrations/${regId}/status`, { status });
      if (res.data.success) {
        toast.success(`Registration ${status} successfully!`);
        if (selectedEventForRegs) {
          fetchEventRegistrationsList(selectedEventForRegs._id);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Event Management & Approval Workflow
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Propose new collegiate events, track advisor review decisions, and manage attendance
          </p>
        </div>
        <Button icon={Plus} onClick={openCreateModal}>
          Propose New Event
        </Button>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events created yet"
          description="Submit your first event proposal. Your assigned faculty advisor will be notified to review and approve it."
          actionText="Create First Event"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((ev) => {
            const isApproved = ev.status === 'approved';
            const isPending = ev.status === 'pending_approval';
            const isRejected = ev.status === 'rejected';

            return (
              <div
                key={ev._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Status header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
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
                        ? 'Approved & Live'
                        : isPending
                        ? 'Pending Faculty Approval'
                        : 'Proposal Rejected'}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-500">
                      {ev.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {ev.description}
                  </p>

                  {/* Schedule Details */}
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

                  {/* Faculty Rejection Alert if declined */}
                  {isRejected && ev.rejectionReason && (
                    <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Faculty Feedback / Rejection Note:</span>
                      </div>
                      <p className="leading-relaxed">{ev.rejectionReason}</p>
                      <span className="text-[10px] text-rose-600 block mt-1">
                        👉 Edit the proposal below to resolve faculty remarks and re-submit.
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Edit3}
                      onClick={() => openEditModal(ev)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50"
                      icon={Trash2}
                      onClick={() => {
                        setDeletingId(ev._id);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </div>

                  {isApproved && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Users}
                        onClick={() => openRegistrationsModal(ev)}
                      >
                        Registrations
                      </Button>
                      <Link to="/dashboard/president/attendance">
                        <Button size="sm" icon={CheckSquare}>
                          Attendance
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Event Modal */}
      <Modal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        title={isEditing ? 'Edit & Resubmit Event Proposal' : 'Propose New College Event'}
        subtitle="This event proposal will be reviewed by your assigned Faculty Advisor before going live."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Event Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Full-Stack Web & AI Bootcamp"
              className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Location Type
              </label>
              <select
                value={formData.locationType}
                onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              >
                <option value="on_campus">On-Campus Physical</option>
                <option value="online">Virtual / Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Event Date
              </label>
              <input
                type="date"
                required
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Start Time
              </label>
              <input
                type="text"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                placeholder="10:00 AM"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                End Time
              </label>
              <input
                type="text"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                placeholder="01:00 PM"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Venue / Room Location
              </label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="Auditorium 2 / Lab C-302"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Capacity (Maximum Seats)
              </label>
              <input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Event Description & Agenda
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline the topics covered, prerequisites, guest speakers, and schedule..."
              className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Banner Image URL (Optional)
              </label>
              <input
                type="url"
                value={formData.bannerImage}
                onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="React, AI, Cloud, Python"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setEventModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={formSubmitting}
            >
              {isEditing ? 'Save & Submit' : 'Submit for Review'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Event?"
        message="Are you sure you want to delete this event? All associated registrations and attendance sheets will be deleted."
        confirmText="Yes, Delete Event"
        isLoading={deleteLoading}
      />

      {/* Event Registrations Review Modal */}
      <Modal
        isOpen={regModalOpen}
        onClose={() => setRegModalOpen(false)}
        title={`Participant Requests: ${selectedEventForRegs?.title || 'Event'}`}
        subtitle="Review, approve, or reject student event participation requests."
        maxWidth="max-w-3xl"
      >
        {regsLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading registrations...
          </div>
        ) : eventRegistrationsList.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No student participation requests received yet for this event.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {eventRegistrationsList.map((r) => {
              const s = r.studentId;
              if (!s) return null;
              const isApproved = r.status === 'approved' || r.status === 'registered';
              const isPending = r.status === 'pending';

              return (
                <div key={r._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={s.avatar} name={s.name} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900">{s.name}</p>
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
                            ? 'Approved'
                            : isPending
                            ? 'Pending Review'
                            : 'Declined'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {s.department} • {s.studentId} • {s.email}
                      </p>
                      {r.notes && (
                        <p className="text-[10px] text-slate-600 italic mt-0.5">
                          "{r.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {isPending && (
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-600 hover:bg-rose-50 border-rose-200"
                        onClick={() => handleUpdateRegStatus(r._id, 'rejected')}
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdateRegStatus(r._id, 'approved')}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Accept
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PresidentEventsPage;

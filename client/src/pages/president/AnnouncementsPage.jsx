import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import {
  Megaphone,
  Plus,
  Pin,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  Send
} from 'lucide-react';

export const AnnouncementsPage = () => {
  const toast = useToast();
  const [club, setClub] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Announcement Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirm
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchClubAndAnnouncements();
  }, []);

  const fetchClubAndAnnouncements = async () => {
    try {
      setLoading(true);
      const clubRes = await api.get('/clubs/president/my-club');
      if (clubRes.data.success) {
        const c = clubRes.data.club;
        setClub(c);
        const annRes = await api.get(`/announcements/club/${c._id}`);
        if (annRes.data.success) {
          setAnnouncements(annRes.data.announcements);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!club) return;

    try {
      setSubmitting(true);
      const res = await api.post('/announcements', {
        clubId: club._id,
        title,
        content,
        priority,
        isPinned,
      });

      if (res.data.success) {
        toast.success('Announcement published and sent to club members!');
        setTitle('');
        setContent('');
        setPriority('normal');
        setIsPinned(false);
        setModalOpen(false);
        fetchClubAndAnnouncements();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!deletingId) return;

    try {
      setDeleteLoading(true);
      const res = await api.delete(`/announcements/${deletingId}`);
      if (res.data.success) {
        toast.info('Announcement deleted');
        setAnnouncements((prev) => prev.filter((a) => a._id !== deletingId));
        setDeleteConfirmOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Club Announcements & Bulletins
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Broadcast important updates, license dispatches, and meeting agendas to club members
          </p>
        </div>
        <Button icon={Plus} onClick={() => setModalOpen(true)}>
          Post New Notice
        </Button>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements published yet"
          description="Keep your members updated by posting your first club announcement."
          actionText="Create Notice"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item._id}
              className={`p-6 rounded-2xl bg-white border shadow-soft ${
                item.isPinned ? 'border-brand-300 ring-1 ring-brand-500/20' : 'border-slate-200/90'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  {item.isPinned && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 flex items-center gap-1">
                      <Pin className="w-3 h-3" /> Pinned Bulletin
                    </span>
                  )}
                  {item.priority === 'urgent' && (
                    <Badge variant="danger" size="sm">
                      Urgent Priority
                    </Badge>
                  )}
                  {item.priority === 'important' && (
                    <Badge variant="warning" size="sm">
                      Important
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <button
                    onClick={() => {
                      setDeletingId(item._id);
                      setDeleteConfirmOpen(true);
                    }}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-2">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                {item.content}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                <span>Posted by {item.authorId?.name || 'Club President'}</span>
                <span>Delivered to all active members</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Post New Club Announcement"
        subtitle="This notice will be pinned on your club page and sent as a notification to all members."
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Notice Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hackathon Team Registrations Live"
              className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              >
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Pin to Top of Club
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Announcement Content
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the announcement details, link to resources, or meeting room instructions..."
              className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

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
              variant="primary"
              icon={Send}
              isLoading={submitting}
            >
              Publish Notice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteAnnouncement}
        title="Delete Announcement?"
        message="Are you sure you want to remove this announcement?"
        confirmText="Delete"
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default AnnouncementsPage;

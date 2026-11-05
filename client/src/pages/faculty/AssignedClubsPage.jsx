import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import {
  ShieldCheck,
  Users,
  Calendar,
  Clock,
  Mail,
  Phone,
  Eye,
  ExternalLink,
  Plus
} from 'lucide-react';

export const AssignedClubsPage = () => {
  const toast = useToast();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Roster modal
  const [rosterModalOpen, setRosterModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [rosterMembers, setRosterMembers] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  // Create Club modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newClubData, setNewClubData] = useState({
    name: '',
    tagline: '',
    description: '',
    category: 'Technical',
    meetingSchedule: 'Every Wednesday 4:30 PM',
    contactEmail: '',
  });

  useEffect(() => {
    fetchAssignedClubs();
  }, []);

  const fetchAssignedClubs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clubs/faculty/my-clubs');
      if (res.data.success) {
        setClubs(res.data.clubs);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load assigned clubs');
    } finally {
      setLoading(false);
    }
  };

  const openRosterModal = async (club) => {
    setSelectedClub(club);
    setRosterModalOpen(true);
    try {
      setRosterLoading(true);
      const res = await api.get(`/memberships/club/${club._id}/members`);
      if (res.data.success) {
        setRosterMembers(res.data.members);
      }
    } catch (err) {
      toast.error('Failed to load member roster');
    } finally {
      setRosterLoading(false);
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!newClubData.name.trim() || !newClubData.description.trim()) {
      toast.error('Please enter both club name and description');
      return;
    }
    try {
      setCreateLoading(true);
      const res = await api.post('/clubs', newClubData);
      if (res.data.success) {
        toast.success(`Club "${res.data.club.name}" created and saved to MongoDB!`);
        setCreateModalOpen(false);
        setNewClubData({
          name: '',
          tagline: '',
          description: '',
          category: 'Technical',
          meetingSchedule: 'Every Wednesday 4:30 PM',
          contactEmail: '',
        });
        fetchAssignedClubs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create club');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Supervised Clubs & Student Forums
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review member rosters, leadership contacts, and activity levels for student societies under your advisory
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setCreateModalOpen(true)}
        >
          Create New Club
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No clubs currently assigned"
          description="You are not designated as the faculty advisor for any student clubs yet."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clubs.map((club) => (
            <div
              key={club._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    {club.logo ? (
                      <img
                        src={club.logo}
                        alt={club.name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 ring-2 ring-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                        {club.name?.charAt(0) || 'C'}
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {club.name}
                      </h3>
                      <p className="text-xs text-purple-700 font-medium">
                        Category: {club.category}
                      </p>
                    </div>
                  </div>
                  <Badge variant="purple" size="sm">
                    Active Forum
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {club.description}
                </p>

                {/* President Info */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <p className="font-semibold text-slate-700">
                    Student President:{' '}
                    <span className="font-bold text-slate-900">
                      {club.presidentId?.name || 'Assigned'}
                    </span>
                  </p>
                  <p className="text-slate-500 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {club.presidentId?.email}
                  </p>
                  {club.presidentId?.phone && (
                    <p className="text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {club.presidentId?.phone}
                    </p>
                  )}
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
                    <span className="text-lg font-bold text-purple-900 block">
                      {club.membersCount || 0}
                    </span>
                    <span className="text-[10px] text-purple-700 font-medium">
                      Enrolled Members
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <span className="text-lg font-bold text-emerald-900 block">
                      {club.approvedEventsCount || 0}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      Approved Events
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                    <span className="text-lg font-bold text-amber-900 block">
                      {club.pendingEventsCount || 0}
                    </span>
                    <span className="text-[10px] text-amber-700 font-medium">
                      Pending Approvals
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link to={`/clubs/${club._id}`}>
                  <Button variant="outline" size="sm" icon={ExternalLink}>
                    Public Club Page
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="primary"
                  icon={Eye}
                  onClick={() => openRosterModal(club)}
                >
                  View Member Roster
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Roster Modal */}
      <Modal
        isOpen={rosterModalOpen}
        onClose={() => setRosterModalOpen(false)}
        title={`Student Roster: ${selectedClub?.name || 'Club'}`}
        subtitle="List of students officially approved to represent and participate in this society."
        maxWidth="max-w-2xl"
      >
        {rosterLoading ? (
          <SkeletonTable rows={4} />
        ) : rosterMembers.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No approved members enrolled yet in this club.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {rosterMembers.map((m) => {
              const s = m.studentId;
              if (!s) return null;
              return (
                <div key={m._id} className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={s.avatar}
                      name={s.name}
                      size="sm"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{s.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {s.department} • {s.studentId}
                      </p>
                      <p className="text-[10px] text-purple-600">{s.email}</p>
                    </div>
                  </div>

                  <Badge variant={m.role === 'core_team' ? 'purple' : 'default'} size="sm">
                    {m.role === 'core_team' ? 'Core Team' : 'Member'}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* Create New Club Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Establish New Campus Club / Forum"
        subtitle="Registers this student society directly in MongoDB with you as designated faculty advisor."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateClub} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Club / Forum Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Artificial Intelligence Research Society"
              value={newClubData.name}
              onChange={(e) =>
                setNewClubData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={newClubData.category}
                onChange={(e) =>
                  setNewClubData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
              >
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Academic">Academic</option>
                <option value="Social & Welfare">Social & Welfare</option>
                <option value="Entrepreneurship">Entrepreneurship</option>
                <option value="Literary">Literary</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                placeholder="club@campus.edu"
                value={newClubData.contactEmail}
                onChange={(e) =>
                  setNewClubData((prev) => ({ ...prev, contactEmail: e.target.value }))
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tagline (One-line summary)
            </label>
            <input
              type="text"
              placeholder="e.g. Fostering cutting-edge research in deep learning"
              value={newClubData.tagline}
              onChange={(e) =>
                setNewClubData((prev) => ({ ...prev, tagline: e.target.value }))
              }
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Meeting Schedule
            </label>
            <input
              type="text"
              placeholder="e.g. Every Friday 4:00 PM - Tech Lab 3"
              value={newClubData.meetingSchedule}
              onChange={(e) =>
                setNewClubData((prev) => ({ ...prev, meetingSchedule: e.target.value }))
              }
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Club Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide a comprehensive mission statement, activities, and goals for this forum..."
              value={newClubData.description}
              onChange={(e) =>
                setNewClubData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={createLoading}
            >
              Create Club in MongoDB
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssignedClubsPage;

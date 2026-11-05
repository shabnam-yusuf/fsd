import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  Mail,
  Globe,
  Instagram,
  Linkedin,
  Github,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Pin,
  Send,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export const ClubDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [club, setClub] = useState(null);
  const [memberCount, setMemberCount] = useState(0);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'events' | 'announcements' | 'members'

  // Membership status
  const [membershipStatus, setMembershipStatus] = useState(null); // 'approved' | 'pending' | 'rejected' | null
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinReason, setJoinReason] = useState('');
  const [submittingJoin, setSubmittingJoin] = useState(false);
  const [cancellingRequest, setCancellingRequest] = useState(false);

  useEffect(() => {
    fetchClubDetails();
    if (isAuthenticated && user?.role === 'student') {
      checkMyMembership();
    }
  }, [id, isAuthenticated, user]);

  const fetchClubDetails = async () => {
    try {
      setLoading(true);
      const [clubRes, membersRes] = await Promise.all([
        api.get(`/clubs/${id}`),
        api.get(`/memberships/club/${id}/members`),
      ]);

      if (clubRes.data.success) {
        setClub(clubRes.data.club);
        setMemberCount(clubRes.data.memberCount);
        setEvents(clubRes.data.events || []);
        setAnnouncements(clubRes.data.announcements || []);
      }

      if (membersRes.data.success) {
        setMembers(membersRes.data.members || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load club information');
    } finally {
      setLoading(false);
    }
  };

  const checkMyMembership = async () => {
    try {
      const res = await api.get('/memberships/my');
      if (res.data.success) {
        const found = res.data.memberships.find(
          (m) => m.clubId && m.clubId._id === id
        );
        if (found) {
          setMembershipStatus(found.status);
        } else {
          setMembershipStatus(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingJoin(true);
      const res = await api.post('/memberships/request', {
        clubId: id,
        joinReason,
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Membership request submitted!');
        setMembershipStatus('pending');
        setJoinModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmittingJoin(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      setCancellingRequest(true);
      const res = await api.delete(`/memberships/cancel/${id}`);
      if (res.data.success) {
        toast.info('Membership request cancelled');
        setMembershipStatus(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setCancellingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-6">
        <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
        <SkeletonCard />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <EmptyState
          title="Club Not Found"
          description="The requested club profile does not exist or has been archived."
          actionText="Back to Clubs Directory"
          onAction={() => (window.location.href = '/clubs')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/clubs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Clubs</span>
      </Link>

      {/* Hero Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
        {/* Banner Image */}
        <div className="h-56 sm:h-72 w-full relative bg-slate-800">
          <img
            src={
              club.bannerImage ||
              'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80'
            }
            alt={club.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
          <div className="absolute top-4 right-4">
            <Badge variant="default" className="bg-white/95 backdrop-blur-sm text-slate-900 font-bold">
              {club.category}
            </Badge>
          </div>
        </div>

        {/* Club Profile Header */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
            <div className="flex items-end gap-5">
              {club.logo ? (
                <img
                  src={club.logo}
                  alt={club.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white shadow-card bg-white shrink-0"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-brand-50 border border-brand-100 ring-4 ring-white shadow-card flex items-center justify-center text-brand-700 font-bold text-2xl shrink-0">
                  {club.name?.charAt(0) || 'C'}
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {club.name}
                </h1>
                <p className="text-sm font-medium text-brand-600 mt-1">
                  {club.tagline}
                </p>
              </div>
            </div>

            {/* Membership Action Button */}
            <div className="shrink-0 flex items-center gap-3">
              {user?.role === 'student' ? (
                membershipStatus === 'approved' ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Official Member</span>
                  </div>
                ) : membershipStatus === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                      <Clock className="w-4 h-4 text-amber-600" />
                      Pending Approval
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelRequest}
                      isLoading={cancellingRequest}
                    >
                      Withdraw
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="md"
                    icon={Send}
                    onClick={() => {
                      setJoinReason('Excited to learn, attend workshops, and collaborate with members.');
                      setJoinModalOpen(true);
                    }}
                  >
                    Request to Join
                  </Button>
                )
              ) : !isAuthenticated ? (
                <Link to="/login">
                  <Button size="md">Sign in to Join</Button>
                </Link>
              ) : null}
            </div>
          </div>

          {/* Key Facts Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Approved Members</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                {memberCount} Students
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Regular Schedule</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block truncate">
                {club.meetingSchedule || 'Scheduled Weekly'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Established</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                {club.foundedYear || 2022}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Contact Channel</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block truncate">
                {club.contactEmail || 'club@campus.edu'}
              </span>
            </div>
          </div>

          {/* Social Links */}
          {club.socialLinks && (
            <div className="flex items-center gap-3 mt-4 text-slate-500">
              {club.socialLinks.website && (
                <a
                  href={club.socialLinks.website}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-brand-600 transition-colors"
                  title="Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {club.socialLinks.instagram && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Instagram className="w-4 h-4 text-rose-500" />
                  {club.socialLinks.instagram}
                </span>
              )}
              {club.socialLinks.github && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Github className="w-4 h-4 text-slate-800" />
                  {club.socialLinks.github}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex gap-4 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>About & Leadership</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'events'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Events</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs">
            {events.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'announcements'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Announcements</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs">
            {announcements.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'members'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Members Roster</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs">
            {memberCount}
          </span>
        </button>
      </div>

      {/* TAB 1: About & Leadership */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-soft">
              <h3 className="text-base font-bold text-slate-900 mb-3">About the Club</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {club.description}
              </p>

              {club.tags && club.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Core Focus & Skill Areas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {club.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-medium px-3 py-1 rounded-xl bg-slate-100 text-slate-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Leadership Cards Column */}
          <div className="space-y-6">
            {/* Club President Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-soft">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 mb-3 block">
                Club President
              </span>
              <div className="flex items-center gap-3">
                <Avatar
                  src={club.presidentId?.avatar}
                  name={club.presidentId?.name || 'Assigned Lead'}
                  size="lg"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {club.presidentId?.name || 'Assigned Lead'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {club.presidentId?.department || 'Engineering'}
                  </p>
                  <p className="text-xs text-brand-600 mt-0.5 truncate">
                    {club.presidentId?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Faculty Advisor Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-soft">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 mb-3 block">
                Faculty Advisor
              </span>
              <div className="flex items-center gap-3">
                <Avatar
                  src={club.facultyAdvisorId?.avatar}
                  name={club.facultyAdvisorId?.name || 'Assigned Advisor'}
                  size="lg"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {club.facultyAdvisorId?.name || 'Assigned Advisor'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {club.facultyAdvisorId?.department || 'University Faculty'}
                  </p>
                  <p className="text-xs text-purple-600 mt-0.5 truncate">
                    {club.facultyAdvisorId?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Events */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {events.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming events scheduled"
              description="This club currently has no approved upcoming events on the calendar."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((ev) => (
                <div
                  key={ev._id}
                  className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-soft flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="primary" size="sm">
                        {ev.category}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {new Date(ev.eventDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 line-clamp-1">
                      {ev.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {ev.description}
                    </p>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-brand-600" />
                        <span>{ev.startTime} - {ev.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-brand-600" />
                        <span>{ev.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
                    <Link to={`/events/${ev._id}`}>
                      <Button size="sm">View & Register</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Announcements */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No announcements yet"
              description="The club president has not posted any announcements recently."
            />
          ) : (
            announcements.map((item) => (
              <div
                key={item._id}
                className={`p-6 rounded-2xl bg-white border shadow-soft ${
                  item.isPinned ? 'border-brand-300 bg-brand-50/10' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {item.isPinned && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                    {item.priority === 'urgent' && (
                      <Badge variant="danger" size="sm">
                        Urgent Notice
                      </Badge>
                    )}
                    {item.priority === 'important' && (
                      <Badge variant="warning" size="sm">
                        Important
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 mt-2">
                  {item.title}
                </h4>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
                  Posted by {item.authorId?.name || 'Club President'}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: Members Roster */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Official Club Members
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Students officially approved to participate in this forum.
              </p>
            </div>
            <Badge variant="success">{members.length} Enrolled</Badge>
          </div>

          {members.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No approved student members currently listed.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {members.map((m) => {
                const s = m.studentId;
                if (!s) return null;
                return (
                  <div
                    key={m._id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={s.avatar}
                        name={s.name || 'Member'}
                        size="md"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {s.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {s.department || 'Undergraduate Student'} • {s.studentId || 'Enrolled'}
                        </p>
                      </div>
                    </div>

                    <Badge variant={m.role === 'core_team' ? 'primary' : 'default'} size="sm">
                      {m.role === 'core_team' ? 'Core Team' : 'Member'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Request to Join Modal */}
      <Modal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        title={`Request to Join ${club.name}`}
        subtitle="Submit a brief statement to the Club President."
      >
        <form onSubmit={handleJoinSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Why do you want to join this club?
            </label>
            <textarea
              rows={4}
              required
              value={joinReason}
              onChange={(e) => setJoinReason(e.target.value)}
              placeholder="Tell the president about your interest, experience, or what you want to learn..."
              className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setJoinModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Send}
              isLoading={submittingJoin}
            >
              Send Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClubDetailPage;

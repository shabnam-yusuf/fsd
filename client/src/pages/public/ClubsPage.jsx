import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import {
  Search,
  Compass,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Send
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Technical',
  'Cultural',
  'Sports',
  'Academic',
  'Social & Welfare',
  'Entrepreneurship',
  'Literary',
];

export const ClubsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Request to Join Modal state
  const [selectedClub, setSelectedClub] = useState(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinReason, setJoinReason] = useState('');
  const [submittingJoin, setSubmittingJoin] = useState(false);
  const [myMemberships, setMyMemberships] = useState({});

  useEffect(() => {
    fetchClubs();
  }, [selectedCategory]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'student') {
      fetchMyMemberships();
    }
  }, [isAuthenticated, user]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/clubs', { params });
      if (res.data.success) {
        setClubs(res.data.clubs);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load clubs');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyMemberships = async () => {
    try {
      const res = await api.get('/memberships/my');
      if (res.data.success) {
        const map = {};
        res.data.memberships.forEach((m) => {
          if (m.clubId) {
            map[m.clubId._id] = m.status; // 'pending' | 'approved' | 'rejected'
          }
        });
        setMyMemberships(map);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchClubs();
  };

  const openJoinModal = (club) => {
    if (!isAuthenticated) {
      toast.info('Please sign in as a student to join clubs');
      return;
    }
    if (user?.role !== 'student') {
      toast.warning('Only student accounts can request club memberships');
      return;
    }
    setSelectedClub(club);
    setJoinReason('Excited to learn, attend workshops, and collaborate with members.');
    setJoinModalOpen(true);
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClub) return;

    try {
      setSubmittingJoin(true);
      const res = await api.post('/memberships/request', {
        clubId: selectedClub._id,
        joinReason,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Membership request sent!');
        setMyMemberships((prev) => ({
          ...prev,
          [selectedClub._id]: 'pending',
        }));
        setJoinModalOpen(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit request';
      toast.error(msg);
    } finally {
      setSubmittingJoin(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="primary">Campus Directory</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Explore Student Clubs & Forums
        </h1>
        <p className="text-sm text-slate-600">
          Discover student societies, academic forums, competitive teams, and creative collectives across our university.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-soft space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clubs by name, description, or keywords (e.g. AI, Figma, Web, Robotics)..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Clubs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No clubs found"
          description="Try adjusting your search keywords or choosing a different category filter."
          actionText="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedCategory('All');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => {
            const membershipStatus = myMemberships[club._id];

            return (
              <div
                key={club._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-card transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Banner */}
                <div className="h-40 w-full relative overflow-hidden bg-slate-100">
                  <img
                    src={
                      club.bannerImage ||
                      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={club.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="default" size="sm" className="bg-white/95 backdrop-blur-sm shadow-sm font-semibold">
                      {club.category}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 -mt-12 mb-3">
                      {club.logo ? (
                        <img
                          src={club.logo}
                          alt={club.name}
                          className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 ring-4 ring-white shadow-md flex items-center justify-center text-brand-700 font-bold text-lg shrink-0">
                          {club.name?.charAt(0) || 'C'}
                        </div>
                      )}
                    </div>

                    <Link to={`/clubs/${club._id}`}>
                      <h3 className="text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1">
                        {club.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-brand-600 font-medium mt-0.5 line-clamp-1">
                      {club.tagline}
                    </p>
                    <p className="text-xs text-slate-500 mt-2.5 line-clamp-3 leading-relaxed">
                      {club.description}
                    </p>

                    {/* Tags */}
                    {club.tags && club.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {club.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer & Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        President: <strong className="text-slate-700">{club.presidentId?.name || 'Assigned'}</strong>
                      </span>
                      <span>Est. {club.foundedYear || 2022}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/clubs/${club._id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          View Club
                        </Button>
                      </Link>

                      {membershipStatus === 'approved' ? (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Joined
                        </span>
                      ) : membershipStatus === 'pending' ? (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openJoinModal(club)}
                        >
                          Join Club
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Request To Join Modal */}
      <Modal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        title={`Request to Join ${selectedClub?.name || 'Club'}`}
        subtitle="Your request will be submitted to the Club President for review."
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
              placeholder="Share your background, skills you'd like to develop, or what you hope to contribute..."
              className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="p-3 bg-brand-50 rounded-xl border border-brand-100 text-xs text-brand-800 leading-relaxed">
            💡 Once approved, you will appear in the club's official roster, receive exclusive club announcements, and access members-only activities.
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
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClubsPage;

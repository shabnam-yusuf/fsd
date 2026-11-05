import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Search,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  Video,
  ArrowRight
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Workshop',
  'Hackathon',
  'Seminar',
  'Competition',
  'Cultural Fest',
  'Sports Meet',
];

export const EventsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeFilter, setTimeFilter] = useState('upcoming'); // 'upcoming' | 'past' | 'all'
  const [myRegistrations, setMyRegistrations] = useState({});

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, timeFilter]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'student') {
      fetchMyRegistrations();
    }
  }, [isAuthenticated, user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (timeFilter !== 'all') params.timeFilter = timeFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/events', { params });
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRegistrations = async () => {
    try {
      const res = await api.get('/registrations/my');
      if (res.data.success) {
        const map = {};
        res.data.registrations.forEach((r) => {
          if (r.eventId) {
            map[r.eventId._id] = r.status; // 'registered' | 'cancelled'
          }
        });
        setMyRegistrations(map);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleQuickRegister = async (eventId) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to register for events');
      return;
    }
    if (user?.role !== 'student') {
      toast.warning('Only students can register for events');
      return;
    }

    try {
      const res = await api.post('/registrations/register', { eventId });
      if (res.data.success) {
        toast.success(res.data.message || 'Request submitted for president approval!');
        setMyRegistrations((prev) => ({
          ...prev,
          [eventId]: res.data.registration?.status || 'pending',
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="purple">Official Calendar</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Campus Events & Workshops
        </h1>
        <p className="text-sm text-slate-600">
          Faculty-approved collegiate events, technical bootcamps, and competitions. Register to secure your seat.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-soft space-y-4">
        {/* Search & Time Tabs */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events by title, venue, or topics..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>

          {/* Time switch */}
          <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setTimeFilter('upcoming')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeFilter === 'upcoming'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setTimeFilter('past')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeFilter === 'past'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Past Events
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeFilter === 'all'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
          </div>
        </div>

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

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description="Try selecting 'Past Events' or clearing search filters to see more results."
          actionText="Reset Filters"
          onAction={() => {
            setSearch('');
            setSelectedCategory('All');
            setTimeFilter('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const regStatus = myRegistrations[event._id];
            const isApproved = regStatus === 'approved' || regStatus === 'registered';
            const isPending = regStatus === 'pending';
            const isPast = new Date(event.eventDate) < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <div
                key={event._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-card transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Banner */}
                <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                  <img
                    src={
                      event.bannerImage ||
                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge variant="default" size="sm" className="bg-white/95 backdrop-blur-sm font-semibold">
                      {event.category}
                    </Badge>
                  </div>
                  {event.locationType === 'online' && (
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-blue-600 text-white flex items-center gap-1 shadow-sm">
                        <Video className="w-3 h-3" /> Virtual
                      </span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Club header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-brand-700 truncate">
                        {event.clubId?.name || 'Campus Forum'}
                      </span>
                    </div>

                    <Link to={`/events/${event._id}`}>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Event metadata */}
                    <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span className="font-semibold text-slate-800">
                          {new Date(event.eventDate).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link to={`/events/${event._id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Details
                      </Button>
                    </Link>

                    {isPast ? (
                      <span className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500">
                        Event Concluded
                      </span>
                    ) : isApproved ? (
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </span>
                    ) : isPending ? (
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleQuickRegister(event._id)}
                      >
                        Register
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsPage;

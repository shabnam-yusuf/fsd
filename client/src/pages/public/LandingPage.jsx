import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import {
  Compass,
  Calendar,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Flame,
  GraduationCap
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();

  const [featuredClubs, setFeaturedClubs] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [stats, setStats] = useState({
    clubsCount: 6,
    eventsCount: 8,
    membersCount: 45,
    satisfactionRate: 98,
  });
  const [loading, setLoading] = useState(true);
  const [demoLoggingIn, setDemoLoggingIn] = useState(false);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [clubsRes, eventsRes] = await Promise.all([
          api.get('/clubs'),
          api.get('/events?timeFilter=upcoming'),
        ]);

        if (clubsRes.data.success) {
          setFeaturedClubs(clubsRes.data.clubs.slice(0, 3));
          setStats((prev) => ({ ...prev, clubsCount: clubsRes.data.count }));
        }

        if (eventsRes.data.success) {
          setUpcomingEvents(eventsRes.data.events.slice(0, 3));
          setStats((prev) => ({ ...prev, eventsCount: eventsRes.data.count }));
        }
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  // Quick Demo Login Handler
  const handleQuickDemo = async (email, password, redirectPath) => {
    setDemoLoggingIn(true);
    const res = await login(email, password);
    setDemoLoggingIn(false);
    if (res.success) {
      navigate(redirectPath);
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'club_president') return '/dashboard/president';
    if (user.role === 'faculty_advisor') return '/dashboard/faculty';
    return '/dashboard/student';
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 border-b border-slate-200/80 bg-gradient-to-b from-white via-brand-50/20 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen College Extracurricular Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Discover Your Community. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-600 bg-clip-text text-transparent">
              Lead Student Forums.
            </span>{' '}
            Create Impact.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The unified system for college student clubs, transparent faculty approvals, event registrations, verified attendance tracking, and leadership management.
          </p>

          {/* Main CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/clubs">
              <Button size="lg" icon={Compass} className="shadow-lg shadow-brand-500/20">
                Explore Clubs
              </Button>
            </Link>
            {isAuthenticated ? (
              <Link to={getDashboardPath()}>
                <Button variant="outline" size="lg" icon={ArrowRight}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button variant="outline" size="lg">
                  Join as Student
                </Button>
              </Link>
            )}
          </div>

          {/* Quick Demo Evaluation Bar */}
          <div className="mt-14 max-w-3xl mx-auto p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-soft">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>1-Click Evaluator Demo Sign-in:</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Instantly switch roles to test dashboards
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                disabled={demoLoggingIn}
                onClick={() =>
                  handleQuickDemo(
                    'student.alex@campus.edu',
                    'student123',
                    '/dashboard/student'
                  )
                }
                className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 transition-colors text-left group"
              >
                <div>
                  <p className="text-xs font-bold text-emerald-950 group-hover:text-emerald-900">
                    Student (Alex)
                  </p>
                  <p className="text-[10px] text-emerald-700">Browse & Register</p>
                </div>
                <GraduationCap className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              </button>

              <button
                type="button"
                disabled={demoLoggingIn}
                onClick={() =>
                  handleQuickDemo(
                    'president.tech@campus.edu',
                    'president123',
                    '/dashboard/president'
                  )
                }
                className="flex items-center justify-between p-2.5 rounded-xl border border-brand-200 bg-brand-50/60 hover:bg-brand-100/80 transition-colors text-left group"
              >
                <div>
                  <p className="text-xs font-bold text-brand-950 group-hover:text-brand-900">
                    President (Sarah)
                  </p>
                  <p className="text-[10px] text-brand-700">Events & Members</p>
                </div>
                <Users className="w-4 h-4 text-brand-600 group-hover:scale-110 transition-transform" />
              </button>

              <button
                type="button"
                disabled={demoLoggingIn}
                onClick={() =>
                  handleQuickDemo(
                    'faculty@campus.edu',
                    'faculty123',
                    '/dashboard/faculty'
                  )
                }
                className="flex items-center justify-between p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 transition-colors text-left group"
              >
                <div>
                  <p className="text-xs font-bold text-purple-950 group-hover:text-purple-900">
                    Faculty (Dr. Robert)
                  </p>
                  <p className="text-[10px] text-purple-700">Approve & Monitor</p>
                </div>
                <ShieldCheck className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Stats Counters */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.clubsCount}+
              </p>
              <p className="text-xs font-medium text-slate-500 mt-1">Active Clubs & Forums</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.eventsCount}+
              </p>
              <p className="text-xs font-medium text-slate-500 mt-1">Campus Events</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                100%
              </p>
              <p className="text-xs font-medium text-slate-500 mt-1">Verified Attendance</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                3-Tier
              </p>
              <p className="text-xs font-medium text-slate-500 mt-1">Role Governance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Clubs Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="primary" className="mb-2">
              Student Communities
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Featured Clubs & Forums
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Join active student-led organizations that match your passions.
            </p>
          </div>
          <Link
            to="/clubs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <span>View All Clubs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredClubs.map((club) => (
            <div
              key={club._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-card transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Banner */}
              <div className="h-36 w-full relative overflow-hidden bg-slate-100">
                <img
                  src={
                    club.bannerImage ||
                    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={club.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant="default" size="sm" className="bg-white/90 backdrop-blur-sm">
                    {club.category}
                  </Badge>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 -mt-10 mb-3">
                    {club.logo ? (
                      <img
                        src={club.logo}
                        alt={club.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white shadow-sm bg-white"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 ring-4 ring-white shadow-sm flex items-center justify-center text-brand-700 font-bold text-base">
                        {club.name?.charAt(0) || 'C'}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                    {club.name}
                  </h3>
                  <p className="text-xs text-brand-600 font-medium mt-0.5 line-clamp-1">
                    {club.tagline}
                  </p>
                  <p className="text-xs text-slate-500 mt-2.5 line-clamp-3 leading-relaxed">
                    {club.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Lead: <strong className="text-slate-700">{club.presidentId?.name || 'Assigned'}</strong>
                  </span>
                  <Link to={`/clubs/${club._id}`}>
                    <Button variant="secondary" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="purple" className="mb-2">
              Campus Activities
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Upcoming Approved Events
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Events reviewed and approved by faculty advisors, ready for registration.
            </p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <span>Browse Event Calendar</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-card transition-all p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="primary" size="sm">
                    {event.category}
                  </Badge>
                  <span className="text-xs text-slate-400 font-medium">
                    {event.clubId?.name}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-2 hover:text-brand-600 transition-colors">
                  {event.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    <span>{new Date(event.eventDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                </span>
                <Link to={`/events/${event._id}`}>
                  <Button size="sm">Register Now</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Role Architecture & Benefits Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Built Specifically for Campus Governance
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Three streamlined roles working in complete synchronization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">1. For Students</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Discover forums, apply to join clubs with personalized statements, register for approved workshops in one click, track your attendance log, and download participation history.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-700">
                <li className="flex items-center gap-2">✓ 1-Click Event Registration</li>
                <li className="flex items-center gap-2">✓ Verified Attendance Record</li>
                <li className="flex items-center gap-2">✓ Instant Club Status Updates</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-lg">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">2. For Club Presidents</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Effortlessly manage your club profile, review and approve member requests, submit event proposals for advisor review, track attendance sheets live, and broadcast announcements.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-700">
                <li className="flex items-center gap-2">✓ Member Approval Workflow</li>
                <li className="flex items-center gap-2">✓ Event Proposal Submission</li>
                <li className="flex items-center gap-2">✓ Live Attendance Marking</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">3. For Faculty Advisors</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Full institutional oversight. Review incoming event proposals, provide constructive rejection remarks or approvals, monitor club rosters, and analyze student engagement metrics.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-700">
                <li className="flex items-center gap-2">✓ Pending Event Approvals</li>
                <li className="flex items-center gap-2">✓ Transparent Reason Logging</li>
                <li className="flex items-center gap-2">✓ Cross-Club Analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-card">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to elevate your campus experience?
            </h2>
            <p className="text-brand-100 text-sm max-w-lg">
              Sign up today with your college email or test the pre-seeded demo accounts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/register">
              <Button size="lg" className="bg-white text-brand-900 hover:bg-brand-50 shadow-none">
                Register as Student
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 shadow-none">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

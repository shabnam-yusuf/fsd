import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import {
  Layers,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Users,
  ShieldCheck,
  GraduationCap,
  Eye,
  EyeOff,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  User as UserIcon
} from 'lucide-react';

export const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Selected role tab: 'student' | 'club_president' | 'faculty_advisor'
  const [selectedRole, setSelectedRole] = useState('student');

  const [username, setUsername] = useState('shabnam');
  const [email, setEmail] = useState('shabnam@gmail.com');
  const [password, setPassword] = useState('student123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot Password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotResponse, setForgotResponse] = useState(null);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectAfterLogin(user.role);
    }
  }, [isAuthenticated, user]);

  const redirectAfterLogin = (role) => {
    if (role === 'club_president') navigate('/dashboard/president');
    else if (role === 'faculty_advisor') navigate('/dashboard/faculty');
    else navigate('/dashboard/student');
  };

  // Role Tab switch helper - updates demonstration credentials
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'student') {
      setUsername('shabnam');
      setEmail('shabnam@gmail.com');
      setPassword('student123');
    } else if (role === 'club_president') {
      setUsername('sarumathi');
      setEmail('sarumathi@gmail.com');
      setPassword('president123');
    } else if (role === 'faculty_advisor') {
      setUsername('sashmitha');
      setEmail('sashmitha@gmail.com');
      setPassword('faculty123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email address and password');
      return;
    }

    setLoading(true);
    const res = await login({
      username: username.trim(),
      email: email.trim(),
      password,
      role: selectedRole,
    });
    setLoading(false);

    if (res?.success) {
      redirectAfterLogin(res.user.role);
    }
  };

  const handleQuickDemo = async (demoUsername, demoEmail, demoPassword, role) => {
    setSelectedRole(role);
    setUsername(demoUsername);
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    const res = await login({
      username: demoUsername,
      email: demoEmail,
      password: demoPassword,
      role,
    });
    setLoading(false);

    if (res?.success) {
      redirectAfterLogin(res.user.role);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your college email');
      return;
    }

    try {
      setForgotLoading(true);
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      if (res.data.success) {
        setForgotResponse(res.data.message);
        toast.success('Password instructions retrieved');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not locate account with this email');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-brand-500/25 mb-4">
            <Layers className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to Campus Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Centralized Clubs, Forums & Extracurricular Management System
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200">
          <button
            type="button"
            onClick={() => handleRoleSelect('student')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedRole === 'student'
                ? 'bg-white text-brand-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('club_president')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedRole === 'club_president'
                ? 'bg-white text-brand-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>President</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('faculty_advisor')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedRole === 'faculty_advisor'
                ? 'bg-white text-brand-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Advisor</span>
          </button>
        </div>

        {/* Main Login Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    selectedRole === 'faculty_advisor'
                      ? 'sashmitha'
                      : selectedRole === 'club_president'
                      ? 'sarumathi'
                      : 'shabnam'
                  }
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === 'faculty_advisor'
                      ? 'sashmitha@gmail.com'
                      : selectedRole === 'club_president'
                      ? 'sarumathi@gmail.com'
                      : 'shabnam@gmail.com'
                  }
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotResponse(null);
                    setForgotModalOpen(true);
                  }}
                  className="text-[11px] font-semibold text-brand-600 hover:text-brand-800 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
            >
              Sign In as {selectedRole === 'faculty_advisor' ? 'Faculty Advisor' : selectedRole === 'club_president' ? 'Club President' : 'Student'}
            </Button>
          </form>

          {/* Student Registration Link */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New student to campus?{' '}
              <Link
                to="/register"
                className="font-bold text-brand-600 hover:text-brand-800 hover:underline"
              >
                Register Here
              </Link>
            </p>
          </div>
        </div>

        {/* 1-Click Demo Evaluation Switcher */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-brand-700">
              <Sparkles className="w-3.5 h-3.5" /> Demonstration Accounts
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Click to auto-fill</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleQuickDemo('shabnam', 'shabnam@gmail.com', 'student123', 'student')
              }
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 transition-colors text-left"
            >
              <p className="text-[11px] font-bold text-emerald-950">Student</p>
              <p className="text-[10px] text-emerald-800 font-medium truncate">Shabnam</p>
              <p className="text-[9px] text-emerald-600 truncate">shabnam@gmail.com</p>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleQuickDemo('sarumathi', 'sarumathi@gmail.com', 'president123', 'club_president')
              }
              className="p-2.5 rounded-xl border border-brand-200 bg-brand-50/70 hover:bg-brand-100 transition-colors text-left"
            >
              <p className="text-[11px] font-bold text-brand-950">Club President</p>
              <p className="text-[10px] text-brand-800 font-medium truncate">Sarumathi</p>
              <p className="text-[9px] text-brand-600 truncate">sarumathi@gmail.com</p>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleQuickDemo('sashmitha', 'sashmitha@gmail.com', 'faculty123', 'faculty_advisor')
              }
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 transition-colors text-left"
            >
              <p className="text-[11px] font-bold text-purple-950">Faculty Advisor</p>
              <p className="text-[10px] text-purple-800 font-medium truncate">Sashmitha</p>
              <p className="text-[9px] text-purple-600 truncate">sashmitha@gmail.com</p>
            </button>
          </div>
        </div>

        {/* Public Overview Link */}
        <div className="text-center">
          <Link
            to="/home"
            className="text-xs font-medium text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
          >
            <span>Explore Campus Platform Overview & Public Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Forgot Password?"
        subtitle="Retrieve instructions to access your college account"
      >
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Enter Registered College Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@campus.edu"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {forgotResponse && (
            <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-xs text-brand-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <span>Account Recovery Verified:</span>
              </div>
              <p className="leading-relaxed">{forgotResponse}</p>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
            💡 Demonstration accounts (Shabnam, Sarumathi, Sashmitha) are registered in MongoDB with valid authentication. Use the Demonstration Accounts panel on the login page to auto-fill your credentials.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setForgotModalOpen(false)}
            >
              Close
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={forgotLoading}
            >
              Verify Email
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LoginPage;

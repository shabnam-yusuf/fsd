import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Compass,
  Calendar,
  Users,
  CheckSquare,
  FileCheck2,
  Megaphone,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  Layers,
  Settings,
  ShieldCheck,
  BarChart3
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const role = user?.role;

  // Student Links
  const studentNavItems = [
    { label: 'Overview', to: '/dashboard/student', icon: LayoutDashboard },
    { label: 'Joined Clubs', to: '/dashboard/student/my-clubs', icon: Layers },
    { label: 'Registered Events', to: '/dashboard/student/events', icon: Calendar },
    { label: 'Attendance History', to: '/dashboard/student/attendance', icon: CheckSquare },
    { label: 'Explore Clubs', to: '/clubs', icon: Compass },
    { label: 'Campus Events', to: '/events', icon: Sparkles },
    { label: 'Notifications', to: '/notifications', icon: Bell },
    { label: 'My Profile', to: '/profile', icon: User },
  ];

  // Club President Links
  const presidentNavItems = [
    { label: 'Dashboard', to: '/dashboard/president', icon: LayoutDashboard },
    { label: 'My Club Info', to: '/dashboard/president/club', icon: Settings },
    { label: 'Members & Requests', to: '/dashboard/president/members', icon: Users },
    { label: 'Event Management', to: '/dashboard/president/events', icon: Calendar },
    { label: 'Attendance Manager', to: '/dashboard/president/attendance', icon: CheckSquare },
    { label: 'Announcements', to: '/dashboard/president/announcements', icon: Megaphone },
    { label: 'Notifications', to: '/notifications', icon: Bell },
    { label: 'My Profile', to: '/profile', icon: User },
  ];

  // Faculty Advisor Links
  const facultyNavItems = [
    { label: 'Dashboard', to: '/dashboard/faculty', icon: LayoutDashboard },
    { label: 'Pending Approvals', to: '/dashboard/faculty/approvals', icon: FileCheck2 },
    { label: 'Assigned Clubs', to: '/dashboard/faculty/clubs', icon: ShieldCheck },
    { label: 'Analytics & Stats', to: '/dashboard/faculty/analytics', icon: BarChart3 },
    { label: 'Notifications', to: '/notifications', icon: Bell },
    { label: 'My Profile', to: '/profile', icon: User },
  ];

  const navItems =
    role === 'club_president'
      ? presidentNavItems
      : role === 'faculty_advisor'
      ? facultyNavItems
      : studentNavItems;

  const roleSubtitle =
    role === 'club_president'
      ? 'Club President Portal'
      : role === 'faculty_advisor'
      ? 'Faculty Advisor Portal'
      : 'Student Portal';

  return (
    <aside
      className={`h-[calc(100vh-4rem)] sticky top-16 bg-white border-r border-slate-200/80 transition-all duration-300 flex flex-col justify-between select-none z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-3">
        {/* Role badge card */}
        {!collapsed ? (
          <div className="p-3.5 mb-3 bg-gradient-to-br from-slate-50 to-brand-50/50 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-700 block">
              {roleSubtitle}
            </span>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {user?.department || 'Campus Department'}
            </p>
          </div>
        ) : (
          <div className="flex justify-center mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
        )}

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.includes('dashboard') && item.to.split('/').length <= 3}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!collapsed && <span>Collapse Sidebar</span>}
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

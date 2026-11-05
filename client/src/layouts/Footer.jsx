import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Heart, Globe, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
                <Layers className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                Campus Clubs & Forums
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              The official centralized platform empowering student leadership, seamless event approval workflows, club discovery, and transparent collegiate engagement.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> University Student Center
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> clubs@campus.edu
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <Link to="/clubs" className="hover:text-brand-600 transition-colors">
                  Explore Clubs
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-brand-600 transition-colors">
                  Campus Events
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-600 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-600 transition-colors">
                  Student Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* User Roles */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              User Portals
            </h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <Link to="/dashboard/student" className="hover:text-brand-600 transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/president" className="hover:text-brand-600 transition-colors">
                  Club President Portal
                </Link>
              </li>
              <li>
                <Link to="/dashboard/faculty" className="hover:text-brand-600 transition-colors">
                  Faculty Advisor Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} Campus Clubs & Forums Management System. Academic Full-Stack Project.</p>
          <p className="flex items-center gap-1">
            Built with React, Node.js, Express & MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

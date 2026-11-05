import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import {
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Compass,
  ArrowRight
} from 'lucide-react';

export const MyClubsPage = () => {
  const toast = useToast();
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('approved'); // 'approved' | 'pending' | 'rejected'
  const [selectedCancelClubId, setSelectedCancelClubId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const res = await api.get('/memberships/my');
      if (res.data.success) {
        setMemberships(res.data.memberships);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your club memberships');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!selectedCancelClubId) return;
    try {
      setCancelLoading(true);
      const res = await api.delete(`/memberships/cancel/${selectedCancelClubId}`);
      if (res.data.success) {
        toast.info('Membership request cancelled');
        setMemberships((prev) =>
          prev.filter((m) => m.clubId && m.clubId._id !== selectedCancelClubId)
        );
        setSelectedCancelClubId(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setCancelLoading(false);
    }
  };

  const approvedList = memberships.filter((m) => m.status === 'approved');
  const pendingList = memberships.filter((m) => m.status === 'pending');
  const rejectedList = memberships.filter((m) => m.status === 'rejected');

  const currentList =
    activeTab === 'approved'
      ? approvedList
      : activeTab === 'pending'
      ? pendingList
      : rejectedList;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Club Memberships
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your active society affiliations and pending application requests
          </p>
        </div>
        <Link to="/clubs">
          <Button icon={Compass} size="sm">
            Explore All Clubs
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('approved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'approved'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-600'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Active Memberships ({approvedList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'pending'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Approvals ({pendingList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rejected')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'rejected'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-600'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Declined ({rejectedList.length})</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={
            activeTab === 'approved'
              ? 'No active club memberships'
              : activeTab === 'pending'
              ? 'No pending membership applications'
              : 'No declined requests'
          }
          description={
            activeTab === 'approved'
              ? 'You have not joined any campus clubs yet. Browse our directory to join exciting communities.'
              : 'All your previous applications have been processed.'
          }
          actionText={activeTab === 'approved' ? 'Discover Clubs' : undefined}
          onAction={activeTab === 'approved' ? () => (window.location.href = '/clubs') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentList.map((m) => {
            const club = m.clubId;
            if (!club) return null;

            return (
              <div
                key={m._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    {club.logo ? (
                      <img
                        src={club.logo}
                        alt={club.name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                        {club.name?.charAt(0) || 'C'}
                      </div>
                    )}
                    <Badge
                      variant={
                        m.status === 'approved'
                          ? 'success'
                          : m.status === 'pending'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {m.status === 'approved'
                        ? m.role === 'core_team' ? 'Core Team' : 'Member'
                        : m.status === 'pending'
                        ? 'Pending Review'
                        : 'Application Declined'}
                    </Badge>
                  </div>

                  <Link to={`/clubs/${club._id}`}>
                    <h3 className="text-base font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1">
                      {club.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-brand-600 font-medium mt-0.5">
                    {club.category}
                  </p>

                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                    <p className="truncate">
                      <strong>Schedule:</strong> {club.meetingSchedule || 'Weekly'}
                    </p>
                    <p className="truncate">
                      <strong>President:</strong> {club.presidentId?.name || 'Assigned'}
                    </p>
                  </div>

                  {/* Rejection reason if any */}
                  {m.status === 'rejected' && m.rejectionReason && (
                    <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                      <strong>Feedback:</strong> {m.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link to={`/clubs/${club._id}`}>
                    <Button variant="secondary" size="sm">
                      Club Details
                    </Button>
                  </Link>

                  {m.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 border-rose-200"
                      onClick={() => setSelectedCancelClubId(club._id)}
                    >
                      Cancel Request
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel confirmation dialog */}
      <ConfirmDialog
        isOpen={!!selectedCancelClubId}
        onClose={() => setSelectedCancelClubId(null)}
        onConfirm={handleCancelRequest}
        title="Withdraw Application?"
        message="Are you sure you want to cancel your pending membership application for this club?"
        confirmText="Withdraw"
        isLoading={cancelLoading}
      />
    </div>
  );
};

export default MyClubsPage;

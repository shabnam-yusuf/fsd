import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Check,
  X,
  Mail,
  Shield,
  Phone
} from 'lucide-react';

export const MembersManagementPage = () => {
  const toast = useToast();
  const [club, setClub] = useState(null);
  const [allClubs, setAllClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedMembers, setApprovedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'members'
  const [search, setSearch] = useState('');

  // Action modals
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('approved'); // 'approved' | 'rejected'
  const [rejectionReason, setRejectionReason] = useState('');
  const [assignedRole, setAssignedRole] = useState('member');
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedClubId]);

  const fetchData = async (overrideClubId) => {
    try {
      setLoading(true);
      const targetId = overrideClubId !== undefined ? overrideClubId : selectedClubId;
      const params = targetId ? { clubId: targetId } : {};
      const clubRes = await api.get('/clubs/president/my-club', { params });
      if (clubRes.data.success) {
        const c = clubRes.data.club;
        setClub(c);
        if (clubRes.data.allClubs) {
          setAllClubs(clubRes.data.allClubs);
        }

        const [requestsRes, membersRes] = await Promise.all([
          api.get(`/memberships/club/${c._id}/requests`),
          api.get(`/memberships/club/${c._id}/members`),
        ]);

        if (requestsRes.data.success) {
          setPendingRequests(requestsRes.data.requests);
        }
        if (membersRes.data.success) {
          setApprovedMembers(membersRes.data.members);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load membership records');
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setRejectionReason('');
    setAssignedRole('member');
    setReviewModalOpen(true);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setSubmittingAction(true);
      const payload = {
        status: actionType,
        rejectionReason: actionType === 'rejected' ? rejectionReason : undefined,
        role: actionType === 'approved' ? assignedRole : undefined,
      };

      const res = await api.put(`/memberships/${selectedRequest._id}/status`, payload);
      if (res.data.success) {
        toast.success(
          `Membership request for ${selectedRequest.studentId?.name} has been ${actionType}`
        );

        // Remove from pending
        setPendingRequests((prev) =>
          prev.filter((r) => r._id !== selectedRequest._id)
        );

        // If approved, refresh approved members list
        if (actionType === 'approved') {
          fetchData();
        }

        setReviewModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process request');
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredMembers = approvedMembers.filter((m) => {
    const s = m.studentId;
    if (!s) return false;
    const query = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      (s.department && s.department.toLowerCase().includes(query)) ||
      (s.studentId && s.studentId.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Club Members & Applications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review prospective applicants, approve credentials, and manage active student members
            {club && <span className="font-semibold text-brand-700"> • {club.name}</span>}
          </p>
        </div>

        {allClubs.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-600 font-semibold">Active Club:</span>
            <select
              value={selectedClubId || club?._id || ''}
              onChange={(e) => setSelectedClubId(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {allClubs.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'pending'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Applications ({pendingRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'members'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Approved Roster ({approvedMembers.length})</span>
        </button>
      </div>

      {/* TAB 1: Pending Membership Requests */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {loading ? (
            <SkeletonTable rows={4} />
          ) : pendingRequests.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No pending membership requests"
              description="All current student applications have been processed and reviewed."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => {
                const s = req.studentId;
                const studentName = s?.name || req.studentName || 'Student Applicant';
                const studentEmail = s?.email || req.studentEmail || '';
                const studentDept = s?.department || req.studentDepartment || 'General';
                const studentCollegeId = s?.studentId || req.studentCollegeId || 'Student';

                return (
                  <div
                    key={req._id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={s?.avatar}
                            name={studentName}
                            size="md"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {studentName}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {studentDept} • {studentCollegeId}
                            </p>
                            <p className="text-xs text-brand-600 mt-0.5">
                              {studentEmail}
                            </p>
                          </div>
                        </div>
                        <Badge variant="warning" size="sm">
                          Pending
                        </Badge>
                      </div>

                      <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                        <span className="font-semibold text-slate-500 block mb-1">
                          Applicant Statement:
                        </span>
                        <p className="italic leading-relaxed">
                          "{req.joinReason || 'Eager to learn and participate in club events.'}"
                        </p>
                      </div>

                      <span className="text-[10px] text-slate-400 mt-2 block">
                        Requested on {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50 border-rose-200"
                        icon={X}
                        onClick={() => openActionModal(req, 'rejected')}
                      >
                        Decline
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        icon={Check}
                        onClick={() => openActionModal(req, 'approved')}
                      >
                        Approve Membership
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Approved Club Members */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Member Search Bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members by name, ID, or department..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            />
          </div>

          {loading ? (
            <SkeletonTable rows={5} />
          ) : filteredMembers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No members match search"
              description="Try typing a different name, department, or student ID."
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-semibold">
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Department & ID</th>
                    <th className="p-4">Role Designation</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Approved On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredMembers.map((m) => {
                    const s = m.studentId;
                    if (!s) return null;

                    return (
                      <tr key={m._id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={s.avatar}
                              name={s.name}
                              size="sm"
                            />
                            <span className="font-bold text-slate-900 block">
                              {s.name}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="block font-medium">{s.department}</span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {s.studentId}
                          </span>
                        </td>

                        <td className="p-4">
                          <Badge variant={m.role === 'core_team' ? 'primary' : 'default'}>
                            {m.role === 'core_team' ? 'Core Team' : 'Member'}
                          </Badge>
                        </td>

                        <td className="p-4 text-slate-500">
                          <span className="block">{s.email}</span>
                          {s.phone && (
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {s.phone}
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-slate-400">
                          {new Date(m.reviewedAt || m.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Review Action Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={
          actionType === 'approved'
            ? `Approve ${selectedRequest?.studentId?.name}`
            : `Decline ${selectedRequest?.studentId?.name}`
        }
        subtitle={
          actionType === 'approved'
            ? 'Confirm membership and optionally assign leadership role.'
            : 'Provide a reason for declining the application.'
        }
      >
        <form onSubmit={handleActionSubmit} className="space-y-4">
          {actionType === 'approved' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assign Membership Role
              </label>
              <select
                value={assignedRole}
                onChange={(e) => setAssignedRole(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              >
                <option value="member">General Member</option>
                <option value="core_team">Core Organizing Team</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reason for Declining (Optional feedback)
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Club capacity reached for this semester, or prerequisite coursework required..."
                className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={actionType === 'approved' ? 'success' : 'danger'}
              isLoading={submittingAction}
            >
              {actionType === 'approved' ? 'Confirm Approval' : 'Confirm Decline'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MembersManagementPage;

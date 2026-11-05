import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { CheckSquare, CheckCircle2, XCircle, Award, Calendar } from 'lucide-react';

export const AttendanceHistoryPage = () => {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance/my');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || {
    totalEvents: 0,
    presentEvents: 0,
    absentEvents: 0,
    attendanceRate: 100,
  };

  const records = data?.records || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Attendance History & Verified Participation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Official attendance records recorded by club presidents and faculty advisors
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft">
          <span className="text-xs font-medium text-slate-500">Attendance Rate</span>
          <p className="text-3xl font-extrabold text-brand-600 mt-1">
            {stats.attendanceRate}%
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-brand-600 h-1.5 rounded-full"
              style={{ width: `${stats.attendanceRate}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft">
          <span className="text-xs font-medium text-slate-500">Events Attended</span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">
            {stats.presentEvents}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Verified Present</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft">
          <span className="text-xs font-medium text-slate-500">Events Missed</span>
          <p className="text-3xl font-extrabold text-rose-500 mt-1">
            {stats.absentEvents}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Marked Absent</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft">
          <span className="text-xs font-medium text-slate-500">Total Evaluated</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">
            {stats.totalEvents}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Attendance Sheets</span>
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <SkeletonTable rows={5} />
      ) : records.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No attendance records found"
          description="Your attendance will appear here once club presidents conduct and mark check-ins for events you register for."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Verified Event Check-ins
            </h3>
            <Badge variant="success">Academic Record</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-semibold">
                  <th className="p-4">Event & Club</th>
                  <th className="p-4">Date & Venue</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Remarks from Lead</th>
                  <th className="p-4">Marked On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {records.map((rec) => {
                  const ev = rec.eventId;
                  const isPresent = rec.status === 'present';

                  return (
                    <tr key={rec._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">
                          {ev ? ev.title : 'Campus Event'}
                        </span>
                        <span className="text-[11px] text-brand-600 block mt-0.5">
                          {ev?.clubId?.name}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="block font-medium">
                          {ev ? new Date(ev.eventDate).toLocaleDateString() : '—'}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {ev ? ev.venue : '—'}
                        </span>
                      </td>

                      <td className="p-4">
                        <Badge variant={isPresent ? 'success' : 'danger'}>
                          {isPresent ? 'Present' : 'Absent'}
                        </Badge>
                      </td>

                      <td className="p-4 text-slate-500 max-w-xs truncate">
                        {rec.remarks || 'Check-in confirmed'}
                      </td>

                      <td className="p-4 text-slate-400">
                        {new Date(rec.markedAt || rec.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistoryPage;

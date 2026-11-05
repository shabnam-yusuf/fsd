import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import {
  CheckSquare,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Check,
  X,
  Calendar,
  Sparkles
} from 'lucide-react';

export const AttendanceManagerPage = () => {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [saving, setSaving] = useState(false);

  // Local student records: [ { studentId, name, studentCode, department, status: 'present' | 'absent' | 'pending', remarks } ]
  const [studentRecords, setStudentRecords] = useState([]);

  useEffect(() => {
    fetchApprovedEvents();
  }, []);

  const fetchApprovedEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events/president/my-events');
      if (res.data.success) {
        const approved = res.data.events.filter((ev) => ev.status === 'approved');
        setEvents(approved);
        if (approved.length > 0) {
          setSelectedEventId(approved[0]._id);
          fetchAttendanceSheet(approved[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceSheet = async (eventId) => {
    try {
      setLoadingSheet(true);
      const res = await api.get(`/attendance/event/${eventId}`);
      if (res.data.success) {
        setAttendanceData(res.data);
        setStudentRecords(res.data.students || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load attendance sheet');
    } finally {
      setLoadingSheet(false);
    }
  };

  const handleEventChange = (e) => {
    const newId = e.target.value;
    setSelectedEventId(newId);
    if (newId) {
      fetchAttendanceSheet(newId);
    }
  };

  const setStudentStatus = (studentId, status) => {
    setStudentRecords((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s))
    );
  };

  const setStudentRemarks = (studentId, remarks) => {
    setStudentRecords((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, remarks } : s))
    );
  };

  const handleMarkAll = (status) => {
    setStudentRecords((prev) => prev.map((s) => ({ ...s, status })));
    toast.info(`Marked all students as ${status.toUpperCase()}`);
  };

  const handleSaveAttendance = async () => {
    if (!selectedEventId || studentRecords.length === 0) return;

    try {
      setSaving(true);
      const recordsToSave = studentRecords.map((s) => ({
        studentId: s.studentId,
        status: s.status === 'present' ? 'present' : 'absent',
        remarks: s.remarks || '',
      }));

      const res = await api.post('/attendance/mark', {
        eventId: selectedEventId,
        records: recordsToSave,
      });

      if (res.data.success) {
        toast.success('Attendance records saved successfully!');
        fetchAttendanceSheet(selectedEventId);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const totalRegistered = studentRecords.length;
  const presentCount = studentRecords.filter((s) => s.status === 'present').length;
  const absentCount = studentRecords.filter((s) => s.status === 'absent').length;
  const pendingCount = totalRegistered - presentCount - absentCount;
  const rate = totalRegistered > 0 ? Math.round((presentCount / totalRegistered) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Event Attendance Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Check-in registered attendees, record presence, and verify participation credit
          </p>
        </div>

        {totalRegistered > 0 && (
          <Button
            icon={Save}
            onClick={handleSaveAttendance}
            isLoading={saving}
          >
            Save Attendance
          </Button>
        )}
      </div>

      {/* Event Selector Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Select Active Event
          </label>
          <select
            value={selectedEventId}
            onChange={handleEventChange}
            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white font-medium"
          >
            {events.length === 0 ? (
              <option value="">No approved events available</option>
            ) : (
              events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title} ({new Date(ev.eventDate).toLocaleDateString()})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Quick Batch Actions */}
        {totalRegistered > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-end">
            <span className="text-xs text-slate-400 font-medium">Quick Batch:</span>
            <Button
              variant="outline"
              size="sm"
              icon={Check}
              className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              onClick={() => handleMarkAll('present')}
            >
              All Present
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={X}
              className="text-rose-700 border-rose-200 hover:bg-rose-50"
              onClick={() => handleMarkAll('absent')}
            >
              All Absent
            </Button>
          </div>
        )}
      </div>

      {/* KPI Stats Strip */}
      {selectedEventId && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
            <span className="text-xs font-medium text-slate-500">Registered</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {totalRegistered}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
            <span className="text-xs font-medium text-emerald-600">Present</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">
              {presentCount}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
            <span className="text-xs font-medium text-rose-600">Absent</span>
            <p className="text-2xl font-extrabold text-rose-600 mt-0.5">
              {absentCount}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
            <span className="text-xs font-medium text-brand-600">Attendance Rate</span>
            <p className="text-2xl font-extrabold text-brand-600 mt-0.5">
              {rate}%
            </p>
          </div>
        </div>
      )}

      {/* Attendance Roster Table */}
      {loadingSheet ? (
        <SkeletonTable rows={5} />
      ) : studentRecords.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No registered attendees for this event"
          description="When students register for this event, their names will automatically populate here for check-in."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Registered Student Attendees ({studentRecords.length})
            </h3>
            <span className="text-xs text-slate-400">
              Click buttons to toggle Present or Absent
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-semibold">
                  <th className="p-4">Student</th>
                  <th className="p-4">Department & Code</th>
                  <th className="p-4 text-center">Status Toggle</th>
                  <th className="p-4">Lead Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {studentRecords.map((s) => {
                  const isPresent = s.status === 'present';
                  const isAbsent = s.status === 'absent';

                  return (
                    <tr
                      key={s.studentId}
                      className={`transition-colors ${
                        isPresent
                          ? 'bg-emerald-50/20'
                          : isAbsent
                          ? 'bg-rose-50/20'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={s.avatar}
                            name={s.name}
                            size="sm"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {s.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {s.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-medium block">{s.department}</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {s.studentCode || 'STU-ID'}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setStudentStatus(s.studentId, 'present')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              isPresent
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" /> Present
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentStatus(s.studentId, 'absent')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              isAbsent
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" /> Absent
                          </button>
                        </div>
                      </td>

                      <td className="p-4">
                        <input
                          type="text"
                          value={s.remarks || ''}
                          onChange={(e) => setStudentRemarks(s.studentId, e.target.value)}
                          placeholder="e.g. Completed lab, active speaker..."
                          className="w-full max-w-xs p-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
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

export default AttendanceManagerPage;

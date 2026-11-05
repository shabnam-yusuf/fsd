const Attendance = require('../models/Attendance');
const EventRegistration = require('../models/EventRegistration');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// @desc    Record/Update attendance for an event (President)
// @route   POST /api/attendance/mark
// @access  Private (Club President)
exports.markAttendance = async (req, res, next) => {
  try {
    const { eventId, records } = req.body;
    // records: [ { studentId, status: 'present' | 'absent', remarks: '' } ]

    if (!eventId || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide eventId and an array of attendance records',
      });
    }

    const event = await Event.findById(eventId).populate('clubId');
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Verify authorized president
    if (event.clubId.presidentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the club president can mark attendance for this event',
      });
    }

    const updatedRecords = [];

    for (const item of records) {
      const { studentId, status, remarks } = item;

      // Upsert attendance record
      const attendance = await Attendance.findOneAndUpdate(
        { eventId, studentId },
        {
          clubId: event.clubId._id,
          status,
          markedBy: req.user.id,
          markedAt: new Date(),
          remarks: remarks || '',
        },
        { upsert: true, new: true, runValidators: true }
      );

      // Update registration attendance status
      await EventRegistration.findOneAndUpdate(
        { eventId, studentId },
        { attendanceStatus: status === 'present' ? 'present' : 'absent' }
      );

      updatedRecords.push(attendance);

      // Notify student
      await Notification.create({
        recipientId: studentId,
        senderId: req.user.id,
        title: 'Attendance Marked',
        message: `Your attendance for "${event.title}" has been marked as ${status.toUpperCase()}.`,
        type: 'attendance_marked',
        link: `/dashboard/student/attendance`,
      });
    }

    res.status(200).json({
      success: true,
      count: updatedRecords.length,
      records: updatedRecords,
      message: 'Attendance recorded successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance sheet for an event (President & Faculty)
// @route   GET /api/attendance/event/:eventId
// @access  Private (President, Faculty Advisor)
exports.getEventAttendance = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId).populate('clubId');
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Get all approved registered students
    const registrations = await EventRegistration.find({
      eventId,
      status: { $in: ['approved', 'registered'] },
    }).populate('studentId', 'name email department studentId phone avatar');

    // Get attendance records
    const attendanceRecords = await Attendance.find({ eventId });

    // Map into complete list with status
    const attendanceMap = {};
    attendanceRecords.forEach((a) => {
      attendanceMap[a.studentId.toString()] = a;
    });

    const studentList = registrations.map((r) => {
      const student = r.studentId;
      const att = attendanceMap[student._id.toString()];
      return {
        studentId: student._id,
        name: student.name,
        email: student.email,
        studentCode: student.studentId,
        department: student.department,
        avatar: student.avatar,
        status: att ? att.status : r.attendanceStatus || 'pending',
        markedAt: att ? att.markedAt : null,
        remarks: att ? att.remarks : '',
      };
    });

    const totalRegistered = registrations.length;
    const presentCount = studentList.filter((s) => s.status === 'present').length;
    const absentCount = studentList.filter((s) => s.status === 'absent').length;
    const pendingCount = totalRegistered - presentCount - absentCount;
    const attendanceRate = totalRegistered > 0 ? Math.round((presentCount / totalRegistered) * 100) : 0;

    res.status(200).json({
      success: true,
      event,
      stats: {
        totalRegistered,
        presentCount,
        absentCount,
        pendingCount,
        attendanceRate,
      },
      students: studentList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's own attendance history & stats
// @route   GET /api/attendance/my
// @access  Private (Student)
exports.getMyAttendance = async (req, res, next) => {
  try {
    const attendanceRecords = await Attendance.find({ studentId: req.user.id })
      .populate({
        path: 'eventId',
        select: 'title eventDate venue startTime endTime category',
        populate: { path: 'clubId', select: 'name logo' },
      })
      .sort({ markedAt: -1 });

    const totalEvents = attendanceRecords.length;
    const presentEvents = attendanceRecords.filter((a) => a.status === 'present').length;
    const absentEvents = attendanceRecords.filter((a) => a.status === 'absent').length;
    const attendanceRate = totalEvents > 0 ? Math.round((presentEvents / totalEvents) * 100) : 100;

    res.status(200).json({
      success: true,
      stats: {
        totalEvents,
        presentEvents,
        absentEvents,
        attendanceRate,
      },
      records: attendanceRecords,
    });
  } catch (error) {
    next(error);
  }
};

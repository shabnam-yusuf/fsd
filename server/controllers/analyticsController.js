const User = require('../models/User');
const Club = require('../models/Club');
const Membership = require('../models/Membership');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');

// @desc    Get Student Dashboard Analytics
// @route   GET /api/analytics/student
// @access  Private (Student)
exports.getStudentAnalytics = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const now = new Date();

    // 1. Total joined clubs
    const joinedClubsCount = await Membership.countDocuments({
      studentId,
      status: 'approved',
    });

    // 2. Pending membership requests
    const pendingRequestsCount = await Membership.countDocuments({
      studentId,
      status: 'pending',
    });

    // 3. Registered upcoming events
    const registrations = await EventRegistration.find({
      studentId,
      status: 'registered',
    }).populate('eventId');

    const upcomingRegisteredEvents = registrations.filter(
      (r) => r.eventId && new Date(r.eventId.eventDate) >= new Date(now.setHours(0, 0, 0, 0))
    );

    // 4. Total events attended & rate
    const attendedCount = await Attendance.countDocuments({
      studentId,
      status: 'present',
    });

    const totalAttendanceMarked = await Attendance.countDocuments({
      studentId,
    });

    const attendanceRate = totalAttendanceMarked > 0
      ? Math.round((attendedCount / totalAttendanceMarked) * 100)
      : 100;

    // 5. Recommended clubs (clubs student hasn't joined or requested yet)
    const myClubIds = (
      await Membership.find({ studentId }).select('clubId')
    ).map((m) => m.clubId);

    const recommendedClubs = await Club.find({
      _id: { $nin: myClubIds },
      status: 'active',
    })
      .populate('membersCount')
      .limit(4);

    // 6. Upcoming campus events
    const upcomingEvents = await Event.find({
      status: 'approved',
      isPublished: true,
      eventDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    })
      .populate('clubId', 'name category logo')
      .sort({ eventDate: 1 })
      .limit(4);

    // 7. Recent notifications
    const recentNotifications = await Notification.find({ recipientId: studentId })
      .sort({ createdAt: -1 })
      .limit(5);

    // 8. Joined clubs list
    const joinedMemberships = await Membership.find({
      studentId,
      status: 'approved',
    }).populate({
      path: 'clubId',
      select: 'name category logo meetingSchedule tagline',
    });

    res.status(200).json({
      success: true,
      stats: {
        joinedClubsCount,
        pendingRequestsCount,
        upcomingRegisteredCount: upcomingRegisteredEvents.length,
        attendedCount,
        attendanceRate,
      },
      upcomingRegisteredEvents: upcomingRegisteredEvents.slice(0, 4),
      recommendedClubs,
      upcomingEvents,
      recentNotifications,
      joinedMemberships,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get President Dashboard Analytics
// @route   GET /api/analytics/president
// @access  Private (Club President)
exports.getPresidentAnalytics = async (req, res, next) => {
  try {
    const myClubs = await Club.find({ presidentId: req.user.id });

    if (!myClubs || myClubs.length === 0) {
      return res.status(200).json({
        success: true,
        hasClub: false,
        message: 'No club assigned to this president account yet',
      });
    }

    const queryClubId = req.query.clubId;
    let club = myClubs[0];
    if (queryClubId) {
      const match = myClubs.find((c) => c._id.toString() === queryClubId);
      if (match) club = match;
    }

    const myClubIds = myClubs.map((c) => c._id);
    const now = new Date();

    const targetClubFilter = queryClubId
      ? { clubId: club._id }
      : { $or: [{ clubId: { $in: myClubIds } }, { presidentId: req.user.id }] };

    // 1. Total club members
    const totalMembers = await Membership.countDocuments(
      queryClubId ? { clubId: club._id, status: 'approved' } : { clubId: { $in: myClubIds }, status: 'approved' }
    );

    // 2. Pending membership requests
    const pendingMembershipRequests = await Membership.countDocuments({
      ...targetClubFilter,
      status: 'pending',
    });

    // 3. Total events organized
    const totalEvents = await Event.countDocuments(
      queryClubId ? { clubId: club._id } : { clubId: { $in: myClubIds } }
    );

    // 4. Upcoming events
    const upcomingEvents = await Event.find({
      clubId: queryClubId ? club._id : { $in: myClubIds },
      eventDate: { $gte: new Date(now.setHours(0, 0, 0, 0)) },
    })
      .populate('registrationsCount')
      .sort({ eventDate: 1 });

    // 5. Pending event approvals
    const pendingEventApprovals = await Event.countDocuments({
      clubId: queryClubId ? club._id : { $in: myClubIds },
      status: 'pending_approval',
    });

    // 6. Real pending membership requests from MongoDB
    const recentRequests = await Membership.find({
      ...targetClubFilter,
      status: 'pending',
    })
      .populate('studentId', 'name email department studentId avatar')
      .populate('clubId', 'name category logo')
      .sort({ createdAt: -1 });

    // 6b. Pending event registration requests for this club's events
    const clubEvents = await Event.find({
      clubId: queryClubId ? club._id : { $in: myClubIds },
    }).select('_id');
    const clubEventIds = clubEvents.map((e) => e._id);

    const pendingEventRegistrationsCount = await EventRegistration.countDocuments({
      eventId: { $in: clubEventIds },
      status: 'pending',
    });

    const recentEventRequests = await EventRegistration.find({
      eventId: { $in: clubEventIds },
      status: 'pending',
    })
      .populate('eventId', 'title eventDate venue startTime')
      .populate('studentId', 'name email department studentId avatar')
      .sort({ createdAt: -1 });

    const clubId = club._id;

    // 7. Event breakdown by category
    const eventCategoryDistribution = await Event.aggregate([
      { $match: { clubId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    // 8. Overall attendance rate across past events
    const attendanceStats = await Attendance.aggregate([
      { $match: { clubId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    let presentTotal = 0;
    let absentTotal = 0;
    attendanceStats.forEach((s) => {
      if (s._id === 'present') presentTotal = s.count;
      if (s._id === 'absent') absentTotal = s.count;
    });
    const totalMarked = presentTotal + absentTotal;
    const overallAttendanceRate = totalMarked > 0 ? Math.round((presentTotal / totalMarked) * 100) : 0;

    res.status(200).json({
      success: true,
      hasClub: true,
      club,
      allClubs: myClubs,
      stats: {
        totalMembers,
        pendingMembershipRequests,
        pendingEventRegistrationsCount,
        totalEvents,
        upcomingEventsCount: upcomingEvents.length,
        pendingEventApprovals,
        presentTotal,
        absentTotal,
        overallAttendanceRate,
      },
      upcomingEvents: upcomingEvents.slice(0, 5),
      recentRequests,
      recentEventRequests,
      eventCategoryDistribution,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Faculty Advisor Dashboard Analytics
// @route   GET /api/analytics/faculty
// @access  Private (Faculty Advisor)
exports.getFacultyAnalytics = async (req, res, next) => {
  try {
    const advisorId = req.user.id;
    const now = new Date();

    // 1. Assigned clubs
    const assignedClubs = await Club.find({ facultyAdvisorId: advisorId })
      .populate('presidentId', 'name email phone avatar department');

    const clubIds = assignedClubs.map((c) => c._id);

    // 2. Pending event approvals across all assigned clubs
    const pendingEvents = await Event.find({
      clubId: { $in: clubIds },
      status: 'pending_approval',
    })
      .populate('clubId', 'name category logo')
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });

    // 3. Total approved events
    const totalApprovedEvents = await Event.countDocuments({
      clubId: { $in: clubIds },
      status: 'approved',
    });

    // 4. Upcoming events
    const upcomingEvents = await Event.find({
      clubId: { $in: clubIds },
      status: 'approved',
      eventDate: { $gte: new Date(now.setHours(0, 0, 0, 0)) },
    })
      .populate('clubId', 'name category logo')
      .sort({ eventDate: 1 })
      .limit(6);

    // 5. Total active students across assigned clubs
    const totalMembers = await Membership.countDocuments({
      clubId: { $in: clubIds },
      status: 'approved',
    });

    // 6. Club-wise performance metrics
    const clubPerformance = await Promise.all(
      assignedClubs.map(async (c) => {
        const memberCount = await Membership.countDocuments({
          clubId: c._id,
          status: 'approved',
        });
        const eventsCount = await Event.countDocuments({
          clubId: c._id,
          status: 'approved',
        });
        const pendingCount = await Event.countDocuments({
          clubId: c._id,
          status: 'pending_approval',
        });
        return {
          id: c._id,
          name: c.name,
          category: c.category,
          logo: c.logo,
          president: c.presidentId ? c.presidentId.name : 'Unassigned',
          memberCount,
          eventsCount,
          pendingCount,
        };
      })
    );

    // 7. Overall event approval distribution
    const approvalStats = await Event.aggregate([
      { $match: { clubId: { $in: clubIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        assignedClubsCount: assignedClubs.length,
        pendingApprovalsCount: pendingEvents.length,
        totalApprovedEvents,
        totalMembers,
      },
      pendingEvents,
      upcomingEvents,
      clubPerformance,
      approvalStats,
      assignedClubs,
    });
  } catch (error) {
    next(error);
  }
};

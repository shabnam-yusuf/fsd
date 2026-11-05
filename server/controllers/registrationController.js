const EventRegistration = require('../models/EventRegistration');
const Event = require('../models/Event');
const Club = require('../models/Club');
const Notification = require('../models/Notification');

// @desc    Register / Request to join an event (Student)
// @route   POST /api/registrations/register
// @access  Private (Student)
exports.registerForEvent = async (req, res, next) => {
  try {
    const { eventId, notes } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an eventId',
      });
    }

    const event = await Event.findById(eventId).populate('clubId');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Only approved and published events can be joined
    if (event.status !== 'approved' || !event.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Registration is only open for approved public events',
      });
    }

    // Check deadline if set
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline for this event has passed',
      });
    }

    // Check existing registration
    const existingRegistration = await EventRegistration.findOne({
      eventId,
      studentId: req.user.id,
    });

    if (existingRegistration) {
      if (existingRegistration.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending registration request for this event',
        });
      } else if (existingRegistration.status === 'approved' || existingRegistration.status === 'registered') {
        return res.status(400).json({
          success: false,
          message: 'You are already an approved participant for this event',
        });
      } else {
        // Re-apply if previously rejected or cancelled
        existingRegistration.status = 'pending';
        existingRegistration.eventName = event.title;
        existingRegistration.clubId = event.clubId?._id;
        existingRegistration.clubName = event.clubId?.name || '';
        existingRegistration.studentName = req.user.name;
        existingRegistration.studentEmail = req.user.email;
        existingRegistration.studentDepartment = req.user.department || '';
        existingRegistration.registeredAt = new Date();
        existingRegistration.rejectionReason = '';
        existingRegistration.reviewedBy = null;
        existingRegistration.reviewedAt = null;
        if (notes) existingRegistration.notes = notes;
        await existingRegistration.save();

        // Notify President
        if (event.clubId && event.clubId.presidentId) {
          await Notification.create({
            recipientId: event.clubId.presidentId,
            senderId: req.user.id,
            title: 'Event Participation Request Re-submitted',
            message: `${req.user.name} re-submitted a participation request for "${event.title}".`,
            type: 'event_registration_request',
            link: `/dashboard/president/events`,
          });
        }

        return res.status(200).json({
          success: true,
          registration: existingRegistration,
          message: 'Participation request re-submitted! Awaiting Club President approval.',
        });
      }
    }

    // Check capacity for approved attendees
    const currentApprovedCount = await EventRegistration.countDocuments({
      eventId,
      status: { $in: ['approved', 'registered'] },
    });

    if (event.capacity && currentApprovedCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event has reached its maximum approved capacity',
      });
    }

    // Save with status: 'pending' (requires President approval)
    const registration = await EventRegistration.create({
      eventId,
      eventName: event.title,
      clubId: event.clubId?._id,
      clubName: event.clubId?.name || '',
      studentId: req.user.id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      studentDepartment: req.user.department || '',
      notes: notes || '',
      status: 'pending',
      attendanceStatus: 'pending',
    });

    // Notify the responsible President ONLY
    if (event.clubId && event.clubId.presidentId) {
      await Notification.create({
        recipientId: event.clubId.presidentId,
        senderId: req.user.id,
        title: 'New Event Participation Request',
        message: `${req.user.name} requested to participate in "${event.title}".`,
        type: 'event_registration_request',
        link: `/dashboard/president/events`,
      });
    }

    // Notify Student
    await Notification.create({
      recipientId: req.user.id,
      title: 'Event Participation Request Submitted',
      message: `Your request to participate in "${event.title}" has been submitted for Club President review.`,
      type: 'event_registration',
      link: `/dashboard/student/events`,
    });

    res.status(201).json({
      success: true,
      registration,
      message: 'Participation request submitted! Awaiting Club President approval.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a student event registration request (Club President)
// @route   PUT /api/registrations/:id/status
// @access  Private (Club President)
exports.updateRegistrationStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected',
      });
    }

    const registration = await EventRegistration.findById(req.params.id)
      .populate({
        path: 'eventId',
        populate: { path: 'clubId' },
      })
      .populate('studentId', 'name email');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Event registration request not found',
      });
    }

    const event = registration.eventId;
    if (!event || !event.clubId) {
      return res.status(404).json({
        success: false,
        message: 'Associated event or club not found',
      });
    }

    // Verify authorization: only the President of the club responsible for this event
    const isEventPresident = event.clubId.presidentId.toString() === req.user.id;
    const isAdvisor = req.user.role === 'faculty_advisor' && event.clubId.facultyAdvisorId?.toString() === req.user.id;

    if (!isEventPresident && !isAdvisor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: Only the President responsible for this event can approve or reject participation requests.',
      });
    }

    registration.status = status;
    registration.reviewedBy = req.user.id;
    registration.reviewedAt = new Date();
    if (status === 'rejected' && rejectionReason) {
      registration.rejectionReason = rejectionReason;
    } else if (status === 'approved') {
      registration.rejectionReason = '';
    }

    await registration.save();

    // Notify Student
    const isApproved = status === 'approved';
    await Notification.create({
      recipientId: registration.studentId._id || registration.studentId,
      senderId: req.user.id,
      title: isApproved ? 'Event Participation Approved!' : 'Event Request Update',
      message: isApproved
        ? `Your participation in "${event.title}" has been approved by the Club President.`
        : `Your request to join "${event.title}" was not approved.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
      type: isApproved ? 'event_registration_approved' : 'event_registration_rejected',
      link: `/dashboard/student/events`,
    });

    res.status(200).json({
      success: true,
      registration,
      message: `Event registration request successfully ${status}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all event registration requests for President's club events
// @route   GET /api/registrations/president/requests
// @access  Private (Club President)
exports.getPresidentEventRegistrations = async (req, res, next) => {
  try {
    const myClubs = await Club.find({ presidentId: req.user.id }).select('_id');
    const clubIds = myClubs.map((c) => c._id);

    const myEvents = await Event.find({ clubId: { $in: clubIds } }).select('_id');
    const eventIds = myEvents.map((e) => e._id);

    const { status } = req.query;
    const query = { eventId: { $in: eventIds } };
    if (status) {
      query.status = status;
    }

    const requests = await EventRegistration.find(query)
      .populate('eventId', 'title eventDate startTime endTime venue category status')
      .populate('studentId', 'name email department studentId phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unregister / cancel registration from an event (Student)
// @route   POST /api/registrations/unregister
// @access  Private (Student)
exports.unregisterFromEvent = async (req, res, next) => {
  try {
    const { eventId } = req.body;

    const registration = await EventRegistration.findOne({
      eventId,
      studentId: req.user.id,
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found',
      });
    }

    registration.status = 'cancelled';
    await registration.save();

    res.status(200).json({
      success: true,
      message: 'Successfully withdrawn event registration request',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's registered events (all statuses)
// @route   GET /api/registrations/my
// @access  Private (Student)
exports.getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await EventRegistration.find({
      studentId: req.user.id,
      status: { $in: ['pending', 'approved', 'registered', 'rejected'] },
    })
      .populate({
        path: 'eventId',
        populate: {
          path: 'clubId',
          select: 'name category logo',
        },
      })
      .sort({ registeredAt: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get registrations for a specific event (President & Faculty)
// @route   GET /api/registrations/event/:eventId
// @access  Private (President, Faculty Advisor)
exports.getEventRegistrations = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { eventId: req.params.eventId };
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['pending', 'approved', 'registered'] };
    }

    const registrations = await EventRegistration.find(query)
      .populate('studentId', 'name email department studentId phone avatar')
      .sort({ registeredAt: 1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    next(error);
  }
};

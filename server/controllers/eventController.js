const Event = require('../models/Event');
const Club = require('../models/Club');
const Notification = require('../models/Notification');
const EventRegistration = require('../models/EventRegistration');

// @desc    Get all approved and published events (for public & students)
// @route   GET /api/events
// @access  Public
exports.getAllEvents = async (req, res, next) => {
  try {
    const { category, search, timeFilter, clubId } = req.query;

    let query = {
      status: 'approved',
      isPublished: true,
    };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (clubId) {
      query.clubId = clubId;
    }

    const now = new Date();
    if (timeFilter === 'upcoming') {
      query.eventDate = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
    } else if (timeFilter === 'past') {
      query.eventDate = { $lt: new Date(now.setHours(0, 0, 0, 0)) };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(query)
      .populate('clubId', 'name category logo bannerImage')
      .populate('submittedBy', 'name email avatar')
      .populate('registrationsCount')
      .sort({ eventDate: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('clubId', 'name category logo bannerImage meetingSchedule presidentId facultyAdvisorId')
      .populate('submittedBy', 'name email avatar department')
      .populate('reviewedBy', 'name email avatar department')
      .populate('registrationsCount');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // If user is authenticated, check their registration status
    let userRegistration = null;
    if (req.user) {
      userRegistration = await EventRegistration.findOne({
        eventId: event._id,
        studentId: req.user.id,
      });
    }

    const registrationsCount = await EventRegistration.countDocuments({
      eventId: event._id,
      status: 'registered',
    });

    res.status(200).json({
      success: true,
      event,
      userRegistration,
      registrationsCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event (Club President)
// @route   POST /api/events
// @access  Private (Club President)
exports.createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      clubId,
      category,
      eventDate,
      startTime,
      endTime,
      venue,
      locationType,
      meetingLink,
      bannerImage,
      capacity,
      registrationDeadline,
      tags,
    } = req.body;

    if (!title || !description || !eventDate || !startTime || !endTime || !venue) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required event details (title, description, date, time, venue)',
      });
    }

    // Verify club exists and user is president of it
    const club = await Club.findOne({
      _id: clubId,
      presidentId: req.user.id,
    });

    if (!club) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to create events for your assigned club',
      });
    }

    const event = await Event.create({
      title,
      description,
      clubId: club._id,
      category: category || 'Workshop',
      eventDate: new Date(eventDate),
      startTime,
      endTime,
      venue,
      locationType: locationType || 'on_campus',
      meetingLink: meetingLink || '',
      bannerImage: bannerImage || '',
      capacity: capacity ? Number(capacity) : 100,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : new Date(eventDate),
      tags: tags || [],
      status: 'pending_approval',
      isPublished: false,
      submittedBy: req.user.id,
    });

    // Notify Faculty Advisor of pending approval request
    if (club.facultyAdvisorId) {
      await Notification.create({
        recipientId: club.facultyAdvisorId,
        senderId: req.user.id,
        title: 'New Event Approval Request',
        message: `${club.name} submitted a new event "${title}" scheduled for ${new Date(eventDate).toLocaleDateString()} for your review and approval.`,
        type: 'event_approval_request',
        link: `/dashboard/faculty/approvals`,
      });
    }

    res.status(201).json({
      success: true,
      event,
      message: 'Event created and submitted to Faculty Advisor for review.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event (Club President)
// @route   PUT /api/events/:id
// @access  Private (Club President)
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id).populate('clubId');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Must be the president of the club that owns this event
    if (event.clubId.presidentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit events for this club',
      });
    }

    // If event was previously rejected and president updates it, resubmit for approval
    const updateData = { ...req.body };
    if (event.status === 'rejected') {
      updateData.status = 'pending_approval';
      updateData.isPublished = false;
      updateData.rejectionReason = '';

      // Notify Faculty Advisor of re-submission
      if (event.clubId.facultyAdvisorId) {
        await Notification.create({
          recipientId: event.clubId.facultyAdvisorId,
          senderId: req.user.id,
          title: 'Resubmitted Event For Approval',
          message: `${event.clubId.name} revised and re-submitted "${event.title}" for approval.`,
          type: 'event_approval_request',
          link: `/dashboard/faculty/approvals`,
        });
      }
    }

    event = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      event,
      message: 'Event updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event (Club President)
// @route   DELETE /api/events/:id
// @access  Private (Club President)
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('clubId');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (event.clubId.presidentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event',
      });
    }

    // Clean up registrations
    await EventRegistration.deleteMany({ eventId: event._id });
    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events for President's club (all statuses)
// @route   GET /api/events/president/my-events
// @access  Private (Club President)
exports.getPresidentEvents = async (req, res, next) => {
  try {
    const club = await Club.findOne({ presidentId: req.user.id });
    if (!club) {
      return res.status(200).json({ success: true, events: [] });
    }

    const events = await Event.find({ clubId: club._id })
      .populate('reviewedBy', 'name email')
      .populate('registrationsCount')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending events awaiting Faculty Advisor review
// @route   GET /api/events/faculty/pending
// @access  Private (Faculty Advisor)
exports.getFacultyPendingEvents = async (req, res, next) => {
  try {
    const assignedClubs = await Club.find({ facultyAdvisorId: req.user.id }).select('_id');
    const clubIds = assignedClubs.map((c) => c._id);

    const pendingEvents = await Event.find({
      clubId: { $in: clubIds },
      status: 'pending_approval',
    })
      .populate('clubId', 'name category logo')
      .populate('submittedBy', 'name email avatar phone department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingEvents.length,
      events: pendingEvents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Faculty Advisor reviews (approves or rejects) an event
// @route   PUT /api/events/:id/review
// @access  Private (Faculty Advisor)
exports.reviewEvent = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected',
      });
    }

    if (status === 'rejected' && (!rejectionReason || !rejectionReason.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is mandatory when declining an event proposal',
      });
    }

    const event = await Event.findById(req.params.id).populate('clubId');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Verify advisor is assigned to this club
    if (event.clubId.facultyAdvisorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned as the faculty advisor for this club',
      });
    }

    const isApproved = status === 'approved';

    event.status = status;
    event.isPublished = isApproved;
    event.reviewedBy = req.user.id;
    event.approvalDate = new Date();
    event.rejectionReason = isApproved ? '' : rejectionReason;

    await event.save();

    // Send notification to Club President
    await Notification.create({
      recipientId: event.clubId.presidentId,
      senderId: req.user.id,
      title: isApproved ? 'Event Proposal Approved! 🎉' : 'Event Proposal Rejected',
      message: isApproved
        ? `Faculty Advisor approved your event "${event.title}". It is now published and open for student registrations.`
        : `Faculty Advisor rejected "${event.title}". Reason: ${rejectionReason}`,
      type: isApproved ? 'event_approved' : 'event_rejected',
      link: `/dashboard/president/events`,
    });

    res.status(200).json({
      success: true,
      event,
      message: `Event has been successfully ${status}`,
    });
  } catch (error) {
    next(error);
  }
};

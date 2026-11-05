const Announcement = require('../models/Announcement');
const Club = require('../models/Club');
const Membership = require('../models/Membership');
const Notification = require('../models/Notification');

// @desc    Get announcements for a club
// @route   GET /api/announcements/club/:clubId
// @access  Public
exports.getClubAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find({ clubId: req.params.clubId })
      .populate('authorId', 'name avatar role')
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create announcement (Club President)
// @route   POST /api/announcements
// @access  Private (Club President)
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { clubId, title, content, priority, isPinned } = req.body;

    if (!clubId || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide clubId, title, and content',
      });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found',
      });
    }

    if (club.presidentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the club president can post announcements for this club',
      });
    }

    const announcement = await Announcement.create({
      clubId,
      authorId: req.user.id,
      title,
      content,
      priority: priority || 'normal',
      isPinned: isPinned || false,
    });

    // Notify all approved members of this club
    const memberships = await Membership.find({
      clubId,
      status: 'approved',
    });

    const notifications = memberships.map((m) => ({
      recipientId: m.studentId,
      senderId: req.user.id,
      title: `Notice from ${club.name}`,
      message: `${title}: ${content.substring(0, 80)}...`,
      type: 'announcement',
      link: `/clubs/${club._id}`,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      announcement,
      message: 'Announcement published successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement (Club President)
// @route   DELETE /api/announcements/:id
// @access  Private (Club President)
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    if (announcement.authorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this announcement',
      });
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Announcement removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get announcements feed for student's joined clubs
// @route   GET /api/announcements/feed
// @access  Private (Student)
exports.getStudentFeedAnnouncements = async (req, res, next) => {
  try {
    const memberships = await Membership.find({
      studentId: req.user.id,
      status: 'approved',
    });

    const clubIds = memberships.map((m) => m.clubId);

    const announcements = await Announcement.find({
      clubId: { $in: clubIds },
    })
      .populate('clubId', 'name logo category')
      .populate('authorId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

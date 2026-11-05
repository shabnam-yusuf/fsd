const Membership = require('../models/Membership');
const Club = require('../models/Club');
const Notification = require('../models/Notification');

// @desc    Request to join a club (Student)
// @route   POST /api/memberships/request
// @access  Private (Student)
exports.requestMembership = async (req, res, next) => {
  try {
    const { clubId, joinReason } = req.body;

    if (!clubId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid clubId',
      });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found',
      });
    }

    // Check if membership record already exists
    const existingMembership = await Membership.findOne({
      clubId,
      studentId: req.user.id,
    });

    if (existingMembership) {
      if (existingMembership.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending membership request for this club',
        });
      }
      if (existingMembership.status === 'approved') {
        return res.status(400).json({
          success: false,
          message: 'You are already an approved member of this club',
        });
      }
      // If previously rejected, allow re-applying by updating
      existingMembership.status = 'pending';
      existingMembership.joinReason = joinReason || 'Re-applied for club membership';
      existingMembership.rejectionReason = '';
      existingMembership.studentName = req.user.name;
      existingMembership.studentEmail = req.user.email;
      existingMembership.studentDepartment = req.user.department || '';
      existingMembership.studentCollegeId = req.user.studentId || '';
      existingMembership.clubName = club.name;
      existingMembership.presidentId = club.presidentId;
      existingMembership.reviewedBy = null;
      existingMembership.reviewedAt = null;
      await existingMembership.save();

      // Notify Club President
      await Notification.create({
        recipientId: club.presidentId,
        senderId: req.user.id,
        title: 'New Membership Request',
        message: `${req.user.name} submitted a membership request for ${club.name}.`,
        type: 'membership_request',
        link: `/dashboard/president/members`,
      });

      return res.status(200).json({
        success: true,
        membership: existingMembership,
        message: 'Membership request re-submitted successfully!',
      });
    }

    const membership = await Membership.create({
      clubId,
      clubName: club.name,
      presidentId: club.presidentId,
      studentId: req.user.id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      studentDepartment: req.user.department || '',
      studentCollegeId: req.user.studentId || '',
      joinReason: joinReason || 'Passionate about participating in club activities.',
      status: 'pending',
    });

    // Notify Club President
    await Notification.create({
      recipientId: club.presidentId,
      senderId: req.user.id,
      title: 'New Membership Request',
      message: `${req.user.name} requested to join ${club.name}.`,
      type: 'membership_request',
      link: `/dashboard/president/members`,
    });

    res.status(201).json({
      success: true,
      membership,
      message: 'Membership request submitted successfully. Awaiting president approval.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in student's memberships (all statuses)
// @route   GET /api/memberships/my
// @access  Private (Student)
exports.getMyMemberships = async (req, res, next) => {
  try {
    const memberships = await Membership.find({ studentId: req.user.id })
      .populate({
        path: 'clubId',
        select: 'name category tagline logo bannerImage meetingSchedule presidentId facultyAdvisorId',
        populate: [
          { path: 'presidentId', select: 'name email avatar' },
          { path: 'facultyAdvisorId', select: 'name email avatar' },
        ],
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: memberships.length,
      memberships,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel/withdraw membership request (Student)
// @route   DELETE /api/memberships/cancel/:clubId
// @access  Private (Student)
exports.cancelMembershipRequest = async (req, res, next) => {
  try {
    const membership = await Membership.findOne({
      clubId: req.params.clubId,
      studentId: req.user.id,
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership request not found',
      });
    }

    await membership.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Membership request cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all approved members of a club
// @route   GET /api/memberships/club/:clubId/members
// @access  Public / Private
exports.getClubMembers = async (req, res, next) => {
  try {
    const members = await Membership.find({
      clubId: req.params.clubId,
      status: 'approved',
    })
      .populate('studentId', 'name email department studentId phone avatar bio createdAt')
      .sort({ role: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending membership requests for a club (President / Advisor)
// @route   GET /api/memberships/club/:clubId/requests
// @access  Private (Club President, Faculty Advisor)
exports.getClubMembershipRequests = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found',
      });
    }

    if (req.user.role === 'club_president' && club.presidentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: You can only view requests for your assigned club',
      });
    }

    const requests = await Membership.find({
      clubId: req.params.clubId,
      status: 'pending',
    })
      .populate('studentId', 'name email department studentId phone avatar bio createdAt')
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

// @desc    Approve or reject a membership request (President / Advisor)
// @route   PUT /api/memberships/:id/status
// @access  Private (Club President, Faculty Advisor)
exports.updateMembershipStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason, role } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected.',
      });
    }

    const membership = await Membership.findById(req.params.id).populate('clubId');

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership request not found',
      });
    }

    if (req.user.role === 'club_president') {
      const isOwner = membership.clubId && membership.clubId.presidentId?.toString() === req.user.id;
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized: You can only update requests for your assigned club',
        });
      }
    }

    membership.status = status;
    membership.reviewedBy = req.user.id;
    membership.reviewedAt = Date.now();

    if (role && status === 'approved') {
      membership.role = role;
    }

    if (status === 'rejected' && rejectionReason) {
      membership.rejectionReason = rejectionReason;
    }

    await membership.save();

    // Notify Student
    const isApproved = status === 'approved';
    await Notification.create({
      recipientId: membership.studentId,
      senderId: req.user.id,
      title: isApproved ? 'Membership Approved!' : 'Membership Request Update',
      message: isApproved
        ? `Congratulations! Your membership for "${membership.clubId.name}" has been approved.`
        : `Your membership request for "${membership.clubId.name}" was not approved.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
      type: isApproved ? 'membership_approved' : 'membership_rejected',
      link: isApproved ? `/dashboard/student/my-clubs` : `/clubs`,
    });

    res.status(200).json({
      success: true,
      membership,
      message: `Membership request successfully ${status}`,
    });
  } catch (error) {
    next(error);
  }
};

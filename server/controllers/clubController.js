const Club = require('../models/Club');
const Membership = require('../models/Membership');
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');
const User = require('../models/User');

// @desc    Get all clubs with search, filter, and membership status
// @route   GET /api/clubs
// @access  Public
exports.getAllClubs = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;

    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status) {
      query.status = status;
    } else {
      query.status = 'active';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const clubs = await Club.find(query)
      .populate('presidentId', 'name email avatar department')
      .populate('facultyAdvisorId', 'name email avatar department')
      .populate('membersCount')
      .sort({ createdAt: -1 });

    // Deduplicate by normalized name to guarantee each club appears only once
    const seenNames = new Set();
    const uniqueClubs = [];
    for (const club of clubs) {
      const normalized = club.name.trim().toLowerCase();
      if (!seenNames.has(normalized)) {
        seenNames.add(normalized);
        uniqueClubs.push(club);
      }
    }

    res.status(200).json({
      success: true,
      count: uniqueClubs.length,
      clubs: uniqueClubs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single club by ID or slug
// @route   GET /api/clubs/:id
// @access  Public
exports.getClubById = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('presidentId', 'name email avatar department phone')
      .populate('facultyAdvisorId', 'name email avatar department phone')
      .populate('membersCount');

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found',
      });
    }

    // Get active events for this club
    const events = await Event.find({
      clubId: club._id,
      status: 'approved',
    })
      .sort({ eventDate: 1 })
      .limit(5);

    // Get announcements
    const announcements = await Announcement.find({ clubId: club._id })
      .populate('authorId', 'name avatar role')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(5);

    // Get approved members count
    const memberCount = await Membership.countDocuments({
      clubId: club._id,
      status: 'approved',
    });

    res.status(200).json({
      success: true,
      club,
      memberCount,
      events,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new club (Faculty Advisor, Club President)
// @route   POST /api/clubs
// @access  Private (Faculty Advisor, Club President)
exports.createClub = async (req, res, next) => {
  try {
    const {
      name,
      tagline,
      description,
      category,
      meetingSchedule,
      contactEmail,
      socialLinks,
      tags,
      bannerImage,
      logo,
      foundedYear,
      presidentId,
      facultyAdvisorId,
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both club name and description',
      });
    }

    // Verify no duplicate club with the same name exists
    const existingClub = await Club.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });
    if (existingClub) {
      return res.status(400).json({
        success: false,
        message: `A club with the name "${name}" already exists. Each club must be unique.`,
      });
    }

    // Determine president and faculty advisor assignments
    let assignedPresidentId = presidentId;
    let assignedFacultyAdvisorId = facultyAdvisorId;

    if (req.user.role === 'faculty_advisor') {
      assignedFacultyAdvisorId = assignedFacultyAdvisorId || req.user.id;
      if (!assignedPresidentId) {
        // Fallback to any president or self
        const defaultPresident = await User.findOne({ role: 'club_president' });
        assignedPresidentId = defaultPresident ? defaultPresident._id : req.user.id;
      }
    } else if (req.user.role === 'club_president') {
      assignedPresidentId = assignedPresidentId || req.user.id;
      if (!assignedFacultyAdvisorId) {
        const defaultAdvisor = await User.findOne({ role: 'faculty_advisor' });
        assignedFacultyAdvisorId = defaultAdvisor ? defaultAdvisor._id : req.user.id;
      }
    } else {
      assignedPresidentId = assignedPresidentId || req.user.id;
      assignedFacultyAdvisorId = assignedFacultyAdvisorId || req.user.id;
    }

    const club = await Club.create({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: tagline || '',
      description,
      category: category || 'Technical',
      meetingSchedule: meetingSchedule || 'Every Wednesday 4:30 PM',
      contactEmail: contactEmail || req.user.email,
      socialLinks: socialLinks || {},
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t) => t.trim()) : []),
      bannerImage: bannerImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      logo: logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      foundedYear: foundedYear || new Date().getFullYear(),
      presidentId: assignedPresidentId,
      facultyAdvisorId: assignedFacultyAdvisorId,
    });

    const populatedClub = await Club.findById(club._id)
      .populate('presidentId', 'name email avatar department')
      .populate('facultyAdvisorId', 'name email avatar department');

    res.status(201).json({
      success: true,
      club: populatedClub,
      message: 'Club created successfully in MongoDB',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update club information (President / Faculty)
// @route   PUT /api/clubs/:id
// @access  Private (Club President, Faculty Advisor)
exports.updateClub = async (req, res, next) => {
  try {
    let club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found',
      });
    }

    // Check authorization: must be club president or assigned faculty advisor
    const isPresident = club.presidentId.toString() === req.user.id;
    const isAdvisor = club.facultyAdvisorId.toString() === req.user.id;

    if (!isPresident && !isAdvisor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this club',
      });
    }

    const {
      name,
      tagline,
      description,
      category,
      meetingSchedule,
      contactEmail,
      socialLinks,
      tags,
      bannerImage,
      logo,
    } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (tagline !== undefined) fieldsToUpdate.tagline = tagline;
    if (description) fieldsToUpdate.description = description;
    if (category) fieldsToUpdate.category = category;
    if (meetingSchedule !== undefined) fieldsToUpdate.meetingSchedule = meetingSchedule;
    if (contactEmail !== undefined) fieldsToUpdate.contactEmail = contactEmail;
    if (socialLinks) fieldsToUpdate.socialLinks = socialLinks;
    if (tags) fieldsToUpdate.tags = tags;
    if (bannerImage !== undefined) fieldsToUpdate.bannerImage = bannerImage;
    if (logo !== undefined) fieldsToUpdate.logo = logo;

    club = await Club.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    })
      .populate('presidentId', 'name email avatar')
      .populate('facultyAdvisorId', 'name email avatar');

    res.status(200).json({
      success: true,
      club,
      message: 'Club details updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get club assigned to current logged-in President
// @route   GET /api/clubs/president/my-club
// @access  Private (Club President)
exports.getPresidentClub = async (req, res, next) => {
  try {
    const { clubId } = req.query;
    const myClubs = await Club.find({ presidentId: req.user.id })
      .populate('presidentId', 'name email avatar department phone')
      .populate('facultyAdvisorId', 'name email avatar department phone')
      .populate('membersCount');

    if (!myClubs || myClubs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No club assigned to this president account yet',
      });
    }

    let club = myClubs[0];
    if (clubId) {
      const match = myClubs.find((c) => c._id.toString() === clubId);
      if (match) club = match;
    }

    const memberCount = await Membership.countDocuments({
      clubId: club._id,
      status: 'approved',
    });

    const pendingRequestsCount = await Membership.countDocuments({
      clubId: club._id,
      status: 'pending',
    });

    res.status(200).json({
      success: true,
      club,
      allClubs: myClubs,
      memberCount,
      pendingRequestsCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get clubs assigned to current logged-in Faculty Advisor
// @route   GET /api/clubs/faculty/my-clubs
// @access  Private (Faculty Advisor)
exports.getFacultyClubs = async (req, res, next) => {
  try {
    const clubs = await Club.find({ facultyAdvisorId: req.user.id })
      .populate('presidentId', 'name email avatar department phone')
      .populate('facultyAdvisorId', 'name email avatar department phone')
      .populate('membersCount');

    // Attach statistics per club
    const clubsWithStats = await Promise.all(
      clubs.map(async (c) => {
        const membersCount = await Membership.countDocuments({
          clubId: c._id,
          status: 'approved',
        });
        const pendingEventsCount = await Event.countDocuments({
          clubId: c._id,
          status: 'pending_approval',
        });
        const approvedEventsCount = await Event.countDocuments({
          clubId: c._id,
          status: 'approved',
        });

        return {
          ...c.toObject(),
          membersCount,
          pendingEventsCount,
          approvedEventsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: clubsWithStats.length,
      clubs: clubsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

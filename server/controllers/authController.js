const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'campus_clubs_super_secret_jwt_key_2026_modern_secure',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, department, studentId, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    const user = await User.create({
      name,
      username: req.body.username || email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
      email: email.toLowerCase(),
      password,
      role: 'student',
      department: department || 'Computer Science & Engineering',
      studentId: studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      phone: phone || '',
      avatar: '',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
        avatar: user.avatar,
        bio: user.bio,
      },
      message: 'Registration successful! Welcome to Campus Clubs & Forums.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, username, password, role } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email/username and password',
      });
    }

    // Look up user by email or username
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    } else if (username) {
      user = await User.findOne({
        $or: [
          { username: username.toLowerCase().trim() },
          { email: username.toLowerCase().trim() },
          { name: { $regex: new RegExp(`^${username.trim()}$`, 'i') } },
        ],
      }).select('+password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found in MongoDB.',
      });
    }

    // If both username and email were provided, verify they match the same account
    if (username && email) {
      const cleanUsername = username.toLowerCase().trim();
      const matchesUsername =
        user.username === cleanUsername ||
        user.name.toLowerCase() === cleanUsername ||
        user.email.split('@')[0].toLowerCase() === cleanUsername;

      if (!matchesUsername) {
        return res.status(401).json({
          success: false,
          message: 'Username does not match the provided email address.',
        });
      }
    }

    // Verify password against MongoDB bcrypt hash
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    // Role-based validation
    if (role && user.role !== role) {
      const roleLabels = {
        student: 'Student',
        club_president: 'Club President',
        faculty_advisor: 'Faculty Advisor',
      };
      return res.status(401).json({
        success: false,
        message: `Role mismatch: This account is registered as ${roleLabels[user.role] || user.role}. Please select the matching role tab.`,
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username || user.email.split('@')[0],
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
        avatar: user.avatar || '',
        bio: user.bio,
      },
      message: 'Logged in successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, department, studentId, phone, bio, avatar } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (department) fieldsToUpdate.department = department;
    if (studentId !== undefined) fieldsToUpdate.studentId = studentId;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (bio !== undefined) fieldsToUpdate.bio = bio;
    if (avatar !== undefined) fieldsToUpdate.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password handler (academic demo password recovery)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered college email',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered student, president, or faculty account found with this email',
      });
    }

    res.status(200).json({
      success: true,
      role: user.role,
      name: user.name,
      message: `Password reset instructions initiated for ${user.name} (${user.email}). For academic project evaluation, the default password is: "${user.role === 'faculty_advisor' ? 'faculty123' : user.role === 'club_president' ? 'president123' : 'student123'}".`,
    });
  } catch (error) {
    next(error);
  }
};


const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    presidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['member', 'core_team', 'lead'],
      default: 'member',
    },
    clubName: {
      type: String,
      default: '',
    },
    studentName: {
      type: String,
      default: '',
    },
    studentEmail: {
      type: String,
      default: '',
    },
    studentDepartment: {
      type: String,
      default: '',
    },
    studentCollegeId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    joinReason: {
      type: String,
      trim: true,
      default: 'Passionate about learning, collaborating, and participating in club events.',
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate membership request for the same student and club
membershipSchema.index({ clubId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Membership', membershipSchema);

const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a club name'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide club description'],
    },
    category: {
      type: String,
      required: [true, 'Please specify a club category'],
      enum: ['Technical', 'Cultural', 'Sports', 'Academic', 'Social & Welfare', 'Entrepreneurship', 'Literary'],
      default: 'Technical',
    },
    logo: {
      type: String,
      default: '',
    },
    bannerImage: {
      type: String,
      default: '',
    },
    presidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    facultyAdvisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    foundedYear: {
      type: Number,
      default: 2022,
    },
    meetingSchedule: {
      type: String,
      default: 'Every Wednesday 4:30 PM - Room B-204',
    },
    contactEmail: {
      type: String,
      trim: true,
      default: '',
    },
    socialLinks: {
      website: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for member count
clubSchema.virtual('membersCount', {
  ref: 'Membership',
  localField: '_id',
  foreignField: 'clubId',
  count: true,
  match: { status: 'approved' },
});

module.exports = mongoose.model('Club', clubSchema);

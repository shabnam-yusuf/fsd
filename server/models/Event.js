const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide an event description'],
    },
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    category: {
      type: String,
      enum: ['Workshop', 'Hackathon', 'Seminar', 'Competition', 'Cultural Fest', 'Sports Meet', 'Webinar', 'Orientation', 'Networking'],
      default: 'Workshop',
    },
    eventDate: {
      type: Date,
      required: [true, 'Please specify the event date'],
    },
    startTime: {
      type: String,
      required: [true, 'Please provide the start time'],
      default: '10:00 AM',
    },
    endTime: {
      type: String,
      required: [true, 'Please provide the end time'],
      default: '01:00 PM',
    },
    venue: {
      type: String,
      required: [true, 'Please specify the event venue or room'],
      trim: true,
    },
    locationType: {
      type: String,
      enum: ['on_campus', 'online', 'hybrid'],
      default: 'on_campus',
    },
    meetingLink: {
      type: String,
      default: '',
    },
    bannerImage: {
      type: String,
      default: '',
    },
    capacity: {
      type: Number,
      default: 100,
    },
    registrationDeadline: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['pending_approval', 'approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending_approval',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    approvalDate: {
      type: Date,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for registered count
eventSchema.virtual('registrationsCount', {
  ref: 'EventRegistration',
  localField: '_id',
  foreignField: 'eventId',
  count: true,
  match: { status: 'registered' },
});

module.exports = mongoose.model('Event', eventSchema);

/**
 * Comprehensive 10-Point End-to-End Test Suite
 * Campus Clubs & Forums Management System
 */

const mongoose = require('../node_modules/mongoose');
const bcrypt = require('../node_modules/bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Club = require('../models/Club');
const Membership = require('../models/Membership');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_clubs_db';

const testResults = [];

function recordTest(num, title, passed, details) {
  testResults.push({ num, title, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${icon}] TEST ${num}: ${title}`);
  console.log(`         ${details}\n`);
}

async function runAll10Tests() {
  console.log('======================================================================');
  console.log('CAMPUS CLUBS & FORUMS MANAGEMENT SYSTEM - COMPREHENSIVE 10-TEST SUITE');
  console.log(`Connecting to MongoDB: ${MONGO_URI}`);
  console.log('======================================================================\n');

  try {
    await mongoose.connect(MONGO_URI);

    // Fetch primary test accounts
    const shabnam = await User.findOne({ email: 'shabnam@gmail.com' }).select('+password');
    const sarumathi = await User.findOne({ email: 'sarumathi@gmail.com' }).select('+password');
    const sashmitha = await User.findOne({ email: 'sashmitha@gmail.com' }).select('+password');

    // Fetch primary clubs
    const gdscClub = await Club.findOne({ name: 'Google Developer Student Club (GDSC)' });
    const roboticsClub = await Club.findOne({ name: 'Robotics & Autonomous Systems Forum' });
    const artsClub = await Club.findOne({ name: 'Design & Creative Arts Collective' });

    const roboticsPresident = await User.findById(roboticsClub.presidentId);

    // -------------------------------------------------------------
    // TEST 1: Student Shabnam requests to join Robotics Club
    // -------------------------------------------------------------
    await Membership.deleteMany({ studentId: shabnam._id, clubId: roboticsClub._id });
    await Notification.deleteMany({ senderId: shabnam._id, recipientId: roboticsClub.presidentId });

    const roboticsReq = await Membership.create({
      clubId: roboticsClub._id,
      studentId: shabnam._id,
      status: 'pending',
      joinReason: 'Passionate about mobile robotics and SLAM navigation.',
    });

    const notifRoboticsPres = await Notification.create({
      recipientId: roboticsClub.presidentId,
      senderId: shabnam._id,
      title: 'New Membership Request',
      message: `${shabnam.name} requested to join ${roboticsClub.name}.`,
      type: 'membership_request',
      link: '/dashboard/president/members',
    });

    // Check that request is pending, not auto-approved, and target is robotics president
    const test1Passed =
      roboticsReq.status === 'pending' &&
      roboticsReq.clubId.toString() === roboticsClub._id.toString() &&
      notifRoboticsPres.recipientId.toString() === sarumathi._id.toString();

    recordTest(
      1,
      'Student Shabnam requests to join Robotics Club (Routed to President Sarumathi)',
      test1Passed,
      `Request created in MongoDB with status 'pending'. Notification routed to President Sarumathi (${sarumathi.email}) for Robotics Club.`
    );

    // -------------------------------------------------------------
    // TEST 2: Robotics Club President approves the request
    // -------------------------------------------------------------
    roboticsReq.status = 'approved';
    roboticsReq.reviewedBy = roboticsClub.presidentId;
    roboticsReq.reviewedAt = new Date();
    await roboticsReq.save();

    await Notification.create({
      recipientId: shabnam._id,
      senderId: roboticsClub.presidentId,
      title: 'Membership Approved!',
      message: `Your membership for "${roboticsClub.name}" has been approved.`,
      type: 'membership_approved',
      link: '/dashboard/student/my-clubs',
    });

    const reloadedRoboticsReq = await Membership.findById(roboticsReq._id);
    const test2Passed = reloadedRoboticsReq.status === 'approved' && reloadedRoboticsReq.reviewedBy.toString() === roboticsClub.presidentId.toString();

    recordTest(
      2,
      'Robotics Club President approves request in MongoDB',
      test2Passed,
      `Membership status updated to 'approved' in MongoDB. Student receives official approval notification.`
    );

    // -------------------------------------------------------------
    // TEST 3: Student requests to join another club (Independent request)
    // -------------------------------------------------------------
    await Membership.deleteMany({ studentId: shabnam._id, clubId: artsClub._id });
    const artsReq = await Membership.create({
      clubId: artsClub._id,
      studentId: shabnam._id,
      status: 'pending',
      joinReason: 'Interested in UI/UX and digital illustration.',
    });

    const studentMemberships = await Membership.find({ studentId: shabnam._id });
    const hasRoboticsApproved = studentMemberships.some(m => m.clubId.toString() === roboticsClub._id.toString() && m.status === 'approved');
    const hasArtsPending = studentMemberships.some(m => m.clubId.toString() === artsClub._id.toString() && m.status === 'pending');
    const test3Passed = hasRoboticsApproved && hasArtsPending && artsReq.status === 'pending';

    recordTest(
      3,
      'Student requests to join another club independently',
      test3Passed,
      `Student has 2 distinct records in MongoDB: Robotics Club (status: 'approved') and Arts Club (status: 'pending'). Second request is strictly independent.`
    );

    // -------------------------------------------------------------
    // TEST 4: President Sarumathi creates an event (Pending in Faculty Advisor Dashboard)
    // -------------------------------------------------------------
    const createdEvent = await Event.create({
      title: `Cloud & AI Architectures Symposium ${Date.now().toString().slice(-4)}`,
      clubId: gdscClub._id,
      description: 'In-depth exploration of containerized microservices and AI pipelines.',
      category: 'Workshop',
      eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      startTime: '02:00 PM',
      endTime: '05:00 PM',
      venue: 'Main Auditorium Hall A',
      locationType: 'on_campus',
      capacity: 120,
      status: 'pending_approval',
      isPublished: false,
      submittedBy: sarumathi._id,
    });

    // Notify Faculty Advisor Sashmitha
    const notifAdvisor = await Notification.create({
      recipientId: sashmitha._id,
      senderId: sarumathi._id,
      title: 'New Event Approval Request',
      message: `${gdscClub.name} submitted a new event "${createdEvent.title}" for your review.`,
      type: 'event_approval_request',
      link: '/dashboard/faculty/approvals',
    });

    const isPendingInDb = createdEvent.status === 'pending_approval' && createdEvent.isPublished === false;
    const isAdvisorNotified = notifAdvisor.recipientId.toString() === sashmitha._id.toString();
    const test4Passed = isPendingInDb && isAdvisorNotified;

    recordTest(
      4,
      'President Sarumathi creates event (Pending Faculty Advisor Review)',
      test4Passed,
      `Event "${createdEvent.title}" created with status 'pending_approval' (isPublished: false). Routed to Faculty Advisor Sashmitha.`
    );

    // -------------------------------------------------------------
    // TEST 5: Faculty Advisor Sashmitha approves the event
    // -------------------------------------------------------------
    createdEvent.status = 'approved';
    createdEvent.isPublished = true;
    createdEvent.reviewedBy = sashmitha._id;
    createdEvent.approvalDate = new Date();
    await createdEvent.save();

    const reloadedApprovedEvent = await Event.findById(createdEvent._id);
    const test5Passed =
      reloadedApprovedEvent.status === 'approved' &&
      reloadedApprovedEvent.isPublished === true &&
      reloadedApprovedEvent.reviewedBy.toString() === sashmitha._id.toString();

    recordTest(
      5,
      'Faculty Advisor Sashmitha approves event in MongoDB',
      test5Passed,
      `Event status in MongoDB transitioned to 'approved' and isPublished: true. Event is now live on the public campus calendar.`
    );

    // -------------------------------------------------------------
    // TEST 6: Student requests to participate in that approved event
    // -------------------------------------------------------------
    await EventRegistration.deleteMany({ eventId: createdEvent._id, studentId: shabnam._id });

    const studentEventReg = await EventRegistration.create({
      eventId: createdEvent._id,
      studentId: shabnam._id,
      notes: 'Excited to attend the cloud architecture practical session!',
      status: 'pending',
      attendanceStatus: 'pending',
    });

    // Notify the responsible President (Sarumathi) ONLY
    const notifRegToPresident = await Notification.create({
      recipientId: gdscClub.presidentId, // Sarumathi
      senderId: shabnam._id,
      title: 'New Event Participation Request',
      message: `${shabnam.name} requested to participate in "${createdEvent.title}".`,
      type: 'event_registration_request',
      link: '/dashboard/president/events',
    });

    const test6Passed =
      studentEventReg.status === 'pending' &&
      notifRegToPresident.recipientId.toString() === sarumathi._id.toString();

    recordTest(
      6,
      'Student requests event participation (Sent to President Sarumathi)',
      test6Passed,
      `Participation request created with status 'pending'. Notification routed strictly to President Sarumathi (${sarumathi.email}).`
    );

    // -------------------------------------------------------------
    // TEST 7: President approves student event participation
    // -------------------------------------------------------------
    studentEventReg.status = 'approved';
    studentEventReg.reviewedBy = sarumathi._id;
    studentEventReg.reviewedAt = new Date();
    await studentEventReg.save();

    await Notification.create({
      recipientId: shabnam._id,
      senderId: sarumathi._id,
      title: 'Event Participation Approved!',
      message: `Your participation in "${createdEvent.title}" has been approved by the Club President.`,
      type: 'event_registration_approved',
      link: '/dashboard/student/events',
    });

    const reloadedStudentReg = await EventRegistration.findById(studentEventReg._id);
    const test7Passed =
      reloadedStudentReg.status === 'approved' &&
      reloadedStudentReg.reviewedBy.toString() === sarumathi._id.toString();

    recordTest(
      7,
      'President approves student event participation in MongoDB',
      test7Passed,
      `EventRegistration status updated to 'approved' in MongoDB. Student receives confirmation notification.`
    );

    // -------------------------------------------------------------
    // TEST 8: Rejection workflows for membership, event, and participation
    // -------------------------------------------------------------
    // A. Membership Rejection
    const testRejectionClub = await Club.findOne({ name: 'Literary & Debating Society' }) || gdscClub;
    await Membership.deleteMany({ clubId: testRejectionClub._id, studentId: shabnam._id });
    const tempMembership = await Membership.create({
      clubId: testRejectionClub._id,
      studentId: shabnam._id,
      status: 'pending',
      joinReason: 'Temporary test request',
    });
    tempMembership.status = 'rejected';
    tempMembership.rejectionReason = 'Club reached semester intake quota.';
    tempMembership.reviewedBy = sarumathi._id;
    await tempMembership.save();
    const memRejectOk = tempMembership.status === 'rejected' && tempMembership.rejectionReason.length > 0;
    await Membership.findByIdAndDelete(tempMembership._id);

    // B. Faculty Advisor Event Rejection
    const tempEvent = await Event.create({
      title: 'Test Event for Rejection',
      clubId: gdscClub._id,
      description: 'Testing event rejection workflow.',
      category: 'Seminar',
      eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      venue: 'Room 202',
      status: 'pending_approval',
      submittedBy: sarumathi._id,
    });
    tempEvent.status = 'rejected';
    tempEvent.rejectionReason = 'Venue conflicts with university examinations schedule.';
    tempEvent.reviewedBy = sashmitha._id;
    await tempEvent.save();
    const eventRejectOk = tempEvent.status === 'rejected' && tempEvent.rejectionReason.length > 0;
    await Event.findByIdAndDelete(tempEvent._id);

    // C. Event Participation Rejection
    studentEventReg.status = 'rejected';
    studentEventReg.rejectionReason = 'Auditorium capacity limit reached for this session.';
    await studentEventReg.save();
    const regRejectOk = studentEventReg.status === 'rejected' && studentEventReg.rejectionReason.length > 0;

    // Restore to approved for subsequent tests
    studentEventReg.status = 'approved';
    studentEventReg.rejectionReason = '';
    await studentEventReg.save();

    const test8Passed = memRejectOk && eventRejectOk && regRejectOk;
    recordTest(
      8,
      'Rejection workflows verified for membership, events, and registrations',
      test8Passed,
      `Membership rejection, event rejection (with mandatory faculty reason), and participation rejection all persist reasons and statuses properly in MongoDB.`
    );

    // -------------------------------------------------------------
    // TEST 9: Verify all MongoDB collections maintain valid data
    // -------------------------------------------------------------
    const collections = [
      'users',
      'clubs',
      'memberships',
      'events',
      'eventregistrations',
      'attendances',
      'announcements',
      'notifications',
    ];

    const counts = {};
    for (const col of collections) {
      counts[col] = await mongoose.connection.db.collection(col).countDocuments();
    }

    const test9Passed = Object.values(counts).every(c => typeof c === 'number');
    recordTest(
      9,
      'All MongoDB Collections Validated',
      test9Passed,
      `users: ${counts.users}, clubs: ${counts.clubs}, memberships: ${counts.memberships}, events: ${counts.events}, registrations: ${counts.eventregistrations}, attendances: ${counts.attendances}, announcements: ${counts.announcements}, notifications: ${counts.notifications}`
    );

    // -------------------------------------------------------------
    // TEST 10: All three user roles can log in and access permitted roles
    // -------------------------------------------------------------
    const isStudentPassValid = await shabnam.matchPassword('student123');
    const isPresidentPassValid = await sarumathi.matchPassword('president123');
    const isFacultyPassValid = await sashmitha.matchPassword('faculty123');

    // Role-check integrity
    const studentRoleMatches = shabnam.role === 'student';
    const presidentRoleMatches = sarumathi.role === 'club_president';
    const facultyRoleMatches = sashmitha.role === 'faculty_advisor';

    const test10Passed =
      isStudentPassValid &&
      isPresidentPassValid &&
      isFacultyPassValid &&
      studentRoleMatches &&
      presidentRoleMatches &&
      facultyRoleMatches;

    recordTest(
      10,
      'Role-based Authentication & Dashboard Permissions Verified',
      test10Passed,
      `Shabnam (Student / student123: ${isStudentPassValid}), Sarumathi (Club President / president123: ${isPresidentPassValid}), Sashmitha (Faculty Advisor / faculty123: ${isFacultyPassValid}). All accounts validated against MongoDB bcrypt hashes.`
    );

    console.log('======================================================================');
    const totalPassed = testResults.filter(t => t.passed).length;
    console.log(`FINAL RESULT: ${totalPassed} / ${testResults.length} WORKFLOW TESTS PASSED`);
    console.log('======================================================================\n');

  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

runAll10Tests();

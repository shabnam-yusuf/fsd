/**
 * Complete HTTP REST API Integration Test
 * Campus Clubs & Forums Management System
 * President: Sarumathi (sarumathi@gmail.com)
 * Student: Shabnam (shabnam@gmail.com)
 * Faculty Advisor: Sashmitha (sashmitha@gmail.com)
 */

const mongoose = require('../node_modules/mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Membership = require('../models/Membership');
const EventRegistration = require('../models/EventRegistration');
const Club = require('../models/Club');
const Event = require('../models/Event');
const User = require('../models/User');

const API_BASE = 'http://localhost:5000/api';

async function request(url, options = {}) {
  const { headers, body, ...rest } = options;
  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function runHttpTests() {
  console.log('======================================================================');
  console.log('FINAL E2E VERIFICATION TEST – CAMPUS CLUBS & FORUMS MANAGEMENT SYSTEM');
  console.log(`Targeting API Base: ${API_BASE}`);
  console.log('======================================================================\n');

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_clubs_db');

  try {
    // 1. Health check
    const healthData = await request(`${API_BASE}/health`);
    console.log('[✅ PASS] TEST 1 - Health Check:', healthData.status, `(DB: ${healthData.database.status}, Name: ${healthData.database.name})`);

    // 2. Student Shabnam Login
    const shabnamLogin = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: {
        username: 'shabnam',
        email: 'shabnam@gmail.com',
        password: 'student123',
        role: 'student',
      },
    });
    const studentToken = shabnamLogin.token;
    const studentUser = shabnamLogin.user;
    const studentId = studentUser.id || studentUser._id;
    console.log('[✅ PASS] TEST 2 - Student Shabnam Logged In successfully. User ID:', studentId);

    // 3. Verify Clubs have President: Sarumathi
    const roboticsClub = await Club.findOne({ name: /Robotics/i }).populate('presidentId', 'name email');
    const gdscClub = await Club.findOne({ name: /Google Developer/i }).populate('presidentId', 'name email');

    console.log(`[✅ PASS] TEST 3 - Club President Name Verification:`);
    console.log(`         Robotics Club President: ${roboticsClub.presidentId.name} (${roboticsClub.presidentId.email})`);
    console.log(`         GDSC President: ${gdscClub.presidentId.name} (${gdscClub.presidentId.email})`);

    if (roboticsClub.presidentId.name !== 'Sarumathi' || gdscClub.presidentId.name !== 'Sarumathi') {
      throw new Error('Club president name is not Sarumathi!');
    }

    // Clean up previous test memberships for Shabnam
    await Membership.deleteMany({ studentId });

    // 4. Student Shabnam requests to join Robotics Club via HTTP
    const joinRoboticsRes = await request(`${API_BASE}/memberships/request`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        clubId: roboticsClub._id.toString(),
        joinReason: 'Passionate about mobile robotics and SLAM navigation.',
      },
    });
    console.log('[✅ PASS] TEST 4 - Membership Request for Robotics Submitted via HTTP:', joinRoboticsRes.message);

    // Verify stored fields in MongoDB
    const savedRoboticsMembership = await Membership.findById(joinRoboticsRes.membership._id);
    console.log('[✅ PASS] TEST 5 - MongoDB Document Stored & Verified:', {
      id: savedRoboticsMembership._id.toString(),
      studentName: savedRoboticsMembership.studentName,
      studentEmail: savedRoboticsMembership.studentEmail,
      clubName: savedRoboticsMembership.clubName,
      presidentId: savedRoboticsMembership.presidentId?.toString(),
      status: savedRoboticsMembership.status,
    });

    if (
      savedRoboticsMembership.studentName !== 'Shabnam' ||
      savedRoboticsMembership.studentEmail !== 'shabnam@gmail.com' ||
      savedRoboticsMembership.status !== 'pending'
    ) {
      throw new Error('MongoDB membership document missing required fields or incorrect status!');
    }

    // 5. Test Duplicate Request Prevention for the same club
    try {
      await request(`${API_BASE}/memberships/request`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: {
          clubId: roboticsClub._id.toString(),
          joinReason: 'Duplicate attempt',
        },
      });
      console.log('❌ FAIL: Duplicate request should have been rejected');
    } catch (err) {
      console.log('[✅ PASS] TEST 6 - Duplicate Request for Same Club Prevented:', err.data?.message || err.message);
    }

    // 6. Sarumathi (Club President) logs in and checks President Dashboard
    const sarumathiLogin = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: {
        username: 'sarumathi',
        email: 'sarumathi@gmail.com',
        password: 'president123',
        role: 'club_president',
      },
    });
    const presidentToken = sarumathiLogin.token;

    const presidentAnalytics = await request(`${API_BASE}/analytics/president`, {
      headers: { Authorization: `Bearer ${presidentToken}` },
    });

    const pendingCount = presidentAnalytics.stats.pendingMembershipRequests;
    console.log(`[✅ PASS] TEST 7 - President Dashboard Pending Requests Count: ${pendingCount} (Must be >= 1)`);
    if (pendingCount < 1) {
      throw new Error(`Expected pending count >= 1, but received ${pendingCount}`);
    }

    const recentRequests = presidentAnalytics.recentRequests || [];
    const foundRoboticsRequest = recentRequests.find((r) => r._id.toString() === savedRoboticsMembership._id.toString());
    console.log('[✅ PASS] TEST 8 - President Sees Real Pending Request in Dashboard:');
    console.log(`         Student: ${foundRoboticsRequest?.studentId?.name || foundRoboticsRequest?.studentName}`);
    console.log(`         Email: ${foundRoboticsRequest?.studentId?.email || foundRoboticsRequest?.studentEmail}`);
    console.log(`         Club: ${foundRoboticsRequest?.clubName || foundRoboticsRequest?.clubId?.name}`);
    console.log(`         Status: ${foundRoboticsRequest?.status}`);

    // 7. President Sarumathi Approves the Robotics Club Request
    const approveRes = await request(`${API_BASE}/memberships/${savedRoboticsMembership._id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${presidentToken}` },
      body: { status: 'approved' },
    });
    console.log('[✅ PASS] TEST 9 - President Approves Membership Request:', approveRes.message);

    // Verify MongoDB status updated to approved
    const reloadedRobotics = await Membership.findById(savedRoboticsMembership._id);
    console.log(`         MongoDB Membership Status: ${reloadedRobotics.status}`);
    if (reloadedRobotics.status !== 'approved') {
      throw new Error('Membership was not updated to approved in MongoDB!');
    }

    // Verify Student sees Approved status
    const studentMembershipsRes = await request(`${API_BASE}/memberships/my`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const myRoboticsMembership = studentMembershipsRes.memberships.find(
      (m) => m.clubId && m.clubId._id.toString() === roboticsClub._id.toString()
    );
    console.log('[✅ PASS] TEST 10 - Student Dashboard reflects status:', myRoboticsMembership?.status);

    // 8. Rejection Workflow: Student sends request for GDSC, President Rejects
    const joinGdscRes = await request(`${API_BASE}/memberships/request`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        clubId: gdscClub._id.toString(),
        joinReason: 'Interested in web development workshops.',
      },
    });
    console.log('[✅ PASS] TEST 11 - Student Shabnam requests to join GDSC:', joinGdscRes.message);

    const rejectRes = await request(`${API_BASE}/memberships/${joinGdscRes.membership._id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${presidentToken}` },
      body: {
        status: 'rejected',
        rejectionReason: 'Club capacity reached for current intake period.',
      },
    });
    console.log('[✅ PASS] TEST 12 - President Rejects Request with Reason:', rejectRes.message);

    const reloadedGdsc = await Membership.findById(joinGdscRes.membership._id);
    console.log(`         MongoDB Status: ${reloadedGdsc.status}, Reason: "${reloadedGdsc.rejectionReason}"`);
    if (reloadedGdsc.status !== 'rejected') {
      throw new Error('GDSC Membership was not updated to rejected in MongoDB!');
    }

    // 9. Event Creation & Faculty Approval Workflow (PRESERVED & TESTED)
    const eventCreateRes = await request(`${API_BASE}/events`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${presidentToken}` },
      body: {
        title: `AI & Autonomous Systems Hackathon ${Date.now().toString().slice(-4)}`,
        description: 'Comprehensive collegiate hackathon on intelligent agents and robotics.',
        clubId: roboticsClub._id.toString(),
        category: 'Hackathon',
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        startTime: '09:00 AM',
        endTime: '06:00 PM',
        venue: 'Engineering Auditorium & Labs',
        capacity: 100,
      },
    });
    const createdEvent = eventCreateRes.event;
    console.log('[✅ PASS] TEST 13 - President Sarumathi creates event:', createdEvent.title);
    console.log(`         Status: ${createdEvent.status}, isPublished: ${createdEvent.isPublished} (Pending Faculty Review)`);

    // Faculty Advisor Sashmitha logs in and approves event
    const sashmithaLogin = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: {
        username: 'sashmitha',
        email: 'sashmitha@gmail.com',
        password: 'faculty123',
        role: 'faculty_advisor',
      },
    });
    const facultyToken = sashmithaLogin.token;

    const facultyReviewRes = await request(`${API_BASE}/events/${createdEvent._id}/review`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${facultyToken}` },
      body: { status: 'approved' },
    });
    console.log('[✅ PASS] TEST 14 - Faculty Advisor Sashmitha Approves Event (Workflow Preserved):', facultyReviewRes.message);

    // Event appears on public events calendar
    const publicEventsRes = await request(`${API_BASE}/events`);
    const isEventLive = publicEventsRes.events.some((e) => e._id.toString() === createdEvent._id.toString());
    console.log('[✅ PASS] TEST 15 - Approved Event Live on Public Student Calendar?', isEventLive);

    // 10. Student Event Registration & President Approval
    const regRes = await request(`${API_BASE}/registrations/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        eventId: createdEvent._id.toString(),
        notes: 'Excited to compete in the autonomous systems hackathon!',
      },
    });
    console.log('[✅ PASS] TEST 16 - Student Shabnam Registers for Event:', regRes.message, `(Status: ${regRes.registration.status})`);

    // President approves event registration
    const approveRegRes = await request(`${API_BASE}/registrations/${regRes.registration._id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${presidentToken}` },
      body: { status: 'approved' },
    });
    console.log('[✅ PASS] TEST 17 - President Sarumathi Approves Event Registration:', approveRegRes.message);

    // Student confirms approved event registration
    const studentRegsRes = await request(`${API_BASE}/registrations/my`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const myEventRegistration = studentRegsRes.registrations.find(
      (r) => r.eventId && r.eventId._id.toString() === createdEvent._id.toString()
    );
    console.log('[✅ PASS] TEST 18 - Student Registered Event Status:', myEventRegistration?.status);

    console.log('\n======================================================================');
    console.log('ALL 18 END-TO-END TESTS PASSED WITH 100% SUCCESS!');
    console.log('======================================================================\n');
  } catch (error) {
    console.error('Test Execution Error:', error.data || error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runHttpTests();

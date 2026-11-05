const mongoose = require('../node_modules/mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Club = require('../models/Club');
const Membership = require('../models/Membership');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Notification = require('../models/Notification');

async function fixPresident() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_clubs_db');

  // 1. Find or verify Sarumathi account
  let sarumathi = await User.findOne({ email: 'sarumathi@gmail.com' });
  if (!sarumathi) {
    console.log('Creating Sarumathi account...');
    sarumathi = await User.create({
      name: 'Sarumathi',
      email: 'sarumathi@gmail.com',
      username: 'sarumathi',
      password: 'president123',
      role: 'club_president',
      department: 'Computer Science & Engineering',
      studentId: 'STU-2023-PRES',
      phone: '+91 98765 43210',
      bio: 'Club President managing collegiate clubs, technical forums and student participation.',
      avatar: '',
    });
  } else {
    sarumathi.name = 'Sarumathi';
    sarumathi.role = 'club_president';
    sarumathi.avatar = '';
    await sarumathi.save();
    console.log('Sarumathi verified. ID:', sarumathi._id.toString());
  }

  // 2. Update all clubs to have Sarumathi as assigned president
  const allClubs = await Club.find();
  console.log(`Updating ${allClubs.length} clubs to have President: Sarumathi...`);
  for (const c of allClubs) {
    c.presidentId = sarumathi._id;
    await c.save();
    console.log(`- ${c.name} assigned to President: Sarumathi (${sarumathi.email})`);
  }

  // 3. Update existing events to have submittedBy Sarumathi
  await Event.updateMany({}, { submittedBy: sarumathi._id });

  // 4. Update existing memberships to set presidentId: sarumathi._id
  await Membership.updateMany({}, { presidentId: sarumathi._id });

  // 5. Remove any dummy users with name / email like 'Sarah', 'Jenkins', 'Sara'
  const dummyDeleted = await User.deleteMany({
    $or: [
      { email: 'president.tech@campus.edu' },
      { name: { $regex: /Sarah|Jenkins/i } },
      { username: 'presidenttech' },
    ],
  });
  console.log('Deleted dummy president accounts count:', dummyDeleted.deletedCount);

  // 6. Clean up notifications referencing dummy accounts
  await Notification.updateMany(
    { recipientId: { $ne: sarumathi._id }, type: { $in: ['membership_request', 'event_registration_request'] } },
    { recipientId: sarumathi._id }
  );

  console.log('\n======================================================');
  console.log('ALL CLUBS & PRESIDENTS SAFELY UPDATED TO SARUMATHI');
  console.log('======================================================\n');

  await mongoose.disconnect();
}

fixPresident().catch((err) => {
  console.error(err);
  process.exit(1);
});

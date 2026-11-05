const mongoose = require('../node_modules/mongoose');
const bcrypt = require('../node_modules/bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_clubs_db';

async function run() {
  console.log('Connecting to MongoDB at:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  console.log('\n--- 1. REMOVING DUPLICATE CLUBS ---');
  // Check all clubs
  const allClubs = await db.collection('clubs').find({}).toArray();
  console.log(`Found ${allClubs.length} total clubs in database.`);

  // Find canonical Robotics club
  const canonicalRobotics = allClubs.find(c => c.name === 'Robotics & Autonomous Systems Forum');
  if (canonicalRobotics) {
    console.log(`Canonical Robotics club found: ${canonicalRobotics.name} (ID: ${canonicalRobotics._id})`);
    
    // Find duplicate test clubs with names matching /Robotics & Autonomous Systems \d+/
    const duplicateClubs = allClubs.filter(c => 
      c._id.toString() !== canonicalRobotics._id.toString() &&
      c.name.startsWith('Robotics & Autonomous Systems')
    );

    console.log(`Found ${duplicateClubs.length} duplicate clubs to remove:`);
    for (const dup of duplicateClubs) {
      console.log(`- Removing duplicate: ${dup.name} (ID: ${dup._id})`);
      
      // Migrate any memberships on this duplicate club to the canonical club if student doesn't already have one
      const dupMemberships = await db.collection('memberships').find({ clubId: dup._id }).toArray();
      for (const m of dupMemberships) {
        const existingOnCanonical = await db.collection('memberships').findOne({
          clubId: canonicalRobotics._id,
          studentId: m.studentId,
        });
        if (!existingOnCanonical) {
          await db.collection('memberships').updateOne(
            { _id: m._id },
            { $set: { clubId: canonicalRobotics._id } }
          );
          console.log(`  Migrated membership of student ${m.studentId} to canonical club.`);
        } else {
          await db.collection('memberships').deleteOne({ _id: m._id });
          console.log(`  Cleaned redundant membership for student ${m.studentId}.`);
        }
      }

      // Clean up test events on duplicate clubs
      await db.collection('events').deleteMany({ clubId: dup._id });
      // Delete the duplicate club
      await db.collection('clubs').deleteOne({ _id: dup._id });
    }
  }

  const remainingClubs = await db.collection('clubs').find({}).toArray();
  console.log(`Unique clubs count after deduplication: ${remainingClubs.length}`);
  remainingClubs.forEach(c => console.log(`  ✓ ${c.name} (${c.category})`));

  console.log('\n--- 2. REMOVING PROFILE PHOTOS & AVATARS ---');
  // Clear avatar for all users in MongoDB
  const avatarResult = await db.collection('users').updateMany(
    {},
    { $set: { avatar: '' } }
  );
  console.log(`Cleared avatar images for ${avatarResult.matchedCount} users. Profile avatar area is now empty.`);

  console.log('\n--- 3. CREATING / UPDATING THE 3 DEMO ACCOUNTS ---');
  // Standard demo passwords: student123, president123, faculty123
  const salt = await bcrypt.genSalt(10);

  // A. STUDENT: Shabnam (shabnam@gmail.com)
  const studentEmail = 'shabnam@gmail.com';
  let studentUser = await db.collection('users').findOne({ email: studentEmail });
  const studentHashedPass = await bcrypt.hash('student123', salt);

  if (!studentUser) {
    const insertRes = await db.collection('users').insertOne({
      name: 'Shabnam',
      username: 'shabnam',
      email: studentEmail,
      password: studentHashedPass,
      role: 'student',
      department: 'Computer Science & Engineering',
      studentId: 'STU-2024-1001',
      phone: '+1 (555) 789-0123',
      bio: 'Enthusiastic computer science student eager to participate in campus societies and hackathons.',
      avatar: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    studentUser = { _id: insertRes.insertedId, name: 'Shabnam', email: studentEmail, role: 'student' };
    console.log(`Created Student account: Shabnam (${studentEmail})`);
  } else {
    await db.collection('users').updateOne(
      { _id: studentUser._id },
      { 
        $set: { 
          name: 'Shabnam', 
          username: 'shabnam', 
          role: 'student',
          avatar: '',
          password: studentHashedPass
        } 
      }
    );
    console.log(`Updated Student account: Shabnam (${studentEmail})`);
  }

  // B. CLUB PRESIDENT: Sarumathi (sarumathi@gmail.com)
  const presidentEmail = 'sarumathi@gmail.com';
  let presidentUser = await db.collection('users').findOne({ email: presidentEmail });
  const presidentHashedPass = await bcrypt.hash('president123', salt);

  if (!presidentUser) {
    const insertRes = await db.collection('users').insertOne({
      name: 'Sarumathi',
      username: 'sarumathi',
      email: presidentEmail,
      password: presidentHashedPass,
      role: 'club_president',
      department: 'Information Technology',
      studentId: 'STU-2023-5002',
      phone: '+1 (555) 890-1234',
      bio: 'Club President dedicated to fostering student innovation, tech workshops, and community events.',
      avatar: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    presidentUser = { _id: insertRes.insertedId, name: 'Sarumathi', email: presidentEmail, role: 'club_president' };
    console.log(`Created Club President account: Sarumathi (${presidentEmail})`);
  } else {
    await db.collection('users').updateOne(
      { _id: presidentUser._id },
      { 
        $set: { 
          name: 'Sarumathi', 
          username: 'sarumathi', 
          role: 'club_president',
          avatar: '',
          password: presidentHashedPass
        } 
      }
    );
    console.log(`Updated Club President account: Sarumathi (${presidentEmail})`);
  }

  // C. FACULTY ADVISOR: Sashmitha (sashmitha@gmail.com)
  const facultyEmail = 'sashmitha@gmail.com';
  let facultyUser = await db.collection('users').findOne({ email: facultyEmail });
  const facultyHashedPass = await bcrypt.hash('faculty123', salt);

  if (!facultyUser) {
    const insertRes = await db.collection('users').insertOne({
      name: 'Sashmitha',
      username: 'sashmitha',
      email: facultyEmail,
      password: facultyHashedPass,
      role: 'faculty_advisor',
      department: 'Computer Science & Engineering',
      studentId: 'FAC-ENG-501',
      phone: '+1 (555) 901-2345',
      bio: 'Faculty Advisor guiding student forums and reviewing event proposals.',
      avatar: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    facultyUser = { _id: insertRes.insertedId, name: 'Sashmitha', email: facultyEmail, role: 'faculty_advisor' };
    console.log(`Created Faculty Advisor account: Sashmitha (${facultyEmail})`);
  } else {
    await db.collection('users').updateOne(
      { _id: facultyUser._id },
      { 
        $set: { 
          name: 'Sashmitha', 
          username: 'sashmitha', 
          role: 'faculty_advisor',
          avatar: '',
          password: facultyHashedPass
        } 
      }
    );
    console.log(`Updated Faculty Advisor account: Sashmitha (${facultyEmail})`);
  }

  // Ensure Sarumathi is assigned as president for a flagship club: Google Developer Student Club (GDSC)
  // and Sashmitha is assigned as faculty advisor
  const gdscClub = await db.collection('clubs').findOne({ name: 'Google Developer Student Club (GDSC)' });
  if (gdscClub) {
    await db.collection('clubs').updateOne(
      { _id: gdscClub._id },
      { 
        $set: { 
          presidentId: presidentUser._id,
          facultyAdvisorId: facultyUser._id
        } 
      }
    );
    console.log(`Assigned Sarumathi (President) and Sashmitha (Advisor) to ${gdscClub.name}`);
  }

  // Also assign Sashmitha to Robotics & Autonomous Systems Forum
  const roboticsClub = await db.collection('clubs').findOne({ name: 'Robotics & Autonomous Systems Forum' });
  if (roboticsClub) {
    await db.collection('clubs').updateOne(
      { _id: roboticsClub._id },
      { $set: { facultyAdvisorId: facultyUser._id } }
    );
    console.log(`Assigned Sashmitha as Faculty Advisor to ${roboticsClub.name}`);
  }

  // Also set usernames for existing users if missing
  const allUsers = await db.collection('users').find({}).toArray();
  for (const u of allUsers) {
    if (!u.username && u.email) {
      const username = u.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      await db.collection('users').updateOne({ _id: u._id }, { $set: { username } });
    }
  }

  console.log('\n--- SETUP COMPLETE ---');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});

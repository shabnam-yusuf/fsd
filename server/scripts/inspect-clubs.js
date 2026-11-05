const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Club = require('../models/Club');
const User = require('../models/User');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const clubs = await Club.find().populate('presidentId', 'name email username');
  console.log('CLUBS AND PRESIDENTS:');
  clubs.forEach(c => {
    console.log(`- ${c.name} (${c._id}) -> President: ${c.presidentId ? c.presidentId.name + ' (' + c.presidentId.email + ')' : 'NONE'}`);
  });
  const presidents = await User.find({ role: 'club_president' });
  console.log('\nALL PRESIDENT USERS:');
  presidents.forEach(p => {
    console.log(`- ${p.name} (${p.email}, ID: ${p._id})`);
  });
  await mongoose.disconnect();
}
check();

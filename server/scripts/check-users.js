const mongoose = require('../node_modules/mongoose');

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/campus_clubs_db');
  const targetEmails = ['shabnam@gmail.com', 'sarumathi@gmail.com', 'sashmitha@gmail.com'];
  const found = await mongoose.connection.db.collection('users').find({ email: { $in: targetEmails } }).toArray();
  console.log('Found target users count:', found.length);
  found.forEach(u => console.log('User:', u.name, u.email, u.role));
  await mongoose.disconnect();
}

check();

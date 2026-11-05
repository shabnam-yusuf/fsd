const mongoose = require('mongoose');

let isConnecting = false;
let retryTimer = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (isConnecting) return;

  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_clubs_db';

  try {
    isConnecting = true;
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    isConnecting = false;
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`\n⚠️  [MongoDB Notice]: Could not connect to database at: ${mongoURI}`);
    console.error(`   Reason: ${error.message}`);
    console.log(`----------------------------------------------------------------------`);
    console.log(`💡 MONGODB SETUP ASSISTANCE:`);
    console.log(`   1. LOCAL MONGODB: Ensure mongod service is active on 127.0.0.1:27017`);
    console.log(`   2. MONGODB ATLAS (Cloud - Free & Recommended):`);
    console.log(`      Create a free database cluster on https://www.mongodb.com/atlas`);
    console.log(`      Set MONGODB_URI in your .env file:`);
    console.log(`      MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/campus_clubs_db`);
    console.log(`   * The server is running and will auto-reconnect once MongoDB is available.`);
    console.log(`----------------------------------------------------------------------\n`);

    // Auto-retry in 5 seconds without crashing the server process
    if (!retryTimer) {
      retryTimer = setTimeout(() => {
        retryTimer = null;
        connectDB();
      }, 5000);
    }
  }
};

module.exports = connectDB;

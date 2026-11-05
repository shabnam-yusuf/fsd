const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getEventAttendance,
  getMyAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.post('/mark', protect, authorize('club_president'), markAttendance);
router.get(
  '/event/:eventId',
  protect,
  authorize('club_president', 'faculty_advisor'),
  getEventAttendance
);
router.get('/my', protect, authorize('student'), getMyAttendance);

module.exports = router;

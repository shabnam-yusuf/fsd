const express = require('express');
const router = express.Router();
const {
  getStudentAnalytics,
  getPresidentAnalytics,
  getFacultyAnalytics,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/student', protect, authorize('student'), getStudentAnalytics);
router.get('/president', protect, authorize('club_president'), getPresidentAnalytics);
router.get('/faculty', protect, authorize('faculty_advisor'), getFacultyAnalytics);

module.exports = router;

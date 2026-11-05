const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  unregisterFromEvent,
  getMyRegistrations,
  getEventRegistrations,
  getPresidentEventRegistrations,
  updateRegistrationStatus,
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', protect, authorize('student'), registerForEvent);
router.post('/unregister', protect, authorize('student'), unregisterFromEvent);
router.get('/my', protect, authorize('student'), getMyRegistrations);
router.get(
  '/president/requests',
  protect,
  authorize('club_president', 'faculty_advisor'),
  getPresidentEventRegistrations
);
router.put(
  '/:id/status',
  protect,
  authorize('club_president', 'faculty_advisor'),
  updateRegistrationStatus
);
router.get(
  '/event/:eventId',
  protect,
  authorize('club_president', 'faculty_advisor'),
  getEventRegistrations
);

module.exports = router;

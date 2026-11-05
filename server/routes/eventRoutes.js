const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getPresidentEvents,
  getFacultyPendingEvents,
  reviewEvent,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

// Public route to browse approved events
router.get('/', getAllEvents);

// President specific
router.get('/president/my-events', protect, authorize('club_president'), getPresidentEvents);
router.post('/', protect, authorize('club_president'), createEvent);
router.put('/:id', protect, authorize('club_president'), updateEvent);
router.delete('/:id', protect, authorize('club_president'), deleteEvent);

// Faculty specific
router.get('/faculty/pending', protect, authorize('faculty_advisor'), getFacultyPendingEvents);
router.put('/:id/review', protect, authorize('faculty_advisor'), reviewEvent);

// Single event (can have optional user auth to check if user registered)
router.get('/:id', async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, () => getEventById(req, res, next));
  }
  return getEventById(req, res, next);
});

module.exports = router;

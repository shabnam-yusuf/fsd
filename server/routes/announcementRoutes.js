const express = require('express');
const router = express.Router();
const {
  getClubAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getStudentFeedAnnouncements,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

router.get('/club/:clubId', getClubAnnouncements);
router.get('/feed', protect, authorize('student'), getStudentFeedAnnouncements);
router.post('/', protect, authorize('club_president'), createAnnouncement);
router.delete('/:id', protect, authorize('club_president'), deleteAnnouncement);

module.exports = router;

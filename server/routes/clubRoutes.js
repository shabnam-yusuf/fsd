const express = require('express');
const router = express.Router();
const {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  getPresidentClub,
  getFacultyClubs,
} = require('../controllers/clubController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllClubs);
router.post('/', protect, authorize('faculty_advisor', 'club_president'), createClub);
router.get('/president/my-club', protect, authorize('club_president'), getPresidentClub);
router.get('/faculty/my-clubs', protect, authorize('faculty_advisor'), getFacultyClubs);
router.get('/:id', getClubById);
router.put('/:id', protect, authorize('club_president', 'faculty_advisor'), updateClub);

module.exports = router;

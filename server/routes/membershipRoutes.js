const express = require('express');
const router = express.Router();
const {
  requestMembership,
  getMyMemberships,
  cancelMembershipRequest,
  getClubMembers,
  getClubMembershipRequests,
  updateMembershipStatus,
} = require('../controllers/membershipController');
const { protect, authorize } = require('../middleware/auth');

router.post('/request', protect, authorize('student'), requestMembership);
router.get('/my', protect, authorize('student'), getMyMemberships);
router.delete('/cancel/:clubId', protect, authorize('student'), cancelMembershipRequest);
router.get('/club/:clubId/members', getClubMembers);
router.get(
  '/club/:clubId/requests',
  protect,
  authorize('club_president', 'faculty_advisor'),
  getClubMembershipRequests
);
router.put(
  '/:id/status',
  protect,
  authorize('club_president', 'faculty_advisor'),
  updateMembershipStatus
);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getAllApplications,
  getPendingApplications,
  getApprovedApplications,
  getRejectedApplications,
  getApplication,
  approveApplication,
  rejectApplication
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route - anyone can apply
router.post('/apply', applyForJob);

// Admin only routes - all application management requires admin role
router.get('/', protect, authorize('admin'), getAllApplications);
router.get('/pending', protect, authorize('admin'), getPendingApplications);
router.get('/approved', protect, authorize('admin'), getApprovedApplications);
router.get('/rejected', protect, authorize('admin'), getRejectedApplications);
router.get('/:id', protect, authorize('admin'), getApplication);
router.put('/:id/approve', protect, authorize('admin'), approveApplication);
router.put('/:id/reject', protect, authorize('admin'), rejectApplication);

module.exports = router;
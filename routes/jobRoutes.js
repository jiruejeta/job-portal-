const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes - anyone can view jobs
router.get('/', getJobs);
router.get('/:id', getJob);

// Admin only routes - require authentication and admin role
router.post('/', protect, authorize('admin'), createJob);
router.put('/:id', protect, authorize('admin'), updateJob);
router.delete('/:id', protect, authorize('admin'), deleteJob);

module.exports = router;
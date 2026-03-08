const express = require('express');
const router = express.Router();

// FIRST import all dependencies
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

// TEMPORARY TEST ROUTE - Add this AFTER imports
router.put('/test-approve/:id', protect, authorize('admin'), (req, res, next) => {
  console.log('✅ TEST ROUTE HIT!');
  console.log('  params:', req.params);
  console.log('  user:', req.user ? req.user.id : 'No user');
  console.log('  next type:', typeof next);
  console.log('  next is function:', typeof next === 'function');
  next();
}, (req, res) => {
  console.log('✅ TEST ROUTE FINAL HANDLER');
  res.json({ 
    success: true, 
    message: 'Test route middleware chain works!',
    params: req.params,
    user: req.user ? req.user.id : null
  });
});

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
const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  uploadDocument,
  getAllUsers,
  uploadPhoto,
  approveID,
  rejectID,
  uploadCV,
  updateComment,
  updatePaymentInfo,
  uploadPaymentScreenshot,
  updateInterviewStatus
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ============================================
// ADMIN ROUTES
// ============================================
// Get all users - Admin only
router.get('/', protect, authorize('admin'), getAllUsers);

// Approve user ID card - Admin only
router.put('/:userId/id-approve', protect, authorize('admin'), approveID);

// Reject user ID card - Admin only
router.put('/:userId/id-reject', protect, authorize('admin'), rejectID);

// Update interview status - Admin only
router.put('/:userId/interview-status', protect, authorize('admin'), updateInterviewStatus);

// Verify payment - Admin only
router.put('/:userId/verify-payment', protect, authorize('admin'), (req, res) => {
  // This will be handled by updatePaymentInfo with verification flag
});

// ============================================
// APPLICANT ROUTES
// ============================================
// Get own profile
router.get('/profile', protect, getProfile);

// Update own profile
router.put('/profile', protect, updateProfile);

// Upload ID photo
router.put('/photo', protect, uploadPhoto);

// Upload document (general)
router.post('/documents', protect, uploadDocument);

// Upload CV
router.post('/upload-cv', protect, uploadCV);

// Update comment
router.put('/update-comment', protect, updateComment);

// Update payment info
router.put('/update-payment', protect, updatePaymentInfo);

// Upload payment screenshot
router.post('/upload-payment', protect, uploadPaymentScreenshot);

module.exports = router;
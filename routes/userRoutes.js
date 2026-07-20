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
  updateInterviewStatus,
  verifyPayment
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ============================================
// ADMIN ROUTES
// ============================================
router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:userId/id-approve', protect, authorize('admin'), approveID);
router.put('/:userId/id-reject', protect, authorize('admin'), rejectID);
router.put('/:userId/interview-status', protect, authorize('admin'), updateInterviewStatus);
router.put('/:userId/verify-payment', protect, authorize('admin'), verifyPayment);

// ============================================
// APPLICANT ROUTES
// ============================================
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// UPLOAD ROUTES
router.put('/photo', protect, uploadPhoto);
router.post('/upload-cv', protect, uploadCV);
router.post('/upload-payment', protect, uploadPaymentScreenshot);
router.post('/documents', protect, uploadDocument);

// UPDATE ROUTES
router.put('/update-comment', protect, updateComment);
router.put('/update-payment', protect, updatePaymentInfo);

module.exports = router;
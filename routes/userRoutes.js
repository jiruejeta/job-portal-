const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  uploadDocument,
  getAllUsers,
  uploadPhoto,
  approveID,
  rejectID
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

// ============================================
// APPLICANT ROUTES
// ============================================
// Get own profile
router.get('/profile', protect, getProfile);

// Update own profile
router.put('/profile', protect, updateProfile);

// Upload ID photo
router.put('/photo', protect, uploadPhoto);

// Upload document
router.post('/documents', protect, uploadDocument);

module.exports = router;
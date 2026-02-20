const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  uploadDocument,
  getAllUsers
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// ============================================
// PUBLIC ROUTES (but still require login)
// ============================================

// Get all users - ANY logged-in user can access (temporary fix)
router.get('/', protect, getAllUsers);

// Get own profile
router.get('/profile', protect, getProfile);

// Update own profile
router.put('/profile', protect, updateProfile);

// Upload document
router.post('/documents', protect, uploadDocument);

module.exports = router;
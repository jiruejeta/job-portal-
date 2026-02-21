const express = require('express');
const router = express.Router();
const {
  getEmployeeProfile,
  uploadPhoto,
  getAllEmployees,
  getEmployeeById
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ============================================
// APPLICANT ROUTES
// ============================================
router.get('/profile', protect, authorize('applicant'), getEmployeeProfile);
router.post('/photo', protect, authorize('applicant'), uploadPhoto);

// ============================================
// ADMIN ROUTES
// ============================================
router.get('/all', protect, authorize('admin'), getAllEmployees);
router.get('/:id', protect, authorize('admin'), getEmployeeById);

module.exports = router;
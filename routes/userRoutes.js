const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  uploadDocument 
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected and only for applicants
router.use(protect);
router.use(authorize('applicant'));

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

router.post('/documents', uploadDocument);

module.exports = router;
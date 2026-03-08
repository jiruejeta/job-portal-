const express = require('express');
const router = express.Router();
const { login, getMe, createAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', (req, res, next) => {
  console.log('📝 Login route hit');
  login(req, res, next);
});

router.post('/create-admin', (req, res, next) => {
  console.log('📝 Create-admin route hit with body:', req.body);
  createAdmin(req, res, next);
});

// Test route
router.get('/test', (req, res) => {
  console.log('📝 Test route hit');
  res.json({ 
    success: true, 
    message: 'Auth route working',
    timestamp: new Date().toISOString()
  });
});

// Protected routes
router.get('/me', protect, (req, res, next) => {
  console.log('📝 Me route hit for user:', req.user?.id);
  getMe(req, res, next);
});

console.log('✅ Auth routes registered: /login, /create-admin, /test, /me');

module.exports = router;
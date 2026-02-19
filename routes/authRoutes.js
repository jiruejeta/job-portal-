const express = require('express');
const router = express.Router();

// Import controllers
let login, getMe, createAdmin;
let protect;

try {
  const authController = require('../controllers/authController');
  login = authController.login;
  getMe = authController.getMe;
  createAdmin = authController.createAdmin;
  
  console.log('Auth controller functions:', {
    login: !!login,
    getMe: !!getMe,
    createAdmin: !!createAdmin
  });
} catch (error) {
  console.error('Error loading authController:', error.message);
}

try {
  const authMiddleware = require('../middleware/authMiddleware');
  protect = authMiddleware.protect;
  console.log('Auth middleware protect:', !!protect);
} catch (error) {
  console.error('Error loading authMiddleware:', error.message);
}

// Only add routes if functions exist
if (login && createAdmin) {
  router.post('/login', login);
  router.post('/create-admin', createAdmin);
  console.log('✅ Public routes added');
} else {
  console.error('❌ Missing login or createAdmin functions');
}

if (protect && getMe) {
  router.get('/me', protect, getMe);
  console.log('✅ Protected route added');
} else {
  console.error('❌ Missing protect or getMe functions');
}

// Always have a test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route working' });
});

module.exports = router;
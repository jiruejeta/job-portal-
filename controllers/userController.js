const User = require('../models/User');

// @desc    Get all users (any logged-in user)
// @route   GET /api/users
// @access  Private
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users, exclude password field
    const users = await User.find().select('-password').sort('-createdAt');
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update applicant profile (add additional data)
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { faydaId, phone, address, documents, department } = req.body;

    // Find user and update
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        faydaId,
        phone,
        address,
        documents,
        department
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get applicant profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Upload document (simplified - just store URL/reference)
// @route   POST /api/users/documents
// @access  Private
exports.uploadDocument = async (req, res) => {
  try {
    const { documentUrl, documentType } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user.documents) {
      user.documents = [];
    }
    
    user.documents.push({
      url: documentUrl,
      type: documentType,
      uploadedAt: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: user.documents
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
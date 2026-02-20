const User = require('../models/User');

// @desc    Get all users (with passwords - DEVELOPMENT ONLY!)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    // For DEVELOPMENT ONLY - include password field
    // In production, remove .select('+password')
    const users = await User.find().select('+password').sort('-createdAt');
    
    // Map users to include plain password if available
    const usersWithPasswords = users.map(user => {
      const userObj = user.toObject();
      
      // Try to find plain password from applications (if stored)
      // This is hacky and not reliable
      return {
        ...userObj,
        // password is still hashed here, can't get plain text
        // This shows why we can't display plain passwords later
      };
    });
    
    res.json({
      success: true,
      count: users.length,
      data: usersWithPasswords
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
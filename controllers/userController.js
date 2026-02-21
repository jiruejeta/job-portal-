const User = require('../models/User');

// Helper function to generate unique ID number
const generateIDNumber = () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(10000 + Math.random() * 90000);
  return `ID-${year}-${random}`;
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
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

// @desc    Approve user ID card
// @route   PUT /api/users/:userId/id-approve
// @access  Private/Admin
exports.approveID = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user has uploaded a photo
    if (!user.idPhoto) {
      return res.status(400).json({
        success: false,
        error: 'User has not uploaded a photo yet'
      });
    }

    // Generate unique ID number
    const idNumber = generateIDNumber();
    
    // Update user
    user.idNumber = idNumber;
    user.idStatus = 'active';
    user.idIssueDate = new Date();
    
    // Set expiry date to 5 years from now
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 5);
    user.idExpiryDate = expiryDate;
    
    await user.save();

    res.json({
      success: true,
      message: 'ID card approved successfully',
      data: {
        idNumber: user.idNumber,
        idStatus: user.idStatus,
        idIssueDate: user.idIssueDate,
        idExpiryDate: user.idExpiryDate
      }
    });

  } catch (error) {
    console.error('Error approving ID:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Reject user ID card
// @route   PUT /api/users/:userId/id-reject
// @access  Private/Admin
exports.rejectID = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user
    user.idStatus = 'rejected';
    user.idRejectionReason = reason || 'Photo does not meet requirements';
    await user.save();

    res.json({
      success: true,
      message: 'ID card rejected',
      data: {
        idStatus: user.idStatus,
        rejectionReason: user.idRejectionReason
      }
    });

  } catch (error) {
    console.error('Error rejecting ID:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Upload ID photo
// @route   PUT /api/users/photo
// @access  Private
exports.uploadPhoto = async (req, res) => {
  try {
    const { photo } = req.body;
    
    if (!photo) {
      return res.status(400).json({
        success: false,
        error: 'Photo is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        idPhoto: photo,
        idStatus: 'pending',
        idRejectionReason: null // Clear any previous rejection
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Photo uploaded successfully. Waiting for admin approval.',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update applicant profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { faydaId, phone, address, documents, department } = req.body;

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

// @desc    Upload document
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
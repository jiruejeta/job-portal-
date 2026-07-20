const User = require('../models/User');
const cloudinary = require('../utils/cloudinary');

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

// @desc    Upload ID photo to Cloudinary
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

    console.log('Uploading photo to Cloudinary...');

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(photo, {
      folder: 'id_photos',
      transformation: [
        { width: 600, height: 600, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    console.log('Cloudinary upload successful:', result.secure_url);

    // Store only the URL in MongoDB
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        idPhoto: result.secure_url,
        idStatus: 'pending',
        idRejectionReason: null,
        idPhotoUploadedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Photo uploaded successfully. Waiting for admin approval.',
      data: {
        idPhoto: user.idPhoto,
        idStatus: user.idStatus
      }
    });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Check for specific Cloudinary errors
    if (error.http_code && error.http_code === 413) {
      return res.status(400).json({
        success: false,
        error: 'Image too large. Please compress your image.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload photo'
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

// ============================================
// NEW FUNCTIONS FOR APPLICANT DASHBOARD
// ============================================

// @desc    Upload CV
// @route   POST /api/users/upload-cv
// @access  Private
exports.uploadCV = async (req, res) => {
  try {
    const { cv } = req.body;
    
    if (!cv) {
      return res.status(400).json({
        success: false,
        error: 'CV file is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { cv: cv },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'CV uploaded successfully',
      data: { cv: user.cv }
    });
  } catch (error) {
    console.error('Upload CV error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Upload document (general) - This is the original uploadDocument function
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
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update comment
// @route   PUT /api/users/update-comment
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    const { comment } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { comment: comment || '' },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: { comment: user.comment }
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update payment info
// @route   PUT /api/users/update-payment
// @access  Private
exports.updatePaymentInfo = async (req, res) => {
  try {
    const { paymentPhone, paymentScreenshot } = req.body;

    const updateData = {};
    if (paymentPhone) updateData.paymentPhone = paymentPhone;
    if (paymentScreenshot) updateData.paymentScreenshot = paymentScreenshot;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Payment info updated successfully',
      data: {
        paymentPhone: user.paymentPhone,
        paymentScreenshot: user.paymentScreenshot,
        paymentStatus: user.paymentStatus
      }
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Upload payment screenshot
// @route   POST /api/users/upload-payment
// @access  Private
exports.uploadPaymentScreenshot = async (req, res) => {
  try {
    const { screenshot } = req.body;
    
    if (!screenshot) {
      return res.status(400).json({
        success: false,
        error: 'Screenshot is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        paymentScreenshot: screenshot,
        paymentStatus: 'pending'
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Payment screenshot uploaded successfully',
      data: {
        paymentScreenshot: user.paymentScreenshot,
        paymentStatus: user.paymentStatus
      }
    });
  } catch (error) {
    console.error('Upload payment screenshot error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update interview status (Admin only)
// @route   PUT /api/users/:userId/interview-status
// @access  Private/Admin
exports.updateInterviewStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { interviewStatus, interviewDate, interviewNotes } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        interviewStatus,
        interviewDate: interviewDate || null,
        interviewNotes: interviewNotes || ''
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Interview status updated successfully',
      data: {
        interviewStatus: user.interviewStatus,
        interviewDate: user.interviewDate,
        interviewNotes: user.interviewNotes
      }
    });
  } catch (error) {
    console.error('Update interview status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Verify payment (Admin only)
// @route   PUT /api/users/:userId/verify-payment
// @access  Private/Admin
exports.verifyPayment = async (req, res) => {
  try {
    const { userId } = req.params;
    const { paymentStatus } = req.body; // 'verified' or 'rejected'

    const user = await User.findByIdAndUpdate(
      userId,
      { paymentStatus },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `Payment ${paymentStatus} successfully`,
      data: {
        paymentStatus: user.paymentStatus
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
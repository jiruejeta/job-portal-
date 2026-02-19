const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Import credential generator
const { generateUsername, generatePassword, hashPassword } = require('../utils/generateCredentials');

// @desc    Submit job application (PUBLIC - no login required)
// @route   POST /api/applications/apply
// @access  Public
exports.applyForJob = async (req, res) => {
  try {
    const { 
      applicantName, 
      email, 
      phone,
      gpa, 
      exitExam, 
      jobId 
    } = req.body;

    // Validate required fields
    if (!applicantName || !email || !phone || !gpa || !exitExam || !jobId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide: name, email, phone, GPA, exit exam, and job ID'
      });
    }

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    if (!job.isActive) {
      return res.status(400).json({
        success: false,
        error: 'This job is no longer accepting applications'
      });
    }

    // Check if deadline has passed
    if (new Date(job.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Application deadline has passed'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ email, jobId });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied for this job'
      });
    }

    // Create application
    const application = await Application.create({
      applicantName,
      email,
      phone,
      gpa,
      exitExam,
      jobId,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        id: application._id,
        applicantName: application.applicantName,
        email: application.email,
        phone: application.phone,
        jobId: application.jobId,
        status: application.status,
        appliedAt: application.appliedAt
      }
    });

  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all applications (Admin only)
// @route   GET /api/applications
// @access  Private (Admin)
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('jobId', 'title department')
      .sort('-appliedAt');

    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get pending applications (Admin only)
// @route   GET /api/applications/pending
// @access  Private (Admin)
exports.getPendingApplications = async (req, res) => {
  try {
    const applications = await Application.find({ status: 'pending' })
      .populate('jobId', 'title department')
      .sort('-appliedAt');

    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Approve application and generate credentials
// @route   PUT /api/applications/:id/approve
// @access  Private (Admin)
exports.approveApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('jobId');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Application already ${application.status}`
      });
    }

    // GENERATE CREDENTIALS
    // Generate username and password
    let plainUsername = generateUsername(application.applicantName);
    const plainPassword = generatePassword(application.applicantName);
    const hashedPassword = await hashPassword(plainPassword);

    // Check if username already exists (rare but possible)
    const existingUser = await User.findOne({ username: plainUsername });
    if (existingUser) {
      // Add another random number if username exists
      plainUsername = `${plainUsername}${Math.floor(10 + Math.random() * 90)}`;
    }

    // Create user account
    const user = await User.create({
      name: application.applicantName,
      username: plainUsername,
      password: hashedPassword,
      role: 'applicant',
      department: application.jobId ? application.jobId.department : 'General',
      isApproved: true,
      phone: application.phone,
      email: application.email
    });

    // Update application with generated credentials
    application.status = 'approved';
    application.generatedUsername = plainUsername;
    application.generatedPassword = plainPassword; // Store plain password temporarily
    await application.save();

    // Return success with credentials
    res.json({
      success: true,
      message: 'Application approved successfully. User account created.',
      data: {
        application: {
          id: application._id,
          status: application.status
        },
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          password: plainPassword, // SEND ONLY ONCE!
          email: user.email,
          role: user.role
        },
        notice: '⚠️ Please save these credentials. They will not be shown again.'
      }
    });

  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Reject application
// @route   PUT /api/applications/:id/reject
// @access  Private (Admin)
exports.rejectApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Application already ${application.status}`
      });
    }

    // Update application status
    application.status = 'rejected';
    await application.save();

    res.json({
      success: true,
      message: 'Application rejected successfully',
      data: {
        id: application._id,
        applicantName: application.applicantName,
        status: application.status
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private (Admin)
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get approved applications (Admin only)
// @route   GET /api/applications/approved
// @access  Private (Admin)
exports.getApprovedApplications = async (req, res) => {
  try {
    const applications = await Application.find({ status: 'approved' })
      .populate('jobId', 'title department')
      .sort('-appliedAt');

    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get rejected applications (Admin only)
// @route   GET /api/applications/rejected
// @access  Private (Admin)
exports.getRejectedApplications = async (req, res) => {
  try {
    const applications = await Application.find({ status: 'rejected' })
      .populate('jobId', 'title department')
      .sort('-appliedAt');

    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
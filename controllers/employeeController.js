const Employee = require('../models/Employee');
const QRCode = require('qrcode');

// @desc    Get employee profile for logged-in user
// @route   GET /api/employee/profile
// @access  Private (Applicant)
exports.getEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id })
      .populate('jobId', 'title department description salary location jobType');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee record not found'
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Upload employee photo (3x4 format)
// @route   POST /api/employee/photo
// @access  Private (Applicant)
exports.uploadPhoto = async (req, res) => {
  try {
    const { photo } = req.body; // base64 image
    
    if (!photo) {
      return res.status(400).json({
        success: false,
        error: 'Photo is required'
      });
    }

    const employee = await Employee.findOne({ userId: req.user.id });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee record not found'
      });
    }

    // Update photo
    employee.photo = photo;
    employee.photoUploadedAt = new Date();
    await employee.save();

    // Regenerate QR code with updated info (including photo reference)
    const qrData = JSON.stringify({
      id: employee.employeeId,
      name: employee.fullName,
      job: employee.jobTitle,
      dept: employee.department,
      hasPhoto: true,
      date: new Date().toISOString().split('T')[0]
    });
    
    const qrCodeDataURL = await QRCode.toDataURL(qrData);
    employee.qrCode = qrCodeDataURL;
    await employee.save();

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        photo: employee.photo,
        qrCode: employee.qrCode
      }
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all employees (Admin only)
// @route   GET /api/employee/all
// @access  Private (Admin)
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('userId', 'name email')
      .populate('jobId', 'title department')
      .sort('-createdAt');
    
    res.json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single employee by ID (Admin only)
// @route   GET /api/employee/:id
// @access  Private (Admin)
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('userId', 'name email username')
      .populate('jobId', 'title department description salary location jobType');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
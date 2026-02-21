const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  // Link to user account
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Link to application
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  
  // Link to job
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  
  // Employee ID (unique) - Format: EMP-YYYY-XXXX
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Personal Information (from application)
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  
  // Photo (to be uploaded later)
  photo: {
    type: String,
    default: ''
  },
  photoUploadedAt: {
    type: Date
  },
  
  // Job Details (from job posting)
  jobTitle: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  salary: {
    type: String
  },
  location: {
    type: String
  },
  jobType: {
    type: String
  },
  
  // Employment Details
  startDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  
  // QR Code (generated automatically)
  qrCode: {
    type: String, // Will store as base64
  },
  qrCodeGeneratedAt: {
    type: Date
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
employeeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Generate a unique employee ID
employeeSchema.statics.generateEmployeeId = async function() {
  const prefix = 'EMP';
  const year = new Date().getFullYear().toString().slice(-2); // 24 for 2024
  
  // Find the last employee to get the sequence number
  const lastEmployee = await this.findOne().sort({ employeeId: -1 });
  
  let sequence = 1;
  if (lastEmployee && lastEmployee.employeeId) {
    // Extract the sequence number from last employee ID (EMP-24-0001 -> 1)
    const lastSeq = parseInt(lastEmployee.employeeId.split('-')[2]);
    sequence = lastSeq + 1;
  }
  
  // Format: EMP-YY-XXXX (e.g., EMP-24-0001)
  const employeeId = `${prefix}-${year}-${sequence.toString().padStart(4, '0')}`;
  
  return employeeId;
};

module.exports = mongoose.model('Employee', employeeSchema);
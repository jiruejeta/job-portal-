const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicantName: {
    type: String,
    required: [true, 'Applicant name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  gpa: {
    type: Number,
    required: [true, 'GPA is required'],
    min: [0, 'GPA cannot be less than 0'],
    max: [4, 'GPA cannot be more than 4']
  },
  exitExam: {
    type: String,
    required: [true, 'Exit exam result is required'],
    trim: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  generatedUsername: {
    type: String,
    trim: true
  },
  generatedPassword: {
    type: String,
    trim: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one applicant can only apply once per job
applicationSchema.index({ email: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
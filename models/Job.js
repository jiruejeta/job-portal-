const mongoose = require('mongoose');

// Check if the model already exists to prevent overwrite error
const Job = mongoose.models.Job || mongoose.model('Job', new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    text: true  // Add text index here instead of separate index
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    index: true  // Add index here
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    text: true
  },
  requirements: {
    type: String,
    required: [true, 'Requirements are required'],
    text: true
  },
  salary: {
    type: String,
    trim: true,
    index: true
  },
  location: {
    type: String,
    trim: true,
    index: true
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship', ''],
    default: '',
    index: true
  },
  benefits: {
    type: String,
    trim: true
  },
  responsibilities: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    trim: true
  },
  education: {
    type: String,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  deadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}));

// Update the updatedAt timestamp on save
Job.schema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Remove the separate schema.index() calls to avoid duplicates

module.exports = Job;
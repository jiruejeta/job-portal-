const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined values
    trim: true
  },
  password: {
    type: String
  },
  role: {
    type: String,
    enum: ['admin', 'applicant'],
    default: 'applicant'
  },
  department: {
    type: String,
    trim: true
  },
  faydaId: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  documents: [{
    type: String, // URLs to uploaded documents
    trim: true
  }],
  isApproved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
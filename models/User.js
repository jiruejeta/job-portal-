const mongoose = require('mongoose');

// Check if the model already exists to prevent overwrite error
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  password: {
    type: String
  },
  role: {
    type: String,
    enum: ['admin', 'applicant'],
    default: 'applicant',
    index: true
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
  email: {
    type: String,
    trim: true,
    lowercase: true,
    index: true
  },
  documents: [{
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isApproved: {
    type: Boolean,
    default: false,
    index: true
  },
  // ID Card Fields - For Photo Upload
  idPhoto: {
    type: String,
    default: ''
  },
  idNumber: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  idStatus: {
    type: String,
    enum: ['pending', 'active', 'rejected', 'expired'],
    default: 'pending',
    index: true
  },
  idIssueDate: {
    type: Date
  },
  idExpiryDate: {
    type: Date
  },
  idRejectionReason: {
    type: String,
    default: null
  },
  idPhotoUploadedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}));

// Update the updatedAt timestamp on save
User.schema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for faster queries
User.schema.index({ email: 1 });
User.schema.index({ role: 1 });
User.schema.index({ idNumber: 1 });
User.schema.index({ idStatus: 1 });
User.schema.index({ isApproved: 1 });

// Compound index for searching
User.schema.index({ 
  name: 'text', 
  email: 'text', 
  username: 'text' 
});

module.exports = User;
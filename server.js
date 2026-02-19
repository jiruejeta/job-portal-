const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import models
require('./models/User');
require('./models/Job');
require('./models/Application');

// Import routes - ONLY ONCE!
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const userRoutes = require('./routes/userRoutes'); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Database:', mongoose.connection.name);
  })
  .catch(err => {
    console.log('❌ MongoDB Connection Error:');
    console.log(err.message);
  });

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Job Portal API is Running!',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// Test DB route
app.get('/api/test-db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.json({
      databaseStatus: states[dbState] || 'unknown',
      databaseName: mongoose.connection.name || 'not connected',
      message: dbState === 1 ? '✅ Database is connected' : '❌ Database is not connected'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test models route
app.get('/api/test-models', async (req, res) => {
  try {
    const models = {
      User: mongoose.modelNames().includes('User'),
      Job: mongoose.modelNames().includes('Job'),
      Application: mongoose.modelNames().includes('Application')
    };
    
    res.json({
      message: 'Models loaded successfully',
      models: models,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mount routes - ONLY ONCE!
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes); 
// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📍 Test the API: http://localhost:${PORT}`);
  console.log(`📍 Test DB: http://localhost:${PORT}/api/test-db`);
  console.log(`📍 Users API: http://localhost:${PORT}/api/users`);
  console.log(`📍 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📍 Jobs API: http://localhost:${PORT}/api/jobs`);
  console.log(`📍 Applications API: http://localhost:${PORT}/api/applications`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
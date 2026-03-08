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
const employeeRoutes = require('./routes/employeeRoutes');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection with options to fix DNS issues
console.log('🔌 Connecting to MongoDB...');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');
console.log('🔑 MongoDB URI:', process.env.MONGO_URI ? '✅ URI exists' : '❌ URI missing');

// Connection options to fix DNS issues on Windows
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  family: 4, // Force IPv4 (this is the key fix for Windows!)
  retryWrites: true,
  w: 'majority',
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 2, // Maintain at least 2 socket connections
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
};

mongoose.connect(process.env.MONGO_URI, mongooseOptions)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📁 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
  })
  .catch(err => {
    console.log('❌ MongoDB Connection Error:');
    console.log('📛 Error name:', err.name);
    console.log('🔢 Error code:', err.code);
    console.log('💬 Error message:', err.message);
    
    // Additional helpful troubleshooting info
    if (err.name === 'MongooseServerSelectionError') {
      console.log('\n🔍 Troubleshooting tips:');
      console.log('1️⃣ Check if your IP is whitelisted in MongoDB Atlas');
      console.log('2️⃣ Verify your username and password are correct');
      console.log('3️⃣ Try using Google DNS (8.8.8.8)');
      console.log('4️⃣ Check if your network blocks MongoDB ports');
      console.log('5️⃣ Try switching to standard connection string instead of SRV');
    }
    
    if (err.code === 'ENOTFOUND') {
      console.log('\n🌐 DNS Resolution Error:');
      console.log('• Try flushing DNS: ipconfig /flushdns');
      console.log('• Change DNS to 8.8.8.8');
      console.log('• Restart your router');
    }
  });

// Debug route to check environment variables (remove in production)
app.get('/api/debug-env', (req, res) => {
  const mongoURI = process.env.MONGO_URI || 'not set';
  // Hide password for security
  const maskedURI = mongoURI.replace(/:[^:]*@/, ':****@');
  
  res.json({
    nodeEnv: process.env.NODE_ENV,
    mongoURI: maskedURI,
    cloudinaryConfig: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? '✅ set' : '❌ not set',
      apiKey: process.env.CLOUDINARY_API_KEY ? '✅ set' : '❌ not set',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? '✅ set' : '❌ not set'
    },
    serverTime: new Date().toISOString()
  });
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
    
    // Get connection stats
    const stats = {
      state: states[dbState] || 'unknown',
      database: mongoose.connection.name || 'not connected',
      host: mongoose.connection.host || 'unknown',
      port: mongoose.connection.port || 'unknown',
      models: Object.keys(mongoose.models).length
    };
    
    res.json({
      success: dbState === 1,
      databaseStatus: stats.state,
      databaseName: stats.database,
      host: stats.host,
      port: stats.port,
      activeModels: stats.models,
      message: dbState === 1 ? '✅ Database is connected' : '❌ Database is not connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
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
      success: true,
      message: 'Models loaded successfully',
      models: models,
      count: Object.values(models).filter(Boolean).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Mount routes - ONLY ONCE!
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/employee', employeeRoutes);

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
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 ==================================`);
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📍 Test API: http://localhost:${PORT}`);
  console.log(`📍 Test DB: http://localhost:${PORT}/api/test-db`);
  console.log(`📍 Debug Env: http://localhost:${PORT}/api/debug-env`);
  console.log(`📍 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📍 Jobs API: http://localhost:${PORT}/api/jobs`);
  console.log(`📍 Applications API: http://localhost:${PORT}/api/applications`);
  console.log(`📍 Users API: http://localhost:${PORT}/api/users`);
  console.log(`📍 Employee API: http://localhost:${PORT}/api/employee`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================\n`);
});
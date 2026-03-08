const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import models
require('./models/User');
require('./models/Job');
require('./models/Application');

// Import routes
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

// MongoDB Connection
console.log('🔌 Connecting to MongoDB...');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');
console.log('🔑 MongoDB URI:', process.env.MONGO_URI ? '✅ URI exists' : '❌ URI missing');

const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  w: 'majority',
  maxPoolSize: 10,
  minPoolSize: 2,
  connectTimeoutMS: 10000,
};

mongoose.connect(process.env.MONGO_URI, mongooseOptions)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📁 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
  })
  .catch(err => {
    console.log('❌ MongoDB Connection Error:', err.message);
  });

// Debug route to check environment variables
app.get('/api/debug-env', (req, res) => {
  const mongoURI = process.env.MONGO_URI || 'not set';
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
    
    res.json({
      success: dbState === 1,
      databaseStatus: states[dbState] || 'unknown',
      databaseName: mongoose.connection.name || 'not connected',
      message: dbState === 1 ? '✅ Database is connected' : '❌ Database is not connected',
      timestamp: new Date().toISOString()
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
      success: true,
      message: 'Models loaded successfully',
      models: models,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DEBUG ROUTES - Add this to see all registered routes
app.get('/api/debug-routes', (req, res) => {
  const routes = [];
  
  const extractRoutes = (stack, basePath = '') => {
    stack.forEach(layer => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        routes.push({
          path: basePath + layer.route.path,
          methods: methods
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        extractRoutes(layer.handle.stack, basePath + (layer.regexp.source
          .replace('\\/?(?=\\/|$)', '')
          .replace(/\\\//g, '/')
          .replace(/\^/g, '')
          .replace(/\?/g, '')));
      }
    });
  };
  
  extractRoutes(app._router.stack);
  res.json({
    totalRoutes: routes.length,
    routes: routes.sort((a, b) => a.path.localeCompare(b.path))
  });
});

// Mount routes - ORDER MATTERS! Auth first, then others
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
  console.log(`📍 Debug Routes: http://localhost:${PORT}/api/debug-routes`);
  console.log(`📍 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📍 Jobs API: http://localhost:${PORT}/api/jobs`);
  console.log(`📍 Applications API: http://localhost:${PORT}/api/applications`);
  console.log(`📍 Users API: http://localhost:${PORT}/api/users`);
  console.log(`📍 Employee API: http://localhost:${PORT}/api/employee`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================\n`);
});
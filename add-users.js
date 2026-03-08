// backend/scripts/add-users-direct.js
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function addUsers() {
  const client = new MongoClient(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    family: 4
  });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('jobportal');
    const usersCollection = db.collection('users');
    
    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('admin123', salt);
    const testHash = await bcrypt.hash('password123', salt);
    
    // Check if admin exists
    const adminExists = await usersCollection.findOne({ username: 'admin' });
    if (!adminExists) {
      await usersCollection.insertOne({
        name: 'Admin User',
        username: 'admin',
        password: adminHash,
        role: 'admin',
        isApproved: true,
        email: 'admin@example.com',
        idStatus: 'active',
        createdAt: new Date()
      });
      console.log('✅ Admin user created');
    } else {
      console.log('⏭️ Admin already exists');
    }
    
    // Check if test user exists
    const testExists = await usersCollection.findOne({ username: 'testid4540' });
    if (!testExists) {
      await usersCollection.insertOne({
        name: 'Test User',
        username: 'testid4540',
        password: testHash,
        role: 'applicant',
        isApproved: true,
        email: 'test@example.com',
        idStatus: 'pending',
        createdAt: new Date()
      });
      console.log('✅ Test user created');
    } else {
      console.log('⏭️ Test user already exists');
    }
    
    // Show all users
    const users = await usersCollection.find({}, { 
      projection: { username: 1, role: 1, _id: 0 } 
    }).toArray();
    
    console.log('\n📊 Users in database:');
    users.forEach(u => console.log(`  - ${u.username} (${u.role})`));
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.close();
    console.log('👋 Disconnected');
  }
}

addUsers();
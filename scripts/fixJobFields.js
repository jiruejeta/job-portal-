const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define Job Schema directly in the script to avoid model conflicts
const jobSchema = new mongoose.Schema({
  title: String,
  department: String,
  description: String,
  requirements: String,
  salary: String,
  location: String,
  jobType: String,
  deadline: Date,
  createdBy: mongoose.Schema.Types.ObjectId,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Use existing model or create new one
const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

// Define User Schema
const userSchema = new mongoose.Schema({
  name: String,
  role: String
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const fixJobFields = async () => {
  try {
    await connectDB();

    // Find an admin user to use as createdBy if needed
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('⚠️  No admin found. Jobs may not have createdBy field.');
    } else {
      console.log(`✅ Found admin: ${admin.name}`);
    }

    // Find all jobs
    const jobs = await Job.find({});
    console.log(`📊 Found ${jobs.length} jobs to check`);

    let updated = 0;
    let skipped = 0;

    for (const job of jobs) {
      const updates = {};
      let needsUpdate = false;

      // Check and fix salary
      if (!job.salary || job.salary === 'Not specified' || job.salary === '') {
        updates.salary = 'Competitive (To be discussed)';
        needsUpdate = true;
      }

      // Check and fix location
      if (!job.location || job.location === 'Not specified' || job.location === '') {
        updates.location = 'Addis Ababa, Ethiopia';
        needsUpdate = true;
      }

      // Check and fix jobType
      if (!job.jobType || job.jobType === '') {
        updates.jobType = 'Full-time';
        needsUpdate = true;
      }

      // Check and fix createdBy
      if (!job.createdBy && admin) {
        updates.createdBy = admin._id;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Job.findByIdAndUpdate(job._id, updates);
        console.log(`✅ Updated job: ${job.title || 'Untitled'}`);
        console.log(`   Added: ${Object.keys(updates).join(', ')}`);
        updated++;
      } else {
        console.log(`⏭️  Job OK: ${job.title}`);
        skipped++;
      }
    }

    console.log('\n=== Fix Complete ===');
    console.log(`✅ Updated: ${updated} jobs`);
    console.log(`⏭️  Skipped: ${skipped} jobs`);
    console.log(`📊 Total: ${jobs.length} jobs`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

fixJobFields();
const mongoose = require('mongoose');

// User schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'manager', 'user'], default: 'user' },
  position: { type: String },
  hubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub' },
  hubName: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
  lastLogin: { type: Date },
  emailVerified: { type: Date },
  image: { type: String }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function createUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lm-dashboard');
    console.log('Connected to MongoDB');

    // Replace with your actual email address
    const userEmail = 'your-email@gmail.com'; // CHANGE THIS TO YOUR GMAIL
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: userEmail });
    
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      console.log('Current status:', existingUser.status);
      
      // Update to active if needed
      if (existingUser.status !== 'active') {
        await User.updateOne(
          { email: userEmail },
          { status: 'active' }
        );
        console.log('Updated user status to active');
      }
    } else {
      // Create new user
      const newUser = new User({
        name: 'Admin User',
        email: userEmail,
        role: 'admin',
        position: 'Administrator',
        status: 'active'
      });

      await newUser.save();
      console.log('Created new user:', userEmail);
    }

    console.log('User setup complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createUser();

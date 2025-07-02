import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // NextAuth required fields
  name: {
    type: String,
    required: false, // Made optional as NextAuth handles this
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  emailVerified: {
    type: Date,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  
  // Custom fields for your application
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  position: {
    type: String,
    required: false, // Made optional since new OAuth users won't have this initially
  },
  
  // Additional tracking fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ name: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
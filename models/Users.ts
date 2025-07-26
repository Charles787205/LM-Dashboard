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
    enum: ['admin', 'manager', 'user'],
    default: 'user'
  },
  department: {
    type: String,
    required: false
  },
  position: {
    type: String,
    required: false, // Made optional since new OAuth users won't have this initially
  },
  phone: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  hubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hub',
    required: false
  },
  hubName: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  employeeId: {
    type: String,
    required: false,
    unique: true,
    sparse: true // Allows multiple null values
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  // Delivery stats for drivers
  totalDeliveries: {
    type: Number,
    default: 0
  },
  successfulDeliveries: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
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

// Index for faster queries (email and employeeId already have unique indexes from schema)
UserSchema.index({ name: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ hubId: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
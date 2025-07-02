import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  sessionToken: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expires: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
SessionSchema.index({ sessionToken: 1 }, { unique: true });
SessionSchema.index({ userId: 1 });
SessionSchema.index({ expires: 1 });

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);

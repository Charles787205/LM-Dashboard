import mongoose from 'mongoose';

const HubCommentSchema = new mongoose.Schema({
   hub_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hub',
      required: true
   },
   user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000 // Reasonable limit for comments
   }
}, {
   timestamps: true // This adds createdAt and updatedAt automatically
});

// Add indexes for better query performance
HubCommentSchema.index({ hub_id: 1, createdAt: -1 }); // For fetching comments by hub
HubCommentSchema.index({ user_id: 1, createdAt: -1 }); // For fetching comments by user

export default mongoose.models.HubComment || mongoose.model('HubComment', HubCommentSchema);

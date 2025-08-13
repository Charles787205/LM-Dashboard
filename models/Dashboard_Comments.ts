import mongoose from 'mongoose';

const DashboardCommentSchema = new mongoose.Schema({
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
   },
   dashboard_type: {
      type: String,
      enum: ['analytics', 'main', 'reports', 'hubs'],
      default: 'analytics',
      required: true
   }
}, {
   timestamps: true // This adds createdAt and updatedAt automatically
});

// Add indexes for better query performance
DashboardCommentSchema.index({ dashboard_type: 1, createdAt: -1 }); // For fetching comments by dashboard type
DashboardCommentSchema.index({ user_id: 1, createdAt: -1 }); // For fetching comments by user

export default mongoose.models.DashboardComment || mongoose.model('DashboardComment', DashboardCommentSchema);

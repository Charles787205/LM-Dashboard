import mongoose from 'mongoose';


const HubCostSchema = new mongoose.Schema({
  hub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hub',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    required: true,
    default: 0
  },
  cost_type: {
    type: String,
    enum: ['monthly', 'weekly', 'daily', "one-time"],
    required: true
  },
  date: {
    type: Date,
    required: function(this: any) {
      return this.cost_type === "one-time";
    }
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});
export default mongoose.models.HubCost || mongoose.model('HubCost', HubCostSchema);
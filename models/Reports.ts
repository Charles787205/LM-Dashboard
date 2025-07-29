import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  hub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hub',
    required: true
  },
  inbound: {
    type: Number,
    default: 0,
    required: true
  },
  outbound: {
    type: Number,
    default: 0,
    required: true
  },
  backlogs: {
    type: Number,
    default: 0,
    required: true
  },
  delivered: {
    type: Number,
    required: true
  },
  failed: {
    type: Number,
    required: true
  },
  misroutes: {
    type: Number,
    default: 0,
    required: true
  },
  //2w or 3w
  attendance: {
    hub_lead: {
      type: Number,
      default: 0,
      required: true
    },
    backroom: {
      type: Number,
      default: 0,
      required: true
    }
  },
  trips: {
    "2w": {
      type: Number,
      default: 0,
      required: true
    },
    "3w": {
      type: Number,
      default: 0,
      required: true
    },
    "4w": {
      type: Number,
      default: 0,
      required: true
    }
  },
  successful_deliveries: {
    "2w": {
      type: Number,
      default: 0,
      required: true
    },
    "3w": {
      type: Number,
      default: 0,
      required: true
    },
    "4w": {
      type: Number,
      default: 0,
      required: true
    }
  },
  date: {
    type: Date,
    default: Date.now
  },
  // Calculated fields (automatically computed)
  sdod: {
    type: Number,
    default: 0,
    required: false // Will be calculated automatically
  },
  successRate: {
    type: Number,
    default: 0,
    required: false // Will be calculated automatically
  },
  failedRate: {
    type: Number,
    default: 0,
    required: false // Will be calculated automatically
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Pre-save middleware to calculate SDOD, success rate, and failed rate
reportSchema.pre('save', function(next) {
  // Calculate SDOD: outbound / (inbound + backlogs)
  const totalIncoming = this.inbound + this.backlogs;
  if (totalIncoming > 0) {
    this.sdod = (this.outbound / totalIncoming) * 100;
  } else {
    this.sdod = 0;
  }

  // Calculate success rate and failed rate
  const totalProcessed = this.delivered + this.failed;
  if (totalProcessed > 0) {
    this.successRate = (this.delivered / totalProcessed) * 100;
    this.failedRate = (this.failed / totalProcessed) * 100;
  } else {
    this.successRate = 0;
    this.failedRate = 0;
  }

  next();
});

// Pre-update middleware for findOneAndUpdate operations
reportSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
  const update = this.getUpdate() as any;
  
  if (update) {
    // Get the fields that might be updated
    const inbound = update.inbound ?? update.$set?.inbound;
    const outbound = update.outbound ?? update.$set?.outbound;
    const backlogs = update.backlogs ?? update.$set?.backlogs;
    const delivered = update.delivered ?? update.$set?.delivered;
    const failed = update.failed ?? update.$set?.failed;

    // Only calculate if we have the necessary fields
    if (inbound !== undefined || outbound !== undefined || backlogs !== undefined || 
        delivered !== undefined || failed !== undefined) {
      
      // Ensure $set exists
      if (!update.$set) {
        update.$set = {};
      }

      // Calculate SDOD if we have the required fields
      if (outbound !== undefined && inbound !== undefined && backlogs !== undefined) {
        const totalIncoming = inbound + backlogs;
        if (totalIncoming > 0) {
          update.$set.sdod = (outbound / totalIncoming) * 100;
        } else {
          update.$set.sdod = 0;
        }
      }

      // Calculate success/failed rates if we have the required fields
      if (delivered !== undefined && failed !== undefined) {
        const totalProcessed = delivered + failed;
        if (totalProcessed > 0) {
          update.$set.successRate = (delivered / totalProcessed) * 100;
          update.$set.failedRate = (failed / totalProcessed) * 100;
        } else {
          update.$set.successRate = 0;
          update.$set.failedRate = 0;
        }
      }
    }
  }

  next();
});

export default mongoose.models.Report || mongoose.model('Report', reportSchema);
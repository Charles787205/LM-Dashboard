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
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
})

export default mongoose.models.Report || mongoose.model('Report', reportSchema);
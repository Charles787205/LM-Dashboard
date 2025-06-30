import mongoose from 'mongoose';
import Hub from './Hubs'

const reportSchema = new mongoose.Schema({
  hub: Hub,
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
      
    },
    "3w": {
      type: Number
    },
    "4w": {
      type: Number
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.models.Report || mongoose.model('Report', reportSchema);
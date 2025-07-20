import mongoose from 'mongoose';

const FailedDeliverySchema = new mongoose.Schema({
  report: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  canceled_bef_delivery: {
    type: Number,
    required: true,
    default: 0
  },
  no_cash_available: {
    type: Number,
    required: true,
    default: 0
  },
  postpone: {
    type: Number,
    required: true,
    default: 0
  },
  not_at_home: {
    type: Number,
    required: true,
    default: 0
  },
  refuse: {
    type: Number,
    required: true,
    default: 0
  },
  unreachable: {
    type: Number,
    required: true,
    default: 0
  },
  invalid_address: {
    type: Number,
    required: true,
    default: 0
  },
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

export default mongoose.models.FailedDelivery || mongoose.model('FailedDelivery', FailedDeliverySchema);
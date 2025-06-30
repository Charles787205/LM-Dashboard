import mongoose from 'mongoose';


const FinancialsSchema = new mongoose.Schema({
  hub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hub',
    required: true
  },
  cost: {
    type: Number,
    required: true,
    default: 0
  },
  revenue: {
    type: Number,
    required: true,
    default: 0
  },
  profit: {
    type: Number,
    required: true,
    default: 0
  }});

export default mongoose.models.Financials || mongoose.model('Financials', FinancialsSchema);
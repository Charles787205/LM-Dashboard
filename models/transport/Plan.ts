import { model, Schema, models } from 'mongoose';

console.log('Loading Plan model...');

const PlanSchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  origin: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
  numberOfTrips: {
    type: Number,
    required: true,
  },
  fulfillment: {
    type: Number,
    default: 0,
  },
  remarks: {
    type: String,
    default: '',
  },
  actuals: [{ type: Schema.Types.ObjectId, ref: 'Actual' }],
}, { timestamps: true });

// Virtual field to calculate fulfillment percentage
PlanSchema.virtual('fulfillmentPercentage').get(function() {
  if (this.numberOfTrips === 0) return 0;
  return Math.round((this.actuals.length / this.numberOfTrips) * 100);
});

// Ensure virtual fields are serialized
PlanSchema.set('toJSON', { virtuals: true });
PlanSchema.set('toObject', { virtuals: true });

const Plan = models.Plan || model('Plan', PlanSchema);
console.log('Plan model registered:', !!Plan);

export default Plan;
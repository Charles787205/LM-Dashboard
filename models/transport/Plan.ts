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
  // Ensure numberOfTrips exists and is valid
  if (!this.numberOfTrips || this.numberOfTrips === 0) return 0;
  
  // Handle case where actuals might be undefined, null, or not an array
  let actualsCount = 0;
  if (this.actuals) {
    if (Array.isArray(this.actuals)) {
      actualsCount = this.actuals.length;
    } else if (typeof this.actuals === 'number') {
      // In case it's already a count
      actualsCount = this.actuals;
    }
  }
  
  return Math.round((actualsCount / this.numberOfTrips) * 100);
});

// Ensure virtual fields are serialized
PlanSchema.set('toJSON', { virtuals: true });
PlanSchema.set('toObject', { virtuals: true });

const Plan = models.Plan || model('Plan', PlanSchema);
console.log('Plan model registered:', !!Plan);

export default Plan;
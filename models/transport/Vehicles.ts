import { models, Schema, model } from 'mongoose';

const VehicleSchema = new Schema({
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
  },
  vehicleType: {
    type: String,
    enum: ["10WV", "4W", "6W", "6WF"],
    required: true,
  },
  vehicle_plate_number: {
    type: String,
    required: true,
    unique: true,
  },
  driver: {
    type: Schema.Types.ObjectId,
    ref: 'Driver',
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true,
  }
}, { timestamps: true });

export default models.Vehicle || model('Vehicle', VehicleSchema);
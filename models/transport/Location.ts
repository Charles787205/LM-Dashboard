import { model, Schema, models } from 'mongoose';

const LocationSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  //destination or origin or both
  type: {
    type: String,
    enum: ['origin', 'destination', 'both'],
    required: true,
  },
}, {
  timestamps: true
})

export default models.Location || model('Location', LocationSchema);
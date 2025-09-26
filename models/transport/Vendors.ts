import { Schema, model, models } from 'mongoose';

const VendorSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  bu_assignment: {
    type: String,
  },
  email_address: {
    type: String,
    required: true,
  },
  contact_number: {
    type: String,
    required: true,
  },
  emergency_contact_person: {
    type: String,
    required: true,
  },
  emergency_contact_number: {
    type: String,
  },
  service_type: {
    type: String,
    enum: ["Oncall", "Dedicated", "WetLease"],
    required: true,
  },
  address: {
    type: String,
  },
  vehicles: [{
    type: Schema.Types.ObjectId,
    ref: 'Vehicle'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

export default models.Vendor || model('Vendor', VendorSchema);
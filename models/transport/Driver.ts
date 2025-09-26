import { models, Schema, model } from 'mongoose';


const DriverSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true,
  },
  helper: [{ type: Schema.Types.ObjectId, ref: 'Helper' }],
  isActive: {
    type: Boolean,
    default: true,
  },
  //timestamp
},
  { timestamps: true }
)

const HelperSchema = new Schema({
  firstName: {
    type: String,

    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  //timestamp
},
  { timestamps: true }
)

export const Helper = models.Helper || model('Helper', HelperSchema);
export default models.Driver || model('Driver', DriverSchema);
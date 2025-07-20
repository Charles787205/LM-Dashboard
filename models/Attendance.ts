import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  report: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  hub_lead: {
    type: Number,
    required: true,
    default: 0
  },
  backroom: {
    type: Number,
    required: true,
    default: 0
  },
  drivers_2w: {
    type: Number,
    required: true,
    default: 0
  },
  drivers_3w: {
    type: Number,
    required: true,
    default: 0
  },
  drivers_4w: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
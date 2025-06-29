import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
  },
  position: {
    type: String,
    required: true,
  }
  


})

export default mongoose.models.User || mongoose.model('User', UserSchema)
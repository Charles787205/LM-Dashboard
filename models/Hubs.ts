import mongoose from 'mongoose';


const HubSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
      unique: true  
   },
   client: {
      type: String,
      enum: ["LEX", "2GO", "SPX"],
      required: true
   }
})

export default mongoose.models.Hub || mongoose.model('Hub', HubSchema)
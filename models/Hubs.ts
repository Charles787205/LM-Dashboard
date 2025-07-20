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
   },
   hub_cost_per_parcel: {
      "2W": {
         type: Number,
         required: true,
         default: 0}
         ,
      "3W": {
         type: Number,
         required: true,
         default: 0},
      "4W": {
         type: Number,  
         required: true,
         default: 0}
   },
   hub_profit_per_parcel: {
      "2W": {
         type: Number,
         required: true,
         default: 0},
      "3W": {
         type: Number,
         required: true,
         default: 0},
      "4W": {
         type: Number,
         required: true,
         default: 0} 
   }
   
}, {
   timestamps: true // This adds createdAt and updatedAt automatically
})

export default mongoose.models.Hub || mongoose.model('Hub', HubSchema)
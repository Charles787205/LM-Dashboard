import { model, Schema, models } from 'mongoose';


const CalltimeSchema = new Schema({
  callTime: {
    type: Date,
    required: true,
  },
  arrival: {
    type: Date,
    
  }
})
const OdometerSchema = new Schema({
  start: {
    type: Number,
   
  },
  end: {
    type: Number,

  }
})
const TripSchema = new Schema({
  departureTime: {
    type: Date,
    required: true,
  },
  arrivalTime: {
    type: Date,
    required: true,
  },
  totalParcels: {
    type: Number,
    required: true,
  },
  odometer: OdometerSchema,
  destination: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  }
});
const TimeSchema = new Schema({
  timeIn: {
    type: Date,
   
  },
  timeOut: {
    type: Date,
    
  },
})
const ActualSchema = new Schema({
  plan: {
    type: Schema.Types.ObjectId,
    ref: 'Plan',
    required: true,
  },
  vehicle: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  status: {
    type: String,
    enum: ["completed", "canceled"],
    required: true,
  },
  linhaulTripNumber: {
    type: String,
    
  },
  //call time should only be in 24 hour format and it should be valid
  callTime: CalltimeSchema,
  
  tripSequence: {
    type: Number,
    required: true,
    
  },
  odometer: OdometerSchema,
  loadingDetail: TimeSchema,
  tripDetail: TripSchema,
  sealNumbers: [{
    type: String,
  }],
  unloadingDetail: TimeSchema,

}, { timestamps: true });

export default models.Actual || model('Actual', ActualSchema);
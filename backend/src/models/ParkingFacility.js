import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewerName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

const facilityChangeSchema = new mongoose.Schema(
  {
    ownerName: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true },
    address: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    carSlots: { type: Number, required: true, min: 0 },
    bikeSlots: { type: Number, required: true, min: 0 },
    carHourlyRate: { type: Number, required: true, min: 0 },
    bikeHourlyRate: { type: Number, required: true, min: 0 },
    pricingCurrency: { type: String, enum: ['LKR'], default: 'LKR' },
    imageUri: { type: String },
  },
  { _id: false },
);

const parkingFacilitySchema = new mongoose.Schema(
  {
    ownerName: { type: String, required: true, trim: true },
    ownerEmail: { type: String, required: true, lowercase: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true, unique: true, index: true },
    address: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    carSlots: { type: Number, required: true, min: 0 },
    bikeSlots: { type: Number, required: true, min: 0 },
    carAvailableSlots: { type: Number, min: 0 },
    bikeAvailableSlots: { type: Number, min: 0 },
    carHourlyRate: { type: Number, required: true, min: 0, default: 0 },
    bikeHourlyRate: { type: Number, required: true, min: 0, default: 0 },
    pricingCurrency: { type: String, enum: ['LKR'], default: 'LKR' },
    reviews: { type: [reviewSchema], default: [] },
    imageUri: { type: String },
    pendingChanges: { type: facilityChangeSchema },
    status: { type: String, enum: ['pending', 'active', 'declined'], default: 'pending' },
  },
  { timestamps: true }
);

export const ParkingFacility = mongoose.model('ParkingFacility', parkingFacilitySchema);

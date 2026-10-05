import mongoose from 'mongoose';

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
    imageUri: { type: String },
    status: { type: String, enum: ['pending', 'active'], default: 'pending' },
  },
  { timestamps: true }
);

export const ParkingFacility = mongoose.model('ParkingFacility', parkingFacilitySchema);

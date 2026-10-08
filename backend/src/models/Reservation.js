import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reservationCode: { type: String, required: true, unique: true, index: true },
    facilityName: { type: String, required: true, trim: true },
    facilityAddress: { type: String, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    slot: { type: String, required: true, trim: true },
    vehicleType: { type: String, enum: ['Car', 'Bike'], required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true },
);

export const Reservation = mongoose.model('Reservation', reservationSchema);

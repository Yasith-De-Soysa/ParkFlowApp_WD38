import mongoose from 'mongoose';
import { ParkingFacility } from '../models/ParkingFacility.js';

mongoose.set('bufferCommands', false);

export const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/parkflow', {
    dbName: process.env.DB_NAME || 'parkflow',
    serverSelectionTimeoutMS: 5000,
  });

  console.log(`MongoDB connected: ${conn.connection.host}`);
  await ParkingFacility.updateMany(
    { pricingCurrency: { $exists: false } },
    { $set: { pricingCurrency: 'LKR' } },
  );
  return conn;
};

export default connectDB;

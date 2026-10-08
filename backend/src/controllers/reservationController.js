import crypto from 'node:crypto';
import { Reservation } from '../models/Reservation.js';

const reservationResponse = (reservation) => ({
  _id: reservation._id,
  reservationCode: reservation.reservationCode,
  facilityName: reservation.facilityName,
  facilityAddress: reservation.facilityAddress,
  date: reservation.date,
  time: reservation.time,
  slot: reservation.slot,
  vehicleType: reservation.vehicleType,
  amount: reservation.amount,
  status: reservation.status,
  createdAt: reservation.createdAt,
});

export const listMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    return res.json({ reservations: reservations.map(reservationResponse) });
  } catch (error) {
    return next(error);
  }
};

export const createReservation = async (req, res, next) => {
  try {
    const { facilityName, facilityAddress, date, time, slot, vehicleType, amount } = req.body;
    if (!facilityName?.trim() || !date?.trim() || !time?.trim() || !slot?.trim() || !vehicleType || amount === undefined) {
      return res.status(400).json({ error: { message: 'Facility, date, time, slot, vehicle type, and amount are required.' } });
    }
    if (!['Car', 'Bike'].includes(vehicleType) || !Number.isFinite(Number(amount)) || Number(amount) < 0) {
      return res.status(400).json({ error: { message: 'Reservation details are invalid.' } });
    }

    const reservation = await Reservation.create({
      userId: req.user.userId,
      reservationCode: `PF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      facilityName: facilityName.trim(),
      facilityAddress: facilityAddress?.trim(),
      date: date.trim(),
      time: time.trim(),
      slot: slot.trim(),
      vehicleType,
      amount: Number(amount),
    });
    return res.status(201).json({ reservation: reservationResponse(reservation) });
  } catch (error) {
    return next(error);
  }
};

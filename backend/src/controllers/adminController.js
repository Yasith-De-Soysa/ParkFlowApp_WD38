import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ParkingFacility } from '../models/ParkingFacility.js';

const secret = () => process.env.JWT_SECRET || 'development-secret';

const adminToken = () => jwt.sign(
  { userId: 'admin', email: process.env.ADMIN_EMAIL, role: 'admin' },
  secret(),
  { expiresIn: '8h' },
);

export const adminLogin = (req, res) => {
  const { email, password } = req.body;
  if (!email || email.trim().toLowerCase() !== process.env.ADMIN_EMAIL?.trim().toLowerCase() ||
      !password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: { message: 'Invalid administrator credentials.' } });
  }
  return res.json({ token: adminToken(), role: 'admin' });
};

export const createOwnerAccount = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 6) {
      return res.status(400).json({ error: { message: 'Provide a valid email and a password of at least 6 characters.' } });
    }
    if (await User.exists({ email })) {
      return res.status(409).json({ error: { message: 'An account with this email already exists.' } });
    }
    const owner = await User.create({
      email,
      name: email.split('@')[0],
      password: await bcrypt.hash(password, 12),
      role: 'owner',
      isActive: true,
    });
    return res.status(201).json({ owner: { id: owner._id, email: owner.email, role: owner.role } });
  } catch (error) {
    return next(error);
  }
};

export const listPendingFacilities = async (_req, res, next) => {
  try {
    const facilities = await ParkingFacility.find({
      $or: [{ status: 'pending' }, { pendingChanges: { $exists: true, $ne: null } }],
    }).sort({ createdAt: -1 }).lean();
    return res.json({
      facilities: facilities.map((facility) => ({
        ...facility,
        reviewType: facility.pendingChanges ? 'update' : 'registration',
        reviewData: facility.pendingChanges || facility,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

export const reviewFacility = async (req, res, next) => {
  try {
    const { action } = req.body;
    if (!['approve', 'decline'].includes(action)) {
      return res.status(400).json({ error: { message: 'Review action must be approve or decline.' } });
    }
    const facility = await ParkingFacility.findOne({
      _id: req.params.facilityId,
      $or: [{ status: 'pending' }, { pendingChanges: { $exists: true, $ne: null } }],
    });
    if (!facility) {
      return res.status(404).json({ error: { message: 'Pending facility registration not found.' } });
    }
    if (facility.pendingChanges) {
      if (action === 'approve') {
        Object.assign(facility, facility.pendingChanges.toObject());
      }
      facility.pendingChanges = undefined;
    } else {
      facility.status = action === 'approve' ? 'active' : 'declined';
    }
    await facility.save();
    return res.json({ facility });
  } catch (error) {
    return next(error);
  }
};

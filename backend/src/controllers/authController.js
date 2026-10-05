import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  vehicleType: user.vehicleType,
  vehicleNumber: user.vehicleNumber,
  avatar: user.avatar,
  createdAt: user.createdAt,
});

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, vehicleType, vehicleNumber, avatar } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name?.trim() || !normalizedEmail || !phone?.trim() || !password || !vehicleType || !vehicleNumber?.trim()) {
      return res.status(400).json({ error: { message: 'Name, email, phone, password, vehicle type, and vehicle number are required.' } });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: { message: 'Please provide a valid email address.' } });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: { message: 'Password must be at least 6 characters.' } });
    }
    if (!['Car', 'Bike'].includes(vehicleType)) {
      return res.status(400).json({ error: { message: 'Vehicle type must be Car or Bike.' } });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: { message: 'An account with this email already exists.' } });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: passwordHash,
      vehicleType,
      vehicleNumber: vehicleNumber.trim(),
      avatar,
    });
    const token = jwt.sign({ userId: user._id.toString(), email: user.email }, process.env.JWT_SECRET || 'development-secret', {
      expiresIn: '7d',
    });

    return res.status(201).json({
      token,
      user: userResponse(user),
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: { message: 'Email and password are required.' } });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: { message: 'User does not exist.' } });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: { message: 'Password does not match.' } });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET || 'development-secret',
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        ...userResponse(user),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: { message: 'User does not exist.' } });
    }

    return res.json({ user: userResponse(user) });
  } catch (error) {
    return next(error);
  }
};

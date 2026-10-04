import { ParkingFacility } from '../models/ParkingFacility.js';

const normalizeName = (name) => name.trim().toLowerCase().replace(/\s+/g, ' ');

export const checkFacilityName = async (req, res, next) => {
  try {
    const name = req.query.name?.toString() || '';
    if (!name.trim()) {
      return res.status(400).json({ error: { message: 'Facility name is required.' } });
    }

    const exists = await ParkingFacility.exists({ normalizedName: normalizeName(name) });
    return res.json({ available: !exists });
  } catch (error) {
    return next(error);
  }
};

export const registerFacility = async (req, res, next) => {
  try {
    const {
      ownerName,
      ownerEmail,
      contactNumber,
      name,
      address,
      latitude,
      longitude,
      carSlots,
      bikeSlots,
      imageUri,
    } = req.body;
    const normalizedName = typeof name === 'string' ? normalizeName(name) : '';

    if (!ownerName?.trim() || !ownerEmail?.trim() || !contactNumber?.trim() || !name?.trim() || !address?.trim()) {
      return res.status(400).json({ error: { message: 'Owner, contact, facility name, and address details are required.' } });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail.trim())) {
      return res.status(400).json({ error: { message: 'Please provide a valid owner email address.' } });
    }
    if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
      return res.status(400).json({ error: { message: 'Please select a valid location on the map.' } });
    }

    const existingFacility = await ParkingFacility.findOne({ normalizedName });
    if (existingFacility) {
      return res.status(409).json({ error: { message: 'A parking facility with this name already exists.' } });
    }

    const facility = await ParkingFacility.create({
      ownerName: ownerName.trim(),
      ownerEmail: ownerEmail.trim(),
      contactNumber: contactNumber.trim(),
      name: name.trim(),
      normalizedName,
      address: address.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      carSlots: Math.max(0, Number(carSlots) || 0),
      bikeSlots: Math.max(0, Number(bikeSlots) || 0),
      imageUri,
    });

    return res.status(201).json({ facility });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: { message: 'A parking facility with this name already exists.' } });
    }
    return next(error);
  }
};

export const listFacilities = async (req, res, next) => {
  try {
    const query = req.query.q?.toString().trim() || '';
    const filter = { status: { $in: ['pending', 'active'] } };

    if (query) {
      const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: safeQuery, $options: 'i' } },
        { address: { $regex: safeQuery, $options: 'i' } },
      ];
    }

    const facilities = await ParkingFacility.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      facilities: facilities.map((facility) => ({
        ...facility,
        availableSlots: facility.carSlots + facility.bikeSlots,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

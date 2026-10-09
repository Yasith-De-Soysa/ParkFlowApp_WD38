import { ParkingFacility } from '../models/ParkingFacility.js';
import { User } from '../models/User.js';

const normalizeName = (name) => name.trim().toLowerCase().replace(/\s+/g, ' ');

const reviewSummary = (facility) => {
  const reviews = facility.reviews || [];
  const ratingTotal = reviews.reduce((total, review) => total + review.rating, 0);
  return {
    ratingAverage: reviews.length ? Number((ratingTotal / reviews.length).toFixed(1)) : 0,
    ratingCount: reviews.length,
  };
};

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
      contactNumber,
      name,
      address,
      latitude,
      longitude,
      carSlots,
      bikeSlots,
      carHourlyRate,
      bikeHourlyRate,
      imageUri,
    } = req.body;
    const normalizedName = typeof name === 'string' ? normalizeName(name) : '';

    const ownerEmail = req.user.email;
    if (!ownerName?.trim() || !ownerEmail || !contactNumber?.trim() || !name?.trim() || !address?.trim()) {
      return res.status(400).json({ error: { message: 'Owner, contact, facility name, and address details are required.' } });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
      return res.status(400).json({ error: { message: 'Please provide a valid owner email address.' } });
    }
    if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
      return res.status(400).json({ error: { message: 'Please select a valid location on the map.' } });
    }
    if (
      !Number.isFinite(Number(carHourlyRate)) ||
      Number(carHourlyRate) < 0 ||
      !Number.isFinite(Number(bikeHourlyRate)) ||
      Number(bikeHourlyRate) < 0
    ) {
      return res.status(400).json({ error: { message: 'Please provide valid hourly rates for cars and bikes.' } });
    }

    const existingFacility = await ParkingFacility.findOne({ normalizedName });
    if (existingFacility) {
      if (existingFacility.status !== 'declined' || existingFacility.ownerEmail !== ownerEmail) {
        return res.status(409).json({ error: { message: 'A parking facility with this name already exists.' } });
      }

      existingFacility.ownerName = ownerName.trim();
      existingFacility.contactNumber = contactNumber.trim();
      existingFacility.address = address.trim();
      existingFacility.latitude = Number(latitude);
      existingFacility.longitude = Number(longitude);
      existingFacility.carSlots = Math.max(0, Number(carSlots) || 0);
      existingFacility.bikeSlots = Math.max(0, Number(bikeSlots) || 0);
      existingFacility.carAvailableSlots = existingFacility.carSlots;
      existingFacility.bikeAvailableSlots = existingFacility.bikeSlots;
      existingFacility.carHourlyRate = Number(carHourlyRate);
      existingFacility.bikeHourlyRate = Number(bikeHourlyRate);
      existingFacility.imageUri = imageUri;
      existingFacility.status = 'pending';
      await existingFacility.save();
      return res.status(201).json({ facility: existingFacility });
    }

    const facility = await ParkingFacility.create({
      ownerName: ownerName.trim(),
      ownerEmail,
      contactNumber: contactNumber.trim(),
      name: name.trim(),
      normalizedName,
      address: address.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      carSlots: Math.max(0, Number(carSlots) || 0),
      bikeSlots: Math.max(0, Number(bikeSlots) || 0),
      carAvailableSlots: Math.max(0, Number(carSlots) || 0),
      bikeAvailableSlots: Math.max(0, Number(bikeSlots) || 0),
      carHourlyRate: Number(carHourlyRate),
      bikeHourlyRate: Number(bikeHourlyRate),
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
    const filter = { status: 'active' };

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
        carAvailableSlots: Math.min(facility.carAvailableSlots ?? facility.carSlots, facility.carSlots),
        bikeAvailableSlots: Math.min(facility.bikeAvailableSlots ?? facility.bikeSlots, facility.bikeSlots),
        availableSlots:
          Math.min(facility.carAvailableSlots ?? facility.carSlots, facility.carSlots) +
          Math.min(facility.bikeAvailableSlots ?? facility.bikeSlots, facility.bikeSlots),
        ...reviewSummary(facility),
      })),
    });
  } catch (error) {
    return next(error);
  }
};

export const listOwnerFacilities = async (req, res, next) => {
  try {
    const facilities = await ParkingFacility.find({
      ownerEmail: req.user.email.toLowerCase(),
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      facilities: facilities.map((facility) => ({
        ...facility,
        carAvailableSlots: Math.min(facility.carAvailableSlots ?? facility.carSlots, facility.carSlots),
        bikeAvailableSlots: Math.min(facility.bikeAvailableSlots ?? facility.bikeSlots, facility.bikeSlots),
        availableSlots:
          Math.min(facility.carAvailableSlots ?? facility.carSlots, facility.carSlots) +
          Math.min(facility.bikeAvailableSlots ?? facility.bikeSlots, facility.bikeSlots),
        totalCapacity: facility.carSlots + facility.bikeSlots,
        ...reviewSummary(facility),
      })),
    });
  } catch (error) {
    return next(error);
  }
};

export const updateSlotAvailability = async (req, res, next) => {
  try {
    const carAvailableSlots = Number(req.body.carAvailableSlots);
    const bikeAvailableSlots = Number(req.body.bikeAvailableSlots);
    if (!Number.isInteger(carAvailableSlots) || !Number.isInteger(bikeAvailableSlots)) {
      return res.status(400).json({ error: { message: 'Available slots must be whole numbers.' } });
    }

    const facility = await ParkingFacility.findOne({
      _id: req.params.facilityId,
      ownerEmail: req.user.email.toLowerCase(),
      status: 'active',
    });
    if (!facility) {
      return res.status(404).json({ error: { message: 'Active parking facility not found.' } });
    }
    if (
      carAvailableSlots < 0 ||
      carAvailableSlots > facility.carSlots ||
      bikeAvailableSlots < 0 ||
      bikeAvailableSlots > facility.bikeSlots
    ) {
      return res.status(400).json({ error: { message: 'Available slots cannot exceed the registered capacity.' } });
    }

    facility.carAvailableSlots = carAvailableSlots;
    facility.bikeAvailableSlots = bikeAvailableSlots;
    await facility.save();

    return res.json({
      message: 'Slot availability published.',
      availability: {
        carAvailableSlots,
        bikeAvailableSlots,
        availableSlots: carAvailableSlots + bikeAvailableSlots,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateOwnerFacility = async (req, res, next) => {
  try {
    const {
      ownerName, contactNumber, name, address, latitude, longitude,
      carSlots, bikeSlots, carHourlyRate, bikeHourlyRate, imageUri,
    } = req.body;
    const normalizedName = typeof name === 'string' ? normalizeName(name) : '';

    if (!ownerName?.trim() || !contactNumber?.trim() || !name?.trim() || !address?.trim()) {
      return res.status(400).json({ error: { message: 'Owner, contact, facility name, and address details are required.' } });
    }
    if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
      return res.status(400).json({ error: { message: 'Please provide a valid facility location.' } });
    }
    if (
      !Number.isFinite(Number(carHourlyRate)) || Number(carHourlyRate) < 0 ||
      !Number.isFinite(Number(bikeHourlyRate)) || Number(bikeHourlyRate) < 0
    ) {
      return res.status(400).json({ error: { message: 'Please provide valid hourly rates.' } });
    }

    const facility = await ParkingFacility.findOne({
      _id: req.params.facilityId,
      ownerEmail: req.user.email.toLowerCase(),
      status: 'active',
    });
    if (!facility) {
      return res.status(404).json({ error: { message: 'Active parking facility not found.' } });
    }
    if (facility.pendingChanges) {
      return res.status(409).json({ error: { message: 'An update is already waiting for admin approval.' } });
    }

    const duplicate = await ParkingFacility.findOne({
      normalizedName,
      _id: { $ne: facility._id },
      status: { $ne: 'declined' },
    });
    if (duplicate) {
      return res.status(409).json({ error: { message: 'A parking facility with this name already exists.' } });
    }

    facility.pendingChanges = {
      ownerName: ownerName.trim(),
      contactNumber: contactNumber.trim(),
      name: name.trim(),
      normalizedName,
      address: address.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      carSlots: Math.max(0, Number(carSlots) || 0),
      bikeSlots: Math.max(0, Number(bikeSlots) || 0),
      carHourlyRate: Number(carHourlyRate),
      bikeHourlyRate: Number(bikeHourlyRate),
      imageUri,
    };
    await facility.save();
    return res.status(202).json({ message: 'Update submitted for admin review.' });
  } catch (error) {
    return next(error);
  }
};

export const listFacilityReviews = async (req, res, next) => {
  try {
    const facility = await ParkingFacility.findOne({
      _id: req.params.facilityId,
      status: { $in: ['pending', 'active'] },
    }).lean();

    if (!facility) {
      return res.status(404).json({ error: { message: 'Parking facility not found.' } });
    }

    return res.json({
      reviews: (facility.reviews || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      ...reviewSummary(facility),
    });
  } catch (error) {
    return next(error);
  }
};

export const addFacilityReview = async (req, res, next) => {
  try {
    const rating = Number(req.body.rating);
    const comment = typeof req.body.comment === 'string' ? req.body.comment.trim() : '';
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: { message: 'Rating must be a whole number from 1 to 5.' } });
    }
    if (!comment || comment.length > 500) {
      return res.status(400).json({ error: { message: 'Review text is required and must be 500 characters or fewer.' } });
    }

    const user = await User.findById(req.user.userId).select('name');
    if (!user) {
      return res.status(401).json({ error: { message: 'User account not found.' } });
    }

    const facility = await ParkingFacility.findOne({
      _id: req.params.facilityId,
      status: { $in: ['pending', 'active'] },
    });
    if (!facility) {
      return res.status(404).json({ error: { message: 'Parking facility not found.' } });
    }

    facility.reviews.push({
      reviewerId: user._id,
      reviewerName: user.name,
      rating,
      comment,
    });
    await facility.save();

    const review = facility.reviews[facility.reviews.length - 1];
    return res.status(201).json({ review, ...reviewSummary(facility) });
  } catch (error) {
    return next(error);
  }
};

export const updateFacilityReview = async (req, res, next) => {
  try {
    const rating = Number(req.body.rating);
    const comment = typeof req.body.comment === 'string' ? req.body.comment.trim() : '';
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: { message: 'Rating must be a whole number from 1 to 5.' } });
    }
    if (!comment || comment.length > 500) {
      return res.status(400).json({ error: { message: 'Review text is required and must be 500 characters or fewer.' } });
    }

    const facility = await ParkingFacility.findOne({
      _id: req.params.facilityId,
      status: { $in: ['pending', 'active'] },
    });
    if (!facility) {
      return res.status(404).json({ error: { message: 'Parking facility not found.' } });
    }

    const review = facility.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ error: { message: 'Review not found.' } });
    }
    if (review.reviewerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: { message: 'You can only edit your own review.' } });
    }

    review.rating = rating;
    review.comment = comment;
    await facility.save();

    return res.json({ review, ...reviewSummary(facility) });
  } catch (error) {
    return next(error);
  }
};

export const deleteFacilityReview = async (req, res, next) => {
  try {
    const facility = await ParkingFacility.findOne({
      _id: req.params.facilityId,
      status: { $in: ['pending', 'active'] },
    });
    if (!facility) {
      return res.status(404).json({ error: { message: 'Parking facility not found.' } });
    }

    const review = facility.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ error: { message: 'Review not found.' } });
    }
    if (review.reviewerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: { message: 'You can only delete your own review.' } });
    }

    facility.reviews.pull(req.params.reviewId);
    await facility.save();

    return res.json({ ...reviewSummary(facility) });
  } catch (error) {
    return next(error);
  }
};

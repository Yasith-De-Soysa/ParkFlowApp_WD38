import express from 'express';
import {
  addFacilityReview,
  checkFacilityName,
  deleteFacilityReview,
  listFacilities,
  listFacilityReviews,
  listOwnerFacilities,
  registerFacility,
  updateSlotAvailability,
  updateFacilityReview,
  updateOwnerFacility,
} from '../controllers/facilityController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/check-name', checkFacilityName);
router.get('/owner/me', authenticate, listOwnerFacilities);
router.put('/:facilityId', authenticate, requireRole('owner'), updateOwnerFacility);
router.patch('/:facilityId/availability', authenticate, requireRole('owner'), updateSlotAvailability);
router.get('/', listFacilities);
router.post('/', authenticate, requireRole('owner'), registerFacility);
router.get('/:facilityId/reviews', listFacilityReviews);
router.post('/:facilityId/reviews', authenticate, addFacilityReview);
router.put('/:facilityId/reviews/:reviewId', authenticate, updateFacilityReview);
router.delete('/:facilityId/reviews/:reviewId', authenticate, deleteFacilityReview);

export default router;

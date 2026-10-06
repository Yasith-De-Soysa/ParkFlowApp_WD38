import express from 'express';
import {
  addFacilityReview,
  checkFacilityName,
  listFacilities,
  listFacilityReviews,
  listOwnerFacilities,
  registerFacility,
  updateOwnerFacility,
} from '../controllers/facilityController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/check-name', checkFacilityName);
router.get('/owner/me', authenticate, listOwnerFacilities);
router.put('/:facilityId', authenticate, requireRole('owner'), updateOwnerFacility);
router.get('/', listFacilities);
router.post('/', authenticate, requireRole('owner'), registerFacility);
router.get('/:facilityId/reviews', listFacilityReviews);
router.post('/:facilityId/reviews', authenticate, addFacilityReview);

export default router;

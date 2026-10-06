import express from 'express';
import {
  addFacilityReview,
  checkFacilityName,
  listFacilities,
  listFacilityReviews,
  listOwnerFacilities,
  registerFacility,
} from '../controllers/facilityController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/check-name', checkFacilityName);
router.get('/owner/me', authenticate, listOwnerFacilities);
router.get('/', listFacilities);
router.post('/', registerFacility);
router.get('/:facilityId/reviews', listFacilityReviews);
router.post('/:facilityId/reviews', authenticate, addFacilityReview);

export default router;

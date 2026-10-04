import express from 'express';
import { checkFacilityName, listFacilities, registerFacility } from '../controllers/facilityController.js';

const router = express.Router();

router.get('/check-name', checkFacilityName);
router.get('/', listFacilities);
router.post('/', registerFacility);

export default router;

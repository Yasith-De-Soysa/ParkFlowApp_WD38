import express from 'express';
import { adminLogin, createOwnerAccount, listPendingFacilities, reviewFacility } from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', adminLogin);
router.use(authenticate, requireRole('admin'));
router.post('/owners', createOwnerAccount);
router.get('/facilities/pending', listPendingFacilities);
router.patch('/facilities/:facilityId/review', reviewFacility);

export default router;

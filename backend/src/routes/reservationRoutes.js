import express from 'express';
import { createReservation, listMyReservations } from '../controllers/reservationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authenticate, listMyReservations);
router.post('/', authenticate, createReservation);

export default router;

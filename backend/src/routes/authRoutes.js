import express from 'express';
import { getCurrentUser, login, register, updateCurrentUser } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);
router.put('/me', authenticate, updateCurrentUser);

export default router;

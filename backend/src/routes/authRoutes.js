import express from 'express';
import { getCurrentUser, login, register, updateCurrentUser } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', uploadAvatar.single('avatar'), register);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);
router.put('/me', authenticate, uploadAvatar.single('avatar'), updateCurrentUser);

export default router;

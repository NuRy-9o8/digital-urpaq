import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Публичные маршруты
router.post('/register', authController.register);
router.post('/login', authController.login);

// Защищенные маршруты
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/profile/telegram', authenticateToken, authController.updateTelegramChatId);
router.delete('/profile/telegram', authenticateToken, authController.removeTelegramChatId);

export default router;

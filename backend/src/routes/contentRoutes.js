import express from 'express';
import * as contentController from '../controllers/contentController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Публичные маршруты
router.get('/news', contentController.getNews);
router.get('/news/:newsId', contentController.getNewsById);
router.get('/content/club/:clubId', contentController.getContent);

// Защищенные маршруты (создание)
router.post('/content', authenticateToken, authorizeRole('teacher', 'admin'), contentController.createContent);
router.delete('/content/:contentId', authenticateToken, authorizeRole('teacher', 'admin'), contentController.deleteContent);

router.post('/news', authenticateToken, authorizeRole('admin'), contentController.createNews);
router.delete('/news/:newsId', authenticateToken, authorizeRole('admin'), contentController.deleteNews);

export default router;

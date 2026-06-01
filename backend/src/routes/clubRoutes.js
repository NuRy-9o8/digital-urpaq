import express from 'express';
import * as clubController from '../controllers/clubController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Публичные маршруты
router.get('/', clubController.getClubs);
router.get('/:id', clubController.getClubById);

// Защищенные маршруты (только администраторы и преподаватели)
router.post('/', authenticateToken, authorizeRole('admin', 'teacher'), clubController.createClub);
router.post('/requests', authenticateToken, authorizeRole('teacher'), clubController.requestNewClub);
router.put('/:id', authenticateToken, authorizeRole('admin', 'teacher'), clubController.updateClub);
router.delete('/:id', authenticateToken, authorizeRole('admin', 'teacher'), clubController.deleteClub);

// Получение студентов кружка
router.get('/:clubId/students', authenticateToken, authorizeRole('teacher', 'admin'), clubController.getClubStudents);

export default router;

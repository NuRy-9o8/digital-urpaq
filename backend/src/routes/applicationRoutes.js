import express from 'express';
import * as applicationController from '../controllers/applicationController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Студентов
router.post('/', authenticateToken, authorizeRole('student'), applicationController.submitApplication);
router.get('/my-applications', authenticateToken, authorizeRole('student'), applicationController.getMyApplications);
router.delete('/:applicationId', authenticateToken, authorizeRole('student'), applicationController.cancelApplication);

// Учителей и администраторов
router.get('/club/:clubId', authenticateToken, authorizeRole('teacher', 'admin'), applicationController.getClubApplications);
router.put('/:applicationId/status', authenticateToken, authorizeRole('teacher', 'admin'), applicationController.updateApplicationStatus);

export default router;

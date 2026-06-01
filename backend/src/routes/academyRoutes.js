import express from 'express';
import * as academyController from '../controllers/academyController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, authorizeRole('student'), academyController.submitAcademyApplication);
router.get('/my-applications', authenticateToken, authorizeRole('student'), academyController.getMyAcademyApplications);
router.get('/', authenticateToken, authorizeRole('admin'), academyController.getAllAcademyApplications);
router.put('/:applicationId/status', authenticateToken, authorizeRole('admin'), academyController.updateAcademyApplicationStatus);

export default router;

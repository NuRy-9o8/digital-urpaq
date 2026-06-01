import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Все маршруты требуют прав администратора
router.use(authenticateToken, authorizeRole('admin'));

router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);

router.get('/statistics', adminController.getStatistics);
router.get('/applications-stats', adminController.getApplicationStats);
router.get('/club-requests', adminController.getClubRequests);
router.put('/club-requests/:requestId', adminController.updateClubRequestStatus);

export default router;

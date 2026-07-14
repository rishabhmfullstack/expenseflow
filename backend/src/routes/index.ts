import { Router } from 'express';
import authRoutes from './auth.routes';
import claimRoutes from './claim.routes';
import uploadRoutes from './upload.routes';
import managerRoutes from './manager.routes';
import seniorManagerRoutes from './senior-manager.routes';
import adminRoutes from './admin.routes';
import approvalRoutes from './approval.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/claims', claimRoutes);
router.use('/uploads', uploadRoutes);
router.use('/manager', managerRoutes);
router.use('/senior-manager', seniorManagerRoutes);
router.use('/admin', adminRoutes);
router.use('/approvals', approvalRoutes);

export default router;

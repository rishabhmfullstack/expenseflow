import { Router } from 'express';
import { Role } from '@prisma/client';
import { managerController } from '../controllers';
import { approvalController } from '../controllers/approval.controller';
import { authenticate, authorize, validate } from '../middlewares';
import { asyncHandler } from '../utils';
import {
  listPendingManagerClaimsQuerySchema,
  listManagerHistoryQuerySchema,
  managerApproveSchema,
  managerNoteSchema,
  uuidParamSchema,
} from '../validators';

const router = Router();

router.use(authenticate, authorize(Role.MANAGER));

router.get(
  '/history',
  validate({ query: listManagerHistoryQuerySchema }),
  asyncHandler(managerController.listHistory),
);

router.get(
  '/claims',
  validate({ query: listPendingManagerClaimsQuerySchema }),
  asyncHandler(managerController.listPending),
);

router.get(
  '/claims/:id/history',
  validate({ params: uuidParamSchema }),
  asyncHandler(approvalController.getClaimHistory),
);

router.get(
  '/claims/:id',
  validate({ params: uuidParamSchema }),
  asyncHandler(managerController.getPending),
);

router.post(
  '/claims/:id/approve',
  validate({ params: uuidParamSchema, body: managerApproveSchema }),
  asyncHandler(managerController.approve),
);

router.post(
  '/claims/:id/approve-after-revert',
  validate({ params: uuidParamSchema, body: managerApproveSchema }),
  asyncHandler(managerController.approveAfterSeniorManagerRevert),
);

router.post(
  '/claims/:id/reject',
  validate({ params: uuidParamSchema, body: managerNoteSchema }),
  asyncHandler(managerController.reject),
);

router.post(
  '/claims/:id/revert-to-employee',
  validate({ params: uuidParamSchema, body: managerNoteSchema }),
  asyncHandler(managerController.revertToEmployee),
);

export default router;

import { Router } from 'express';
import { Role } from '@prisma/client';
import { seniorManagerController } from '../controllers';
import { approvalController } from '../controllers/approval.controller';
import { authenticate, authorize, validate } from '../middlewares';
import { asyncHandler } from '../utils';
import {
  listPendingSeniorManagerClaimsQuerySchema,
  seniorManagerApproveSchema,
  seniorManagerNoteSchema,
  uuidParamSchema,
} from '../validators';

const router = Router();

router.use(authenticate, authorize(Role.SENIOR_MANAGER));

router.get(
  '/claims',
  validate({ query: listPendingSeniorManagerClaimsQuerySchema }),
  asyncHandler(seniorManagerController.listPending),
);

router.get(
  '/claims/:id/history',
  validate({ params: uuidParamSchema }),
  asyncHandler(approvalController.getClaimHistory),
);

router.get(
  '/claims/:id',
  validate({ params: uuidParamSchema }),
  asyncHandler(seniorManagerController.getPending),
);

router.post(
  '/claims/:id/approve',
  validate({ params: uuidParamSchema, body: seniorManagerApproveSchema }),
  asyncHandler(seniorManagerController.approve),
);

router.post(
  '/claims/:id/reject',
  validate({ params: uuidParamSchema, body: seniorManagerNoteSchema }),
  asyncHandler(seniorManagerController.reject),
);

router.post(
  '/claims/:id/revert-to-manager',
  validate({ params: uuidParamSchema, body: seniorManagerNoteSchema }),
  asyncHandler(seniorManagerController.revertToManager),
);

export default router;

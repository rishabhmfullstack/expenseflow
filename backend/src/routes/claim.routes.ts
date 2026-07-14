import { Router } from 'express';
import { claimController } from '../controllers';
import { approvalController } from '../controllers/approval.controller';
import { authenticate, validate } from '../middlewares';
import { asyncHandler } from '../utils';
import {
  createClaimSchema,
  listClaimsQuerySchema,
  updateClaimSchema,
  uuidParamSchema,
} from '../validators';

const router = Router();

router.use(authenticate);

router.get(
  '/me',
  validate({ query: listClaimsQuerySchema }),
  asyncHandler(claimController.list),
);

router.get(
  '/',
  validate({ query: listClaimsQuerySchema }),
  asyncHandler(claimController.list),
);

router.post(
  '/',
  validate({ body: createClaimSchema }),
  asyncHandler(claimController.create),
);

router.get(
  '/:id/history',
  validate({ params: uuidParamSchema }),
  asyncHandler(approvalController.getClaimHistory),
);

router.post(
  '/:id/submit',
  validate({ params: uuidParamSchema }),
  asyncHandler(claimController.submit),
);

router.get(
  '/:id',
  validate({ params: uuidParamSchema }),
  asyncHandler(claimController.getById),
);

router.patch(
  '/:id',
  validate({ params: uuidParamSchema, body: updateClaimSchema }),
  asyncHandler(claimController.update),
);

router.delete(
  '/:id',
  validate({ params: uuidParamSchema }),
  asyncHandler(claimController.delete),
);

export default router;

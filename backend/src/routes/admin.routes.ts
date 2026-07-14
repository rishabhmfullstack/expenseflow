import { Router } from 'express';
import { Role } from '@prisma/client';
import { adminController } from '../controllers';
import { approvalController } from '../controllers/approval.controller';
import { authenticate, authorize, validate } from '../middlewares';
import { asyncHandler } from '../utils';
import {
  assignToManagerSchema,
  assignToSeniorManagerSchema,
  createAdminUserSchema,
  listAdminClaimsQuerySchema,
  listAdminUsersQuerySchema,
  monthlySummaryQuerySchema,
  updateAdminUserSchema,
  uuidParamSchema,
} from '../validators';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN));

router.get(
  '/users',
  validate({ query: listAdminUsersQuerySchema }),
  asyncHandler(adminController.listUsers),
);

router.post(
  '/users',
  validate({ body: createAdminUserSchema }),
  asyncHandler(adminController.createUser),
);

router.get(
  '/users/:id',
  validate({ params: uuidParamSchema }),
  asyncHandler(adminController.getUser),
);

router.patch(
  '/users/:id',
  validate({ params: uuidParamSchema, body: updateAdminUserSchema }),
  asyncHandler(adminController.updateUser),
);

router.delete(
  '/users/:id',
  validate({ params: uuidParamSchema }),
  asyncHandler(adminController.deleteUser),
);

router.post(
  '/users/:id/deactivate',
  validate({ params: uuidParamSchema }),
  asyncHandler(adminController.deactivateUser),
);

router.post(
  '/users/:id/assign-to-manager',
  validate({ params: uuidParamSchema, body: assignToManagerSchema }),
  asyncHandler(adminController.assignEmployeeToManager),
);

router.post(
  '/users/:id/assign-to-senior-manager',
  validate({ params: uuidParamSchema, body: assignToSeniorManagerSchema }),
  asyncHandler(adminController.assignManagerToSeniorManager),
);

router.get(
  '/claims/:id/history',
  validate({ params: uuidParamSchema }),
  asyncHandler(approvalController.getClaimHistory),
);

router.get(
  '/claims',
  validate({ query: listAdminClaimsQuerySchema }),
  asyncHandler(adminController.listAllClaims),
);

router.get(
  '/summary/monthly',
  validate({ query: monthlySummaryQuerySchema }),
  asyncHandler(adminController.getMonthlySummary),
);

export default router;

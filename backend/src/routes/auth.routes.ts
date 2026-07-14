import { Router } from 'express';
import { authController } from '../controllers';
import {
  authRateLimiter,
  authenticate,
  optionalRefreshToken,
  refreshToken,
  validate,
} from '../middlewares';
import { asyncHandler } from '../utils';
import {
  loginSchema,
  refreshTokenBodySchema,
  registerSchema,
} from '../validators';

const router = Router();

router.post(
  '/signup',
  authRateLimiter,
  validate({ body: registerSchema }),
  asyncHandler(authController.signup),
);

router.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  asyncHandler(authController.login),
);

router.post(
  '/refresh',
  authRateLimiter,
  validate({ body: refreshTokenBodySchema }),
  refreshToken,
  asyncHandler(authController.refresh),
);

router.post(
  '/logout',
  optionalRefreshToken,
  asyncHandler(authController.logout),
);

router.get('/me', authenticate, asyncHandler(authController.me));

export default router;

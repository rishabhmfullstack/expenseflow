export { ApiError } from './api-error.util';
export { asyncHandler } from './async-handler.util';
export { hashPassword, comparePassword } from './hash.util';
export {
  generateRefreshToken,
  hashToken,
  parseExpiresInToMs,
  getRefreshTokenExpiryDate,
} from './token.util';
export { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from './jwt.util';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function getPaginationParams(page: number | string = 1, limit: number | string = 20): PaginationParams {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(Math.max(1, Number(limit) || 20), 100);

  return { page: safePage, limit: safeLimit };
}

export function getPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export function getSkipTake(page: number | string, limit: number | string): { skip: number; take: number } {
  const { page: safePage, limit: safeLimit } = getPaginationParams(page, limit);

  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
}

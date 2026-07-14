import { RequestHandler } from 'express';
import { ApiError } from '../utils';
import { getRefreshTokenFromRequest } from '../utils/cookie.util';

export const refreshToken: RequestHandler = (req, _res, next) => {
  const token = getRefreshTokenFromRequest(req);

  if (!token) {
    next(ApiError.unauthorized('Refresh token is required'));
    return;
  }

  req.refreshToken = token;
  next();
};

export const optionalRefreshToken: RequestHandler = (req, _res, next) => {
  const token = getRefreshTokenFromRequest(req);

  if (token) {
    req.refreshToken = token;
  }

  next();
};

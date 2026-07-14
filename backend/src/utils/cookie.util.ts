import { CookieOptions, Request, Response } from 'express';
import { env } from '../config';
import { parseExpiresInToMs } from './token.util';

export function getRefreshTokenCookieName(): string {
  return env.REFRESH_TOKEN_COOKIE_NAME;
}

export function getRefreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/api/v1/auth',
    maxAge: parseExpiresInToMs(env.JWT_REFRESH_EXPIRES_IN),
  };
}

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(getRefreshTokenCookieName(), token, getRefreshCookieOptions());
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(getRefreshTokenCookieName(), {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/api/v1/auth',
  });
}

export function getRefreshTokenFromRequest(req: Request): string | undefined {
  const cookieName = getRefreshTokenCookieName();
  const cookieToken = req.cookies?.[cookieName];
  const bodyToken = req.body?.refreshToken;

  if (typeof cookieToken === 'string' && cookieToken.length > 0) {
    return cookieToken;
  }

  if (typeof bodyToken === 'string' && bodyToken.length > 0) {
    return bodyToken;
  }

  return undefined;
}

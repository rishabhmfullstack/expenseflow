import { AuthenticatedUser } from './auth.types';

export interface ValidatedRequestData {
  body?: unknown;
  query?: unknown;
  params?: unknown;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      refreshToken?: string;
      validated?: ValidatedRequestData;
    }
  }
}

export {};

import { Role, User } from '@prisma/client';
import { env } from '../config';
import { refreshTokenRepository, userRepository } from '../repositories';
import {
  ApiError,
  getRefreshTokenExpiryDate,
  hashPassword,
  hashToken,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils';
import { LoginInput, RegisterInput } from '../validators';
import { PublicUser } from '../types';

export interface AuthTokenResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    managerId: user.managerId,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class AuthService {
  async signup(input: RegisterInput): Promise<AuthTokenResult> {
    const email = input.email.toLowerCase();

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw ApiError.conflict('Email is already registered');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await userRepository.create({
      email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: Role.EMPLOYEE,
    });

    return this.issueTokenPair(user);
  }

  async login(input: LoginInput): Promise<AuthTokenResult> {
    const email = input.email.toLowerCase();
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('Account is inactive');
    }

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    return this.issueTokenPair(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokenResult> {
    let payload: { sub: string };

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const tokenHash = hashToken(refreshToken);
    const storedToken = await refreshTokenRepository.findActiveByHash(tokenHash);

    if (!storedToken) {
      const revokedToken = await refreshTokenRepository.findByHash(tokenHash);

      if (revokedToken) {
        await refreshTokenRepository.revokeAllForUser(revokedToken.userId);
      }

      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    if (storedToken.userId !== payload.sub) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    if (!storedToken.user.isActive) {
      throw ApiError.unauthorized('Account is inactive');
    }

    await refreshTokenRepository.revokeById(storedToken.id);

    return this.issueTokenPair(storedToken.user);
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    const storedToken = await refreshTokenRepository.findByHash(tokenHash);

    if (storedToken && !storedToken.revokedAt) {
      await refreshTokenRepository.revokeById(storedToken.id);
    }
  }

  async getMe(userId: string): Promise<PublicUser> {
    const user = await userRepository.findActiveById(userId);

    if (!user) {
      throw ApiError.unauthorized('User not found or inactive');
    }

    return toPublicUser(user);
  }

  private async issueTokenPair(user: User): Promise<AuthTokenResult> {
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = signRefreshToken({ sub: user.id });
    const expiresAt = getRefreshTokenExpiryDate(env.JWT_REFRESH_EXPIRES_IN);

    await refreshTokenRepository.create(user.id, hashToken(refreshToken), expiresAt);

    return {
      user: toPublicUser(user),
      accessToken,
      refreshToken,
    };
  }
}

export const authService = new AuthService();

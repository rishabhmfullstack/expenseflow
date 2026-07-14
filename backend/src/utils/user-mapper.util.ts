import { User } from '@prisma/client';
import { PublicUser } from '../types';

export function toPublicUser(user: User): PublicUser {
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

export function toPublicUserWithManager(
  user: User & {
    manager?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: User['role'];
    } | null;
  },
) {
  return {
    ...toPublicUser(user),
    manager: user.manager ?? null,
  };
}

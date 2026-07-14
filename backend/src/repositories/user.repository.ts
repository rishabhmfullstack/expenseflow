import { Prisma, Role, User } from '@prisma/client';
import { prisma } from '../config';
import { getSkipTake } from '../utils/pagination.util';

export interface FindUsersParams {
  page: number;
  limit: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
}

const managerSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
} as const;

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByIdWithManager(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        manager: {
          select: managerSelect,
        },
      },
    });
  }

  async findActiveById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        id,
        isActive: true,
      },
    });
  }

  async findMany(params: FindUsersParams) {
    const { skip, take } = getSkipTake(params.page, params.limit);

    const where: Prisma.UserWhereInput = {
      ...(params.role && { role: params.role }),
      ...(params.isActive !== undefined && { isActive: params.isActive }),
      ...(params.search && {
        OR: [
          { email: { contains: params.search, mode: 'insensitive' } },
          { firstName: { contains: params.search, mode: 'insensitive' } },
          { lastName: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        include: {
          manager: {
            select: managerSelect,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async deactivate(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async countDirectReports(userId: string): Promise<number> {
    return prisma.user.count({
      where: { managerId: userId },
    });
  }

  async hasClaimsAsEmployee(userId: string): Promise<boolean> {
    const count = await prisma.claim.count({
      where: { employeeId: userId },
    });
    return count > 0;
  }
}

export const userRepository = new UserRepository();

import { Role } from '@prisma/client';
import { prisma } from '../config';
import {
  adminRepository,
  claimRepository,
  userRepository,
} from '../repositories';
import { ApiError, getPaginationMeta, hashPassword } from '../utils';
import { toManagerClaimResponse } from '../utils/claim-mapper.util';
import { toPublicUserWithManager } from '../utils/user-mapper.util';
import {
  AssignToManagerInput,
  AssignToSeniorManagerInput,
  CreateAdminUserInput,
  ListAdminClaimsQuery,
  ListAdminUsersQuery,
  MonthlySummaryQuery,
  UpdateAdminUserInput,
} from '../validators';

export class AdminService {
  async listUsers(query: ListAdminUsersQuery) {
    const { users, total } = await userRepository.findMany({
      page: query.page,
      limit: query.limit,
      search: query.search,
      role: query.role,
      isActive: query.isActive,
    });

    return {
      users: users.map(toPublicUserWithManager),
      meta: getPaginationMeta(total, query.page, query.limit),
    };
  }

  async getUser(userId: string) {
    const user = await userRepository.findByIdWithManager(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return toPublicUserWithManager(user);
  }

  async createUser(input: CreateAdminUserInput) {
    const email = input.email.toLowerCase();

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw ApiError.conflict('Email is already registered');
    }

    await this.validateManagerAssignment(input.role, input.managerId ?? null);

    const passwordHash = await hashPassword(input.password);

    const user = await userRepository.create({
      email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      ...(input.managerId
        ? { manager: { connect: { id: input.managerId } } }
        : {}),
    });

    const created = await userRepository.findByIdWithManager(user.id);
    return toPublicUserWithManager(created!);
  }

  async updateUser(userId: string, input: UpdateAdminUserInput) {
    const existing = await userRepository.findById(userId);

    if (!existing) {
      throw ApiError.notFound('User not found');
    }

    if (input.email) {
      const duplicate = await userRepository.findByEmail(input.email);
      if (duplicate && duplicate.id !== userId) {
        throw ApiError.conflict('Email is already in use');
      }
    }

    const nextRole = input.role ?? existing.role;
    const nextManagerId = input.managerId !== undefined ? input.managerId : existing.managerId;

    await this.validateManagerAssignment(nextRole, nextManagerId, userId);

    const user = await userRepository.update(userId, {
      ...(input.email && { email: input.email.toLowerCase() }),
      ...(input.firstName && { firstName: input.firstName }),
      ...(input.lastName && { lastName: input.lastName }),
      ...(input.role && { role: input.role }),
      ...(input.managerId !== undefined && {
        manager: input.managerId
          ? { connect: { id: input.managerId } }
          : { disconnect: true },
      }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    });

    const updated = await userRepository.findByIdWithManager(user.id);
    return toPublicUserWithManager(updated!);
  }

  async deleteUser(adminId: string, userId: string) {
    if (adminId === userId) {
      throw ApiError.badRequest('You cannot delete your own account');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const directReports = await userRepository.countDirectReports(userId);
    if (directReports > 0) {
      throw ApiError.conflict('Cannot delete user with direct reports');
    }

    const hasClaims = await userRepository.hasClaimsAsEmployee(userId);
    if (hasClaims) {
      throw ApiError.conflict('Cannot delete user with existing claims');
    }

    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });
  }

  async deactivateUser(adminId: string, userId: string) {
    if (adminId === userId) {
      throw ApiError.badRequest('You cannot deactivate your own account');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (!user.isActive) {
      throw ApiError.badRequest('User is already deactivated');
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { isActive: false },
      });
      await tx.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });

    const deactivated = await userRepository.findByIdWithManager(userId);
    return toPublicUserWithManager(deactivated!);
  }

  async assignEmployeeToManager(employeeId: string, input: AssignToManagerInput) {
    const employee = await userRepository.findById(employeeId);
    if (!employee) {
      throw ApiError.notFound('Employee not found');
    }

    if (employee.role !== Role.EMPLOYEE) {
      throw ApiError.badRequest('User must have the EMPLOYEE role');
    }

    const manager = await userRepository.findActiveById(input.managerId);
    if (!manager || manager.role !== Role.MANAGER) {
      throw ApiError.badRequest('Manager must be an active user with MANAGER role');
    }

    const updated = await userRepository.update(employeeId, {
      manager: { connect: { id: input.managerId } },
    });

    const withManager = await userRepository.findByIdWithManager(updated.id);
    return toPublicUserWithManager(withManager!);
  }

  async assignManagerToSeniorManager(managerId: string, input: AssignToSeniorManagerInput) {
    const manager = await userRepository.findById(managerId);
    if (!manager) {
      throw ApiError.notFound('Manager not found');
    }

    if (manager.role !== Role.MANAGER) {
      throw ApiError.badRequest('User must have the MANAGER role');
    }

    const seniorManager = await userRepository.findActiveById(input.seniorManagerId);
    if (!seniorManager || seniorManager.role !== Role.SENIOR_MANAGER) {
      throw ApiError.badRequest(
        'Senior manager must be an active user with SENIOR_MANAGER role',
      );
    }

    const updated = await userRepository.update(managerId, {
      manager: { connect: { id: input.seniorManagerId } },
    });

    const withManager = await userRepository.findByIdWithManager(updated.id);
    return toPublicUserWithManager(withManager!);
  }

  async listAllClaims(query: ListAdminClaimsQuery) {
    const { claims, total } = await claimRepository.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      status: query.status,
      category: query.category,
      employeeId: query.employeeId,
      expenseDateFrom: query.expenseDateFrom,
      expenseDateTo: query.expenseDateTo,
    });

    return {
      claims: claims.map(toManagerClaimResponse),
      meta: getPaginationMeta(total, query.page, query.limit),
    };
  }

  async getMonthlySummary(query: MonthlySummaryQuery) {
    const { summaries, total } = await adminRepository.getMonthlySummary({
      page: query.page,
      limit: query.limit,
      year: query.year,
    });

    return {
      summaries,
      meta: getPaginationMeta(total, query.page, query.limit),
    };
  }

  private async validateManagerAssignment(
    role: Role,
    managerId: string | null,
    userId?: string,
  ): Promise<void> {
    if (userId && managerId === userId) {
      throw ApiError.badRequest('User cannot be their own manager');
    }

    switch (role) {
      case Role.EMPLOYEE: {
        if (!managerId) {
          return;
        }
        const manager = await userRepository.findActiveById(managerId);
        if (!manager || manager.role !== Role.MANAGER) {
          throw ApiError.badRequest('Employee must be assigned to an active MANAGER');
        }
        break;
      }
      case Role.MANAGER: {
        if (!managerId) {
          return;
        }
        const seniorManager = await userRepository.findActiveById(managerId);
        if (!seniorManager || seniorManager.role !== Role.SENIOR_MANAGER) {
          throw ApiError.badRequest('Manager must be assigned to an active SENIOR_MANAGER');
        }
        break;
      }
      case Role.SENIOR_MANAGER:
      case Role.ADMIN: {
        if (managerId) {
          throw ApiError.badRequest(`${role} cannot have a manager assigned`);
        }
        break;
      }
      default:
        break;
    }
  }
}

export const adminService = new AdminService();

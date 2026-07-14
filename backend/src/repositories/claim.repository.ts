import { Claim, ClaimStatus, ExpenseCategory, Prisma } from '@prisma/client';
import { prisma } from '../config';
import { getSkipTake } from '../utils/pagination.util';

export interface FindOwnClaimsParams {
  employeeId: string;
  page: number;
  limit: number;
  search?: string;
  status?: ClaimStatus;
  category?: ExpenseCategory;
  expenseDateFrom?: Date;
  expenseDateTo?: Date;
}

export interface FindPendingWithParams {
  pendingWith: string;
  page: number;
  limit: number;
  search?: string;
  category?: ExpenseCategory;
  expenseDateFrom?: Date;
  expenseDateTo?: Date;
}

export interface CreateClaimData {
  employeeId: string;
  amount: Prisma.Decimal;
  category: ExpenseCategory;
  description: string;
  receiptUrl?: string | null;
  expenseDate: Date;
}

export type UpdateClaimData = Partial<Omit<CreateClaimData, 'employeeId'>>;

export interface UpdateClaimStatusData {
  status: ClaimStatus;
  pendingWith: string | null;
}

type TransactionClient = Prisma.TransactionClient;

const employeeSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
} as const;

export interface FindAllClaimsParams {
  page: number;
  limit: number;
  search?: string;
  status?: ClaimStatus;
  category?: ExpenseCategory;
  employeeId?: string;
  expenseDateFrom?: Date;
  expenseDateTo?: Date;
}

export class ClaimRepository {
  async create(data: CreateClaimData): Promise<Claim> {
    return prisma.claim.create({
      data: {
        employeeId: data.employeeId,
        amount: data.amount,
        category: data.category,
        description: data.description,
        receiptUrl: data.receiptUrl,
        expenseDate: data.expenseDate,
        status: ClaimStatus.DRAFT,
      },
    });
  }

  async findById(id: string): Promise<Claim | null> {
    return prisma.claim.findUnique({ where: { id } });
  }

  async findOwnById(id: string, employeeId: string): Promise<Claim | null> {
    return prisma.claim.findFirst({
      where: {
        id,
        employeeId,
      },
    });
  }

  async findByIdPendingWith(id: string, pendingWith: string) {
    return prisma.claim.findFirst({
      where: {
        id,
        pendingWith,
      },
      include: {
        employee: {
          select: employeeSelect,
        },
      },
    });
  }

  async findOwnClaims(params: FindOwnClaimsParams): Promise<{ claims: Claim[]; total: number }> {
    const { skip, take } = getSkipTake(params.page, params.limit);

    const where: Prisma.ClaimWhereInput = {
      employeeId: params.employeeId,
      ...(params.search && {
        description: {
          contains: params.search,
          mode: 'insensitive',
        },
      }),
      ...(params.status && { status: params.status }),
      ...(params.category && { category: params.category }),
      ...((params.expenseDateFrom || params.expenseDateTo) && {
        expenseDate: {
          ...(params.expenseDateFrom && { gte: params.expenseDateFrom }),
          ...(params.expenseDateTo && { lte: params.expenseDateTo }),
        },
      }),
    };

    const [claims, total] = await prisma.$transaction([
      prisma.claim.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.claim.count({ where }),
    ]);

    return { claims, total };
  }

  async findPendingWith(params: FindPendingWithParams) {
    const { skip, take } = getSkipTake(params.page, params.limit);

    const where: Prisma.ClaimWhereInput = {
      pendingWith: params.pendingWith,
      ...(params.search && {
        description: {
          contains: params.search,
          mode: 'insensitive',
        },
      }),
      ...(params.category && { category: params.category }),
      ...((params.expenseDateFrom || params.expenseDateTo) && {
        expenseDate: {
          ...(params.expenseDateFrom && { gte: params.expenseDateFrom }),
          ...(params.expenseDateTo && { lte: params.expenseDateTo }),
        },
      }),
    };

    const [claims, total] = await prisma.$transaction([
      prisma.claim.findMany({
        where,
        include: {
          employee: {
            select: employeeSelect,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.claim.count({ where }),
    ]);

    return { claims, total };
  }

  async findAll(params: FindAllClaimsParams) {
    const { skip, take } = getSkipTake(params.page, params.limit);

    const where: Prisma.ClaimWhereInput = {
      ...(params.search && {
        description: {
          contains: params.search,
          mode: 'insensitive',
        },
      }),
      ...(params.status && { status: params.status }),
      ...(params.category && { category: params.category }),
      ...(params.employeeId && { employeeId: params.employeeId }),
      ...((params.expenseDateFrom || params.expenseDateTo) && {
        expenseDate: {
          ...(params.expenseDateFrom && { gte: params.expenseDateFrom }),
          ...(params.expenseDateTo && { lte: params.expenseDateTo }),
        },
      }),
    };

    const [claims, total] = await prisma.$transaction([
      prisma.claim.findMany({
        where,
        include: {
          employee: {
            select: employeeSelect,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.claim.count({ where }),
    ]);

    return { claims, total };
  }

  async update(id: string, data: UpdateClaimData, tx: TransactionClient = prisma): Promise<Claim> {
    return tx.claim.update({
      where: { id },
      data,
    });
  }

  async updateStatus(
    id: string,
    data: UpdateClaimStatusData,
    tx: TransactionClient = prisma,
  ): Promise<Claim> {
    return tx.claim.update({
      where: { id },
      data: {
        status: data.status,
        pendingWith: data.pendingWith,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.claim.delete({
      where: { id },
    });
  }
}

export const claimRepository = new ClaimRepository();

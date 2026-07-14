import { ApprovalAction, ApprovalStep, ClaimStatus, Prisma } from '@prisma/client';
import { prisma } from '../config';
import { getSkipTake } from '../utils/pagination.util';

export interface CreateApprovalHistoryData {
  claimId: string;
  actorId: string;
  action: ApprovalAction;
  step: ApprovalStep;
  note?: string | null;
}

export interface FindManagerActionsParams {
  managerId: string;
  page: number;
  limit: number;
  search?: string;
  status?: ClaimStatus;
  actionDateFrom?: Date;
  actionDateTo?: Date;
}

type TransactionClient = Prisma.TransactionClient;

const actorSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  managerId: true,
} as const;

const claimSelect = {
  id: true,
  amount: true,
  category: true,
  description: true,
  status: true,
  expenseDate: true,
  employee: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
} as const;

export class ApprovalHistoryRepository {
  async create(
    data: CreateApprovalHistoryData,
    tx: TransactionClient = prisma,
  ) {
    return tx.approvalHistory.create({
      data: {
        claimId: data.claimId,
        actorId: data.actorId,
        action: data.action,
        step: data.step,
        note: data.note,
      },
    });
  }

  async findByClaimId(claimId: string) {
    return prisma.approvalHistory.findMany({
      where: { claimId },
      orderBy: { createdAt: 'asc' },
      include: {
        actor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async hasActorOnClaim(claimId: string, actorId: string): Promise<boolean> {
    const count = await prisma.approvalHistory.count({
      where: { claimId, actorId },
    });

    return count > 0;
  }

  async findByClaimIds(claimIds: string[]) {
    if (claimIds.length === 0) {
      return [];
    }

    return prisma.approvalHistory.findMany({
      where: { claimId: { in: claimIds } },
      orderBy: { createdAt: 'asc' },
      include: {
        actor: {
          select: {
            id: true,
            managerId: true,
          },
        },
      },
    });
  }

  async findManagerActions(params: FindManagerActionsParams) {
    const { skip, take } = getSkipTake(params.page, params.limit);

    const where: Prisma.ApprovalHistoryWhereInput = {
      actorId: params.managerId,
      step: ApprovalStep.MANAGER,
      ...(params.actionDateFrom || params.actionDateTo
        ? {
            createdAt: {
              ...(params.actionDateFrom && { gte: params.actionDateFrom }),
              ...(params.actionDateTo && { lte: params.actionDateTo }),
            },
          }
        : {}),
      ...(params.search && {
        OR: [
          { claim: { description: { contains: params.search, mode: 'insensitive' } } },
          {
            claim: {
              employee: { firstName: { contains: params.search, mode: 'insensitive' } },
            },
          },
          {
            claim: {
              employee: { lastName: { contains: params.search, mode: 'insensitive' } },
            },
          },
          {
            claim: {
              employee: { email: { contains: params.search, mode: 'insensitive' } },
            },
          },
        ],
      }),
      ...(params.status === ClaimStatus.REJECTED && { action: ApprovalAction.REJECTED }),
      ...(params.status === ClaimStatus.REVERTED_TO_EMPLOYEE && {
        action: ApprovalAction.REVISION_REQUESTED,
      }),
      ...(params.status === ClaimStatus.PENDING_SENIOR_MANAGER && {
        action: ApprovalAction.APPROVED,
        actor: { managerId: { not: null } },
      }),
      ...(params.status === ClaimStatus.APPROVED && {
        action: ApprovalAction.APPROVED,
        actor: { managerId: null },
      }),
    };

    const [entries, total] = await prisma.$transaction([
      prisma.approvalHistory.findMany({
        where,
        include: {
          actor: { select: actorSelect },
          claim: { select: claimSelect },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.approvalHistory.count({ where }),
    ]);

    return { entries, total };
  }
}

export const approvalHistoryRepository = new ApprovalHistoryRepository();

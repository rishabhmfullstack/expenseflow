import { ApprovalAction, ApprovalStep, Claim, ClaimStatus, Prisma, Role } from '@prisma/client';
import { prisma } from '../config';
import { approvalHistoryRepository, claimRepository, userRepository } from '../repositories';
import { ApiError, getPaginationMeta, toClaimResponse } from '../utils';
import { CreateClaimInput, ListClaimsQuery, UpdateClaimInput } from '../validators';
import type { ClaimResponse } from '../utils/claim-mapper.util';

export const EDITABLE_CLAIM_STATUSES: ClaimStatus[] = [
  ClaimStatus.DRAFT,
  ClaimStatus.REVERTED_TO_EMPLOYEE,
];

export const SUBMITTABLE_CLAIM_STATUSES: ClaimStatus[] = [
  ClaimStatus.DRAFT,
  ClaimStatus.REVERTED_TO_EMPLOYEE,
];

export type { ClaimResponse };

function assertEditable(claim: Claim): void {
  if (!EDITABLE_CLAIM_STATUSES.includes(claim.status)) {
    throw ApiError.forbidden(
      `Claim can only be edited when status is ${EDITABLE_CLAIM_STATUSES.join(' or ')}`,
    );
  }
}

export class ClaimService {
  async createClaim(employeeId: string, input: CreateClaimInput): Promise<ClaimResponse> {
    const claim = await claimRepository.create({
      employeeId,
      amount: new Prisma.Decimal(input.amount),
      category: input.category,
      description: input.description,
      receiptUrl: input.receiptUrl ?? null,
      expenseDate: input.expenseDate,
    });

    return toClaimResponse(claim);
  }

  async getOwnClaim(employeeId: string, claimId: string): Promise<ClaimResponse> {
    const claim = await claimRepository.findOwnById(claimId, employeeId);

    if (!claim) {
      throw ApiError.notFound('Claim not found');
    }

    return toClaimResponse(claim);
  }

  async listOwnClaims(employeeId: string, query: ListClaimsQuery) {
    const { claims, total } = await claimRepository.findOwnClaims({
      employeeId,
      page: query.page,
      limit: query.limit,
      search: query.search,
      status: query.status,
      category: query.category,
      expenseDateFrom: query.expenseDateFrom,
      expenseDateTo: query.expenseDateTo,
    });

    return {
      claims: claims.map(toClaimResponse),
      meta: getPaginationMeta(total, query.page, query.limit),
    };
  }

  async updateClaim(
    employeeId: string,
    claimId: string,
    input: UpdateClaimInput,
  ): Promise<ClaimResponse> {
    const existing = await claimRepository.findOwnById(claimId, employeeId);

    if (!existing) {
      throw ApiError.notFound('Claim not found');
    }

    assertEditable(existing);

    const claim = await claimRepository.update(claimId, {
      ...(input.amount !== undefined && { amount: new Prisma.Decimal(input.amount) }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.receiptUrl !== undefined && { receiptUrl: input.receiptUrl }),
      ...(input.expenseDate !== undefined && { expenseDate: input.expenseDate }),
    });

    return toClaimResponse(claim);
  }

  async deleteClaim(employeeId: string, claimId: string): Promise<void> {
    const existing = await claimRepository.findOwnById(claimId, employeeId);

    if (!existing) {
      throw ApiError.notFound('Claim not found');
    }

    assertEditable(existing);

    await claimRepository.delete(claimId);
  }

  async submitClaim(employeeId: string, claimId: string): Promise<ClaimResponse> {
    const claim = await claimRepository.findOwnById(claimId, employeeId);

    if (!claim) {
      throw ApiError.notFound('Claim not found');
    }

    if (!SUBMITTABLE_CLAIM_STATUSES.includes(claim.status)) {
      throw ApiError.badRequest(
        `Claim can only be submitted when status is ${SUBMITTABLE_CLAIM_STATUSES.join(' or ')}`,
      );
    }

    const employee = await userRepository.findActiveById(employeeId);

    if (!employee) {
      throw ApiError.unauthorized('User not found or inactive');
    }

    if (!employee.managerId) {
      throw ApiError.badRequest('Employee must have an assigned manager before submitting a claim');
    }

    const manager = await userRepository.findActiveById(employee.managerId);

    if (!manager || manager.role !== Role.MANAGER) {
      throw ApiError.badRequest('Assigned manager is invalid or inactive');
    }

    const historyAction =
      claim.status === ClaimStatus.DRAFT
        ? ApprovalAction.SUBMITTED
        : ApprovalAction.RESUBMITTED;

    const updatedClaim = await prisma.$transaction(async (tx) => {
      const result = await claimRepository.updateStatus(
        claim.id,
        {
          status: ClaimStatus.PENDING_MANAGER,
          pendingWith: employee.managerId,
        },
        tx,
      );

      await approvalHistoryRepository.create(
        {
          claimId: claim.id,
          actorId: employeeId,
          action: historyAction,
          step: ApprovalStep.MANAGER,
          note: null,
        },
        tx,
      );

      return result;
    });

    return toClaimResponse(updatedClaim);
  }
}

export const claimService = new ClaimService();

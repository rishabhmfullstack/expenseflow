import {
  ApprovalAction,
  ApprovalStep,
  Claim,
  ClaimStatus,
} from '@prisma/client';
import { prisma } from '../config';
import {
  approvalHistoryRepository,
  claimRepository,
  userRepository,
} from '../repositories';
import {
  ApiError,
  buildStatusTransitionMap,
  getPaginationMeta,
  toClaimResponse,
  toManagerActionHistoryResponse,
  toManagerClaimResponse,
} from '../utils';
import {
  ListPendingManagerClaimsQuery,
  ListManagerHistoryQuery,
  ManagerApproveInput,
  ManagerNoteInput,
} from '../validators';
import type { ClaimResponse, ManagerClaimResponse } from '../utils/claim-mapper.util';

const MANAGER_INITIAL_APPROVE_STATUS = ClaimStatus.PENDING_MANAGER;
const MANAGER_REAPPROVE_STATUS = ClaimStatus.REVERTED_TO_MANAGER;

export class ManagerService {
  async listPendingClaims(managerId: string, query: ListPendingManagerClaimsQuery) {
    const { claims, total } = await claimRepository.findPendingWith({
      pendingWith: managerId,
      page: query.page,
      limit: query.limit,
      search: query.search,
      category: query.category,
      expenseDateFrom: query.expenseDateFrom,
      expenseDateTo: query.expenseDateTo,
    });

    return {
      claims: claims.map(toManagerClaimResponse),
      meta: getPaginationMeta(total, query.page, query.limit),
    };
  }

  async getPendingClaim(managerId: string, claimId: string): Promise<ManagerClaimResponse> {
    const claim = await claimRepository.findByIdPendingWith(claimId, managerId);

    if (!claim) {
      throw ApiError.notFound('Claim not found or not pending with you');
    }

    return toManagerClaimResponse(claim);
  }

  async approve(
    managerId: string,
    claimId: string,
    input: ManagerApproveInput,
  ): Promise<ClaimResponse> {
    return this.forwardApproval(
      managerId,
      claimId,
      MANAGER_INITIAL_APPROVE_STATUS,
      input.note,
    );
  }

  async approveAfterSeniorManagerRevert(
    managerId: string,
    claimId: string,
    input: ManagerApproveInput,
  ): Promise<ClaimResponse> {
    return this.forwardApproval(
      managerId,
      claimId,
      MANAGER_REAPPROVE_STATUS,
      input.note,
    );
  }

  async reject(managerId: string, claimId: string, input: ManagerNoteInput): Promise<ClaimResponse> {
    const claim = await this.getClaimForManagerAction(
      managerId,
      claimId,
      [MANAGER_INITIAL_APPROVE_STATUS, MANAGER_REAPPROVE_STATUS],
    );

    const updatedClaim = await prisma.$transaction(async (tx) => {
      const result = await claimRepository.updateStatus(
        claim.id,
        {
          status: ClaimStatus.REJECTED,
          pendingWith: null,
        },
        tx,
      );

      await approvalHistoryRepository.create(
        {
          claimId: claim.id,
          actorId: managerId,
          action: ApprovalAction.REJECTED,
          step: ApprovalStep.MANAGER,
          note: input.note,
        },
        tx,
      );

      return result;
    });

    return toClaimResponse(updatedClaim);
  }

  async revertToEmployee(
    managerId: string,
    claimId: string,
    input: ManagerNoteInput,
  ): Promise<ClaimResponse> {
    const claim = await this.getClaimForManagerAction(
      managerId,
      claimId,
      [MANAGER_INITIAL_APPROVE_STATUS, MANAGER_REAPPROVE_STATUS],
    );

    const updatedClaim = await prisma.$transaction(async (tx) => {
      const result = await claimRepository.updateStatus(
        claim.id,
        {
          status: ClaimStatus.REVERTED_TO_EMPLOYEE,
          pendingWith: null,
        },
        tx,
      );

      await approvalHistoryRepository.create(
        {
          claimId: claim.id,
          actorId: managerId,
          action: ApprovalAction.REVISION_REQUESTED,
          step: ApprovalStep.MANAGER,
          note: input.note,
        },
        tx,
      );

      return result;
    });

    return toClaimResponse(updatedClaim);
  }

  async listActionHistory(managerId: string, query: ListManagerHistoryQuery) {
    const actionDateTo = query.actionDateTo
      ? new Date(
          Date.UTC(
            query.actionDateTo.getUTCFullYear(),
            query.actionDateTo.getUTCMonth(),
            query.actionDateTo.getUTCDate(),
            23,
            59,
            59,
            999,
          ),
        )
      : undefined;

    const { entries, total } = await approvalHistoryRepository.findManagerActions({
      managerId,
      page: query.page,
      limit: query.limit,
      search: query.search,
      status: query.status,
      actionDateFrom: query.actionDateFrom,
      actionDateTo,
    });

    const claimIds = [...new Set(entries.map((entry) => entry.claimId))];
    const claimHistory = await approvalHistoryRepository.findByClaimIds(claimIds);

    const transitionsByClaim = new Map<string, ReturnType<typeof buildStatusTransitionMap>>();
    for (const claimId of claimIds) {
      const history = claimHistory.filter((entry) => entry.claimId === claimId);
      transitionsByClaim.set(claimId, buildStatusTransitionMap(history));
    }

    const history = entries.map((entry) => {
      const transition = transitionsByClaim.get(entry.claimId)?.get(entry.id);

      return toManagerActionHistoryResponse({
        ...entry,
        previousStatus: transition?.previousStatus ?? ClaimStatus.DRAFT,
        newStatus: transition?.newStatus ?? entry.claim.status,
      });
    });

    return {
      history,
      meta: getPaginationMeta(total, query.page, query.limit),
    };
  }

  private async forwardApproval(
    managerId: string,
    claimId: string,
    requiredStatus: ClaimStatus,
    note?: string,
  ): Promise<ClaimResponse> {
    const claim = await this.getClaimForManagerAction(managerId, claimId, [requiredStatus]);

    const manager = await userRepository.findActiveById(managerId);
    if (!manager) {
      throw ApiError.unauthorized('Manager not found or inactive');
    }

    const nextState = this.resolveApprovalTarget(manager.managerId);

    const updatedClaim = await prisma.$transaction(async (tx) => {
      const result = await claimRepository.updateStatus(claim.id, nextState, tx);

      await approvalHistoryRepository.create(
        {
          claimId: claim.id,
          actorId: managerId,
          action: ApprovalAction.APPROVED,
          step: ApprovalStep.MANAGER,
          note: note ?? null,
        },
        tx,
      );

      return result;
    });

    return toClaimResponse(updatedClaim);
  }

  private resolveApprovalTarget(seniorManagerId: string | null): {
    status: ClaimStatus;
    pendingWith: string | null;
  } {
    if (seniorManagerId) {
      return {
        status: ClaimStatus.PENDING_SENIOR_MANAGER,
        pendingWith: seniorManagerId,
      };
    }

    return {
      status: ClaimStatus.APPROVED,
      pendingWith: null,
    };
  }

  private async getClaimForManagerAction(
    managerId: string,
    claimId: string,
    allowedStatuses: ClaimStatus[],
  ): Promise<Claim> {
    const claim = await claimRepository.findById(claimId);

    if (!claim) {
      throw ApiError.notFound('Claim not found');
    }

    if (claim.pendingWith !== managerId) {
      throw ApiError.forbidden('Claim is not pending with you');
    }

    if (!allowedStatuses.includes(claim.status)) {
      throw ApiError.badRequest(
        `Action not allowed for claim status ${claim.status}`,
      );
    }

    return claim;
  }
}

export const managerService = new ManagerService();

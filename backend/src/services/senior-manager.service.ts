import {
  ApprovalAction,
  ApprovalStep,
  Claim,
  ClaimStatus,
  Role,
} from '@prisma/client';
import { prisma } from '../config';
import {
  approvalHistoryRepository,
  claimRepository,
  userRepository,
} from '../repositories';
import { ApiError, getPaginationMeta, toClaimResponse, toManagerClaimResponse } from '../utils';
import {
  ListPendingSeniorManagerClaimsQuery,
  SeniorManagerApproveInput,
  SeniorManagerNoteInput,
} from '../validators';
import type { ClaimResponse, ManagerClaimResponse } from '../utils/claim-mapper.util';

const SENIOR_MANAGER_ACTION_STATUS = ClaimStatus.PENDING_SENIOR_MANAGER;

export class SeniorManagerService {
  async listPendingClaims(
    seniorManagerId: string,
    query: ListPendingSeniorManagerClaimsQuery,
  ) {
    const { claims, total } = await claimRepository.findPendingWith({
      pendingWith: seniorManagerId,
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

  async getPendingClaim(
    seniorManagerId: string,
    claimId: string,
  ): Promise<ManagerClaimResponse> {
    const claim = await claimRepository.findByIdPendingWith(claimId, seniorManagerId);

    if (!claim) {
      throw ApiError.notFound('Claim not found or not pending with you');
    }

    return toManagerClaimResponse(claim);
  }

  async approve(
    seniorManagerId: string,
    claimId: string,
    input: SeniorManagerApproveInput,
  ): Promise<ClaimResponse> {
    const claim = await this.getClaimForSeniorManagerAction(seniorManagerId, claimId);

    const updatedClaim = await prisma.$transaction(async (tx) => {
      const result = await claimRepository.updateStatus(
        claim.id,
        {
          status: ClaimStatus.APPROVED,
          pendingWith: null,
        },
        tx,
      );

      await approvalHistoryRepository.create(
        {
          claimId: claim.id,
          actorId: seniorManagerId,
          action: ApprovalAction.APPROVED,
          step: ApprovalStep.SENIOR_MANAGER,
          note: input.note ?? null,
        },
        tx,
      );

      return result;
    });

    return toClaimResponse(updatedClaim);
  }

  async reject(
    seniorManagerId: string,
    claimId: string,
    input: SeniorManagerNoteInput,
  ): Promise<ClaimResponse> {
    const claim = await this.getClaimForSeniorManagerAction(seniorManagerId, claimId);

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
          actorId: seniorManagerId,
          action: ApprovalAction.REJECTED,
          step: ApprovalStep.SENIOR_MANAGER,
          note: input.note,
        },
        tx,
      );

      return result;
    });

    return toClaimResponse(updatedClaim);
  }

  async revertToManager(
    seniorManagerId: string,
    claimId: string,
    input: SeniorManagerNoteInput,
  ): Promise<ClaimResponse> {
    const claim = await this.getClaimForSeniorManagerAction(seniorManagerId, claimId);
    const managerId = await this.resolveManagerForRevert(claim);

    const updatedClaim = await prisma.$transaction(async (tx) => {
      const result = await claimRepository.updateStatus(
        claim.id,
        {
          status: ClaimStatus.REVERTED_TO_MANAGER,
          pendingWith: managerId,
        },
        tx,
      );

      await approvalHistoryRepository.create(
        {
          claimId: claim.id,
          actorId: seniorManagerId,
          action: ApprovalAction.REVISION_REQUESTED,
          step: ApprovalStep.SENIOR_MANAGER,
          note: input.note,
        },
        tx,
      );

      return result;
    });

    return toClaimResponse(updatedClaim);
  }

  private async resolveManagerForRevert(claim: Claim): Promise<string> {
    const submitter = await userRepository.findActiveById(claim.employeeId);

    if (!submitter) {
      throw ApiError.badRequest('Claim submitter not found or inactive');
    }

    if (submitter.role === Role.MANAGER) {
      return submitter.id;
    }

    if (!submitter.managerId) {
      throw ApiError.badRequest('Cannot revert to manager: employee has no assigned manager');
    }

    const manager = await userRepository.findActiveById(submitter.managerId);

    if (!manager || manager.role !== Role.MANAGER) {
      throw ApiError.badRequest('Cannot revert to manager: assigned manager is invalid');
    }

    return manager.id;
  }

  private async getClaimForSeniorManagerAction(
    seniorManagerId: string,
    claimId: string,
  ): Promise<Claim> {
    const claim = await claimRepository.findById(claimId);

    if (!claim) {
      throw ApiError.notFound('Claim not found');
    }

    if (claim.pendingWith !== seniorManagerId) {
      throw ApiError.forbidden('Claim is not pending with you');
    }

    if (claim.status !== SENIOR_MANAGER_ACTION_STATUS) {
      throw ApiError.badRequest(
        `Action not allowed for claim status ${claim.status}`,
      );
    }

    return claim;
  }
}

export const seniorManagerService = new SeniorManagerService();

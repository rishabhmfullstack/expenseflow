import { Claim, Role } from '@prisma/client';
import {
  approvalHistoryRepository,
  claimRepository,
  userRepository,
} from '../repositories';
import { ApiError, toApprovalHistoryResponse, type ApprovalHistoryResponse } from '../utils';

export class ApprovalService {
  async getClaimHistory(
    userId: string,
    role: Role,
    claimId: string,
  ): Promise<ApprovalHistoryResponse[]> {
    const claim = await claimRepository.findById(claimId);

    if (!claim) {
      throw ApiError.notFound('Claim not found');
    }

    const canAccess = await this.canAccessClaimHistory(userId, role, claim);

    if (!canAccess) {
      throw ApiError.forbidden('You do not have access to this claim history');
    }

    const history = await approvalHistoryRepository.findByClaimId(claimId);
    return history.map(toApprovalHistoryResponse);
  }

  private async canAccessClaimHistory(
    userId: string,
    role: Role,
    claim: Claim,
  ): Promise<boolean> {
    if (role === Role.ADMIN) {
      return true;
    }

    if (role === Role.EMPLOYEE) {
      return claim.employeeId === userId;
    }

    if (claim.pendingWith === userId) {
      return true;
    }

    if (role === Role.MANAGER) {
      const employee = await userRepository.findById(claim.employeeId);
      if (employee?.managerId === userId) {
        return true;
      }

      return approvalHistoryRepository.hasActorOnClaim(claim.id, userId);
    }

    if (role === Role.SENIOR_MANAGER) {
      const employee = await userRepository.findByIdWithManager(claim.employeeId);

      if (employee?.managerId) {
        const manager = await userRepository.findById(employee.managerId);
        if (manager?.managerId === userId) {
          return true;
        }
      }

      return approvalHistoryRepository.hasActorOnClaim(claim.id, userId);
    }

    return false;
  }
}

export const approvalService = new ApprovalService();

import { RequestHandler } from 'express';
import { approvalService } from '../services';

export class ApprovalController {
  getClaimHistory: RequestHandler = async (req, res) => {
    const claimId = req.params.id as string;
    const history = await approvalService.getClaimHistory(req.user!.id, req.user!.role, claimId);

    res.status(200).json({
      success: true,
      data: { history },
    });
  };
}

export const approvalController = new ApprovalController();

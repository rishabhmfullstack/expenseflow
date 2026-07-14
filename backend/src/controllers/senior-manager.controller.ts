import { RequestHandler } from 'express';
import { seniorManagerService } from '../services';
import { validatedQuery } from '../middlewares/validate.middleware';
import {
  ListPendingSeniorManagerClaimsQuery,
  SeniorManagerApproveInput,
  SeniorManagerNoteInput,
} from '../validators';

export class SeniorManagerController {
  listPending: RequestHandler = async (req, res) => {
    const result = await seniorManagerService.listPendingClaims(
      req.user!.id,
      validatedQuery<ListPendingSeniorManagerClaimsQuery>(req),
    );

    res.status(200).json({
      success: true,
      data: { claims: result.claims },
      meta: result.meta,
    });
  };

  getPending: RequestHandler = async (req, res) => {
    const claimId = req.params.id as string;
    const claim = await seniorManagerService.getPendingClaim(req.user!.id, claimId);

    res.status(200).json({
      success: true,
      data: { claim },
    });
  };

  approve: RequestHandler = async (req, res) => {
    const claimId = req.params.id as string;
    const claim = await seniorManagerService.approve(
      req.user!.id,
      claimId,
      req.body as SeniorManagerApproveInput,
    );

    res.status(200).json({
      success: true,
      data: { claim },
    });
  };

  reject: RequestHandler = async (req, res) => {
    const claimId = req.params.id as string;
    const claim = await seniorManagerService.reject(
      req.user!.id,
      claimId,
      req.body as SeniorManagerNoteInput,
    );

    res.status(200).json({
      success: true,
      data: { claim },
    });
  };

  revertToManager: RequestHandler = async (req, res) => {
    const claimId = req.params.id as string;
    const claim = await seniorManagerService.revertToManager(
      req.user!.id,
      claimId,
      req.body as SeniorManagerNoteInput,
    );

    res.status(200).json({
      success: true,
      data: { claim },
    });
  };
}

export const seniorManagerController = new SeniorManagerController();

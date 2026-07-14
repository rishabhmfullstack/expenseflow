import { RequestHandler } from 'express';
import { managerService } from '../services';
import { validatedQuery } from '../middlewares/validate.middleware';
import {
  ListPendingManagerClaimsQuery,
  ListManagerHistoryQuery,
  ManagerApproveInput,
  ManagerNoteInput,
} from '../validators';

export class ManagerController {
  listPending: RequestHandler = async (req, res) => {
    const result = await managerService.listPendingClaims(
      req.user!.id,
      validatedQuery<ListPendingManagerClaimsQuery>(req),
    );

    res.status(200).json({
      success: true,
      data: { claims: result.claims },
      meta: result.meta,
    });
  };

  getPending: RequestHandler = async (req, res) => {
    const claimId = req.params.id as string;
    const claim = await managerService.getPendingClaim(req.user!.id, claimId);

    res.status(200).json({
      success: true,
      data: { claim },
    });
  };

  approve: RequestHandler = async (req, res) => {
    const claimId = req.params.id as string;
    const claim = await managerService.approve(
      req.user!.id,
      claimId,
      req.body as ManagerApproveInput,
    );

    res.status(200).json({
      success: true,
      data: { claim },
    });
  };

  approveAfterSeniorManagerRevert: RequestHandler = async (req, res) => {
    const claimId = req.params.id as string;
    const claim = await managerService.approveAfterSeniorManagerRevert(
      req.user!.id,
      claimId,
      req.body as ManagerApproveInput,
    );

    res.status(200).json({
      success: true,
      data: { claim },
    });
  };

  reject: RequestHandler = async (req, res) => {
    const claimId = req.params.id as string;
    const claim = await managerService.reject(
      req.user!.id,
      claimId,
      req.body as ManagerNoteInput,
    );

    res.status(200).json({
      success: true,
      data: { claim },
    });
  };

  revertToEmployee: RequestHandler = async (req, res) => {
    const claimId = req.params.id as string;
    const claim = await managerService.revertToEmployee(
      req.user!.id,
      claimId,
      req.body as ManagerNoteInput,
    );

    res.status(200).json({
      success: true,
      data: { claim },
    });
  };

  listHistory: RequestHandler = async (req, res) => {
    const result = await managerService.listActionHistory(
      req.user!.id,
      validatedQuery<ListManagerHistoryQuery>(req),
    );

    res.status(200).json({
      success: true,
      data: { history: result.history },
      meta: result.meta,
    });
  };
}

export const managerController = new ManagerController();

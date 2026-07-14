import { RequestHandler } from 'express';
import { claimService } from '../services';
import { validatedQuery } from '../middlewares/validate.middleware';
import { CreateClaimInput, ListClaimsQuery, UpdateClaimInput } from '../validators';

export class ClaimController {
  create: RequestHandler = async (req, res) => {
    const claim = await claimService.createClaim(req.user!.id, req.body as CreateClaimInput);

    res.status(201).json({
      success: true,
      data: { claim },
    });
  };

  list: RequestHandler = async (req, res) => {
    const result = await claimService.listOwnClaims(
      req.user!.id,
      validatedQuery<ListClaimsQuery>(req),
    );

    res.status(200).json({
      success: true,
      data: { claims: result.claims },
      meta: result.meta,
    });
  };

  getById: RequestHandler = async (req, res) => {
    const claimId = req.params.id as string;
    const claim = await claimService.getOwnClaim(req.user!.id, claimId);

    res.status(200).json({
      success: true,
      data: { claim },
    });
  };

  update: RequestHandler = async (req, res) => {
    const claimId = req.params.id as string;
    const claim = await claimService.updateClaim(
      req.user!.id,
      claimId,
      req.body as UpdateClaimInput,
    );

    res.status(200).json({
      success: true,
      data: { claim },
    });
  };

  delete: RequestHandler = async (req, res) => {
    const claimId = req.params.id as string;
    await claimService.deleteClaim(req.user!.id, claimId);

    res.status(200).json({
      success: true,
      data: { message: 'Claim deleted successfully' },
    });
  };

  submit: RequestHandler = async (req, res) => {
    const claimId = req.params.id as string;
    const claim = await claimService.submitClaim(req.user!.id, claimId);

    res.status(200).json({
      success: true,
      data: { claim },
    });
  };
}

export const claimController = new ClaimController();

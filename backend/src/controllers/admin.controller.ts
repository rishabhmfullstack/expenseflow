import { RequestHandler } from 'express';
import { adminService } from '../services';
import { validatedQuery } from '../middlewares/validate.middleware';
import {
  AssignToManagerInput,
  AssignToSeniorManagerInput,
  CreateAdminUserInput,
  ListAdminClaimsQuery,
  ListAdminUsersQuery,
  MonthlySummaryQuery,
  UpdateAdminUserInput,
} from '../validators';

export class AdminController {
  listUsers: RequestHandler = async (req, res) => {
    const result = await adminService.listUsers(validatedQuery<ListAdminUsersQuery>(req));

    res.status(200).json({
      success: true,
      data: { users: result.users },
      meta: result.meta,
    });
  };

  createUser: RequestHandler = async (req, res) => {
    const user = await adminService.createUser(req.body as CreateAdminUserInput);

    res.status(201).json({
      success: true,
      data: { user },
    });
  };

  getUser: RequestHandler = async (req, res) => {
    const userId = req.params.id as string;
    const user = await adminService.getUser(userId);

    res.status(200).json({
      success: true,
      data: { user },
    });
  };

  updateUser: RequestHandler = async (req, res) => {
    const userId = req.params.id as string;
    const user = await adminService.updateUser(userId, req.body as UpdateAdminUserInput);

    res.status(200).json({
      success: true,
      data: { user },
    });
  };

  deleteUser: RequestHandler = async (req, res) => {
    const userId = req.params.id as string;
    await adminService.deleteUser(req.user!.id, userId);

    res.status(200).json({
      success: true,
      data: { message: 'User deleted successfully' },
    });
  };

  deactivateUser: RequestHandler = async (req, res) => {
    const userId = req.params.id as string;
    const user = await adminService.deactivateUser(req.user!.id, userId);

    res.status(200).json({
      success: true,
      data: { user },
    });
  };

  assignEmployeeToManager: RequestHandler = async (req, res) => {
    const employeeId = req.params.id as string;
    const user = await adminService.assignEmployeeToManager(
      employeeId,
      req.body as AssignToManagerInput,
    );

    res.status(200).json({
      success: true,
      data: { user },
    });
  };

  assignManagerToSeniorManager: RequestHandler = async (req, res) => {
    const managerId = req.params.id as string;
    const user = await adminService.assignManagerToSeniorManager(
      managerId,
      req.body as AssignToSeniorManagerInput,
    );

    res.status(200).json({
      success: true,
      data: { user },
    });
  };

  listAllClaims: RequestHandler = async (req, res) => {
    const result = await adminService.listAllClaims(validatedQuery<ListAdminClaimsQuery>(req));

    res.status(200).json({
      success: true,
      data: { claims: result.claims },
      meta: result.meta,
    });
  };

  getMonthlySummary: RequestHandler = async (req, res) => {
    const result = await adminService.getMonthlySummary(
      validatedQuery<MonthlySummaryQuery>(req),
    );

    res.status(200).json({
      success: true,
      data: { summaries: result.summaries },
      meta: result.meta,
    });
  };
}

export const adminController = new AdminController();

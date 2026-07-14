import { RequestHandler } from 'express';

export class UserController {
  // Business logic to be implemented
}

export const userController = new UserController();

export const placeholderUserHandler: RequestHandler = (_req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'User routes not implemented yet',
    },
  });
};

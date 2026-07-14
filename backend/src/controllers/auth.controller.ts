import { RequestHandler } from 'express';
import { authService } from '../services';
import { clearRefreshTokenCookie, setRefreshTokenCookie } from '../utils/cookie.util';
import { LoginInput, RegisterInput } from '../validators';

export class AuthController {
  signup: RequestHandler = async (req, res) => {
    const result = await authService.signup(req.body as RegisterInput);

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  };

  login: RequestHandler = async (req, res) => {
    const result = await authService.login(req.body as LoginInput);

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  };

  refresh: RequestHandler = async (req, res) => {
    const result = await authService.refresh(req.refreshToken!);

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  };

  logout: RequestHandler = async (req, res) => {
    if (req.refreshToken) {
      await authService.logout(req.refreshToken);
    }

    clearRefreshTokenCookie(res);

    res.status(200).json({
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    });
  };

  me: RequestHandler = async (req, res) => {
    const user = await authService.getMe(req.user!.id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  };
}

export const authController = new AuthController();

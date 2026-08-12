import { Request, Response } from "express";
import {
  loginUser,
  logOutUserService,
  refreshAccessToken,
  registerUser,
} from "../services/auth.service.js";
import {
  AuthenticatedRequest,
} from "../middlewares/auth.middleware.js";
import { AppError } from "../errors/Apperror.js";

export async function register(req: Request, res: Response) {
  const user = await registerUser(req.body);

  res.status(201).json({
    success: true,
    data: user,
  });
}

export async function login(req: Request, res: Response) {
  const user = await loginUser(req.body);

  res.cookie("refreshToken", user.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    data: {
      accessToken: user.accessToken,
      user: user.user,
    },
  });
}

export async function refreshTokenController(
  req: Request,
  res: Response
) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: {
        code: "REFRESH_TOKEN_MISSING",
        message: "Refresh token is missing",
      },
    });
  }

  const result = await refreshAccessToken(refreshToken);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
}

export async function logOutUserController(
  req: Request,
  res: Response
) {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await logOutUserService(refreshToken);
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(200).json({
    success: true,
    data: {
      message: "User logged out successfully",
    },
  });
}

export async function getMe(
  req: AuthenticatedRequest,
  res: Response
) {
  res.status(200).json({
    success: true,
    data: {
      id: req.user?.sub,
      email: req.user?.email,
      role: req.user?.role,
    },
  });
}
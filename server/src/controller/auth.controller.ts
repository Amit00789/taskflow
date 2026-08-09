import { Request, Response } from "express";
import {
  loginUser,
  registerUser,
} from "../services/auth.service.js";
import {
  AuthenticatedRequest,
} from "../middlewares/auth.middleware.js";

export async function register(req: Request, res: Response) {
  const user = await registerUser(req.body);

  res.status(201).json({
    success: true,
    data: user,
  });
}

export async function login(req: Request, res: Response) {
  const user = await loginUser(req.body);

  res.status(200).json({
    success: true,
    data: user,
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
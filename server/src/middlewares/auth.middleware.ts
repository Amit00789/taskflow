import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

export interface AuthenticatedRequest<
  P = Record<string, string>
> extends Request<P> {
  user?: {
    sub: string;
    email: string;
    role: string;
  };
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_AUTH_HEADER",
        message: "Invalid authorization header",
      },
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded !== "object" || !decoded.sub) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid authentication token",
        },
      });
    }

    req.user = {
      sub: decoded.sub,
      email: decoded.email as string,
      role: decoded.role as string,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid or expired token",
      },
    });
  }
}
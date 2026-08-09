import jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "15m",
  });
}
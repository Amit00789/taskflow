import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

if (!JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET is not configured");
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  sub: string;
}

export function generateAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "15m",
  });
}

export function generateRefreshToken(payload: RefreshTokenPayload) {
  return jwt.sign({
    ...payload,
    jti: crypto.randomUUID(),
  },
    JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    });
}
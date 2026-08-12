import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { AppError } from "../errors/Apperror.js";
import { generateAccessToken, generateRefreshToken, RefreshTokenPayload } from "../utils/jwt.js";
import jwt from "jsonwebtoken";
import { hashToken } from "../utils/auth.util.js";
import { RefreshToken } from "../models/refreshToken.model.js";
import crypto from "crypto";

const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET ?? "";

if (!JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET is not configured");
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}


export async function registerUser(input: RegisterInput) {
  const { name, email, password } = input;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError(
      "A user with this email already exists",
      409,
      "USER_ALREADY_EXISTS"
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
}


export async function loginUser(input: LoginInput) {
  const { email, password } = input;

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(
      "Invalid email or password",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    throw new AppError(
      "Invalid email or password",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  const familyId = crypto.randomUUID();
  const accessToken = generateAccessToken({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    sub: user._id.toString(),
  });

  const tokenHash = hashToken(refreshToken);

  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt,
    familyId
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function refreshAccessToken(
  refreshToken: string
) {
  const decoded = jwt.verify(
    refreshToken,
    JWT_REFRESH_SECRET
  ) as RefreshTokenPayload;

  const tokenHash = hashToken(refreshToken);

  const storedToken = await RefreshToken.findOne({
    tokenHash,
  });

  if (!storedToken) {
    throw new AppError(
      "Invalid refresh token",
      401,
      "INVALID_REFRESH_TOKEN"
    );
  }

  if (storedToken.revoked) {
    if (storedToken.replacedBy) {
      // Refresh token was already rotated.
      // Someone is trying to reuse an old refresh token.

      await RefreshToken.updateMany(
        {
          familyId: storedToken.familyId,
          revoked: false,
        },
        {
          $set: {
            revoked: true,
          },
        }
      );
      throw new AppError(
        "Refresh token reuse detected",
        401,
        "REFRESH_TOKEN_REUSE_DETECTED"
      );
    }

    // Token was revoked for some other reason,
    // such as logout.
    throw new AppError(
      "Refresh token has been revoked",
      401,
      "REFRESH_TOKEN_REVOKED"
    );
  }

  if (storedToken.expiresAt < new Date()) {
    throw new AppError(
      "Refresh token has expired",
      401,
      "REFRESH_TOKEN_EXPIRED"
    );
  }

  const user = await User.findById(decoded.sub);

  if (!user) {
    throw new AppError(
      "Invalid refresh token",
      401,
      "INVALID_REFRESH_TOKEN"
    );
  }

  // Generate new access token
  const accessToken = generateAccessToken({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  // Generate new refresh token
  const newRefreshToken = generateRefreshToken({
    sub: user._id.toString(),
  });

  const newTokenHash = hashToken(newRefreshToken);

  const newExpiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  // Create new refresh-token record
  const newStoredToken = await RefreshToken.create({
    userId: user._id,
    tokenHash: newTokenHash,
    familyId: storedToken.familyId,
    expiresAt: newExpiresAt,
    revoked: false,
  });

  // Revoke old token and link it to the new token
  storedToken.revoked = true;
  storedToken.replacedBy = newStoredToken._id;

  await storedToken.save();

  return {
    accessToken,
    refreshToken: newRefreshToken,

    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  }
}

export async function logOutUserService(
  refreshToken: string
) {
  jwt.verify(
    refreshToken,
    JWT_REFRESH_SECRET
  ) as RefreshTokenPayload;

  const tokenHash = hashToken(refreshToken);

  const storedToken = await RefreshToken
    .findOne({
      tokenHash,
    });

  if (!storedToken) {
    throw new AppError(
      "Invalid refresh token",
      401,
      "INVALID_REFRESH_TOKEN"
    );
  }

  storedToken.revoked = true;

  await storedToken.save();


}
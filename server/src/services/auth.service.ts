import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { AppError } from "../errors/Apperror.js";
import { generateAccessToken } from "../utils/jwt.js";

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

  const accessToken = generateAccessToken({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
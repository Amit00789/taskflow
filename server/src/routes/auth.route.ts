import { Router } from "express";
import {
    getMe,
    login,
    register,
    refreshTokenController,
    logOutUserController
} from "../controller/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    loginSchema,
    registerSchema,
} from "../validators/auth.validator.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/register",
    validate(registerSchema),
    register
);

router.post(
    "/login",
    validate(loginSchema),
    login
);

router.post(
    "/refresh",
    refreshTokenController
);

router.post(
    "/logout",
    logOutUserController
);

router.get(
    "/me",
    authenticate,
    getMe
);

export default router;
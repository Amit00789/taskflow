import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { createTodoController } from "../controller/todo.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  createTodoController
);

export default router;
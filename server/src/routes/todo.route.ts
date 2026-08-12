import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { completeAllTodosController, createTodoController, deleteAllTodosController, deleteTodoByIdController, getTodoByIdController, getTodoController, updateTodoByIdController } from "../controller/todo.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  createTodoController
);

router.get(
  "/",
  authenticate,
  getTodoController
);

router.patch(
  "/complete-all",
  authenticate,
  completeAllTodosController
);

router.delete(
  "/",
  authenticate,
  deleteAllTodosController
);

router.get(
  "/:id",
  authenticate,
  getTodoByIdController
);

router.patch(
  "/:id",
  authenticate,
  updateTodoByIdController
);

router.delete(
  "/:id",
  authenticate,
  deleteTodoByIdController
);

export default router;
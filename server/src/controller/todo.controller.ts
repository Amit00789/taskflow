import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { createTodo } from "../services/todo.service.js";

export async function createTodoController(
  req: AuthenticatedRequest,
  res: Response
) {
  const todo = await createTodo(
    req.user!.sub,
    req.body
  );

  res.status(201).json({
    success: true,
    data: todo,
  });
}
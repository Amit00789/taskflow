import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { completeAllTodos, createTodo, deleteAllTodos, deleteTodoById, getTodo, getTodoById, updateTodoById } from "../services/todo.service.js";

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
};

export async function getTodoController(
  req: AuthenticatedRequest,
  res: Response
) {
  const todo = await getTodo(
    req.user!.sub
  );
  res.status(200).json({
    success: true,
    data: todo,
  });
};

export async function getTodoByIdController(
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) {
  const todo = await getTodoById(
    req.user!.sub,
    req.params.id
  );

  if (!todo) {
    return res.status(404).json({
      success: false,
      message: "Todo not found",
    });
  }

  res.status(200).json({
    success: true,
    data: todo,
  });
};

export async function completeAllTodosController(
  req: AuthenticatedRequest,
  res: Response
) {
  const result = await completeAllTodos(
    req.user!.sub
  );

  res.status(200).json({
    success: true,
    data: {
      modifiedCount: result.modifiedCount,
    },
  });
}

export async function deleteTodoByIdController(
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) {
  const todo = await deleteTodoById(
    req.user!.sub,
    req.params.id
  );

  res.status(200).json({
    success: true,
    message: "Task has been deleted",
  });
}

export async function updateTodoByIdController(
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) {
  const todo = await updateTodoById(
    req.user!.sub,
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    data: todo,
  });
}

export async function deleteAllTodosController(
  req: AuthenticatedRequest,
  res: Response
) {
  const result = await deleteAllTodos(
    req.user!.sub
  );

  res.status(200).json({
    success: true,
    data: {
      deletedCount: result.deletedCount,
    },
  });
}
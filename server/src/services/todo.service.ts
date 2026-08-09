import mongoose from "mongoose";
import { Todo } from "../models/todo.model.js";
import { AppError } from "../errors/Apperror.js";

interface CreateTodoInput {
  title: string;
  description?: string;
}

export async function createTodo(
  userId: string,
  input: CreateTodoInput
) {
  const todo = await Todo.create({
    title: input.title,
    description: input.description,
    userId: new mongoose.Types.ObjectId(userId),
  });

  return todo;
}
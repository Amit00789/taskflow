import mongoose from "mongoose";
import { Todo } from "../models/todo.model.js";
import { AppError } from "../errors/Apperror.js";

interface CreateTodoInput {
  title: string;
  description?: string;
  startDate: Date;
  expectedCompletionDate: Date;
}

interface UpdateTodoInput {
  title?: string;
  description?: string;
  startDate?: Date;
  expectedCompletionDate?: Date;
  completed?: boolean;
}

export async function createTodo(
  userId: string,
  input: CreateTodoInput
) {
  const todo = await Todo.create({
    title: input.title,
    description: input.description,
    startDate: input.startDate,
    expectedCompletionDate: input.expectedCompletionDate,
    userId: new mongoose.Types.ObjectId(userId),
  });

  return todo;
}

export async function getTodo(
  userId: string
) {
  return Todo.find({
    userId
  });
}

export async function getTodoById(
  userId: string,
  todoId: string,
) {
  return Todo.findOne({
    userId: userId,
    _id: todoId
  });
}

export async function updateTodoById(
  userId: string,
  todoId: string,
  input: UpdateTodoInput
) {
  const todo = await Todo.findOneAndUpdate(
    {
      _id: todoId,
      userId,
    },
    {
      $set: input,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!todo) {
    throw new AppError(
      "Todo does not exist",
      404,
      "TODO_DOES_NOT_EXIST"
    );
  }

  return todo;
}

export async function deleteTodoById(
  userId: string,
  todoId: string
) {
  const todo = await Todo.findOneAndDelete({
    _id: todoId,
    userId,
  });

  if (!todo) {
    throw new AppError(
      "Todo does not exist",
      404,
      "TODO_DOES_NOT_EXIST"
    );
  }

  return todo;
}

export async function completeAllTodos(
  userId: string
) {
  const result = await Todo.updateMany(
    {
      userId,
      completed: false,
    },
    {
      $set: {
        completed: true,
        completedAt: new Date(),
      },
    }
  );

  return result;
}

export async function deleteAllTodos(
  userId: string
) {
  const result = await Todo.deleteMany({
    userId,
  });

  return result;
}
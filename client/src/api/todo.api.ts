import { api } from "./axios";

export function getTodos() {
    return api.get("/api/todos");
}

export function createTodo(data: {
    title: string;
    description?: string;
    startDate?: string;
    expectedCompletionDate?: string;
}) {
    return api.post("/api/todos", data);
}

export function updateTodoById(
    id: string,
    data: {
        title?: string;
        description?: string;
        startDate?: string;
        expectedCompletionDate?: string;
        completed?: boolean;
    }
) {
    return api.patch(`/api/todos/${id}`, data);
}

export function deleteTodoById(id: string) {
    return api.delete(`/api/todos/${id}`);
}

export function completeAllTodos() {
    return api.patch("/api/todos/complete-all");
}

export function deleteAllTodos() {
    return api.delete("/api/todos/");
}
import { api } from "./axios";

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}


export async function loginUser(input: LoginInput) {
    const response = await api.post("/api/auth/login", input);

    return response.data;
}


export async function registerUser(input: RegisterInput) {
    const response = await api.post("/api/auth/register", input);

    return response.data;
}

export async function refreshAccessToken() {
    const response = await api.post(
        "/api/auth/refresh"
    );

    return response.data;
}

export async function logoutUser() {
    const response = await api.post("/api/auth/logout");

    return response.data;
}
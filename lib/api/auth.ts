import { request } from "./client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  AuthUser,
} from "./types";

export function login(data: LoginRequest): Promise<AuthResponse> {
  return request<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function register(data: RegisterRequest): Promise<AuthResponse> {
  return request<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMe(): Promise<AuthUser> {
  return request<AuthUser>("/api/v1/auth/me", {
    method: "GET",
  });
}

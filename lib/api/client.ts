import type { ApiResponse } from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://35.240.178.148:10086";

export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  } catch {
    throw new ApiError(-1, "网络连接失败，请稍后重试");
  }

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent("growpilot:unauthorized"));
    throw new ApiError(401, "登录已过期，请重新登录");
  }

  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(res.status, `服务器错误 (${res.status})`);
  }

  if (json.code !== 0) {
    throw new ApiError(json.code, json.message || "请求失败");
  }

  return json.data as T;
}

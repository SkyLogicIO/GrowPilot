import { request } from "./client";

// ─── 类型 ─────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  system_instruction?: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
}

export interface ChatResponse {
  status: string;
  content: string;
  model: string;
  latency_ms: number;
}

// ─── 单轮生成 ─────────────────────────────────────────────────

export interface GenerateRequest {
  prompt: string;
  system_instruction?: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
}

// ─── Token 估算 ───────────────────────────────────────────────

export interface CountTokensRequest {
  text: string;
}

export interface CountTokensResponse {
  text_length: number;
  estimated_tokens: number;
  estimated_cost_usd: number;
  model: string;
}

// ─── 模型列表 ─────────────────────────────────────────────────

export interface GeminiModel {
  name: string;
  display_name: string;
  description: string;
  context_window: number;
  input_price: number;
  output_price: number;
}

export interface ModelsResponse {
  models: GeminiModel[];
  default_model: string;
}

// ─── 接口 ─────────────────────────────────────────────────────

export function chat(data: ChatRequest): Promise<ChatResponse> {
  return request<ChatResponse>("/api/v1/gemini/chat", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function generate(data: GenerateRequest): Promise<ChatResponse> {
  return request<ChatResponse>("/api/v1/gemini/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getModels(): Promise<ModelsResponse> {
  return request<ModelsResponse>("/api/v1/gemini/models");
}

export function countTokens(data: CountTokensRequest): Promise<CountTokensResponse> {
  return request<CountTokensResponse>("/api/v1/gemini/count-tokens", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

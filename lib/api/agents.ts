/**
 * Agent 智能体 API
 * 对接后端 /api/v1/agents 路由
 */

import { request } from "./client";

// ─── 类型 ─────────────────────────────────────────────────────────────

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  tools?: string[];
  workflow?: unknown;
  example_inputs?: unknown;
}

export interface AgentChatInput {
  product_info?: string;
  platforms?: string[];
  hook_count?: number;
  [key: string]: unknown;
}

export interface AgentChatResponse {
  agent_id: string;
  agent_name: string;
  result: string;
  workflow_outputs?: Record<string, string>;
  status: string;
}

export interface AgentDetail {
  id: string;
  name: string;
  description: string;
  tools: unknown[];
  workflow: unknown;
  example_inputs: unknown;
}

// ─── API 函数 ──────────────────────────────────────────────────────────

/** 列出所有智能体 */
export function listAgents(): Promise<AgentInfo[]> {
  return request<AgentInfo[]>("/api/v1/agents");
}

/** 获取智能体详情 */
export function getAgentDetail(agentId: string): Promise<AgentDetail> {
  return request<AgentDetail>(`/api/v1/agents/${agentId}`);
}

/** 智能体对话（非流式） */
export function agentChat(
  agentId: string,
  input: AgentChatInput,
  options?: { temperature?: number; max_tokens?: number },
): Promise<AgentChatResponse> {
  return request<AgentChatResponse>(`/api/v1/agents/${agentId}/chat`, {
    method: "POST",
    body: JSON.stringify({
      input,
      ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
      ...(options?.max_tokens !== undefined ? { max_tokens: options.max_tokens } : {}),
    }),
  });
}

/** 智能体对话（流式 SSE） */
export async function* agentChatStream(
  agentId: string,
  input: AgentChatInput,
  options?: { temperature?: number; max_tokens?: number },
): AsyncGenerator<AgentStreamEvent> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")?.trim() || ""
      : "";

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://35.240.178.148:10086";

  const res = await fetch(`${baseUrl}/api/v1/agents/${agentId}/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      input,
      ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
      ...(options?.max_tokens !== undefined ? { max_tokens: options.max_tokens } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`Agent stream request failed: ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (!data) continue;

      try {
        yield JSON.parse(data) as AgentStreamEvent;
      } catch {
        // skip malformed events
      }
    }
  }
}

export interface AgentStreamEvent {
  type: "step_start" | "step_complete" | "complete" | "error";
  step?: string;
  result?: string;
  data?: unknown;
  error?: string;
}

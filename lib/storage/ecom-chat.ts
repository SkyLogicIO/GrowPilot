/**
 * 电商智能体对话存储工具
 */

import type { ToolKey } from "@/lib/prompts/marketing-prompts";

// ─── 类型 ─────────────────────────────────────────────────────────────

export interface EcomChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  mediaRefs?: string[];
}

export interface EcomChatThread {
  id: string;
  title: string;
  messages: EcomChatMessage[];
  activeTool: ToolKey;
  createdAt: number;
  updatedAt: number;
}

interface EcomChatStorageSchema {
  threads: EcomChatThread[];
  version: number;
}

// ─── 常量 ─────────────────────────────────────────────────────────────

export type StorageToolKey = "ecom" | "selling-point";

const STORAGE_KEY_MAP: Record<StorageToolKey, string> = {
  ecom: "growpilot_ecom_chat",
  "selling-point": "growpilot_selling_point_chat",
};

const DEFAULT_TOOL_KEY: StorageToolKey = "ecom";
const STORAGE_VERSION = 1;
const MAX_THREADS = 30;
const MAX_MESSAGES_PER_THREAD = 200;

// ─── 工具函数 ─────────────────────────────────────────────────────────

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function generateThreadId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ─── CRUD ─────────────────────────────────────────────────────────────

export function loadThreads(toolKey?: StorageToolKey): EcomChatThread[] {
  if (typeof window === "undefined") return [];

  const key = STORAGE_KEY_MAP[toolKey ?? DEFAULT_TOOL_KEY];
  const stored = window.localStorage.getItem(key);
  const data = safeJsonParse<EcomChatStorageSchema | null>(stored, null);

  if (!data || data.version !== STORAGE_VERSION) return [];

  return data.threads || [];
}

function writeThreads(threads: EcomChatThread[], toolKey?: StorageToolKey): boolean {
  if (typeof window === "undefined") return false;

  const trimmed = threads.slice(0, MAX_THREADS).map((t) => ({
    ...t,
    messages: t.messages.slice(-MAX_MESSAGES_PER_THREAD),
  }));

  try {
    const key = STORAGE_KEY_MAP[toolKey ?? DEFAULT_TOOL_KEY];
    window.localStorage.setItem(
      key,
      JSON.stringify({ threads: trimmed, version: STORAGE_VERSION }),
    );
    return true;
  } catch {
    console.warn("ecom-chat localStorage quota exceeded");
    try {
      const minimal = threads.slice(0, 5).map((t) => ({
        ...t,
        messages: t.messages.slice(-50),
      }));
      const key = STORAGE_KEY_MAP[toolKey ?? DEFAULT_TOOL_KEY];
      window.localStorage.setItem(
        key,
        JSON.stringify({ threads: minimal, version: STORAGE_VERSION }),
      );
      return true;
    } catch {
      const key = STORAGE_KEY_MAP[toolKey ?? DEFAULT_TOOL_KEY];
      window.localStorage.removeItem(key);
      return false;
    }
  }
}

export function saveThread(thread: EcomChatThread, toolKey?: StorageToolKey): boolean {
  const threads = loadThreads(toolKey);
  const idx = threads.findIndex((t) => t.id === thread.id);
  if (idx !== -1) {
    threads[idx] = thread;
  } else {
    threads.unshift(thread);
  }
  return writeThreads(threads, toolKey);
}

export function deleteThread(id: string, toolKey?: StorageToolKey): void {
  const threads = loadThreads(toolKey).filter((t) => t.id !== id);
  writeThreads(threads, toolKey);
}

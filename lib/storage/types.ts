/**
 * 生成项目存储类型定义
 */

export type ProjectMode = "video" | "image" | "avatar";

export interface GeneratedProject {
  id: string;
  name: string;
  mode: ProjectMode;
  prompt: string;
  resultUrl: string;
  resultType: "video" | "image" | "text";
  thumbnailUrl?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface StorageSchema {
  projects: GeneratedProject[];
  version: number;
}

export const STORAGE_KEY = "growpilot_projects";
export const STORAGE_VERSION = 2; // 版本2：不存储 base64 数据

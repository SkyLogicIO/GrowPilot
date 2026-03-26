/**
 * 生成项目存储工具函数
 */

import {
  GeneratedProject,
  StorageSchema,
  STORAGE_KEY,
  STORAGE_VERSION,
} from "./types";

/** 最大存储条数 */
const MAX_PROJECTS = 20;

/** Base64 数据前缀 */
const BASE64_PREFIX = "data:";

/**
 * 安全解析 JSON
 */
function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/**
 * 检查是否为 base64 数据
 */
function isBase64Data(url: string | undefined): boolean {
  return !!url && url.startsWith(BASE64_PREFIX);
}

/**
 * 清理项目数据中的 base64 内容（太大，不存储）
 */
function sanitizeProject(project: GeneratedProject): GeneratedProject {
  return {
    ...project,
    // 不存储 base64 数据，只保留是否存在的标记
    resultUrl: isBase64Data(project.resultUrl) ? "" : project.resultUrl,
    thumbnailUrl: isBase64Data(project.thumbnailUrl) ? "" : project.thumbnailUrl,
  };
}

/**
 * 加载所有生成项目
 */
export function loadProjects(): GeneratedProject[] {
  if (typeof window === "undefined") return [];

  const stored = window.localStorage.getItem(STORAGE_KEY);
  const data = safeJsonParse<StorageSchema | null>(stored, null);

  if (!data || data.version !== STORAGE_VERSION) {
    // 版本不匹配，初始化新存储
    return [];
  }

  return data.projects || [];
}

/**
 * 保存所有生成项目
 */
export function saveProjects(projects: GeneratedProject[]): boolean {
  if (typeof window === "undefined") return false;

  // 清理 base64 数据并限制数量
  const sanitized = projects.slice(0, MAX_PROJECTS).map(sanitizeProject);

  const data: StorageSchema = {
    projects: sanitized,
    version: STORAGE_VERSION,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    // 存储空间不足，尝试清理旧数据
    console.warn("localStorage quota exceeded, clearing old data...");
    try {
      // 只保留最新的 5 条
      const minimal = projects.slice(0, 5).map(sanitizeProject);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        projects: minimal,
        version: STORAGE_VERSION,
      }));
      return true;
    } catch {
      // 完全无法存储，清空数据
      console.error("Cannot save to localStorage, clearing all data");
      window.localStorage.removeItem(STORAGE_KEY);
      return false;
    }
  }
}

/**
 * 添加单个项目
 */
export function saveProject(project: GeneratedProject): boolean {
  const projects = loadProjects();
  // 新项目放在最前面
  projects.unshift(project);
  return saveProjects(projects);
}

/**
 * 删除单个项目
 */
export function deleteProject(id: string): void {
  const projects = loadProjects();
  const filtered = projects.filter((p) => p.id !== id);
  saveProjects(filtered);
}

/**
 * 更新单个项目
 */
export function updateProject(
  id: string,
  updates: Partial<GeneratedProject>
): void {
  const projects = loadProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index !== -1) {
    projects[index] = { ...projects[index], ...updates };
    saveProjects(projects);
  }
}

/**
 * 清空所有项目
 */
export function clearAllProjects(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * 获取存储使用情况
 */
export function getStorageUsage(): { used: number; count: number } {
  if (typeof window === "undefined") return { used: 0, count: 0 };

  const stored = window.localStorage.getItem(STORAGE_KEY);
  const used = stored ? new Blob([stored]).size : 0;
  const projects = loadProjects();

  return {
    used,
    count: projects.length,
  };
}

/**
 * 生成唯一 ID
 */
export function generateProjectId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export type { GeneratedProject, ProjectMode } from "./types";

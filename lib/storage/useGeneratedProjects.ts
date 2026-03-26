"use client";

import { useCallback, useEffect, useState } from "react";
import {
  GeneratedProject,
  loadProjects,
  saveProject as saveProjectToStorage,
  deleteProject as deleteProjectFromStorage,
  clearAllProjects as clearAllFromStorage,
  generateProjectId,
  getStorageUsage,
} from "./index";

export interface UseGeneratedProjectsReturn {
  projects: GeneratedProject[];
  isLoading: boolean;
  usage: { used: number; count: number };
  save: (project: Omit<GeneratedProject, "id" | "createdAt">) => GeneratedProject;
  remove: (id: string) => void;
  clear: () => void;
  refresh: () => void;
}

/**
 * 生成项目管理 Hook
 */
export function useGeneratedProjects(): UseGeneratedProjectsReturn {
  const [projects, setProjects] = useState<GeneratedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usage, setUsage] = useState({ used: 0, count: 0 });

  // 初始加载
  useEffect(() => {
    const loaded = loadProjects();
    setProjects(loaded);
    setUsage(getStorageUsage());
    setIsLoading(false);
  }, []);

  // 保存新项目
  const save = useCallback(
    (project: Omit<GeneratedProject, "id" | "createdAt">): GeneratedProject => {
      const newProject: GeneratedProject = {
        ...project,
        id: generateProjectId(),
        createdAt: new Date().toISOString(),
      };

      saveProjectToStorage(newProject);
      setProjects((prev) => [newProject, ...prev]);
      setUsage(getStorageUsage());

      return newProject;
    },
    []
  );

  // 删除项目
  const remove = useCallback((id: string) => {
    deleteProjectFromStorage(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setUsage(getStorageUsage());
  }, []);

  // 清空所有
  const clear = useCallback(() => {
    clearAllFromStorage();
    setProjects([]);
    setUsage({ used: 0, count: 0 });
  }, []);

  // 刷新数据
  const refresh = useCallback(() => {
    const loaded = loadProjects();
    setProjects(loaded);
    setUsage(getStorageUsage());
  }, []);

  return {
    projects,
    isLoading,
    usage,
    save,
    remove,
    clear,
    refresh,
  };
}

export default useGeneratedProjects;

// ─── 工作区视图状态类型 ─────────────────────────────────────────────

/** 当前创作上下文（从线程+筛选器推导，不单独持久化） */
export interface CurrentBrief {
  threadId: string;
  threadTitle: string;
  mode: string;
  platform: string;
  intent: string;
  language: string;
  assetCount: number;
}

/** 任务状态 */
export type JobStatus = "pending" | "generating" | "completed" | "failed";

/** 任务（映射自 MediaItem + 额外状态） */
export interface WorkspaceJob {
  id: string;
  type: "image" | "video";
  status: JobStatus;
  label: string;
  sourceMessageId: string;
  linkedAssetId?: string;
  createdAt: number;
  errorMessage?: string;
}

/** 资产状态 */
export type AssetStatus = "loading" | "ready" | "failed";

/** 资产（扩展现有 MediaItem） */
export interface WorkspaceAsset {
  id: string;
  type: "image" | "video";
  status: AssetStatus;
  dataUrl: string;
  prompt: string;
  sourceMessageId: string;
  createdAt: number;
  isUploaded: boolean;
  statusText?: string; // 详细状态文本，如 "生成中... (30s)"
}

/** 选中资产 ID */
export type SelectedAssetId = string | null;

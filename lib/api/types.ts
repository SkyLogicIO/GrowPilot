/** 通用 API 响应 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
}

/** 注册请求 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

/** 登录请求 */
export interface LoginRequest {
  username: string;
  password: string;
}

/** 认证响应（注册 / 登录） */
export interface AuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
}

/** 用户信息 */
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  user_type: number; // 1 普通, 2 VIP, 3 企业
  credits: number;
}

// ─── AI 工具请求 ───────────────────────────────────────────────

/** 文生图 */
export interface TextToImageRequest {
  prompt: string;
  negative_prompt?: string;
  width: number;
  height: number;
  steps: number;
  cfg_scale: number;
  seed?: number;
  model_name: string;
}

/** 图生图 */
export interface ImageToImageRequest {
  image_url: string;
  prompt: string;
  negative_prompt?: string;
  seed?: number;
  model_name: string;
}

/** 文生视频 */
export interface TextToVideoRequest {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  fps: number;
  duration: number;
  model_name: string;
}

/** 图生视频 */
export interface ImageToVideoRequest {
  image_url: string;
  prompt?: string;
  fps: number;
  duration: number;
  model_name: string;
}

/** 局部重绘 */
export interface InpaintRequest {
  image_url: string;
  mask_url: string;
  prompt: string;
  negative_prompt?: string;
  denoising_strength?: number;
  width?: number;
  height?: number;
  steps?: number;
  cfg_scale?: number;
  seed?: number;
  model_name: string;
}

/** 首尾帧视频 */
export interface FrameToVideoRequest {
  start_frame_url: string;
  end_frame_url: string;
  prompt: string;
  steps?: number;
  fps: number;
  duration: number;
  model_name: string;
}

// ─── 任务 ─────────────────────────────────────────────────────

/** 任务状态 */
export type TaskStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

/** 任务创建响应（后端返回 task_id） */
export interface TaskCreatedInfo {
  task_id: string;
  status: TaskStatus;
  model_name?: string;
  result_url?: string;
  created_at: string;
  latency_ms?: number;
  duration?: number;
  fps?: number;
}

/** 任务查询响应（后端返回 id） */
export interface TaskDetailInfo {
  id: number;
  task_type?: string;
  model_name?: string;
  status: TaskStatus;
  progress: number; // 0-100
  result_url?: string;
  error?: string;
  created_at: string;
  completed_at?: string;
}

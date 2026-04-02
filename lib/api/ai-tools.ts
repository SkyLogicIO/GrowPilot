import { request } from "./client";
import type {
  FrameToVideoRequest,
  ImageToVideoRequest,
  InpaintRequest,
  TaskInfo,
  TextToImageRequest,
  TextToVideoRequest,
} from "./types";

// ─── AI 工具（均返回 TaskInfo，需轮询取结果）────────────────────

export function textToImage(data: TextToImageRequest): Promise<TaskInfo> {
  return request<TaskInfo>("/api/v1/ai-tools/text-to-image", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function textToVideo(data: TextToVideoRequest): Promise<TaskInfo> {
  return request<TaskInfo>("/api/v1/ai-tools/text-to-video", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function imageToVideo(data: ImageToVideoRequest): Promise<TaskInfo> {
  return request<TaskInfo>("/api/v1/ai-tools/image-to-video", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function inpaint(data: InpaintRequest): Promise<TaskInfo> {
  return request<TaskInfo>("/api/v1/ai-tools/inpaint", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function frameToVideo(data: FrameToVideoRequest): Promise<TaskInfo> {
  return request<TaskInfo>("/api/v1/ai-tools/frame-to-video", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── 任务查询 ─────────────────────────────────────────────────

export function getTask(taskId: string): Promise<TaskInfo> {
  return request<TaskInfo>(`/api/v1/ai-tools/tasks/${taskId}`);
}

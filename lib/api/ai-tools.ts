import { request } from "./client";
import type {
  FrameToVideoRequest,
  ImageToImageRequest,
  ImageToVideoRequest,
  InpaintRequest,
  TaskCreatedInfo,
  TaskDetailInfo,
  TextToImageRequest,
  TextToVideoRequest,
} from "./types";

// ─── AI 工具（均返回 TaskCreatedInfo，需轮询取结果）──────────

export function textToImage(data: TextToImageRequest): Promise<TaskCreatedInfo> {
  return request<TaskCreatedInfo>("/api/v1/ai-tools/text-to-image", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function imageToImage(data: ImageToImageRequest): Promise<TaskCreatedInfo> {
  return request<TaskCreatedInfo>("/api/v1/ai-tools/image-to-image", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function textToVideo(data: TextToVideoRequest): Promise<TaskCreatedInfo> {
  return request<TaskCreatedInfo>("/api/v1/ai-tools/text-to-video", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function imageToVideo(data: ImageToVideoRequest): Promise<TaskCreatedInfo> {
  return request<TaskCreatedInfo>("/api/v1/ai-tools/image-to-video", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function inpaint(data: InpaintRequest): Promise<TaskCreatedInfo> {
  return request<TaskCreatedInfo>("/api/v1/ai-tools/inpaint", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function frameToVideo(data: FrameToVideoRequest): Promise<TaskCreatedInfo> {
  return request<TaskCreatedInfo>("/api/v1/ai-tools/frame-to-video", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── 任务查询 ─────────────────────────────────────────────────

export function getTask(taskId: string): Promise<TaskDetailInfo> {
  return request<TaskDetailInfo>(`/api/v1/ai-tools/tasks/${taskId}`);
}

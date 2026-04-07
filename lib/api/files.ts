import { request, getStoredToken } from "./client";

// ─── 类型 ─────────────────────────────────────────────────────

export interface GenerateUrlRequest {
  bucket: string;
  key: string;
  storage_type: "local" | "oss" | "s3";
}

export interface FileUrlInfo {
  url: string;
  storage_type: string;
  bucket: string;
  key: string;
}

export interface ParseMetadataResponse {
  bucket: string;
  key: string;
  storage_type: string;
  url: string;
}

/** 预签名上传请求（单个） */
export interface PresignedUploadRequest {
  filename: string;
  contentType: string;
  folder?: string;
  path?: string;
  expiresIn?: number;
}

/** 预签名上传响应（单个） */
export interface PresignedUploadResponse {
  upload_url: string;
  access_url: string;
  bucket: string;
  key: string;
  storage_type: string;
  method: string;
  headers: Record<string, string>;
  expires_at: string;
}

/** 批量预签名上传请求 */
export interface BatchPresignedUploadRequest {
  files: PresignedUploadRequest[];
  folder?: string;
  expiresIn?: number;
}

/** 上传配置 */
export interface UploadConfig {
  storage_type: string;
  max_file_size: number;
  allowed_types: string[];
  chunk_upload: boolean;
  presigned_url: boolean;
  default_expires_in: number;
}

// ─── URL 生成接口 ────────────────────────────────────────────

/** 单个文件 URL 生成 */
export function generateUrl(data: GenerateUrlRequest): Promise<FileUrlInfo> {
  return request<FileUrlInfo>("/api/v1/files/generate-url", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** 批量文件 URL 生成 */
export function batchGenerateUrl(
  items: GenerateUrlRequest[],
): Promise<FileUrlInfo[]> {
  return request<FileUrlInfo[]>("/api/v1/files/batch-generate-url", {
    method: "POST",
    body: JSON.stringify(items),
  });
}

/** 从 URL 反解析存储元数据 */
export function parseMetadata(url: string): Promise<ParseMetadataResponse> {
  return request<ParseMetadataResponse>(
    `/api/v1/files/parse-metadata?url=${encodeURIComponent(url)}`,
  );
}

// ─── 预签名上传接口 ──────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://35.240.178.148:10086";

/** 获取上传配置 */
export function getUploadConfig(): Promise<UploadConfig> {
  return request<UploadConfig>("/api/v1/files/upload/config");
}

/** 获取单个预签名上传 URL */
export function getPresignedUploadUrl(
  data: PresignedUploadRequest,
): Promise<PresignedUploadResponse> {
  return request<PresignedUploadResponse>(
    "/api/v1/files/upload/presigned",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

/** 获取批量预签名上传 URL */
export function getBatchPresignedUploadUrls(
  data: BatchPresignedUploadRequest,
): Promise<{ urls: PresignedUploadResponse[]; count: number }> {
  return request("/api/v1/files/upload/presigned/batch", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** 上传文件到预签名 URL（直传存储服务） */
export async function uploadFileToPresignedUrl(
  presigned: PresignedUploadResponse,
  file: File,
): Promise<void> {
  const res = await fetch(presigned.upload_url, {
    method: presigned.method || "PUT",
    headers: presigned.headers || { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`文件上传失败: ${res.status}`);
  }
}

/** 一步到位：上传文件并返回可访问的 URL */
export async function uploadFile(
  file: File,
  folder?: string,
): Promise<string> {
  const presigned = await getPresignedUploadUrl({
    filename: file.name,
    contentType: file.type,
    folder: folder || "uploads",
  });
  await uploadFileToPresignedUrl(presigned, file);
  return presigned.access_url;
}

/** 一步到位：批量上传文件并返回可访问的 URL 列表 */
export async function uploadFiles(
  files: File[],
  folder?: string,
): Promise<string[]> {
  const { urls } = await getBatchPresignedUploadUrls({
    files: files.map((f) => ({
      filename: f.name,
      contentType: f.type,
    })),
    folder: folder || "uploads",
  });
  await Promise.all(
    urls.map((url, i) => uploadFileToPresignedUrl(url, files[i] || files[0])),
  );
  return urls.map((u) => u.access_url);
}

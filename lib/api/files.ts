import { request } from "./client";

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

// ─── 接口 ─────────────────────────────────────────────────────

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

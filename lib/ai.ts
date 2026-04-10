/**
 * 客户端 AI 服务层
 * 通过后端 GenAI 代理（/api/v1/genai/v1beta）调用 Google Gemini API，
 * 使用 JWT 认证，API Key 由后端统一管理。
 */

import {
  GoogleGenAI,
  setDefaultBaseUrls,
  GenerateVideosParameters,
} from "@google/genai";

// 配置 SDK Base URL，指向后端 GenAI 代理
// 注意：SDK 会自动追加 /{apiVersion}（默认 v1beta），所以这里只到 /api/v1/genai
setDefaultBaseUrls({
  geminiUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/genai`,
});

/** 从 localStorage 获取 JWT token */
export function getAuthToken(): string {
  return window.localStorage.getItem("access_token")?.trim() || "";
}

/**
 * 创建带 JWT 认证的 GoogleGenAI 实例
 *
 * - apiKey 设为 "dummy"（后端不使用）
 * - Authorization 头携带 JWT
 * - 预设 x-goog-api-key 头阻止 SDK 发送真实 API Key（避免 CORS 拦截）
 */
function createAI(): GoogleGenAI {
  const token = getAuthToken();
  return new GoogleGenAI({
    apiKey: "dummy",
    httpOptions: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

// ─── 文生图 / 图生图（Gemini Flash Image）────────────────────────

export interface GenerateImageParams {
  prompt: string;
  aspectRatio?: string;
  inputImage?: File;
}

export interface GenerateImageResult {
  imageUrl: string; // base64 data URL
}

export async function generateImage(
  params: GenerateImageParams
): Promise<GenerateImageResult> {
  const token = getAuthToken();
  if (!token) throw new Error("请先登录后再使用 AI 功能");

  const ai = createAI();

  // 构建 contents
  const contents: any[] = [{ text: params.prompt }];
  if (params.inputImage) {
    const base64 = await fileToBase64(params.inputImage);
    contents.push({
      inlineData: { mimeType: params.inputImage.type || "image/jpeg", data: base64 },
    });
  }

  // 构建 imageConfig
  const imageConfig: Record<string, unknown> = {};
  if (params.aspectRatio) imageConfig.aspectRatio = params.aspectRatio;

  const config: Record<string, unknown> = {
    responseModalities: ["IMAGE"],
    imageConfig,
  };

  const genResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents,
    config,
  } as any);

  const parts = genResponse.candidates?.[0]?.content?.parts;
  if (!parts?.length) throw new Error("图片生成完成但没有返回数据");
  const imagePart = parts.find((p: any) => p.inlineData);
  if (!imagePart?.inlineData) throw new Error("响应中没有找到图片数据");

  const mimeType = imagePart.inlineData.mimeType || "image/png";
  return {
    imageUrl: `data:${mimeType};base64,${imagePart.inlineData.data}`,
  };
}

// ─── 图片编辑（Gemini Image — 用于换背景等）──────────────────────

export interface EditImageParams {
  prompt: string;
  image: File;
}

export async function editImage(params: EditImageParams): Promise<GenerateImageResult> {
  const token = getAuthToken();
  if (!token) throw new Error("请先登录后再使用 AI 功能");

  const ai = createAI();
  const base64 = await fileToBase64(params.image);

  const genResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      { text: params.prompt },
      { inlineData: { mimeType: params.image.type || "image/jpeg", data: base64 } },
    ],
    config: { responseModalities: ["TEXT", "IMAGE"] },
  });

  const parts = genResponse.candidates?.[0]?.content?.parts;
  if (!parts?.length) throw new Error("图片编辑完成但没有返回图片");
  const imagePart = parts.find((p: any) => p.inlineData);
  if (!imagePart?.inlineData) throw new Error("响应中没有找到图片数据");

  const mimeType = imagePart.inlineData.mimeType || "image/png";
  return {
    imageUrl: `data:${mimeType};base64,${imagePart.inlineData.data}`,
  };
}

// ─── 多图编辑（Gemini Image — 通用图像编辑）─────────────────────────

export interface EditImagesParams {
  prompt: string;
  negativePrompt?: string;
  images: File[]; // 1-3 张图片
}

export async function editImages(params: EditImagesParams): Promise<GenerateImageResult> {
  const token = getAuthToken();
  if (!token) throw new Error("请先登录后再使用 AI 功能");

  const ai = createAI();

  // 构建完整 prompt（含负面提示词）
  let fullPrompt = params.prompt;
  if (params.negativePrompt) {
    fullPrompt += `\n\n请不要在结果中包含以下内容：${params.negativePrompt}`;
  }

  // 构建 contents：prompt + 所有图片
  const contents: any[] = [{ text: fullPrompt }];
  for (const image of params.images) {
    const base64 = await fileToBase64(image);
    contents.push({
      inlineData: { mimeType: image.type || "image/jpeg", data: base64 },
    });
  }

  const genResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents,
    config: { responseModalities: ["TEXT", "IMAGE"] },
  });

  const parts = genResponse.candidates?.[0]?.content?.parts;
  if (!parts?.length) throw new Error("图片编辑完成但没有返回图片");
  const imagePart = parts.find((p: any) => p.inlineData);
  if (!imagePart?.inlineData) throw new Error("响应中没有找到图片数据");

  const mimeType = imagePart.inlineData.mimeType || "image/png";
  return {
    imageUrl: `data:${mimeType};base64,${imagePart.inlineData.data}`,
  };
}

// ─── 文生视频 / 图生视频（Veo 3.1）────────────────────────────────

export interface GenerateVideoParams {
  prompt: string;
  model?: string;
  duration?: number;
  resolution?: string;
  aspectRatio?: string;
  inputImage?: File;
  onProgress?: (status: string) => void;
}

export interface GenerateVideoResult {
  videoUrl: string; // base64 data URL
  model: string;
  duration: number;
  resolution: string;
  aspectRatio: string;
}

export async function generateVideo(
  params: GenerateVideoParams
): Promise<GenerateVideoResult> {
  const token = getAuthToken();
  if (!token) throw new Error("请先登录后再使用 AI 功能");

  const ai = createAI();
  const modelName = params.model || "veo-3.1-fast-generate-preview";

  const ALLOWED_DURATIONS = [4, 6, 8];
  let duration = params.duration || 8;
  if (!ALLOWED_DURATIONS.includes(duration)) duration = 8;

  const resolution = params.resolution === "1080p" ? "1080p" : "720p";
  const aspectRatio = params.aspectRatio === "9:16" ? "9:16" : "16:9";

  // 图生视频只支持 8 秒
  if (params.inputImage) {
    duration = 8;
  }

  const genParams: GenerateVideosParameters = {
    model: modelName,
    config: {
      numberOfVideos: 1,
      durationSeconds: duration,
      resolution,
      aspectRatio,
    },
  };

  if (params.inputImage) {
    const base64 = await fileToBase64(params.inputImage);
    genParams.source = {
      prompt: params.prompt,
      image: { imageBytes: base64, mimeType: params.inputImage.type || "image/jpeg" },
    };
  } else {
    genParams.source = { prompt: params.prompt };
  }

  params.onProgress?.("提交生成请求...");

  let operation = await ai.models.generateVideos(genParams);

  let attempts = 0;
  const maxAttempts = 30;

  while (!operation.done && attempts < maxAttempts) {
    params.onProgress?.(`生成中... (${attempts * 10}s)`);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    attempts++;
    operation = await ai.operations.getVideosOperation({ operation });
  }

  if (!operation.done) throw new Error(`视频生成超时（${maxAttempts * 10}秒）`);

  // 检查操作是否包含错误
  if ((operation as any).error) {
    const err = (operation as any).error;
    throw new Error(`视频生成失败: ${err.message || JSON.stringify(err)}`);
  }

  if (!operation.response?.generatedVideos?.length) {
    throw new Error(`视频生成完成但没有返回视频（响应: ${JSON.stringify(operation.response ?? operation).slice(0, 300)}）`);
  }

  const firstVideo = operation.response.generatedVideos[0];
  if (!firstVideo?.video?.uri) throw new Error("生成的视频缺少 URI");

  // 将 Google 原始域名改写为后端代理地址，走统一认证
  const rawUri = decodeURIComponent(firstVideo.video.uri);
  const proxyBase = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/genai`;
  const videoUri = rawUri.replace(
    "https://generativelanguage.googleapis.com",
    proxyBase,
  );
  params.onProgress?.("下载视频中...");

  const videoResponse = await fetch(videoUri, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!videoResponse.ok) throw new Error(`获取视频文件失败: ${videoResponse.status}`);

  const videoBlob = await videoResponse.blob();
  const videoBase64 = await blobToBase64(videoBlob);

  return {
    videoUrl: `data:${videoBlob.type};base64,${videoBase64}`,
    model: modelName,
    duration,
    resolution,
    aspectRatio,
  };
}

// ─── 文本对话（Gemini Chat）────────────────────────────────────────

export interface GeminiChatMessage {
  role: "user" | "model";
  content: string;
}

export interface GeminiChatParams {
  messages: GeminiChatMessage[];
  systemInstruction?: string;
  model?: string;
  maxOutputTokens?: number;
  temperature?: number;
}

export async function chatWithGemini(params: GeminiChatParams): Promise<string> {
  const token = getAuthToken();
  if (!token) throw new Error("请先登录后再使用 AI 功能");

  const ai = createAI();
  const modelName = params.model || "gemini-2.5-flash";

  const contents = params.messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  const config: Record<string, unknown> = {};
  if (params.systemInstruction) {
    config.systemInstruction = { text: params.systemInstruction };
  }
  if (params.maxOutputTokens) config.maxOutputTokens = params.maxOutputTokens;
  if (params.temperature !== undefined) config.temperature = params.temperature;

  const response = await ai.models.generateContent({
    model: modelName,
    contents,
    config,
  });

  return response.text ?? "";
}

// ─── 多模态对话（文本 + 图片）────────────────────────────────────────

export interface MediaItem {
  id: string;
  type: "image" | "video";
  dataUrl: string;
  prompt: string;
  createdAt: number;
  status?: string;
}

export interface ChatWithMediaResult {
  text: string;
  images: MediaItem[];
  videoDescriptions: string[];
}

export interface ChatWithMediaParams {
  messages: GeminiChatMessage[];
  systemInstruction?: string;
  model?: string;
  maxOutputTokens?: number;
  temperature?: number;
}

export async function chatWithMedia(
  params: ChatWithMediaParams,
): Promise<ChatWithMediaResult> {
  // 第一步：纯文本对话（使用 gemini-2.5-flash，不请求 IMAGE modality）
  const text = await chatWithGemini({
    messages: params.messages,
    systemInstruction: params.systemInstruction,
    model: "gemini-2.5-flash",
    maxOutputTokens: params.maxOutputTokens,
    temperature: params.temperature,
  });

  // 第二步：从回复中提取 [IMAGE: ...] 标记，用 Imagen 生成图片
  const imageRegex = /\[IMAGE:\s*([^\]]+)\]/g;
  const imageDescriptions: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = imageRegex.exec(text)) !== null) {
    imageDescriptions.push(match[1].trim());
  }
  let cleanText = text.replace(imageRegex, "").trim();

  // 第三步：提取 [VIDEO: ...] 标记（不在此处调用 generateVideo）
  const videoRegex = /\[VIDEO:\s*([^\]]+)\]/g;
  const videoDescriptions: string[] = [];

  while ((match = videoRegex.exec(text)) !== null) {
    videoDescriptions.push(match[1].trim());
  }
  cleanText = cleanText.replace(videoRegex, "").trim();

  // 最多返回 1 个视频描述（视频生成耗时长）
  const videoDesc = videoDescriptions.length > 0 ? [videoDescriptions[0]] : [];

  // 最多生成 2 张图片
  const descriptions = imageDescriptions.slice(0, 2);
  const images: MediaItem[] = [];
  const now = Date.now();

  for (let i = 0; i < descriptions.length; i++) {
    try {
      const result = await generateImage({
        prompt: descriptions[i],
        aspectRatio: "1:1",
      });
      images.push({
        id: `media_${now}_${i}`,
        type: "image",
        dataUrl: result.imageUrl,
        prompt: descriptions[i],
        createdAt: now,
      });
    } catch (err) {
      // 单张图片失败不影响整体回复
      console.warn(`图片生成失败 (${descriptions[i]}):`, err);
    }
  }

  // 如果有图片标记但全部生成失败，在文本末尾提示
  if (descriptions.length > 0 && images.length === 0) {
    cleanText += `\n\n[图片生成失败，请重试]`;
  }

  return { text: cleanText, images, videoDescriptions: videoDesc };
}

// ─── 工具函数 ─────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // 去掉 data:xxx;base64, 前缀
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * 客户端 AI 服务层
 * 直接在浏览器调用 Google GenAI SDK，不经过服务端 API 路由
 */

import {
  GoogleGenAI,
  GenerateImagesParameters,
  GenerateImagesConfig,
  GenerateVideosParameters,
} from "@google/genai";

/** 从 localStorage 获取 API Key */
export function getApiKey(): string {
  return window.localStorage.getItem("gemini_api_key")?.trim() || "";
}

// ─── 文生图 / 图生图（Imagen 4.0）────────────────────────────────

export interface GenerateImageParams {
  prompt: string;
  model?: string;
  numberOfImages?: number;
  aspectRatio?: string;
  imageSize?: string;
  inputImage?: File;
}

export interface GenerateImageResult {
  imageUrl: string; // base64 data URL
  enhancedPrompt?: string;
}

export async function generateImage(
  params: GenerateImageParams
): Promise<GenerateImageResult> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("请先设置 Gemini API Key");

  const ai = new GoogleGenAI({ apiKey });
  const modelName = params.model || "imagen-4.0-generate-001";

  // 图生图模式：使用 Gemini generateContent
  if (params.inputImage) {
    const base64 = await fileToBase64(params.inputImage);
    const genResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        { text: params.prompt },
        { inlineData: { mimeType: params.inputImage.type || "image/jpeg", data: base64 } },
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

  // 文生图模式：使用 Imagen generateImages
  const config: GenerateImagesConfig = {
    numberOfImages: 1,
    aspectRatio: "1:1",
  };
  if (params.numberOfImages) config.numberOfImages = params.numberOfImages;
  if (params.aspectRatio) config.aspectRatio = params.aspectRatio;
  if (params.imageSize) config.imageSize = params.imageSize;

  const genParams: GenerateImagesParameters = {
    model: modelName,
    prompt: params.prompt,
    config,
  };

  const response = await ai.models.generateImages(genParams);

  if (!response.generatedImages?.length) throw new Error("图片生成完成但没有返回图片");
  const firstImage = response.generatedImages[0];
  if (!firstImage?.image?.imageBytes) throw new Error("生成的图片缺少数据");

  const mimeType = firstImage.image.mimeType || "image/jpeg";
  return {
    imageUrl: `data:${mimeType};base64,${firstImage.image.imageBytes}`,
    enhancedPrompt: firstImage.enhancedPrompt,
  };
}

// ─── 图片编辑（Gemini Image — 用于换背景等）──────────────────────

export interface EditImageParams {
  prompt: string;
  image: File;
}

export async function editImage(params: EditImageParams): Promise<GenerateImageResult> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("请先设置 Gemini API Key");

  const ai = new GoogleGenAI({ apiKey });
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
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("请先设置 Gemini API Key");

  const ai = new GoogleGenAI({ apiKey });

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
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("请先设置 Gemini API Key");

  const ai = new GoogleGenAI({ apiKey });
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

  if (!operation.response?.generatedVideos?.length) {
    throw new Error("视频生成完成但没有返回视频");
  }

  const firstVideo = operation.response.generatedVideos[0];
  if (!firstVideo?.video?.uri) throw new Error("生成的视频缺少 URI");

  const videoUri = decodeURIComponent(firstVideo.video.uri);
  params.onProgress?.("下载视频中...");

  const videoUrl = `${videoUri}&key=${apiKey}`;
  const videoResponse = await fetch(videoUrl);
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

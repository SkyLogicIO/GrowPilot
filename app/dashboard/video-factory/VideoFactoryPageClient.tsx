"use client";

import { useEffect, useRef, useState } from "react";
import { Video, ArrowLeft, Clock, Download } from "lucide-react";
import Link from "next/link";
import VideoGenerationForm, {
  type VideoGenerationParams,
  type VideoGenerationResult,
} from "../../../components/VideoGenerationForm";
import { useGeneratedProjects } from "../../../lib/storage/useGeneratedProjects";
import { generateVideo } from "../../../lib/ai";
import { textToVideo } from "@/lib/api/ai-tools";
import { useTaskPolling } from "@/hooks/useTaskPolling";

/** resolution + aspectRatio → 后端 width/height（后端约束 256-1024） */
const VIDEO_SIZE_MAP: Record<string, Record<string, { width: number; height: number }>> = {
  "720p": {
    "16:9": { width: 1024, height: 576 },
    "9:16": { width: 576, height: 1024 },
  },
  "1080p": {
    "16:9": { width: 1024, height: 576 },
    "9:16": { width: 576, height: 1024 },
  },
};

export default function VideoFactoryPageClient() {
  const { projects, save: saveProject } = useGeneratedProjects();
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<"input" | "result">("input");
  const [resultData, setResultData] = useState<VideoGenerationResult | null>(null);

  const polling = useTaskPolling({ interval: 5000 }); // 视频生成较慢，5 秒轮询
  const paramsRef = useRef<VideoGenerationParams | null>(null);
  const resolveRef = useRef<((result: VideoGenerationResult) => void) | null>(null);
  const rejectRef = useRef<((error: Error) => void) | null>(null);
  const useBackendRef = useRef(false);

  const videoProjects = projects
    .filter((p) => p.mode === "video")
    .slice(0, 10);

  // 监听轮询终态
  useEffect(() => {
    if (!polling.task || polling.isLoading) return;

    if (polling.task.status === "completed" && polling.task.result_url) {
      const p = paramsRef.current;
      const fullUrl = polling.task.result_url;
      const result: VideoGenerationResult = {
        id: Date.now(),
        name: "新生成视频",
        updatedAt: new Date().toISOString(),
        cover: fullUrl,
        statusText: "已完成",
        mode: "video",
        prompt: p?.prompt || "",
        attachments: [
          {
            type: "video",
            src: fullUrl,
            content: "",
            name: `生成结果 (${p?.duration ?? 8}s, ${p?.resolution ?? "720p"}, ${p?.aspectRatio ?? "16:9"})`,
          },
        ],
      };

      saveProject({
        name: "新生成视频",
        mode: "video",
        prompt: p?.prompt || "",
        resultUrl: fullUrl,
        resultType: "video",
        thumbnailUrl: fullUrl,
        metadata: {
          model: p?.model || "auto",
          duration: p?.duration ?? 8,
          resolution: p?.resolution ?? "720p",
          aspect_ratio: p?.aspectRatio ?? "16:9",
        },
      });

      setResultData(result);
      setStep("result");
      setIsGenerating(false);

      resolveRef.current?.(result);
      resolveRef.current = null;
      rejectRef.current = null;

      polling.reset();
    }

    if (polling.task.status === "failed") {
      const err = new Error(polling.error || "任务执行失败");
      setIsGenerating(false);

      rejectRef.current?.(err);
      rejectRef.current = null;
      resolveRef.current = null;

      polling.reset();
    }
  }, [polling.task?.status, polling.isLoading, saveProject, polling.reset]);

  const handleGenerate = async (
    params: VideoGenerationParams,
  ): Promise<VideoGenerationResult> => {
    setIsGenerating(true);
    paramsRef.current = params;

    try {
      // ── 图生视频：保留直连 Google GenAI（需要 API Key）────────
      if (params.inputImage) {
        useBackendRef.current = false;
        const modelDisplayName =
          params.model === "veo-3.1-fast-generate-preview"
            ? "Veo 3.1 Fast"
            : "Veo 3.1";

        const genResult = await generateVideo({
          prompt: params.prompt,
          model: params.model,
          duration: params.duration,
          resolution: params.resolution,
          aspectRatio: params.aspectRatio,
          inputImage: params.inputImage,
        });

        const fullUrl = genResult.videoUrl;
        const result: VideoGenerationResult = {
          id: Date.now(),
          name: "新生成视频",
          updatedAt: new Date().toISOString(),
          cover: fullUrl,
          statusText: "已完成",
          mode: "video",
          prompt: params.prompt,
          attachments: [
            {
              type: "video",
              src: fullUrl,
              content: "",
              name: `生成结果 (${modelDisplayName}, ${params.duration}s, ${params.resolution}, ${params.aspectRatio})`,
            },
          ],
        };

        saveProject({
          name: "新生成视频",
          mode: "video",
          prompt: params.prompt,
          resultUrl: fullUrl,
          resultType: "video",
          thumbnailUrl: fullUrl,
          metadata: {
            model: genResult.model,
            duration: genResult.duration,
            resolution: genResult.resolution,
            aspect_ratio: genResult.aspectRatio,
          },
        });

        setResultData(result);
        setStep("result");
        return result;
      }

      // ── 文生视频：走后端 API + 异步轮询 ───────────────────────
      useBackendRef.current = true;
      const sizeMap = VIDEO_SIZE_MAP[params.resolution] || VIDEO_SIZE_MAP["720p"];
      const size = sizeMap[params.aspectRatio] || sizeMap["16:9"];

      const taskInfo = await textToVideo({
        prompt: params.prompt,
        width: size.width,
        height: size.height,
        steps: 30,
        fps: 8,
        duration: params.duration,
        model_name: params.model || "modelscope",
      });

      polling.start(taskInfo.task_id);

      return new Promise((resolve, reject) => {
        resolveRef.current = resolve;
        rejectRef.current = reject;
      });
    } catch (error: unknown) {
      setIsGenerating(false);
      throw error;
    }
  };

  const handleReset = () => {
    setStep("input");
    setResultData(null);
    polling.reset();
  };

  const progress = polling.task?.progress ?? 0;
  const showBackendProgress =
    isGenerating && useBackendRef.current && polling.isLoading;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-xl bg-surface border-2 border-border flex items-center justify-center hover:bg-surface-hover transition-colors"
        >
          <ArrowLeft size={18} className="text-text-secondary" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#74B9FF] border-2 border-border flex items-center justify-center shadow-[3px_3px_0px_#1A1A1A]">
            <Video size={22} className="text-text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary">AI 视频工场</h1>
            <p className="text-sm text-text-secondary">
              输入创意或图片， AI 自动生成高品质营销短视频
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 生成区域 */}
        <div className="lg:col-span-2">
          <div className="brut-card-static p-6">
            {step === "input" ? (
              <>
                <VideoGenerationForm
                  isGenerating={isGenerating}
                  onGenerate={handleGenerate}
                />

                {/* 后端任务进度 */}
                {showBackendProgress && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-text-secondary">
                        任务处理中
                      </span>
                      <span className="text-sm font-bold text-text-muted">
                        {progress}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-surface-hover border-2 border-border overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(progress, 5)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                      {polling.task?.status === "pending"
                        ? "排队等待中..."
                        : polling.task?.status === "processing"
                          ? "AI 正在生成视频，通常需要 1-3 分钟..."
                          : "正在提交任务..."}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-5">
                <div className="relative w-full aspect-video rounded-2xl bg-black/50 overflow-hidden border-2 border-border">
                  {resultData?.attachments?.[0]?.type === "video" ? (
                    <video
                      src={resultData.attachments[0].src}
                      controls
                      className="w-full h-full object-contain"
                      autoPlay
                    />
                  ) : (
                    <img
                      src={resultData?.attachments?.[0]?.src}
                      alt="Result"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="brut-btn bg-surface text-text-primary px-6 py-2.5"
                  >
                    重新生成
                  </button>
                  <div className="flex gap-3">
                    {resultData?.attachments?.[0]?.src && (
                      <a
                        href={resultData.attachments[0].src}
                        download="video.mp4"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="brut-btn bg-accent text-white px-6 py-2.5"
                      >
                        下载视频
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 历史记录 */}
        <div className="lg:col-span-1">
          <div className="brut-card-static p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-text-primary">生成历史</h3>
              <span className="brut-tag bg-[#74B9FF] text-text-primary">
                {videoProjects.length}
              </span>
            </div>
            {videoProjects.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <Clock size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">暂无生成记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {videoProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-3 rounded-xl bg-surface-hover border-2 border-border hover:border-accent transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-10 rounded-lg bg-black/30 overflow-hidden shrink-0">
                        {project.resultUrl ? (
                          project.resultType === "video" ? (
                            <video
                              src={project.resultUrl}
                              className="w-full h-full object-cover"
                              muted
                            />
                          ) : (
                            <img
                              src={
                                project.thumbnailUrl || project.resultUrl
                              }
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video size={16} className="text-text-muted opacity-50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text-primary truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-text-muted truncate">
                          {project.prompt}
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                          {new Date(project.createdAt).toLocaleString("zh-CN")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, ArrowLeft, Clock, Download } from "lucide-react";
import Link from "next/link";
import ImageGenerationForm, {
  type ImageGenerationParams,
  type ImageGenerationResult,
} from "../../../components/ImageGenerationForm";
import { useGeneratedProjects } from "../../../lib/storage/useGeneratedProjects";
import { generateImage } from "../../../lib/ai";
import { textToImage } from "@/lib/api/ai-tools";
import { useTaskPolling } from "@/hooks/useTaskPolling";

/** 前端比例 → 后端 width/height */
const RATIO_SIZE_MAP: Record<string, { width: number; height: number }> = {
  "1:1":  { width: 1024, height: 1024 },
  "3:4":  { width: 768,  height: 1024 },
  "4:3":  { width: 1024, height: 768 },
  "9:16": { width: 576,  height: 1024 },
  "16:9": { width: 1024, height: 576 },
};

export default function ArtStudioPageClient() {
  const { projects, save: saveProject } = useGeneratedProjects();
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<"input" | "result">("input");
  const [resultData, setResultData] = useState<ImageGenerationResult | null>(null);

  const polling = useTaskPolling({ interval: 3000 });
  const promptRef = useRef("");
  // 保存 resolve/reject，用于在 useEffect 中完成 Promise
  const resolveRef = useRef<((result: ImageGenerationResult) => void) | null>(null);
  const rejectRef = useRef<((error: Error) => void) | null>(null);
  const useBackendRef = useRef(false);

  const imageProjects = projects
    .filter((p) => p.mode === "image")
    .slice(0, 10);

  // 监听轮询终态，完成结果处理
  useEffect(() => {
    if (!polling.task || polling.isLoading) return;

    if (polling.task.status === "completed" && polling.task.result_url) {
      const fullUrl = polling.task.result_url;
      const result: ImageGenerationResult = {
        id: Date.now(),
        name: "新生成图片",
        updatedAt: new Date().toISOString(),
        cover: fullUrl,
        statusText: "已完成",
        mode: "image",
        prompt: promptRef.current,
        attachments: [
          {
            type: "image",
            src: fullUrl,
            content: "",
            name: "生成结果",
          },
        ],
      };

      saveProject({
        name: "新生成图片",
        mode: "image",
        prompt: promptRef.current,
        resultUrl: fullUrl,
        resultType: "image",
        thumbnailUrl: fullUrl,
        metadata: { model: "auto" },
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
    params: ImageGenerationParams,
  ): Promise<ImageGenerationResult> => {
    setIsGenerating(true);
    promptRef.current = params.prompt;

    try {
      // ── 图生图：保留直连 Google GenAI（需要 API Key）────────
      if (params.inputImage) {
        useBackendRef.current = false;
        const genResult = await generateImage({
          prompt: params.prompt,
          model: params.model,
          inputImage: params.inputImage || undefined,
        });

        const fullUrl = genResult.imageUrl;
        const result: ImageGenerationResult = {
          id: Date.now(),
          name: "新生成图片",
          updatedAt: new Date().toISOString(),
          cover: fullUrl,
          statusText: "已完成",
          mode: "image",
          prompt: params.prompt,
          attachments: [
            { type: "image", src: fullUrl, content: "", name: "生成结果" },
          ],
        };

        saveProject({
          name: "新生成图片",
          mode: "image",
          prompt: params.prompt,
          resultUrl: fullUrl,
          resultType: "image",
          thumbnailUrl: fullUrl,
          metadata: { model: params.model },
        });

        setResultData(result);
        setStep("result");
        return result;
      }

      // ── 文生图：走后端 API + 异步轮询 ───────────────────────
      useBackendRef.current = true;
      const size = RATIO_SIZE_MAP[params.ratio] || RATIO_SIZE_MAP["1:1"];

      const taskInfo = await textToImage({
        prompt: params.prompt,
        width: size.width,
        height: size.height,
        steps: 30,
        cfg_scale: 7,
        model_name: params.model || "auto",
      });

      polling.start(taskInfo.task_id);

      // 返回 Promise，轮询终态时在 useEffect 中 resolve
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
          <div className="w-12 h-12 rounded-xl bg-[#C77DFF] border-2 border-border flex items-center justify-center shadow-[3px_3px_0px_#1A1A1A]">
            <ImageIcon size={22} className="text-text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary">
              AI 绘画工作室
            </h1>
            <p className="text-sm text-text-secondary">
              一句话生成营销海报、商品主图与创意插画
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
                <ImageGenerationForm
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
                        className="h-full bg-accent rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(progress, 5)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                      {polling.task?.status === "pending"
                        ? "排队等待中..."
                        : polling.task?.status === "processing"
                          ? "AI 正在生成图片..."
                          : "正在提交任务..."}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-5">
                {/* 结果展示 */}
                <div className="relative w-full aspect-[4/3] rounded-2xl bg-black/50 overflow-hidden border-2 border-border">
                  <img
                    src={resultData?.attachments?.[0]?.src}
                    alt="Result"
                    className="w-full h-full object-contain"
                  />
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
                        download={`image_${Date.now()}.png`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="brut-btn bg-accent text-white px-6 py-2.5 flex items-center gap-2"
                      >
                        <Download size={16} />
                        下载图片
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
              <span className="brut-tag bg-[#C77DFF] text-white">
                {imageProjects.length}
              </span>
            </div>

            {imageProjects.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <Clock size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">暂无生成记录</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {imageProjects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-xl bg-surface-hover border-2 border-border hover:border-accent transition-colors cursor-pointer overflow-hidden"
                  >
                    <div className="aspect-square bg-black/30">
                      {(project.thumbnailUrl || project.resultUrl) ? (
                        <img
                          src={
                            project.thumbnailUrl || project.resultUrl
                          }
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon
                            size={24}
                            className="text-text-muted opacity-50"
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-bold text-text-primary truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {project.prompt}
                      </p>
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

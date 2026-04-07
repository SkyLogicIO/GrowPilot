"use client";

import { useState } from "react";
import { Video, ArrowLeft, Clock, Download } from "lucide-react";
import Link from "next/link";
import VideoGenerationForm, {
  type VideoGenerationParams,
  type VideoGenerationResult,
} from "../../../components/VideoGenerationForm";
import { useGeneratedProjects } from "../../../lib/storage/useGeneratedProjects";
import { generateVideo } from "../../../lib/ai";

export default function VideoFactoryPageClient() {
  const { projects, save: saveProject } = useGeneratedProjects();
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<"input" | "result">("input");
  const [resultData, setResultData] = useState<VideoGenerationResult | null>(null);

  const videoProjects = projects
    .filter((p) => p.mode === "video")
    .slice(0, 10);

  const handleGenerate = async (
    params: VideoGenerationParams,
  ): Promise<VideoGenerationResult> => {
    setIsGenerating(true);

    try {
      const genResult = await generateVideo({
        prompt: params.prompt,
        model: params.model,
        duration: params.duration,
        resolution: params.resolution,
        aspectRatio: params.aspectRatio,
        inputImage: params.inputImage || undefined,
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
            name: `生成结果 (${genResult.duration}s, ${genResult.resolution}, ${genResult.aspectRatio})`,
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
    } catch (error: unknown) {
      setIsGenerating(false);
      throw error;
    }
  };

  const handleReset = () => {
    setStep("input");
    setResultData(null);
  };

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
              <VideoGenerationForm
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
              />
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

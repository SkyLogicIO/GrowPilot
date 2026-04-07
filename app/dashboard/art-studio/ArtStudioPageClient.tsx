"use client";

import { useState } from "react";
import { Image as ImageIcon, ArrowLeft, Clock, Download } from "lucide-react";
import Link from "next/link";
import ImageGenerationForm, {
  type ImageGenerationParams,
  type ImageGenerationResult,
} from "../../../components/ImageGenerationForm";
import { useGeneratedProjects } from "../../../lib/storage/useGeneratedProjects";
import { generateImage } from "../../../lib/ai";

export default function ArtStudioPageClient() {
  const { projects, save: saveProject } = useGeneratedProjects();
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<"input" | "result">("input");
  const [resultData, setResultData] = useState<ImageGenerationResult | null>(null);

  const imageProjects = projects
    .filter((p) => p.mode === "image")
    .slice(0, 10);

  const handleGenerate = async (
    params: ImageGenerationParams,
  ): Promise<ImageGenerationResult> => {
    setIsGenerating(true);

    try {
      const genResult = await generateImage({
        prompt: params.prompt,
        model: params.model,
        aspectRatio: params.ratio,
        numberOfImages: params.count ? parseInt(params.count, 10) : undefined,
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
              <ImageGenerationForm
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
              />
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

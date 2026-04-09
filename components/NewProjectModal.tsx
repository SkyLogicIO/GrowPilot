"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Image as ImageIcon,
  Video,
  User,
  Bot,
  Sparkles,
  X,
  Download,
} from "lucide-react";
import VideoGenerationForm, { VideoGenerationParams, VideoGenerationResult } from "./VideoGenerationForm";
import ImageGenerationForm, { ImageGenerationParams, ImageGenerationResult } from "./ImageGenerationForm";
import AvatarGenerationForm, { AvatarGenerationParams, AvatarGenerationResult } from "./AvatarGenerationForm";
import { useGeneratedProjects } from "../lib/storage/useGeneratedProjects";
import { generateVideo, generateImage } from "@/lib/ai";

export type ModeKey = "video" | "image" | "avatar" | "assistant";

type NewProjectModalProps = {
  defaultMode?: ModeKey;
  openSignal?: number;
  hideTriggerButton?: boolean;
  onProjectCreated?: (project: any) => void;
};

const MODES: Array<{ key: ModeKey; label: string; icon: React.ComponentType<{ size?: string | number; className?: string }> }> = [
  { key: "video", label: "视频生成", icon: Video },
  { key: "image", label: "图像生成", icon: ImageIcon },
  { key: "avatar", label: "数字人", icon: User },
];

export default function NewProjectModal({ defaultMode, openSignal, hideTriggerButton, onProjectCreated }: NewProjectModalProps) {
  const router = useRouter();
  const { save: saveProject } = useGeneratedProjects();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ModeKey>("video");
  const [name, setName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<"input" | "result">("input");
  const [resultData, setResultData] = useState<any>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const lastOpenSignalRef = useRef<number | undefined>(undefined);

  const namePlaceholder = {
    video: "请输入项目名称（视频生成）",
    image: "请输入项目名称（图像生成）",
    avatar: "请输入项目名称（数字人）",
    assistant: "请输入项目名称（AI营销助手）",
  }[mode];

  useEffect(() => {
    if (!openSignal) return;
    if (lastOpenSignalRef.current === openSignal) return;
    lastOpenSignalRef.current = openSignal;
    setMode(defaultMode || "video");
    setOpen(true);
    setStep("input");
    setResultData(null);
    setName("");
  }, [defaultMode, openSignal]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (el.contains(target)) return;
      if (!isGenerating) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (!isGenerating) setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, isGenerating]);

  const handleVideoGenerate = async (params: VideoGenerationParams): Promise<VideoGenerationResult> => {
    setIsGenerating(true);

    try {
      const result = await generateVideo({
        prompt: params.prompt,
        model: params.model,
        duration: params.duration,
        resolution: params.resolution,
        aspectRatio: params.aspectRatio,
        inputImage: params.inputImage ?? undefined,
      });

      const videoUrl = result.videoUrl;
      const modelDisplayName = params.model === "veo-3.1-fast-generate-preview" ? "Veo 3.1 Fast" : "Veo 3.1";

      const newProject = {
        id: Date.now(),
        name: name || "新生成视频",
        updatedAt: new Date().toISOString(),
        cover: videoUrl,
        statusText: "已完成",
        mode: "video",
        prompt: params.prompt,
        attachments: [{
          type: "video",
          src: videoUrl,
          content: "",
          name: `生成结果 (${modelDisplayName}, ${result.duration}s, ${result.resolution}, ${result.aspectRatio})`,
        }],
      };

      saveProject({
        name: name || "新生成视频",
        mode: "video",
        prompt: params.prompt,
        resultUrl: videoUrl,
        resultType: "video",
        metadata: {
          model: result.model,
          duration: result.duration,
          resolution: result.resolution,
          aspectRatio: result.aspectRatio,
        },
      });

      setResultData(newProject);
      setStep("result");
      return newProject;
    } catch (error: any) {
      console.error("视频生成失败:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageGenerate = async (params: ImageGenerationParams): Promise<ImageGenerationResult> => {
    setIsGenerating(true);

    try {
      const result = await generateImage({
        prompt: params.prompt,
        aspectRatio: params.ratio,
        inputImage: params.inputImage ?? undefined,
      });

      const imageUrl = result.imageUrl;

      const newProject = {
        id: Date.now(),
        name: name || "新生成图片",
        updatedAt: new Date().toISOString(),
        cover: imageUrl,
        statusText: "已完成",
        mode: "image",
        prompt: params.prompt,
        attachments: [{
          type: "image",
          src: imageUrl,
          content: result.imageUrl ? "" : "",
          name: "生成结果",
        }],
      };

      saveProject({
        name: name || "新生成图片",
        mode: "image",
        prompt: params.prompt,
        resultUrl: imageUrl,
        resultType: "image",
        thumbnailUrl: imageUrl,
        metadata: {
          model: params.model,
        },
      });

      setResultData(newProject);
      setStep("result");
      return newProject;
    } catch (error: any) {
      console.error("图片生成失败:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAvatarGenerate = async (params: AvatarGenerationParams): Promise<AvatarGenerationResult> => {
    // TODO: Implement avatar generation logic
    alert("数字人生成功能即将上线，敬请期待！");
    throw new Error("Avatar generation not implemented yet");
  };

  const handleFinish = () => {
    if (resultData && onProjectCreated) {
      onProjectCreated(resultData);
    }
    setOpen(false);
  };

  return (
    <>
      {!hideTriggerButton && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-6 py-2.5 bg-accent hover:bg-accent-light text-white rounded-lg font-medium transition-all shadow-lg shadow-accent/30"
        >
          + 新建项目
        </button>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6" style={{ zIndex: 100000 }}>
          <div
            ref={rootRef}
            className="w-full max-w-3xl rounded-2xl border border-white/10 bg-surface shadow-2xl ring-1 ring-white/10 overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div className="text-lg font-bold text-white">新建项目</div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isGenerating}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
              >
                <X size={18} className="text-gray-200" />
              </button>
            </div>

            <div className="px-5 py-4 border-b border-white/10">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={namePlaceholder}
                disabled={isGenerating}
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent-light transition-colors disabled:opacity-50"
              />
              <div className="mt-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-1 rounded-2xl bg-white/5 border border-white/10 p-1">
                    {MODES.map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setMode(m.key)}
                        disabled={isGenerating}
                        className={`h-10 px-4 rounded-xl border transition-colors flex items-center justify-start gap-2 whitespace-nowrap ${
                          mode === m.key
                            ? "bg-white/10 border-white/20 text-white"
                            : "bg-transparent border-transparent text-gray-300 hover:bg-white/5"
                        } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <m.icon size={16} className={mode === m.key ? "text-accent-bright" : "text-gray-400"} />
                        <span className="text-sm font-semibold">{m.label}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      router.push("/dashboard/marketing-assistant");
                    }}
                    disabled={isGenerating}
                    className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                  >
                    <Bot size={16} className="text-accent-bright" />
                    <span className="text-sm font-semibold text-gray-200">AI营销助手</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="px-5 py-5">
              {step === "input" ? (
                <>
                  {mode === "video" && (
                    <VideoGenerationForm isGenerating={isGenerating} onGenerate={handleVideoGenerate} />
                  )}
                  {mode === "image" && (
                    <ImageGenerationForm isGenerating={isGenerating} onGenerate={handleImageGenerate} />
                  )}
                  {mode === "avatar" && (
                    <AvatarGenerationForm isGenerating={isGenerating} onGenerate={handleAvatarGenerate} />
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="relative w-full aspect-video rounded-2xl bg-black/50 overflow-hidden flex items-center justify-center border border-white/10">
                    {resultData?.attachments?.[0]?.type === "video" ? (
                      <video 
                        src={resultData.attachments[0].src} 
                        controls 
                        className="w-full h-full object-contain"
                        autoPlay
                      />
                    ) : (resultData?.attachments?.[0]?.type === "text" || (!resultData?.attachments?.[0]?.src && resultData?.attachments?.[0]?.content)) ? (
                       <div className="w-full h-full p-6 overflow-auto bg-white/5 text-gray-200 text-sm whitespace-pre-wrap font-mono">
                         {resultData.attachments[0].content}
                       </div>
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
                      onClick={() => setStep("input")}
                      className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 font-medium transition-colors"
                    >
                      重新生成
                    </button>
                    
                    <div className="flex items-center gap-3">
                      {resultData?.attachments?.[0]?.src && (
                        <a 
                           href={resultData?.attachments?.[0]?.src} 
                           download={`generated_${Date.now()}.${resultData?.attachments?.[0]?.type === "video" ? "mp4" : "png"}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-colors flex items-center gap-2"
                        >
                          <Download size={18} />
                          下载
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={handleFinish}
                        className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white font-bold shadow-lg shadow-accent/30 transition-colors"
                      >
                        完成并保存
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

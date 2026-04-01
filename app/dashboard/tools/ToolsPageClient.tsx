"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { FileText, Image as ImageIcon, Mic, Video, Wand2 } from "lucide-react";
import VoiceGenerate from "./VoiceGenerate";
import FaceSwapModal from "@/components/FaceSwapModal";
import ImageEditModal from "@/components/ImageEditModal";
import BackgroundReplaceModal from "@/components/BackgroundReplaceModal";
import ComingSoonModal from "@/components/ComingSoonModal";

type TabKey = "write" | "image" | "ai_image" | "video" | "voice";

type TabConfig = {
  key: TabKey;
  label: string;
  icon: LucideIcon;
  color: string;
};

const TABS: TabConfig[] = [
  { key: "write",    label: "AI帮我写",  icon: FileText,   color: "bg-[#FFD93D]" },
  { key: "image",    label: "图像处理",   icon: ImageIcon,  color: "bg-[#4ECDC4]" },
  { key: "ai_image", label: "AI图像工具", icon: Wand2,      color: "bg-[#C77DFF]" },
  { key: "video",    label: "视频分析",   icon: Video,      color: "bg-[#74B9FF]" },
  { key: "voice",    label: "语音生成",   icon: Mic,        color: "bg-[#FF6B6B]" },
];

export default function ToolsPageClient() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<TabKey>("write");
  const [showFaceSwap, setShowFaceSwap] = useState(false);
  const [showImageEdit, setShowImageEdit] = useState(false);
  const [showBackgroundReplace, setShowBackgroundReplace] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [selectedTool, setSelectedTool] = useState("");

  useEffect(() => {
    if (!tabFromUrl) return;
    const isValid = TABS.some((x) => x.key === tabFromUrl);
    if (!isValid) return;
    setActiveTab(tabFromUrl as TabKey);
  }, [tabFromUrl]);

  const openComingSoon = (toolName: string) => {
    setSelectedTool(toolName);
    setShowComingSoon(true);
  };

  const writeTools = useMemo(() => ["直播话术生成", "带货脚本生成", "短视频文案提取", "爆款脚本仿写"], []);

  const imageTools = useMemo(
    () => ["通用图像编辑", "高清放大", "局部重绘", "智能抠图", "AI消除", "智能扩图", "元素擦除", "线稿提取"],
    []
  );

  const aiImageTools = useMemo(
    () => ["万物迁移", "换背景", "换脸", "换装", "手部修复", "肤质增强", "人像调节", "产品精修"],
    []
  );

  const videoTools = useMemo(
    () => ["声音提取", "ASR工具", "背景替换", "数字人", "智能字幕", "视频去水印", "视频增强", "镜头分割"],
    []
  );

  const activeConfig = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${activeConfig.color} border-2 border-border flex items-center justify-center shadow-[3px_3px_0px_#1A1A1A]`}>
          <activeConfig.icon size={22} className="text-text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">AI创作工具</h1>
          <p className="text-sm text-text-secondary">写文案、处理图片、分析视频，一站式效率工具箱</p>
        </div>
      </div>

      <div className="brut-card-static p-6">
        {/* Tab 栏 */}
        <div className="inline-flex items-center gap-1 rounded-xl bg-surface-hover border-2 border-border p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`h-10 px-4 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
                  isActive
                    ? `text-white ${tab.color} shadow-[2px_2px_0px_#1A1A1A]`
                    : "text-text-secondary hover:text-text-primary hover:bg-surface"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 写作工具 */}
        {activeTab === "write" && (
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {writeTools.map((title, i) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => openComingSoon(title)}
                  className="group text-left brut-card p-5 flex items-start gap-4"
                >
                  <div className={`w-10 h-10 rounded-lg bg-[#FFD93D] border-2 border-border flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A] shrink-0 text-text-primary font-black text-sm`}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-text-primary font-bold">{title}</div>
                    <div className="mt-1 text-sm text-text-secondary">点击进入，快速生成可用内容</div>
                  </div>
                  <span className="brut-btn bg-accent text-white text-xs px-3 h-8 flex items-center shrink-0 mt-0.5">
                    立即使用
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 图像处理工具 */}
        {activeTab === "image" && (
          <div className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imageTools.map((title) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => {
                    if (title === "通用图像编辑") {
                      setShowImageEdit(true);
                    } else {
                      openComingSoon(title);
                    }
                  }}
                  className="text-left brut-card p-5"
                >
                  <div className="text-text-primary font-bold">{title}</div>
                  <div className="mt-1 text-sm text-text-secondary">
                    {title === "通用图像编辑" ? "智能识别图片内容，根据提示词编辑" : "专业级图像处理能力，提升画质"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI 图像工具 */}
        {activeTab === "ai_image" && (
          <div className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {aiImageTools.map((title) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => {
                    if (title === "换背景") {
                      setShowBackgroundReplace(true);
                    } else {
                      openComingSoon(title);
                    }
                  }}
                  className="text-left brut-card p-5"
                >
                  <div className="text-text-primary font-bold">{title}</div>
                  <div className="mt-1 text-sm text-text-secondary">AI 一键处理，效果更自然</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 视频分析工具 */}
        {activeTab === "video" && (
          <div className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videoTools.map((title) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => openComingSoon(title)}
                  className="text-left brut-card p-5"
                >
                  <div className="text-text-primary font-bold">{title}</div>
                  <div className="mt-1 text-sm text-text-secondary">AI 智能处理，创作更高效</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 语音生成 */}
        {activeTab === "voice" && <VoiceGenerate />}
      </div>

      <FaceSwapModal open={showFaceSwap} onClose={() => setShowFaceSwap(false)} />
      <ImageEditModal open={showImageEdit} onClose={() => setShowImageEdit(false)} />
      <BackgroundReplaceModal open={showBackgroundReplace} onClose={() => setShowBackgroundReplace(false)} />
      <ComingSoonModal isOpen={showComingSoon} onClose={() => setShowComingSoon(false)} featureName={selectedTool} />
    </div>
  );
}

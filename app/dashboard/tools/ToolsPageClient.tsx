"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { FileText, Image as ImageIcon, Mic, Video, Wand2 } from "lucide-react";
import VoiceGenerate from "./VoiceGenerate";
import FaceSwapModal from "@/components/FaceSwapModal";
import ImageEditModal from "@/components/ImageEditModal";
import BackgroundReplaceModal from "@/components/BackgroundReplaceModal";

type TabKey = "write" | "image" | "ai_image" | "video" | "voice";

type TabConfig = {
  key: TabKey;
  label: string;
  icon: LucideIcon;
};

const TABS: TabConfig[] = [
  { key: "write", label: "AI帮我写", icon: FileText },
  { key: "image", label: "图像处理", icon: ImageIcon },
  { key: "ai_image", label: "AI图像工具", icon: Wand2 },
  { key: "video", label: "视频分析", icon: Video },
  { key: "voice", label: "语音生成", icon: Mic },
];

export default function ToolsPageClient() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<TabKey>("write");
  const [showFaceSwap, setShowFaceSwap] = useState(false);
  const [showImageEdit, setShowImageEdit] = useState(false);
  const [showBackgroundReplace, setShowBackgroundReplace] = useState(false);

  useEffect(() => {
    if (!tabFromUrl) return;
    const isValid = TABS.some((x) => x.key === tabFromUrl);
    if (!isValid) return;
    setActiveTab(tabFromUrl as TabKey);
  }, [tabFromUrl]);

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI创作工具</h1>
          <p className="text-gray-400 mt-1">写文案、处理图片、分析视频，一站式效率工具箱</p>
        </div>
      </div>

      <div className="bg-[#0F1115] border border-white/5 rounded-2xl p-6">
        <div className="inline-flex items-center gap-1 rounded-2xl bg-white/5 border border-white/10 p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`h-10 px-4 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${
                  isActive ? "text-white bg-white/10" : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={16} className={isActive ? "text-blue-300" : "text-gray-500"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === "write" && (
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {writeTools.map((title) => (
                <button
                  key={title}
                  type="button"
                  className="text-left rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors p-5"
                >
                  <div className="text-white font-semibold">{title}</div>
                  <div className="mt-1 text-sm text-gray-400">点击进入，快速生成可用内容</div>
                  <div className="mt-4 inline-flex items-center h-10 px-5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
                    立即使用
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

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
                    }
                  }}
                  className="text-left rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors p-5"
                >
                  <div className="text-white font-semibold">{title}</div>
                  <div className="mt-1 text-sm text-gray-400">
                    {title === "通用图像编辑" ? "智能识别图片内容，根据提示词编辑" : "专业级图像处理能力，提升画质"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "ai_image" && (
          <div className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {aiImageTools.map((title) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => {
                    if (title === "换脸") {
                      setShowFaceSwap(true);
                    }
                    if (title === "换背景") {
                      setShowBackgroundReplace(true);
                    }
                  }}
                  className="text-left rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors p-5"
                >
                  <div className="text-white font-semibold">{title}</div>
                  <div className="mt-1 text-sm text-gray-400">AI 一键处理，效果更自然</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "video" && (
          <div className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videoTools.map((title) => (
                <button
                  key={title}
                  type="button"
                  className="text-left rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors p-5"
                >
                  <div className="text-white font-semibold">{title}</div>
                  <div className="mt-1 text-sm text-gray-400">AI 智能处理，创作更高效</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "voice" && <VoiceGenerate />}
      </div>

      <FaceSwapModal open={showFaceSwap} onClose={() => setShowFaceSwap(false)} />
      <ImageEditModal open={showImageEdit} onClose={() => setShowImageEdit(false)} />
      <BackgroundReplaceModal open={showBackgroundReplace} onClose={() => setShowBackgroundReplace(false)} />
    </div>
  );
}

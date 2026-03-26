"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Login from "../components/Login";
import OnboardingModal from "../components/OnboardingModal";
import ComingSoonModal from "../components/ComingSoonModal";
import {
  Image as ImageIcon,
  Sprout,
  Video,
  ArrowRight,
  Scissors,
  Shirt,
  Paintbrush,
  PenLine,
} from "lucide-react";

export default function HomePageClient() {
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState("");

  const features = [
    {
      title: "AI 视频工场",
      description: "输入一句创意或一张图片，AI 自动生成高品质营销短视频",
      icon: Video,
      action: "立即生成",
      bg: "bg-[#74B9FF]",
      tag: "视频",
      tagBg: "bg-[#C77DFF] text-white",
      implemented: true,
    },
    {
      title: "AI 绘画工作室",
      description: "一句话生成营销海报、商品主图与创意插画，告别设计外包",
      icon: ImageIcon,
      action: "开始绘图",
      bg: "bg-[#C77DFF]",
      tag: "绘图",
      tagBg: "bg-[#FFB3C6] text-black",
      implemented: true,
    },
    {
      title: "AI 智能编辑",
      description: "一键抠图去背景、智能换场景、擦除多余元素，商品图秒变大片",
      icon: Scissors,
      action: "开始编辑",
      bg: "bg-[#4ECDC4]",
      tag: "编辑",
      tagBg: "bg-[#FFD93D] text-black",
      implemented: false,
    },
    {
      title: "AI 模特换装",
      description: "上传服装与模特照片，AI 自动生成真实换装效果，电商必备利器",
      icon: Shirt,
      action: "立即换装",
      bg: "bg-[#FFD93D]",
      tag: "换装",
      tagBg: "bg-[#FF6B6B] text-white",
      implemented: false,
    },
    {
      title: "AI 局部重绘",
      description: "框选不满意的区域，AI 精准重绘，哪里不满意改哪里",
      icon: Paintbrush,
      action: "开始重绘",
      bg: "bg-[#FFB3C6]",
      tag: "重绘",
      tagBg: "bg-[#4ECDC4] text-white",
      implemented: false,
    },
    {
      title: "AI 营销文案",
      description: "对话式生成爆款文案、直播话术、带货脚本，您的专属营销智囊",
      icon: PenLine,
      action: "生成文案",
      bg: "bg-[#6BCB77]",
      tag: "文案",
      tagBg: "bg-[#74B9FF] text-white",
      implemented: true,
    },
  ];

  const handleFeatureClick = (feature: (typeof features)[0]) => {
    if (!feature.implemented) {
      setSelectedFeature(feature.title);
      setComingSoonOpen(true);
      return;
    }
    setIsAuthOpen(true);
  };

  return (
    <main className="min-h-screen bg-background text-text-primary">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">

        {/* ── 导航 ── */}
        <nav className="flex justify-between items-center mb-16 animate-fade-up">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-accent border-2 border-border flex items-center justify-center shadow-[3px_3px_0px_#1A1A1A]">
              <Sprout size={20} className="text-white" />
            </div>
            <span className="text-xl font-black text-text-primary tracking-tight">GrowPilot</span>
          </div>

          <div className="flex items-center gap-5">
            <span className="hidden md:block text-sm text-text-muted font-medium">AI Growth Engine</span>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="brut-btn-pill bg-accent text-white px-6 py-2.5 text-sm"
            >
              <span className="flex items-center gap-2">
                立即创作
                <ArrowRight size={15} />
              </span>
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <div className="mb-20 animate-fade-up delay-1">
          <div className="relative">
            <div className="absolute -top-4 -left-3 w-14 h-14 bg-[#FFD93D] rounded-xl border-2 border-border opacity-60 rotate-[-8deg]" />
            <div className="absolute -top-2 right-12 w-8 h-8 bg-[#4ECDC4] rounded-full border-2 border-border opacity-50" />
            <div className="absolute top-10 right-0 w-10 h-10 bg-[#FFB3C6] rounded-lg border-2 border-border opacity-50 rotate-6" />

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="brut-tag bg-[#FFD93D] text-black">AI 增长平台</span>
                <span className="brut-tag bg-[#4ECDC4] text-white">营销创作者专属</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6 text-text-primary">
                数字AI助理
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10">帮您成就增长</span>
                  <span className="absolute bottom-1 left-0 right-0 h-4 bg-[#FFD93D] z-0 -rotate-1" />
                </span>
              </h1>

              <p className="text-text-secondary text-lg leading-relaxed mb-10 max-w-lg font-medium">
                AI 生图、生视频、智能编辑、模特换装、营销文案，
                一站式 AI 视觉营销工具集，为电商与设计团队而生。
              </p>

              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="brut-btn bg-accent text-white px-8 py-3.5 text-base"
                >
                  <span className="flex items-center gap-2">
                    免费开始
                    <ArrowRight size={18} />
                  </span>
                </button>
                <button className="brut-btn bg-surface text-text-primary px-8 py-3.5 text-base font-bold">
                  了解更多
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 功能卡片 ── */}
        <div className="mb-20 animate-fade-up delay-2">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-black text-text-primary">核心能力</h2>
            <span className="brut-tag bg-accent text-white">6 个模块</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  onClick={() => handleFeatureClick(feature)}
                  className={`animate-fade-up delay-${Math.min(index + 1, 6)} group brut-card p-6 cursor-pointer`}
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} border-2 border-border flex items-center justify-center mb-5 shadow-[2px_2px_0px_#1A1A1A] group-hover:shadow-[3px_3px_0px_#1A1A1A] transition-shadow`}>
                    <Icon size={22} className="text-text-primary" />
                  </div>

                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-black text-text-primary leading-tight">
                      {feature.title}
                    </h3>
                    <span className={`brut-tag ${feature.tagBg} shrink-0 ml-2`}>{feature.tag}</span>
                  </div>

                  <p className="text-sm text-text-secondary leading-relaxed mb-5 font-medium">
                    {feature.description}
                  </p>

                  <button className={`brut-btn ${feature.bg} text-text-primary px-4 py-2 text-sm w-full`}>
                    <span className="flex items-center justify-center gap-2">
                      {feature.implemented ? feature.action : "敬请期待"}
                      <ArrowRight size={14} />
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CTA 横幅 ── */}
        <div className="brut-card bg-[#FFD93D] p-10 text-center mb-8 animate-fade-up delay-4">
          <div className="flex justify-center gap-2 mb-5">
            <span className="brut-tag bg-accent text-white">限时免费</span>
            <span className="brut-tag bg-[#4ECDC4] text-white">即刻开始</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-text-primary mb-3">
            种下创意，收获增长
          </h2>
          <p className="text-text-secondary font-medium mb-8">加入数千名营销创作者的行列</p>
          <button
            className="brut-btn bg-text-primary text-white px-10 py-4 text-lg"
            onClick={() => setIsAuthOpen(true)}
          >
            立即体验 →
          </button>
        </div>

      </div>

      <Login
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => { setIsAuthOpen(false); setIsOnboardingOpen(true); }}
      />
      <OnboardingModal isOpen={isOnboardingOpen} onComplete={() => router.push("/dashboard")} />
      <ComingSoonModal
        isOpen={comingSoonOpen}
        onClose={() => setComingSoonOpen(false)}
        featureName={selectedFeature}
      />
    </main>
  );
}

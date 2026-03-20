"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Login from "../components/Login";
import OnboardingModal from "../components/OnboardingModal";
import { Camera, FolderUp, Image as ImageIcon, Lightbulb, PlaySquare, Video } from "lucide-react";

export default function HomePageClient() {
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const features = [
    {
      title: "爆款案例拆解",
      description: "一键获取千万级播放量的视频脚本公式，让成功可以复制",
      icon: <PlaySquare className="w-12 h-12 mb-4 text-white" />,
      action: "免费拆解",
      bgImage: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "云端素材管家",
      description: "随时随地管理您的核心资产，支持多端同步与智能分类",
      icon: <FolderUp className="w-12 h-12 mb-4 text-white" />,
      action: "上传素材",
      bgImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "灵感生成器",
      description: "告别创作瓶颈，AI 实时追踪全网热点，告诉您「现在该拍什么」",
      icon: <Lightbulb className="w-12 h-12 mb-4 text-white" />,
      action: "获取灵感",
      bgImage: "https://images.unsplash.com/photo-1555421689-d68471e189f2?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "AI 视频工场",
      description: "输入创意，AI 自动生成高品质短视频，批量生产流量引擎",
      icon: <Video className="w-12 h-12 mb-4 text-white" />,
      action: "立即生成",
      bgImage: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop",
    },
    {
      title: "AI 绘画工作室",
      description: "文字秒变大片，轻松制作封面图、插画与营销海报",
      icon: <ImageIcon className="w-12 h-12 mb-4 text-white" />,
      action: "开始绘图",
      bgImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2064&auto=format&fit=crop",
    },
    {
      title: "智能拍摄教练",
      description: "手把手教您运镜、打光与构图，小白也能拍出电影感",
      icon: <Camera className="w-12 h-12 mb-4 text-white" />,
      action: "开启教学",
      bgImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1638&auto=format&fit=crop",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-900 text-white relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="z-10 w-full max-w-7xl px-8 md:px-12 py-12 flex flex-col items-center">
        <div className="w-full flex flex-col md:flex-row justify-between items-center mb-16 backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex flex-col mb-4 md:mb-0">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              GrowPilot
            </h1>
            <p className="text-sm text-gray-300 mt-1">您的数字AI增长助理</p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xl font-bold tracking-tight text-white/80 italic">Build Growth Once, Scale Everywhere</span>
              <span className="text-sm text-gray-300 mt-1">从内容采集到流量变现，一站式 AI 驱动的增长操作系统</span>
            </div>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
            >
              立即创作
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.12)), url(${feature.bgImage})`,
                  backgroundColor: "#0F1115",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              <div
                className={`absolute inset-0 bg-gradient-to-t transition-opacity ${
                  index === 4
                    ? "from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-70"
                    : "from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-50"
                }`}
              />

              <div className="absolute inset-0 p-8 flex flex-col justify-end items-start">
                <div className="mb-auto pt-4 transform transition-transform duration-300 group-hover:-translate-y-2">{feature.icon}</div>

                <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-blue-200 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-gray-300 text-sm mb-6 line-clamp-2 group-hover:text-white transition-colors">
                  {feature.description}
                </p>

                <button className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-blue-600 backdrop-blur-sm rounded-lg text-sm font-medium transition-all duration-300 border border-white/20 hover:border-blue-500 w-full justify-center group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100">
                  <span>{feature.action}</span>
                  <span className="text-lg">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center py-12 flex flex-col items-center gap-6">
          <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-purple-200 opacity-90 leading-tight">
            数字AI助理，帮您成就新的增长
          </h2>
          <button
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white text-lg rounded-full font-bold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
            onClick={() => setIsAuthOpen(true)}
          >
            立即体验
          </button>
        </div>
      </div>

      <Login
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          setIsOnboardingOpen(true);
        }}
      />

      <OnboardingModal isOpen={isOnboardingOpen} onComplete={() => router.push("/dashboard")} />
    </main>
  );
}


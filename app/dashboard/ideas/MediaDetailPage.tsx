"use client";

import type { ReactNode } from "react";
import { Bookmark, Download, Sparkles, Wand2, X } from "lucide-react";
import type { IdeaDetailItem } from "./ideasData";

export interface MediaDetailPageProps {
  open: boolean;
  item: IdeaDetailItem | null;
  onClose: () => void;
}

interface RecommendedSize {
  value: string;
  hint: string;
}

interface DetailRow {
  label: string;
  value: ReactNode;
}

export default function MediaDetailPage({ open, item, onClose }: MediaDetailPageProps) {
  if (!open || !item) return null;

  const recommendedSizes: RecommendedSize[] = [
    { value: "816*1456", hint: "(9:16)" },
    { value: "1024*1024", hint: "(1:1)" },
    { value: "736*1304", hint: "..." },
  ];

  const versionRows: DetailRow[] = [
    {
      label: "类型",
      value: (
        <span className="inline-flex px-3 h-8 rounded-full bg-blue-500/20 text-blue-200 font-bold items-center">
          CHECKPOINT
        </span>
      ),
    },
    { label: "是否原创", value: "原创" },
    { label: "在线生成数", value: "16.6k" },
    { label: "下载量", value: "528" },
    { label: "基础算法", value: "基础模型 F.1" },
  ];

  const paramRows: DetailRow[] = [
    { label: "采样器", value: "Euler" },
    { label: "推荐采样步数", value: "25步" },
    { label: "CFG", value: "3.5" },
    {
      label: "推荐尺寸",
      value: (
        <div className="space-y-1 text-white">
          {recommendedSizes.map((size) => (
            <div key={size.value} className="flex items-center gap-3">
              <span className="font-semibold">{size.value}</span>
              <span className="text-gray-400">{size.hint}</span>
            </div>
          ))}
        </div>
      ),
    },
    { label: "高清修复", value: "可开启也可以不使用" },
    {
      label: "配置说明",
      value: "出图有噪点可提高cfg，但个人推荐3.5，本模型对于脸部特写的控制好，欢迎使用。",
    },
    {
      label: "推荐提示词",
      value: (
        <div className="text-white">
          <div className="whitespace-pre-wrap break-words">
            This is a modern-style image showing a young woman sitting on the floor. She wore a black blazer and plaid
            skirt, and her long hair fell over her shoulders. Her eyes were calm and deep, and her expression was
            slightly thoughtful. The background is a white wall and a gray chair. The overall color is simple and
            generous, giving people a feeling of tranquility.
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      <div className="h-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="p-5 overflow-auto">
          <div className="rounded-2xl bg-[#0F1115] border border-white/5 overflow-hidden">
            <img src={item.cover} alt={item.title} className="w-full h-auto block" />
          </div>
        </div>

        <div className="p-5 overflow-auto border-t border-white/10 lg:border-t-0 lg:border-l border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mt-2 text-lg font-extrabold text-white leading-snug line-clamp-2">{item.title}</div>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-300">
                <div>作者：Cding D（高级会员）</div>
                <div>日期：2025-12-24</div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="关闭详情"
              className="shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              <X size={18} className="text-gray-200" />
            </button>
          </div>

          <div className="mt-5">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="h-12 rounded-2xl bg-[#F3C96B] text-[#2B1B00] font-extrabold flex items-center justify-center gap-2"
              >
                <Sparkles size={18} className="text-[#2B1B00]" />
                一键同款
              </button>
              <button
                type="button"
                className="h-12 rounded-2xl bg-[#F3C96B] text-[#2B1B00] font-extrabold flex items-center justify-center gap-2"
              >
                <Wand2 size={18} className="text-[#2B1B00]" />
                使用模型
              </button>
              <button
                type="button"
                className="h-12 rounded-2xl bg-white/5 border border-white/10 text-white font-extrabold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                <Bookmark size={18} className="text-white" />
                收藏
              </button>
              <button
                type="button"
                className="h-12 rounded-2xl bg-[#F3C96B] text-[#2B1B00] font-extrabold flex items-center justify-center gap-2"
              >
                <Download size={18} className="text-[#2B1B00]" />
                会员下载
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
              <span className="px-2.5 h-7 rounded-lg bg-blue-600 text-white text-sm font-bold flex items-center">独家</span>
              <div className="text-base font-bold text-white">版本详情</div>
            </div>

            <div className="grid grid-cols-[120px_minmax(0,1fr)] text-sm">
              {versionRows.map((row) => (
                <div key={row.label} className="contents">
                  <div className="px-4 py-3 border-t border-white/10 text-gray-300">{row.label}</div>
                  <div className="px-4 py-3 border-t border-white/10 text-white">{row.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <div className="text-base font-bold text-white">推荐参数</div>
            </div>

            <div className="grid grid-cols-[120px_minmax(0,1fr)] text-sm">
              {paramRows.map((row) => (
                <div key={row.label} className="contents">
                  <div className="px-4 py-3 border-t border-white/10 text-gray-300">{row.label}</div>
                  <div className="px-4 py-3 border-t border-white/10 text-white">{row.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

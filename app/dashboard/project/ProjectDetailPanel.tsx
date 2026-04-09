"use client";

import { X } from "lucide-react";
import { formatProjectTime } from "@/lib/demoProjects";

type Attachment = {
  type: "image" | "video";
  src: string;
  name: string;
};

type ProjectDetails = {
  id: number;
  name: string;
  statusText?: string;
  updatedAt: string;
  cover: string;
  mode: "视频生成" | "图像生成" | "数字人" | "AI营销助手" | "AI换脸";
  model: string;
  ratio: string;
  count: string;
  advanced: string;
  prompt: string;
  resultTitle: string;
  resultHint: string;
  attachments: Attachment[];
};

type ProjectDetailPanelProps = {
  details: ProjectDetails;
  onClose: () => void;
};

export default function ProjectDetailPanel({ details, onClose }: ProjectDetailPanelProps) {
  return (
    <div className="h-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      <div className="h-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="p-5 overflow-auto">
          <div className="rounded-2xl bg-surface border border-white/5 overflow-hidden">
            <img src={details.cover} alt={details.name} className="w-full h-auto block" />
          </div>
        </div>

        <div className="p-5 overflow-auto border-t border-white/10 lg:border-t-0 lg:border-l border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mt-2 text-lg font-extrabold text-white leading-snug line-clamp-2">{details.name}</div>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-300">
                <div>更新于：{formatProjectTime(details.updatedAt)}</div>
                {details.statusText ? <div className="text-accent-bright font-semibold">{details.statusText}</div> : null}
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

          <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <div className="text-base font-bold text-white">详细参数</div>
            </div>

            <div className="grid grid-cols-[120px_minmax(0,1fr)] text-sm">
              {[
                { label: "模式", value: details.mode },
                { label: "模型", value: details.model },
                { label: "比例", value: details.ratio },
                { label: "数量", value: details.count },
                { label: "高级", value: details.advanced },
              ].map((row) => (
                <div key={row.label} className="contents">
                  <div className="px-4 py-3 border-t border-white/10 text-gray-300">{row.label}</div>
                  <div className="px-4 py-3 border-t border-white/10 text-white">{row.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <div className="text-base font-bold text-white">详细说明</div>
            </div>

            <div className="grid grid-cols-[120px_minmax(0,1fr)] text-sm">
              {[{ label: "创作需求", value: <div className="whitespace-pre-wrap break-words">{details.prompt}</div> }].map(
                (row) => (
                  <div key={row.label} className="contents">
                    <div className="px-4 py-3 border-t border-white/10 text-gray-300">{row.label}</div>
                    <div className="px-4 py-3 border-t border-white/10 text-white">{row.value}</div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <div className="text-base font-bold text-white">素材与附件</div>
            </div>

            {!!details.attachments.length ? (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {details.attachments.map((file, index) => (
                  <div
                    key={`${file.type}_${file.src}_${index}`}
                    className="relative aspect-video rounded-xl border border-white/10 overflow-hidden bg-white/5"
                  >
                    {file.type === "video" ? (
                      <video src={file.src} controls className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <img src={file.src} alt={file.name} className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent" />
                    <div className="absolute left-3 bottom-2 text-xs font-semibold text-white/90">{file.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-400">暂无素材</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


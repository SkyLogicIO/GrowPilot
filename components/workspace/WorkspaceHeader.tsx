"use client";

import type { CurrentBrief } from "./types";

export default function WorkspaceHeader({ brief }: { brief: CurrentBrief }) {
  const tags: { label: string; color: string }[] = [
    { label: brief.mode, color: "bg-blue-500/15 text-blue-400" },
    { label: brief.platform, color: "bg-accent/10 text-accent" },
    { label: brief.intent, color: "bg-violet-500/15 text-violet-400" },
    { label: brief.language, color: "bg-emerald-500/15 text-emerald-400" },
  ].filter((t) => t.label);

  return (
    <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-2 shrink-0 min-h-[48px]">
      <span className="text-xs font-bold text-text-secondary truncate mr-1">
        {brief.threadTitle || "未命名对话"}
      </span>
      <div className="w-px h-3.5 bg-white/[0.08] shrink-0" />
      {tags.map((tag) => (
        <span
          key={tag.label}
          className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${tag.color}`}
        >
          {tag.label}
        </span>
      ))}
      {brief.assetCount > 0 && (
        <>
          <div className="w-px h-3.5 bg-white/[0.08] shrink-0" />
          <span className="shrink-0 text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">
            {brief.assetCount} 项素材
          </span>
        </>
      )}
    </div>
  );
}

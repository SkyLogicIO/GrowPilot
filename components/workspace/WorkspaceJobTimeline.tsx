"use client";

import { ImageIcon, Play, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { WorkspaceJob } from "./types";

const statusConfig: Record<
  WorkspaceJob["status"],
  { icon: typeof CheckCircle2; color: string; pulse?: boolean }
> = {
  completed: { icon: CheckCircle2, color: "text-green-400" },
  generating: { icon: Loader2, color: "text-accent", pulse: true },
  pending: { icon: Loader2, color: "text-white/30" },
  failed: { icon: XCircle, color: "text-red-400" },
};

export default function WorkspaceJobTimeline({
  jobs,
  onClick,
}: {
  jobs: WorkspaceJob[];
  onClick?: (jobId: string) => void;
}) {
  if (jobs.length === 0) return null;

  return (
    <div className="px-4 py-2 border-t border-white/[0.06] shrink-0">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1">
        {jobs.map((job) => {
          const cfg = statusConfig[job.status];
          const Icon = cfg.icon;
          return (
            <button
              key={job.id}
              type="button"
              onClick={() => onClick?.(job.linkedAssetId ?? job.id)}
              className="shrink-0 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors group"
            >
              {job.type === "image" ? (
                <ImageIcon size={12} className="text-text-muted shrink-0" />
              ) : (
                <Play size={12} className="text-text-muted shrink-0 fill-current" />
              )}
              <Icon
                size={12}
                className={`${cfg.color} shrink-0 ${cfg.pulse ? "animate-spin" : ""}`}
              />
              <span className="text-[11px] text-text-secondary font-medium truncate max-w-[120px] group-hover:text-text-primary transition-colors">
                {job.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

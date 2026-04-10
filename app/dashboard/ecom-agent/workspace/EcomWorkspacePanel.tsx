"use client";

import type {
  CurrentBrief,
  WorkspaceJob,
  WorkspaceAsset,
} from "./types";
import WorkspaceHeader from "./WorkspaceHeader";
import WorkspacePrimaryCanvas from "./WorkspacePrimaryCanvas";
import WorkspaceJobTimeline from "./WorkspaceJobTimeline";
import WorkspaceAssetRail from "./WorkspaceAssetRail";

interface CanvasActions {
  onSendToChat: (asset: WorkspaceAsset) => void;
  onAddToProject: (asset: WorkspaceAsset, brief: CurrentBrief) => void;
}

interface EcomWorkspacePanelProps {
  brief: CurrentBrief;
  jobs: WorkspaceJob[];
  assets: WorkspaceAsset[];
  selectedAsset: WorkspaceAsset | null;
  selectedAssetId: string | null;
  onSelectAsset: (assetId: string) => void;
  onRemoveAsset: (assetId: string) => void;
  actions: CanvasActions;
}

export default function EcomWorkspacePanel({
  brief,
  jobs,
  assets,
  selectedAsset,
  selectedAssetId,
  onSelectAsset,
  onRemoveAsset,
  actions,
}: EcomWorkspacePanelProps) {
  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader brief={brief} />

      {/* 主画布 */}
      <WorkspacePrimaryCanvas
        asset={selectedAsset}
        brief={brief}
        actions={actions}
      />

      {/* 任务时间线 */}
      <WorkspaceJobTimeline
        jobs={jobs}
        onClick={(jobId) => onSelectAsset(jobId)}
      />

      {/* 候选素材条 */}
      <WorkspaceAssetRail
        assets={assets}
        selectedAssetId={selectedAssetId}
        onSelect={onSelectAsset}
        onRemove={onRemoveAsset}
      />
    </div>
  );
}

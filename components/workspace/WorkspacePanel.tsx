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

export interface WorkspacePanelProps {
  brief: CurrentBrief;
  jobs: WorkspaceJob[];
  assets: WorkspaceAsset[];
  selectedAsset: WorkspaceAsset | null;
  selectedAssetId: string | null;
  onSelectAsset: (assetId: string) => void;
  onRemoveAsset: (assetId: string) => void;
  actions: CanvasActions;
  threadId: string;
  imageDataMap: Record<string, string>;
  onExportCanvas: (dataUrl: string, sourceAsset: WorkspaceAsset) => void;
}

export default function WorkspacePanel({
  brief,
  jobs,
  assets,
  selectedAsset,
  selectedAssetId,
  onSelectAsset,
  onRemoveAsset,
  actions,
  threadId,
  imageDataMap,
  onExportCanvas,
}: WorkspacePanelProps) {
  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader brief={brief} />

      {/* 主画布 */}
      <WorkspacePrimaryCanvas
        asset={selectedAsset}
        brief={brief}
        actions={actions}
        threadId={threadId}
        imageDataMap={imageDataMap}
        onExport={onExportCanvas}
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

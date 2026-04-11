export interface CanvasImageNode {
  id: string;
  type: "image";
  assetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface WorkspaceCanvasDocument {
  id: string;
  threadId: string;
  width: number;
  height: number;
  background: string;
  selectedNodeId: string | null;
  nodes: CanvasImageNode[];
  updatedAt: number;
}

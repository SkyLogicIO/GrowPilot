"use client";

import { useReducer, useCallback, useRef, useEffect } from "react";
import type Konva from "konva";
import type { WorkspaceCanvasDocument, CanvasImageNode } from "./types";
import {
  loadCanvasDocument,
  saveCanvasDocument,
  deleteCanvasDocument,
} from "./storage";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const CANVAS_BG = "#0f172a";

interface State {
  document: WorkspaceCanvasDocument | null;
  prevAssetId: string | null;
}

type Action =
  | { type: "LOAD"; doc: WorkspaceCanvasDocument | null }
  | { type: "ADD_ASSET"; threadId: string; assetId: string; assetNaturalWidth: number; assetNaturalHeight: number }
  | { type: "FIX_NODE_SIZE"; assetId: string; imgW: number; imgH: number }
  | { type: "UPDATE_NODE"; updates: { id: string; changes: Partial<CanvasImageNode> } }
  | { type: "SELECT_NODE"; nodeId: string | null }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD":
      return { document: action.doc, prevAssetId: null };

    case "ADD_ASSET": {
      const { threadId, assetId, assetNaturalWidth, assetNaturalHeight } = action;
      const prev = state.document;
      if (prev && prev.nodes.some((n) => n.assetId === assetId)) {
        return {
          ...state,
          prevAssetId: assetId,
          document: {
            ...prev,
            selectedNodeId: prev.nodes.find((n) => n.assetId === assetId)?.id ?? null,
          },
        };
      }

      const imgW = assetNaturalWidth || 800;
      const imgH = assetNaturalHeight || 800;
      const canvasW = prev?.width || CANVAS_WIDTH;
      const canvasH = prev?.height || CANVAS_HEIGHT;
      const scale = Math.min(canvasW / imgW, canvasH / imgH, 1) * 0.85;
      const nodeW = imgW * scale;
      const nodeH = imgH * scale;
      const nodeX = (canvasW - nodeW) / 2;
      const nodeY = (canvasH - nodeH) / 2;

      const newNode: CanvasImageNode = {
        id: `node_${assetId}_${Date.now()}`,
        type: "image",
        assetId,
        x: nodeX,
        y: nodeY,
        width: nodeW,
        height: nodeH,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      };

      const newDoc: WorkspaceCanvasDocument = {
        id: prev?.id || `canvas_${threadId}`,
        threadId,
        width: prev?.width || CANVAS_WIDTH,
        height: prev?.height || CANVAS_HEIGHT,
        background: prev?.background || CANVAS_BG,
        selectedNodeId: newNode.id,
        nodes: prev ? [...prev.nodes, newNode] : [newNode],
        updatedAt: Date.now(),
      };

      saveCanvasDocument(newDoc);
      return { ...state, prevAssetId: assetId, document: newDoc };
    }

    case "UPDATE_NODE": {
      const { id, changes } = action.updates;
      const prev = state.document;
      if (!prev) return state;
      const next: WorkspaceCanvasDocument = {
        ...prev,
        nodes: prev.nodes.map((n) => (n.id === id ? { ...n, ...changes } : n)),
        updatedAt: Date.now(),
      };
      saveCanvasDocument(next);
      return { ...state, document: next };
    }

    case "SELECT_NODE": {
      const prev = state.document;
      if (!prev || prev.selectedNodeId === action.nodeId) return state;
      const next: WorkspaceCanvasDocument = { ...prev, selectedNodeId: action.nodeId };
      saveCanvasDocument(next);
      return { ...state, document: next };
    }

    case "FIX_NODE_SIZE": {
      const { assetId, imgW, imgH } = action;
      const prev = state.document;
      if (!prev || imgW <= 0 || imgH <= 0) return state;

      const nodeIdx = prev.nodes.findIndex((n) => n.assetId === assetId);
      if (nodeIdx === -1) return state;

      // Skip if the existing node already has correct proportions
      const existing = prev.nodes[nodeIdx];
      const ratio = existing.width / existing.height;
      if (Math.abs(ratio - imgW / imgH) < 0.01) return state;

      const canvasW = prev.width || CANVAS_WIDTH;
      const canvasH = prev.height || CANVAS_HEIGHT;
      const scale = Math.min(canvasW / imgW, canvasH / imgH, 1) * 0.85;
      const newW = imgW * scale;
      const newH = imgH * scale;
      const newX = (canvasW - newW) / 2;
      const newY = (canvasH - newH) / 2;

      const updatedNode: CanvasImageNode = {
        ...existing,
        x: newX,
        y: newY,
        width: newW,
        height: newH,
      };

      const newNodes = [...prev.nodes];
      newNodes[nodeIdx] = updatedNode;

      const newDoc: WorkspaceCanvasDocument = {
        ...prev,
        nodes: newNodes,
        updatedAt: Date.now(),
      };
      saveCanvasDocument(newDoc);
      return { ...state, document: newDoc };
    }

    case "RESET":
      return { document: null, prevAssetId: null };

    default:
      return state;
  }
}

export function useWorkspaceCanvasDocument(params: {
  threadId: string;
  assetId: string | null;
  assetDataUrl: string | null;
  assetNaturalWidth?: number;
  assetNaturalHeight?: number;
}) {
  const { threadId, assetId, assetDataUrl, assetNaturalWidth, assetNaturalHeight } = params;

  const [state, dispatch] = useReducer(reducer, {
    document: null,
    prevAssetId: null,
  });

  const stageRef = useRef<Konva.Stage>(null);
  const prevThreadIdRef = useRef<string>("");

  // Detect natural image size via ref (avoids setState-in-effect lint)
  const naturalSizeRef = useRef<{ w: number; h: number } | null>(null);

  // Load/reset canvas document when threadId changes
  useEffect(() => {
    if (threadId === prevThreadIdRef.current) return;
    prevThreadIdRef.current = threadId;
    naturalSizeRef.current = null;
    const doc = loadCanvasDocument(threadId);
    dispatch({ type: "LOAD", doc });
  }, [threadId]);

  // Add asset node when assetId changes to a new value
  useEffect(() => {
    if (!threadId || !assetId || !assetDataUrl) return;
    if (state.prevAssetId === assetId) return;

    // Try to detect natural size synchronously (data URLs / browser cache hit)
    const img = new window.Image();
    img.src = assetDataUrl;
    const w = assetNaturalWidth || naturalSizeRef.current?.w || (img.complete && img.naturalWidth > 0 ? img.naturalWidth : 0);
    const h = assetNaturalHeight || naturalSizeRef.current?.h || (img.complete && img.naturalHeight > 0 ? img.naturalHeight : 0);

    if (w > 0 && h > 0) {
      naturalSizeRef.current = { w, h };
    }

    dispatch({
      type: "ADD_ASSET",
      threadId,
      assetId,
      assetNaturalWidth: w,
      assetNaturalHeight: h,
    });

    // If we didn't get real dimensions, fix them once the image loads
    if (w === 0 || h === 0) {
      img.onload = () => {
        const nw = img.naturalWidth;
        const nh = img.naturalHeight;
        if (nw > 0 && nh > 0) {
          naturalSizeRef.current = { w: nw, h: nh };
          dispatch({ type: "FIX_NODE_SIZE", assetId, imgW: nw, imgH: nh });
        }
      };
    }
  }, [threadId, assetId, assetDataUrl, assetNaturalWidth, assetNaturalHeight, state.prevAssetId]);

  const updateNode = useCallback((id: string, changes: Partial<CanvasImageNode>) => {
    dispatch({ type: "UPDATE_NODE", updates: { id, changes } });
  }, []);

  const selectNode = useCallback((nodeId: string | null) => {
    dispatch({ type: "SELECT_NODE", nodeId });
  }, []);

  const resetDocument = useCallback(() => {
    deleteCanvasDocument(threadId);
    dispatch({ type: "RESET" });
  }, [threadId]);

  return {
    document: state.document,
    stageRef,
    updateNode,
    selectNode,
    resetDocument,
  };
}

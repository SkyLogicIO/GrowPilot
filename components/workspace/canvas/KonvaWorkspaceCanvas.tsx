"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from "react-konva";
import type Konva from "konva";
import type { CanvasImageNode, WorkspaceCanvasDocument } from "./types";

interface KonvaWorkspaceCanvasProps {
  document: WorkspaceCanvasDocument;
  imageDataMap: Record<string, string>;
  onUpdateNode: (id: string, updates: Partial<CanvasImageNode>) => void;
  onSelectNode: (id: string | null) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
}

function CanvasImageNodeComponent({
  node,
  src,
  isSelected,
  onSelect,
  onChange,
}: {
  node: CanvasImageNode;
  src: string;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<CanvasImageNode>) => void;
}) {
  const shapeRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Load image using native Image object
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) return;
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.src = src;
    image.onload = () => setImg(image);
  }, [src]);

  const handleDragEnd = useCallback(() => {
    if (!shapeRef.current) return;
    onChange({
      x: shapeRef.current.x(),
      y: shapeRef.current.y(),
    });
  }, [onChange]);

  const handleTransformEnd = useCallback(() => {
    if (!shapeRef.current) return;
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Enforce minimum size
    const MIN = 50;
    const newW = Math.max(MIN, node.width() * scaleX);
    const newH = Math.max(MIN, node.height() * scaleY);

    node.scaleX(1);
    node.scaleY(1);
    node.width(newW);
    node.height(newH);

    onChange({
      x: node.x(),
      y: node.y(),
      width: newW,
      height: newH,
      rotation: node.rotation(),
    });
  }, [onChange]);

  if (!img) return null;

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        id={node.id}
        image={img}
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        rotation={node.rotation}
        scaleX={node.scaleX}
        scaleY={node.scaleY}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(_oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 50) return _oldBox;
            return newBox;
          }}
          borderStroke="#3b82f6"
          borderStrokeWidth={1.5}
          anchorStroke="#3b82f6"
          anchorFill="#1e3a5f"
          anchorSize={8}
          anchorCornerRadius={2}
        />
      )}
    </>
  );
}

export default function KonvaWorkspaceCanvas({
  document: doc,
  imageDataMap,
  onUpdateNode,
  onSelectNode,
  stageRef,
}: KonvaWorkspaceCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  // Fit stage to container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setStageSize({ width: Math.round(width), height: Math.round(height) });
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      // Click on empty area → deselect
      if (e.target === e.target.getStage()) {
        onSelectNode(null);
      }
    },
    [onSelectNode],
  );

  // Don't render Stage until container dimensions are known
  if (stageSize.width === 0 || stageSize.height === 0) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
      />
    );
  }

  const scaleToFit = stageSize.width / doc.width;
  const scale = Math.min(scaleToFit, stageSize.height / doc.height, 1);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          {/* 画布背景 Rect — 确保导出时背景色被包含 */}
          <Rect
            x={0}
            y={0}
            width={doc.width}
            height={doc.height}
            fill={doc.background}
            listening={false}
          />
          {doc.nodes.map((node) => {
            const src = imageDataMap[node.assetId];
            if (!src) return null;
            return (
              <CanvasImageNodeComponent
                key={node.id}
                node={node}
                src={src}
                isSelected={doc.selectedNodeId === node.id}
                onSelect={() => onSelectNode(node.id)}
                onChange={(updates) => onUpdateNode(node.id, updates)}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createDrawPoster } from "../../../core/src";
import { getLayerBounds } from "../../../core/src/core/layout";
import { getSnapLines, type SnapLine } from "../../../core/src/core/snap";
import type { Layer } from "../../../core/src";
import type { BoundingBox } from "../../../core/src/core/layout";
import type { EditableLayer } from "../hooks/useEditorState";
import { hitTest, canvasCoords } from "../utils/hitTest";
import {
  drawSelection,
  clearSelection,
  getHandleAtPoint,
  getHandleCursor,
  type HandleType,
} from "../utils/selectionRenderer";
import Ruler from "./Ruler";
import styles from "./CanvasStage.module.css";

const CANVAS_W = 375;
const CANVAS_H = 667;

interface DragState {
  type: "move" | "resize" | "rotate";
  layerId: string;
  mouseStartX: number;
  mouseStartY: number;
  initialProps: Record<string, unknown>;
  startBounds: BoundingBox;
  handle?: HandleType;
  hasMoved: boolean;
}

function getMovePatch(
  initialProps: Record<string, unknown>,
  dx: number,
  dy: number,
): Record<string, unknown> {
  const t = initialProps.type as string;
  if (["rect", "image", "qrcode", "text", "circle"].includes(t)) {
    return {
      x: (initialProps.x as number) + dx,
      y: (initialProps.y as number) + dy,
    };
  }
  if (t === "line") {
    return {
      x1: (initialProps.x1 as number) + dx,
      y1: (initialProps.y1 as number) + dy,
      x2: (initialProps.x2 as number) + dx,
      y2: (initialProps.y2 as number) + dy,
    };
  }
  if (t === "polygon") {
    const pts = initialProps.points as [number, number][];
    return { points: pts.map(p => [p[0] + dx, p[1] + dy]) };
  }
  return {};
}

function getResizePatch(
  layerType: string,
  handle: HandleType,
  startBounds: BoundingBox,
  dx: number,
  dy: number,
): Record<string, unknown> {
  // line / polygon — resize not supported
  if (layerType === "line" || layerType === "polygon") return {};

  let { x: nx, y: ny, width: nw, height: nh } = startBounds;

  switch (handle) {
    case "nw":
      nx += dx;
      ny += dy;
      nw -= dx;
      nh -= dy;
      break;
    case "n":
      ny += dy;
      nh -= dy;
      break;
    case "ne":
      ny += dy;
      nw += dx;
      nh -= dy;
      break;
    case "e":
      nw += dx;
      break;
    case "se":
      nw += dx;
      nh += dy;
      break;
    case "s":
      nh += dy;
      break;
    case "sw":
      nx += dx;
      nw -= dx;
      nh += dy;
      break;
    case "w":
      nx += dx;
      nw -= dx;
      break;
  }

  nw = Math.max(10, nw);
  nh = Math.max(10, nh);

  if (layerType === "circle") {
    const r = Math.max(nw, nh) / 2;
    return { x: nx + nw / 2, y: ny + nh / 2, radius: r };
  }
  if (layerType === "text") {
    return { x: nx, y: ny, maxWidth: nw };
  }
  return { x: nx, y: ny, width: nw, height: nh };
}

function getRotatePatch(
  startBounds: BoundingBox,
  startX: number,
  startY: number,
  curX: number,
  curY: number,
  initialRotate: number = 0,
): Record<string, unknown> {
  const cx = startBounds.x + startBounds.width / 2;
  const cy = startBounds.y + startBounds.height / 2;

  const startAngle = Math.atan2(startY - cy, startX - cx);
  const curAngle = Math.atan2(curY - cy, curX - cx);
  const delta = curAngle - startAngle;

  return { rotate: initialRotate + delta };
}

interface CanvasStageProps {
  layers: EditableLayer[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateLayer: (id: string, patch: Record<string, unknown>) => void;
  onCommitHistory: () => void;
}

export default function CanvasStage({
  layers,
  selectedId,
  onSelect,
  onUpdateLayer,
  onCommitHistory,
}: CanvasStageProps) {
  const renderCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<ReturnType<typeof createDrawPoster> | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const [snapLines, setSnapLines] = useState<SnapLine[]>([]);

  // Keep dragStateRef in sync with dragState
  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  // Initialize draw-poster
  useEffect(() => {
    const canvas = renderCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    posterRef.current = createDrawPoster(ctx, { ratio: 1 });
  }, []);

  // Sync layers to draw-poster and re-render
  useEffect(() => {
    const poster = posterRef.current;
    if (!poster) return;

    // Sync layers — snapshot first to avoid mutation-during-iteration bug
    const existingLayers = [...poster.getLayers()];
    existingLayers.forEach(l => {
      if (l.id) poster.removeLayer(l.id);
    });
    layers.forEach(l => poster.addLayer(l as unknown as Layer));
    poster.render().then(() => {
      // After render, update overlay
      const overlayCtx = overlayCanvasRef.current?.getContext("2d");
      if (!overlayCtx) return;

      clearSelection(overlayCtx);

      // Draw snap lines
      if (snapLines.length > 0) {
        overlayCtx.save();
        overlayCtx.strokeStyle = "#ff0000";
        overlayCtx.lineWidth = 1;
        snapLines.forEach(line => {
          overlayCtx.beginPath();
          if (line.type === "vertical") {
            overlayCtx.moveTo(line.position, line.min);
            overlayCtx.lineTo(line.position, line.max);
          } else {
            overlayCtx.moveTo(line.min, line.position);
            overlayCtx.lineTo(line.max, line.position);
          }
          overlayCtx.stroke();
        });
        overlayCtx.restore();
      }

      if (!selectedId) {
        return;
      }
      const selectedLayer = layers.find(l => l.id === selectedId);
      if (!selectedLayer) {
        return;
      }
      const renderCtx = renderCanvasRef.current?.getContext("2d");
      if (!renderCtx) return;
      const bounds = getLayerBounds(
        renderCtx,
        selectedLayer as unknown as Layer,
      );
      drawSelection(overlayCtx, bounds);
    });
  }, [layers, selectedId, snapLines]);

  const getOverlayCtx = useCallback(() => {
    return overlayCanvasRef.current?.getContext("2d") ?? null;
  }, []);

  const getRenderCtx = useCallback(() => {
    return renderCanvasRef.current?.getContext("2d") ?? null;
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const overlayCanvas = overlayCanvasRef.current;
      if (!overlayCanvas) return;
      const { x, y } = canvasCoords(e, overlayCanvas);
      const renderCtx = getRenderCtx();
      if (!renderCtx) return;

      // Check if clicking on a resize handle first
      if (selectedId) {
        const selectedLayer = layers.find(l => l.id === selectedId);
        if (selectedLayer) {
          const bounds = getLayerBounds(
            renderCtx,
            selectedLayer as unknown as Layer,
          );
          const handle = getHandleAtPoint(bounds, x, y);
          if (handle) {
            setDragState({
              type: handle === "rot" ? "rotate" : "resize",
              layerId: selectedId,
              mouseStartX: x,
              mouseStartY: y,
              initialProps: { ...selectedLayer } as Record<string, unknown>,
              startBounds: bounds,
              handle,
              hasMoved: false,
            });
            return;
          }
        }
      }

      // Hit test layers
      const hitId = hitTest(renderCtx, layers as unknown as Layer[], x, y);
      if (hitId) {
        if (hitId !== selectedId) {
          onSelect(hitId);
        }
        const hitLayer = layers.find(l => l.id === hitId);
        if (hitLayer) {
          const bounds = getLayerBounds(
            renderCtx,
            hitLayer as unknown as Layer,
          );
          setDragState({
            type: "move",
            layerId: hitId,
            mouseStartX: x,
            mouseStartY: y,
            initialProps: { ...hitLayer } as Record<string, unknown>,
            startBounds: bounds,
            hasMoved: false,
          });
        }
      } else {
        onSelect(null);
      }
    },
    [layers, selectedId, onSelect, getRenderCtx],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const overlayCanvas = overlayCanvasRef.current;
      if (!overlayCanvas) return;
      const { x, y } = canvasCoords(e, overlayCanvas);
      const ds = dragStateRef.current;

      if (!ds) {
        // Update cursor when not dragging
        const renderCtx = getRenderCtx();
        if (!renderCtx) return;

        if (selectedId) {
          const selectedLayer = layers.find(l => l.id === selectedId);
          if (selectedLayer) {
            const bounds = getLayerBounds(
              renderCtx,
              selectedLayer as unknown as Layer,
            );
            const handle = getHandleAtPoint(bounds, x, y);
            if (handle) {
              overlayCanvas.style.cursor = getHandleCursor(handle);
              return;
            }
          }
        }

        const hitId = hitTest(renderCtx, layers as unknown as Layer[], x, y);
        overlayCanvas.style.cursor = hitId ? "move" : "default";
        return;
      }

      const dx = x - ds.mouseStartX;
      const dy = y - ds.mouseStartY;

      let patch: Record<string, unknown>;
      if (ds.type === "move") {
        // Apply snapping
        let snapDx = 0;
        let snapDy = 0;
        
        // Calculate theoretical new position without snap
        const currentBounds = {
           ...ds.startBounds,
           x: ds.startBounds.x + dx,
           y: ds.startBounds.y + dy,
        };
        
        const renderCtx = getRenderCtx();
        if (renderCtx) {
           const otherLayers = layers.filter(l => l.id !== ds.layerId);
           const otherBounds = otherLayers.map(l => getLayerBounds(renderCtx, l as unknown as Layer));
           
           const snapResult = getSnapLines(currentBounds, otherBounds);
           snapDx = snapResult.dx;
           snapDy = snapResult.dy;
           setSnapLines(snapResult.lines);
        }

        patch = getMovePatch(ds.initialProps, dx + snapDx, dy + snapDy);
      } else if (ds.type === "rotate") {
        patch = getRotatePatch(
          ds.startBounds,
          ds.mouseStartX,
          ds.mouseStartY,
          x,
          y,
          (ds.initialProps.rotate as number) || 0,
        );
        setSnapLines([]);
      } else {
        patch = getResizePatch(
          ds.initialProps.type as string,
          ds.handle!,
          ds.startBounds,
          dx,
          dy,
        );
        setSnapLines([]);
      }

      if (Object.keys(patch).length > 0) {
        onUpdateLayer(ds.layerId, patch);
        setDragState(prev => (prev ? { ...prev, hasMoved: true } : null));
      }
    },
    [layers, selectedId, onUpdateLayer, getRenderCtx],
  );

  const handleMouseUp = useCallback(() => {
    const ds = dragStateRef.current;
    if (ds?.hasMoved) {
      onCommitHistory();
    }
    setDragState(null);
    setSnapLines([]);
    if (overlayCanvasRef.current) {
      overlayCanvasRef.current.style.cursor = "default";
    }
  }, [onCommitHistory]);

  const handleMouseLeave = useCallback(() => {
    const ds = dragStateRef.current;
    if (ds?.hasMoved) {
      onCommitHistory();
    }
    setDragState(null);
    setSnapLines([]);
    if (overlayCanvasRef.current) {
      overlayCanvasRef.current.style.cursor = "default";
    }
  }, [onCommitHistory]);

  return (
    <div className={styles.stageArea}>
      <div className={styles.canvasWrapper}>
        <div style={{ position: "relative", paddingLeft: 20, paddingTop: 20 }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 20,
              width: CANVAS_W,
              height: 20,
            }}
          >
            <Ruler length={CANVAS_W} orientation="horizontal" />
          </div>
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 0,
              width: 20,
              height: CANVAS_H,
            }}
          >
            <Ruler length={CANVAS_H} orientation="vertical" />
          </div>
          <div className={styles.canvasContainer}>
            <canvas
              ref={renderCanvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className={styles.renderCanvas}
            />
            <canvas
              ref={overlayCanvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className={styles.overlayCanvas}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            />
          </div>
        </div>
        <div className={styles.canvasInfo}>
          画布尺寸：{CANVAS_W} × {CANVAS_H}
        </div>
      </div>
    </div>
  );
}

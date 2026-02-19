"use client";

import { useEffect, useCallback } from "react";
import styles from "./page.module.css";
import { useEditorState } from "../hooks/useEditorState";
import type { EditableLayer } from "../hooks/useEditorState";
import { createDefaultLayer } from "../utils/layerDefaults";
import CanvasStage from "../components/CanvasStage";
import Toolbar from "../components/Toolbar";
import PropsPanel from "../components/PropsPanel";
import { createDrawPoster } from "../../../core/src";

const CANVAS_W = 375;
const CANVAS_H = 667;

export default function Home() {
  const { layers, selectedId, canUndo, canRedo, dispatch } = useEditorState();

  // ─── Actions ──────────────────────────────────────────────

  const addElement = useCallback(
    (type: string, overrides?: Record<string, unknown>) => {
      const layer = createDefaultLayer(type, overrides);
      dispatch({ type: "ADD_LAYER", layer });
    },
    [dispatch],
  );

  const updateLayer = useCallback(
    (id: string, patch: Record<string, unknown>) => {
      dispatch({ type: "UPDATE_LAYER", id, patch });
    },
    [dispatch],
  );

  const commitHistory = useCallback(() => {
    dispatch({ type: "PUSH_HISTORY" });
  }, [dispatch]);

  const removeLayer = useCallback(
    (id: string) => {
      dispatch({ type: "REMOVE_LAYER", id });
    },
    [dispatch],
  );

  const setLayers = useCallback(
    (newLayers: EditableLayer[]) => {
      dispatch({ type: "SET_LAYERS", layers: newLayers });
    },
    [dispatch],
  );

  const reorderLayers = useCallback(
    (fromIndex: number, toIndex: number) => {
      dispatch({ type: "REORDER", fromIndex, toIndex });
    },
    [dispatch],
  );

  const select = useCallback(
    (id: string | null) => {
      dispatch({ type: "SELECT", id });
    },
    [dispatch],
  );

  const undo = useCallback(() => dispatch({ type: "UNDO" }), [dispatch]);
  const redo = useCallback(() => dispatch({ type: "REDO" }), [dispatch]);

  // ─── Export ───────────────────────────────────────────────

  const handleExport = useCallback(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const poster = createDrawPoster(ctx, { ratio: 1 });
    layers.forEach(l =>
      poster.addLayer(l as Parameters<typeof poster.addLayer>[0]),
    );
    await poster.render();
    const url = poster.exportDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "poster.png";
    a.click();
  }, [layers]);

  // ─── Keyboard Shortcuts ───────────────────────────────────

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const meta = e.metaKey || e.ctrlKey;

      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        dispatch({ type: "REMOVE_LAYER", id: selectedId });
        return;
      }

      if (meta && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "UNDO" });
        return;
      }

      if (meta && (e.key === "Z" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        dispatch({ type: "REDO" });
        return;
      }

      if (meta && e.key === "d" && selectedId) {
        e.preventDefault();
        const original = layers.find(l => l.id === selectedId);
        if (original) {
          const l = original as unknown as Record<string, unknown>;
          const copy = {
            ...original,
            id: `${original.type}-copy-${Date.now()}`,
            zIndex: (original.zIndex ?? 0) + 1,
            ...(typeof l.x === "number" ? { x: (l.x as number) + 10 } : {}),
            ...(typeof l.y === "number" ? { y: (l.y as number) + 10 } : {}),
          } as EditableLayer;
          dispatch({ type: "ADD_LAYER", layer: copy });
        }
        return;
      }

      // Arrow key nudge
      if (selectedId) {
        const step = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          dx = -step;
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          dx = step;
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          dy = -step;
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          dy = step;
        } else return;

        if (dx === 0 && dy === 0) return;

        const layer = layers.find(l => l.id === selectedId);
        if (!layer) return;
        const t = layer.type;
        const lp = layer as unknown as Record<string, unknown>;

        if (["rect", "image", "qrcode", "text", "circle"].includes(t)) {
          dispatch({
            type: "UPDATE_LAYER",
            id: selectedId,
            patch: { x: (lp.x as number) + dx, y: (lp.y as number) + dy },
          });
        } else if (t === "line") {
          dispatch({
            type: "UPDATE_LAYER",
            id: selectedId,
            patch: {
              x1: (lp.x1 as number) + dx,
              y1: (lp.y1 as number) + dy,
              x2: (lp.x2 as number) + dx,
              y2: (lp.y2 as number) + dy,
            },
          });
        } else if (t === "polygon") {
          const pts = lp.points as [number, number][];
          dispatch({
            type: "UPDATE_LAYER",
            id: selectedId,
            patch: { points: pts.map(p => [p[0] + dx, p[1] + dy]) },
          });
        }
        dispatch({ type: "PUSH_HISTORY" });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, layers, dispatch]);

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.title}>AI 海报编辑器</div>
        <div className={styles.subtitle}>
          拖拽移动元素 · 点击选中 · 拖拽手柄缩放 · 右侧属性面板编辑
        </div>
      </header>

      <div className={styles.editorShell}>
        <Toolbar
          onAddElement={addElement}
          onUndo={undo}
          onRedo={redo}
          onDelete={() => selectedId && removeLayer(selectedId)}
          onExport={handleExport}
          canUndo={canUndo}
          canRedo={canRedo}
          hasSelection={!!selectedId}
        />

        <CanvasStage
          layers={layers}
          selectedId={selectedId}
          onSelect={select}
          onUpdateLayer={updateLayer}
          onCommitHistory={commitHistory}
        />

        <PropsPanel
          layers={layers}
          selectedId={selectedId}
          onSelect={select}
          onUpdateLayer={updateLayer}
          onRemoveLayer={removeLayer}
          onReorderLayers={reorderLayers}
          onSetLayers={setLayers}
        />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";
import { createDrawPoster } from "../../../core/src";
import type { Layer } from "../../../core/src";

const CANVAS_WIDTH = 375;
const CANVAS_HEIGHT = 667;

type EditableLayer = { id: string; type: string } & Record<string, unknown>;

const defaultPrompt =
  "请生成一张 375x667 的生日海报，包含温暖背景、主标题、日期与一张蛋糕图片";

const extractJsonArray = (text: string): EditableLayer[] | null => {
  if (!text) return null;
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = text.slice(start, end + 1);
  try {
    const parsed = JSON.parse(slice);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const ensureIds = (layers: EditableLayer[]): EditableLayer[] =>
  layers.map((layer, index) => {
    const candidate = layer as EditableLayer;
    const id =
      typeof candidate.id === "string" && candidate.id.length > 0
        ? candidate.id
        : `layer-${index + 1}`;
    return { ...candidate, id };
  });

export default function Home() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [layers, setLayers] = useState<EditableLayer[]>([]);
  const [rawJson, setRawJson] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const posterRef = useRef<ReturnType<typeof createDrawPoster> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    posterRef.current = createDrawPoster(ctx, { ratio: 1 });
  }, []);

  useEffect(() => {
    const poster = posterRef.current;
    if (!poster) return;
    poster.getLayers().forEach(layer => {
      if (layer.id) poster.removeLayer(layer.id);
    });
    layers.forEach(layer => poster.addLayer(layer as unknown as Layer));
    poster.render();
  }, [layers]);

  const selectedLayer = useMemo(
    () => layers.find(layer => layer.id === selectedId) ?? null,
    [layers, selectedId],
  );

  const syncRawJson = (nextLayers: EditableLayer[]) => {
    setRawJson(JSON.stringify(nextLayers, null, 2));
  };

  const updateLayer = (id: string, patch: Record<string, unknown>) => {
    setLayers(prev => {
      const next = prev.map(layer =>
        layer.id === id ? { ...layer, ...patch } : layer,
      );
      syncRawJson(next);
      return next;
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/kimi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          canvasWidth: CANVAS_WIDTH,
          canvasHeight: CANVAS_HEIGHT,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "生成失败");
      }
      const content = String(data?.content ?? "");
      const parsed = extractJsonArray(content);
      if (!parsed) {
        throw new Error("未识别到可用的 JSON 图层数组");
      }
      const nextLayers = ensureIds(parsed as EditableLayer[]);
      setLayers(nextLayers);
      setSelectedId(nextLayers[0]?.id ?? null);
      syncRawJson(nextLayers);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成失败");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(rawJson);
      if (!Array.isArray(parsed)) {
        setError("JSON 必须是数组");
        return;
      }
      const nextLayers = ensureIds(parsed as EditableLayer[]);
      setLayers(nextLayers);
      setSelectedId(nextLayers[0]?.id ?? null);
      setError("");
    } catch {
      setError("JSON 解析失败");
    }
  };

  const renderNumberField = (
    label: string,
    key: keyof EditableLayer,
    layer: EditableLayer,
  ) => {
    const value = layer[key];
    if (typeof value !== "number") return null;
    return (
      <label>
        <div className={styles.stepTitle}>{label}</div>
        <input
          className={styles.input}
          type="number"
          value={value}
          onChange={event =>
            updateLayer(layer.id, { [key]: Number(event.target.value) })
          }
        />
      </label>
    );
  };

  const renderTextField = (
    label: string,
    key: keyof EditableLayer,
    layer: EditableLayer,
  ) => {
    const value = layer[key];
    if (typeof value !== "string") return null;
    return (
      <label>
        <div className={styles.stepTitle}>{label}</div>
        <input
          className={styles.input}
          value={value}
          onChange={event =>
            updateLayer(layer.id, { [key]: event.target.value })
          }
        />
      </label>
    );
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.title}>AI 海报平台</div>
        <div className={styles.subtitle}>
          四步流程：输入描述 → 调用 Kimi → 生成图层 JSON → 手动调整元素
        </div>
      </header>
      <main className={styles.main}>
        <section className={styles.panel}>
          <div className={styles.step}>
            <div className={styles.stepTitle}>Step 1 - 需求描述</div>
            <textarea
              className={styles.textarea}
              value={prompt}
              onChange={event => setPrompt(event.target.value)}
            />
            <div className={styles.buttonRow}>
              <button
                className={styles.buttonPrimary}
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? "生成中..." : "调用 Kimi 生成"}
              </button>
            </div>
            {error ? <div className={styles.status}>{error}</div> : null}
          </div>

          <div className={styles.step}>
            <div className={styles.stepTitle}>Step 2 - AI 输出 JSON</div>
            <textarea
              className={styles.jsonBox}
              value={rawJson}
              onChange={event => setRawJson(event.target.value)}
            />
            <div className={styles.buttonRow}>
              <button
                className={styles.buttonSecondary}
                onClick={handleApplyJson}
              >
                应用 JSON
              </button>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepTitle}>Step 4 - 手动调整图层</div>
            <div className={styles.layersList}>
              {layers.map(layer => (
                <div
                  key={layer.id}
                  className={`${styles.layerItem} ${
                    selectedId === layer.id ? styles.layerItemActive : ""
                  }`}
                  onClick={() => setSelectedId(layer.id)}
                >
                  <span>{layer.type}</span>
                  <span>{layer.id}</span>
                </div>
              ))}
              {layers.length === 0 ? <div>暂无图层</div> : null}
            </div>
            {selectedLayer ? (
              <div className={styles.editorGrid}>
                {renderNumberField("X", "x", selectedLayer)}
                {renderNumberField("Y", "y", selectedLayer)}
                {renderNumberField("宽度", "width", selectedLayer)}
                {renderNumberField("高度", "height", selectedLayer)}
                {renderNumberField("半径", "radius", selectedLayer)}
                {renderNumberField("字号", "fontSize", selectedLayer)}
                {renderTextField("文本", "text", selectedLayer)}
                {renderTextField("文字颜色", "color", selectedLayer)}
                {renderTextField("填充色", "fillStyle", selectedLayer)}
                {renderTextField("图片", "image", selectedLayer)}
              </div>
            ) : null}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.step}>
            <div className={styles.stepTitle}>Step 3 - 画布预览</div>
            <div className={styles.canvasWrap}>
              <canvas
                ref={canvasRef}
                className={styles.canvas}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
              />
              <div className={styles.subtitle}>
                画布尺寸：{CANVAS_WIDTH} × {CANVAS_HEIGHT}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

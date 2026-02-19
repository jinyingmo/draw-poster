"use client";

import { useState, useRef } from "react";
import type { EditableLayer } from "../hooks/useEditorState";
import { LAYER_TYPE_LABELS } from "../utils/layerDefaults";
import styles from "./PropsPanel.module.css";

// ─── Layer List ───────────────────────────────────────────────

interface LayerListProps {
  layers: EditableLayer[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onToggleVisible: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

function LayerList({
  layers,
  selectedId,
  onSelect,
  onToggleVisible,
  onRemove,
  onReorder,
}: LayerListProps) {
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Display in reverse order (top-most layer first)
  const displayed = [...layers].reverse();

  return (
    <div className={styles.layerList}>
      {displayed.length === 0 && (
        <div className={styles.emptyHint}>暂无图层，点击左侧工具栏添加</div>
      )}
      {displayed.map((layer, dispIdx) => {
        const realIdx = layers.length - 1 - dispIdx;
        const isSelected = layer.id === selectedId;
        const isHidden = layer.visible === false;

        return (
          <div
            key={layer.id}
            className={`${styles.layerItem} ${isSelected ? styles.layerItemActive : ""} ${dragOverIndex === dispIdx ? styles.layerItemDragOver : ""}`}
            draggable
            onClick={() => onSelect(layer.id)}
            onDragStart={() => {
              dragIndexRef.current = realIdx;
            }}
            onDragOver={e => {
              e.preventDefault();
              setDragOverIndex(dispIdx);
            }}
            onDragLeave={() => setDragOverIndex(null)}
            onDrop={() => {
              setDragOverIndex(null);
              const fromReal = dragIndexRef.current;
              if (fromReal === null) return;
              const toReal = layers.length - 1 - dispIdx;
              if (fromReal !== toReal) onReorder(fromReal, toReal);
              dragIndexRef.current = null;
            }}
            onDragEnd={() => {
              setDragOverIndex(null);
              dragIndexRef.current = null;
            }}
          >
            <span className={styles.layerDragHandle}>⋮⋮</span>
            <span className={styles.layerTypeBadge}>
              {LAYER_TYPE_LABELS[layer.type] ?? layer.type}
            </span>
            <span className={styles.layerId} title={layer.id}>
              {layer.id}
            </span>
            <button
              className={styles.layerIconBtn}
              title={isHidden ? "显示图层" : "隐藏图层"}
              onClick={e => {
                e.stopPropagation();
                onToggleVisible(layer.id);
              }}
            >
              {isHidden ? "🙈" : "👁"}
            </button>
            <button
              className={styles.layerIconBtn}
              title="删除图层"
              onClick={e => {
                e.stopPropagation();
                onRemove(layer.id);
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Field helpers ────────────────────────────────────────────

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

function NumInput({
  value,
  onChange,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <input
      className={styles.input}
      type="number"
      value={value}
      step={step}
      onChange={e => onChange(Number(e.target.value))}
    />
  );
}

function StrInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      className={styles.input}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
}

function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={styles.colorRow}>
      <input
        className={styles.colorSwatch}
        type="color"
        value={typeof value === "string" && value.startsWith("#") ? value : "#000000"}
        onChange={e => onChange(e.target.value)}
      />
      <input
        className={styles.input}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

// ─── Layer Editor ─────────────────────────────────────────────

interface LayerEditorProps {
  layer: EditableLayer;
  onUpdate: (patch: Record<string, unknown>) => void;
}

function LayerEditor({ layer, onUpdate }: LayerEditorProps) {
  const l = layer as unknown as Record<string, unknown>;

  const num = (key: string, label: string, step?: number) => {
    const v = l[key];
    if (typeof v !== "number") return null;
    return (
      <Field key={key} label={label}>
        <NumInput value={v} onChange={val => onUpdate({ [key]: val })} step={step} />
      </Field>
    );
  };

  const str = (key: string, label: string) => {
    const v = l[key];
    if (typeof v !== "string") return null;
    return (
      <Field key={key} label={label}>
        <StrInput value={v} onChange={val => onUpdate({ [key]: val })} />
      </Field>
    );
  };

  const color = (key: string, label: string) => {
    const v = l[key] ?? "";
    if (typeof v !== "string") return null;
    return (
      <Field key={key} label={label}>
        <ColorInput value={v} onChange={val => onUpdate({ [key]: val })} />
      </Field>
    );
  };

  const textarea = (key: string, label: string) => {
    const v = l[key] ?? "";
    return (
      <Field key={key} label={label}>
        <textarea
          className={styles.textarea}
          value={String(v)}
          onChange={e => onUpdate({ [key]: e.target.value })}
          rows={3}
        />
      </Field>
    );
  };

  const checkbox = (key: string, label: string) => {
    const v = l[key];
    return (
      <label key={key} className={styles.checkField}>
        <input
          type="checkbox"
          checked={v !== false}
          onChange={e => onUpdate({ [key]: e.target.checked })}
        />
        <span>{label}</span>
      </label>
    );
  };

  const select = (
    key: string,
    label: string,
    options: { value: string; label: string }[],
  ) => {
    const v = l[key] ?? options[0]?.value;
    return (
      <Field key={key} label={label}>
        <select
          className={styles.select}
          value={String(v)}
          onChange={e => onUpdate({ [key]: e.target.value })}
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
    );
  };

  const type = layer.type;

  return (
    <div className={styles.layerEditor}>
      {/* Common */}
      <div className={styles.editorSection}>
        <div className={styles.sectionTitle}>图层信息</div>
        <Field label="ID">
          <span className={styles.readonlyValue}>{layer.id}</span>
        </Field>
        <div className={styles.checkRow}>
          {checkbox("visible", "可见")}
          {checkbox("locked", "锁定")}
        </div>
        {num("zIndex", "层级")}
      </div>

      {/* Position & Size */}
      <div className={styles.editorSection}>
        <div className={styles.sectionTitle}>位置与尺寸</div>
        <div className={styles.fieldGrid}>
          {type === "line" ? (
            <>
              {num("x1", "X1")}
              {num("y1", "Y1")}
              {num("x2", "X2")}
              {num("y2", "Y2")}
            </>
          ) : type === "circle" ? (
            <>
              {num("x", "圆心 X")}
              {num("y", "圆心 Y")}
              {num("radius", "半径")}
            </>
          ) : type === "polygon" ? (
            <Field label="顶点 JSON">
              <textarea
                className={styles.textarea}
                value={JSON.stringify(l["points"] ?? [], null, 2)}
                rows={4}
                onChange={e => {
                  try {
                    const pts = JSON.parse(e.target.value);
                    onUpdate({ points: pts });
                  } catch {}
                }}
              />
            </Field>
          ) : (
            <>
              {num("x", "X")}
              {num("y", "Y")}
              {num("width", "宽度")}
              {num("height", "高度")}
              {typeof l["radius"] === "number" ? num("radius", "圆角") : null}
            </>
          )}
        </div>
      </div>

      {/* Type-specific */}
      {type === "text" && (
        <div className={styles.editorSection}>
          <div className={styles.sectionTitle}>文本</div>
          {textarea("text", "内容")}
          <div className={styles.fieldGrid}>
            {num("fontSize", "字号")}
            {num("lineHeight", "行高")}
            {num("maxWidth", "最大宽度")}
            {num("maxLines", "最大行数")}
          </div>
          {str("fontFamily", "字体")}
          {select("fontWeight", "粗细", [
            { value: "normal", label: "正常" },
            { value: "bold", label: "粗体" },
            { value: "300", label: "细体" },
          ])}
          {select("textAlign", "对齐", [
            { value: "left", label: "左对齐" },
            { value: "center", label: "居中" },
            { value: "right", label: "右对齐" },
          ])}
        </div>
      )}

      {type === "image" && (
        <div className={styles.editorSection}>
          <div className={styles.sectionTitle}>图片</div>
          <Field label="图片 URL">
            <textarea
              className={styles.textarea}
              value={String(l["image"] ?? "")}
              rows={2}
              onChange={e => onUpdate({ image: e.target.value })}
            />
          </Field>
          {select("objectFit", "填充方式", [
            { value: "fill", label: "拉伸" },
            { value: "cover", label: "覆盖" },
            { value: "contain", label: "适应" },
          ])}
        </div>
      )}

      {type === "qrcode" && (
        <div className={styles.editorSection}>
          <div className={styles.sectionTitle}>二维码</div>
          {textarea("text", "内容 URL")}
          {num("margin", "边距")}
          {select("errorCorrectionLevel", "容错级别", [
            { value: "L", label: "L (7%)" },
            { value: "M", label: "M (15%)" },
            { value: "Q", label: "Q (25%)" },
            { value: "H", label: "H (30%)" },
          ])}
        </div>
      )}

      {/* Style */}
      {["rect", "circle", "text", "line", "polygon"].includes(type) && (
        <div className={styles.editorSection}>
          <div className={styles.sectionTitle}>样式</div>
          {type === "text"
            ? color("color", "文字颜色")
            : color("fillStyle", "填充色")}
          {color("strokeStyle", "描边色")}
          {typeof l["lineWidth"] === "number" || type === "line"
            ? num("lineWidth", "线宽")
            : null}
          <Field label="透明度">
            <input
              className={styles.input}
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={typeof l["globalAlpha"] === "number" ? l["globalAlpha"] : 1}
              onChange={e => onUpdate({ globalAlpha: Number(e.target.value) })}
              style={{ padding: 0 }}
            />
          </Field>
          {num("shadowBlur", "阴影模糊")}
          {color("shadowColor", "阴影颜色")}
        </div>
      )}
    </div>
  );
}

// ─── AI Generate Section ──────────────────────────────────────

const CANVAS_W = 375;
const CANVAS_H = 667;

const extractJsonArray = (text: string) => {
  if (!text) return null;
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const ensureIds = (layers: EditableLayer[]): EditableLayer[] =>
  layers.map((layer, i) => ({
    ...layer,
    id:
      typeof layer.id === "string" && layer.id.length > 0
        ? layer.id
        : `layer-${i + 1}`,
  }));

interface AIGenerateProps {
  onSetLayers: (layers: EditableLayer[]) => void;
}

function AIGenerate({ onSetLayers }: AIGenerateProps) {
  const [prompt, setPrompt] = useState(
    "请生成一张 375x667 的生日海报，包含温暖背景、主标题、日期与一张蛋糕图片",
  );
  const [rawJson, setRawJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/kimi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, canvasWidth: CANVAS_W, canvasHeight: CANVAS_H }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "生成失败");
      const content = String(data?.content ?? "");
      const parsed = extractJsonArray(content);
      if (!parsed) throw new Error("未识别到可用的 JSON 图层数组");
      const nextLayers = ensureIds(parsed as EditableLayer[]);
      setRawJson(JSON.stringify(nextLayers, null, 2));
      onSetLayers(nextLayers);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成失败");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    try {
      const parsed = JSON.parse(rawJson);
      if (!Array.isArray(parsed)) {
        setError("JSON 必须是数组");
        return;
      }
      const nextLayers = ensureIds(parsed as EditableLayer[]);
      onSetLayers(nextLayers);
      setError("");
    } catch {
      setError("JSON 解析失败");
    }
  };

  return (
    <div className={styles.aiSection}>
      <details>
        <summary className={styles.aiSummary}>✨ AI 生成海报</summary>
        <div className={styles.aiBody}>
          <Field label="需求描述">
            <textarea
              className={styles.textarea}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={3}
            />
          </Field>
          <button
            className={styles.btnPrimary}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "生成中..." : "调用 Kimi 生成"}
          </button>
          {error && <div className={styles.errorMsg}>{error}</div>}

          {rawJson && (
            <>
              <Field label="AI 输出 JSON">
                <textarea
                  className={styles.jsonBox}
                  value={rawJson}
                  rows={8}
                  onChange={e => setRawJson(e.target.value)}
                />
              </Field>
              <button className={styles.btnSecondary} onClick={handleApply}>
                应用到画布
              </button>
            </>
          )}
        </div>
      </details>
    </div>
  );
}

// ─── PropsPanel (root) ────────────────────────────────────────

interface PropsPanelProps {
  layers: EditableLayer[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateLayer: (id: string, patch: Record<string, unknown>) => void;
  onRemoveLayer: (id: string) => void;
  onReorderLayers: (fromIndex: number, toIndex: number) => void;
  onSetLayers: (layers: EditableLayer[]) => void;
}

export default function PropsPanel({
  layers,
  selectedId,
  onSelect,
  onUpdateLayer,
  onRemoveLayer,
  onReorderLayers,
  onSetLayers,
}: PropsPanelProps) {
  const selectedLayer = layers.find(l => l.id === selectedId) ?? null;

  const handleToggleVisible = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (!layer) return;
    onUpdateLayer(id, { visible: layer.visible === false ? true : false });
  };

  return (
    <aside className={styles.panel}>
      {/* Layer List */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>图层列表</div>
        <LayerList
          layers={layers}
          selectedId={selectedId}
          onSelect={onSelect}
          onToggleVisible={handleToggleVisible}
          onRemove={onRemoveLayer}
          onReorder={onReorderLayers}
        />
      </div>

      {/* Properties */}
      {selectedLayer && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            属性编辑 —{" "}
            {LAYER_TYPE_LABELS[selectedLayer.type] ?? selectedLayer.type}
          </div>
          <LayerEditor
            layer={selectedLayer}
            onUpdate={patch => onUpdateLayer(selectedLayer.id, patch)}
          />
        </div>
      )}

      {/* AI Generate */}
      <AIGenerate onSetLayers={onSetLayers} />
    </aside>
  );
}

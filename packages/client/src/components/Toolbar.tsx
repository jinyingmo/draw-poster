"use client";

import { useRef } from "react";
import styles from "./Toolbar.module.css";

const ELEMENT_TOOLS = [
  { type: "rect", icon: "▭", label: "矩形" },
  { type: "circle", icon: "◯", label: "圆形" },
  { type: "text", icon: "T", label: "文本" },
  { type: "image", icon: "🖼", label: "图片" },
  { type: "qrcode", icon: "⊞", label: "二维码" },
  { type: "line", icon: "╱", label: "线条" },
  { type: "polygon", icon: "⬡", label: "多边形" },
];

interface ToolbarProps {
  onAddElement: (type: string, overrides?: Record<string, unknown>) => void;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
}

export default function Toolbar({
  onAddElement,
  onUndo,
  onRedo,
  onDelete,
  onExport,
  canUndo,
  canRedo,
  hasSelection,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const src = evt.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // limit initial size if too big
        let w = img.width;
        let h = img.height;
        if (w > 300) {
          const r = 300 / w;
          w = 300;
          h = h * r;
        }
        onAddElement("image", {
          image: src,
          width: w,
          height: h,
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <aside className={styles.toolbar}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleUpload}
      />
      <div className={styles.toolGroup}>
        {ELEMENT_TOOLS.map(tool => (
          <button
            key={tool.type}
            className={styles.toolBtn}
            title={tool.label}
            onClick={() => {
              if (tool.type === "image") {
                fileInputRef.current?.click();
              } else {
                onAddElement(tool.type);
              }
            }}
          >
            <span className={styles.toolIcon}>{tool.icon}</span>
            <span className={styles.toolLabel}>{tool.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.divider} />

      <div className={styles.toolGroup}>
        <button
          className={styles.toolBtn}
          title="撤销 (Ctrl+Z)"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <span className={styles.toolIcon}>↩</span>
          <span className={styles.toolLabel}>撤销</span>
        </button>
        <button
          className={styles.toolBtn}
          title="重做 (Ctrl+Shift+Z)"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <span className={styles.toolIcon}>↪</span>
          <span className={styles.toolLabel}>重做</span>
        </button>
        <button
          className={styles.toolBtn}
          title="删除选中 (Delete)"
          onClick={onDelete}
          disabled={!hasSelection}
        >
          <span className={styles.toolIcon}>🗑</span>
          <span className={styles.toolLabel}>删除</span>
        </button>
        <button className={styles.toolBtn} title="导出图片" onClick={onExport}>
          <span className={styles.toolIcon}>⬇</span>
          <span className={styles.toolLabel}>导出</span>
        </button>
      </div>
    </aside>
  );
}

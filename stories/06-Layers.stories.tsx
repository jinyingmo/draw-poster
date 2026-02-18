import React, { useEffect, useRef, useState } from "react";
import { createDrawPoster } from "../packages/core/src";

const Section = ({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) => (
  <div style={{ marginBottom: 40 }}>
    <div
      style={{
        fontFamily: "sans-serif",
        fontSize: 13,
        fontWeight: 600,
        color: "#555",
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: 1,
      }}
    >
      {title}
    </div>
    {desc && (
      <div style={{ fontFamily: "sans-serif", fontSize: 12, color: "#888", marginBottom: 8 }}>
        {desc}
      </div>
    )}
    {children}
  </div>
);

const W = 460;

// ── 图层添加 & zIndex 排序 ─────────────────────────────────────────────────
const ZIndexDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 故意乱序添加图层，依靠 zIndex 正确渲染
    p.addLayer({
      type: "rect",
      id: "blue",
      zIndex: 1,
      x: 30,
      y: 30,
      width: 140,
      height: 100,
      fillStyle: "#3498db",
      radius: 8,
    });

    p.addLayer({
      type: "rect",
      id: "red",
      zIndex: 3, // 最上层
      x: 100,
      y: 80,
      width: 140,
      height: 100,
      fillStyle: "#e74c3c",
      radius: 8,
    });

    p.addLayer({
      type: "rect",
      id: "green",
      zIndex: 2,
      x: 60,
      y: 55,
      width: 140,
      height: 100,
      fillStyle: "#27ae60",
      radius: 8,
    });

    // 文字标注
    p.addLayer({
      type: "text",
      id: "label-blue",
      zIndex: 4,
      text: "zIndex:1",
      x: 80,
      y: 72,
      fontSize: 12,
      color: "#fff",
      textAlign: "center",
      textBaseline: "middle",
    });
    p.addLayer({
      type: "text",
      id: "label-green",
      zIndex: 4,
      text: "zIndex:2",
      x: 155,
      y: 97,
      fontSize: 12,
      color: "#fff",
      textAlign: "center",
      textBaseline: "middle",
    });
    p.addLayer({
      type: "text",
      id: "label-red",
      zIndex: 5,
      text: "zIndex:3",
      x: 180,
      y: 125,
      fontSize: 12,
      color: "#fff",
      textAlign: "center",
      textBaseline: "middle",
    });

    p.render();
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={210}
      style={{ border: "1px solid #eee", background: "#f8f9fa" }}
    />
  );
};

// ── 图层显隐控制 visible ───────────────────────────────────────────────────
const VisibilityDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [hidden, setHidden] = useState<string[]>([]);

  const renderLayers = (hiddenIds: string[]) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    const layers: Array<{
      id: string;
      label: string;
      color: string;
      x: number;
      y: number;
    }> = [
      { id: "layer-a", label: "图层 A", color: "#e74c3c", x: 20, y: 20 },
      { id: "layer-b", label: "图层 B", color: "#3498db", x: 140, y: 20 },
      { id: "layer-c", label: "图层 C", color: "#27ae60", x: 260, y: 20 },
      { id: "layer-d", label: "图层 D", color: "#f39c12", x: 380, y: 20 },
    ];

    layers.forEach(({ id, label, color, x, y }) => {
      const isVisible = !hiddenIds.includes(id);
      p.addLayer({
        type: "rect",
        id,
        x,
        y,
        width: 100,
        height: 80,
        fillStyle: color,
        visible: isVisible,
        radius: 8,
      });
      p.addLayer({
        type: "text",
        id: id + "-label",
        text: label,
        x: x + 50,
        y: y + 40,
        fontSize: 13,
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
        textBaseline: "middle",
        visible: isVisible,
      });
    });

    p.render();
  };

  useEffect(() => {
    renderLayers(hidden);
  }, [hidden]);

  const toggleLayer = (id: string) => {
    setHidden((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const layerButtons = [
    { id: "layer-a", label: "图层 A" },
    { id: "layer-b", label: "图层 B" },
    { id: "layer-c", label: "图层 C" },
    { id: "layer-d", label: "图层 D" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {layerButtons.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => toggleLayer(id)}
            style={{
              padding: "4px 12px",
              fontSize: 12,
              cursor: "pointer",
              background: hidden.includes(id) ? "#bdc3c7" : "#2c3e50",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              fontFamily: "sans-serif",
            }}
          >
            {hidden.includes(id) ? "👁‍🗨 显示" : "🙈 隐藏"} {label}
          </button>
        ))}
      </div>
      <canvas
        ref={ref}
        width={W}
        height={120}
        style={{ border: "1px solid #eee", background: "#f8f9fa" }}
      />
      <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#999", marginTop: 4 }}>
        点击按钮切换图层显隐（visible: true/false）
      </div>
    </div>
  );
};

// ── 图层添加 & 删除 ────────────────────────────────────────────────────────
const LayerManageDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const counterRef = useRef(0);
  const posRef = useRef(0);
  const [layerList, setLayerList] = useState<Array<{ id: string; color: string }>>([]);

  const colors = ["#e74c3c", "#3498db", "#27ae60", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22"];

  const pRef = useRef<ReturnType<typeof createDrawPoster> | null>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    pRef.current = createDrawPoster(ctx, { ratio: 1 });
  }, []);

  const addLayer = () => {
    const p = pRef.current!;
    const id = `layer-${++counterRef.current}`;
    const color = colors[counterRef.current % colors.length];
    const x = (posRef.current % 4) * 100 + 20;
    const y = Math.floor(posRef.current / 4) * 90 + 10;
    posRef.current++;

    p.addLayer({
      type: "rect",
      id,
      x,
      y,
      width: 80,
      height: 70,
      fillStyle: color,
      radius: 8,
    });
    p.addLayer({
      type: "text",
      id: id + "-t",
      text: `#${counterRef.current}`,
      x: x + 40,
      y: y + 35,
      fontSize: 16,
      fontWeight: "bold",
      color: "#fff",
      textAlign: "center",
      textBaseline: "middle",
    });

    setLayerList((prev) => [...prev, { id, color }]);
    p.render();
  };

  const removeLayer = (id: string) => {
    const p = pRef.current!;
    p.removeLayer(id);
    p.removeLayer(id + "-t");
    setLayerList((prev) => prev.filter((l) => l.id !== id));
    p.render();
  };

  return (
    <div>
      <div style={{ marginBottom: 8, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button
          onClick={addLayer}
          style={{
            padding: "4px 16px",
            fontSize: 12,
            cursor: "pointer",
            background: "#27ae60",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            fontFamily: "sans-serif",
          }}
        >
          + 添加图层
        </button>
        {layerList.map(({ id, color }) => (
          <button
            key={id}
            onClick={() => removeLayer(id)}
            style={{
              padding: "4px 10px",
              fontSize: 11,
              cursor: "pointer",
              background: color,
              color: "#fff",
              border: "none",
              borderRadius: 4,
              fontFamily: "sans-serif",
            }}
          >
            × {id}
          </button>
        ))}
      </div>
      <canvas
        ref={ref}
        width={W}
        height={200}
        style={{ border: "1px solid #eee", background: "#f8f9fa" }}
      />
      <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#999", marginTop: 4 }}>
        点击 + 添加图层，点击色块删除对应图层（addLayer / removeLayer）
      </div>
    </div>
  );
};

// ── 蒙版系统 mask ────────────────────────────────────────────────────────────
const MaskDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 圆形蒙版裁剪矩形
    p.addLayer({
      type: "rect",
      id: "masked-rect",
      x: 20,
      y: 20,
      width: 160,
      height: 160,
      fillStyle: {
        type: "linear",
        x0: 20,
        y0: 20,
        x1: 180,
        y1: 180,
        stops: [
          { offset: 0, color: "#f093fb" },
          { offset: 1, color: "#f5576c" },
        ],
      },
      mask: {
        type: "circle",
        x: 100,
        y: 100,
        radius: 70,
      },
    });
    p.drawText({
      text: "圆形蒙版",
      x: 100,
      y: 188,
      fontSize: 12,
      color: "#555",
      textAlign: "center",
      textBaseline: "top",
    });

    // 矩形蒙版裁剪文本背景
    p.addLayer({
      type: "rect",
      id: "masked-text-bg",
      x: 220,
      y: 20,
      width: 200,
      height: 100,
      fillStyle: "#4facfe",
      mask: {
        type: "rect",
        x: 230,
        y: 30,
        width: 180,
        height: 80,
        radius: 16,
      },
    });
    p.addLayer({
      type: "text",
      id: "text-in-mask",
      text: "矩形圆角蒙版",
      x: 320,
      y: 70,
      fontSize: 16,
      color: "#fff",
      fontWeight: "bold",
      textAlign: "center",
      textBaseline: "middle",
    });
    p.drawText({
      text: "圆角矩形蒙版",
      x: 320,
      y: 128,
      fontSize: 12,
      color: "#555",
      textAlign: "center",
      textBaseline: "top",
    });

    // 多边形蒙版
    p.addLayer({
      type: "rect",
      id: "hex-bg",
      x: 220,
      y: 150,
      width: 200,
      height: 120,
      fillStyle: "#43e97b",
      mask: {
        type: "polygon",
        points: [
          [300, 155],
          [360, 175],
          [380, 230],
          [350, 275],
          [250, 275],
          [220, 230],
          [240, 175],
        ],
      },
    });
    p.drawText({
      text: "多边形蒙版",
      x: 305,
      y: 280,
      fontSize: 12,
      color: "#555",
      textAlign: "center",
      textBaseline: "top",
    });

    p.render();
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={310}
      style={{ border: "1px solid #eee", background: "#fff" }}
    />
  );
};

// ── Story ─────────────────────────────────────────────────────────────────────
const LayersDemo = () => (
  <div
    style={{
      padding: 32,
      fontFamily: "sans-serif",
      background: "#fafafa",
      minHeight: "100vh",
    }}
  >
    <h2 style={{ margin: "0 0 24px", color: "#222" }}>图层系统 Layer System</h2>

    <Section
      title="zIndex 排序"
      desc="图层按 zIndex 升序渲染，数值大的在上方（添加顺序与渲染顺序无关）"
    >
      <ZIndexDemo />
    </Section>

    <Section
      title="图层显隐 visible"
      desc="通过 visible: false 隐藏图层，不影响其他图层渲染"
    >
      <VisibilityDemo />
    </Section>

    <Section
      title="图层管理 addLayer / removeLayer"
      desc="动态添加或删除图层，每次调用 render() 重新绘制"
    >
      <LayerManageDemo />
    </Section>

    <Section
      title="蒙版系统 mask — 圆形 / 圆角矩形 / 多边形裁剪"
      desc="任意图层均可设置 mask 属性，以另一图层形状作为裁剪区域"
    >
      <MaskDemo />
    </Section>
  </div>
);

export default {
  title: "Core/06-Layers",
  component: LayersDemo,
};

export const Default = () => <LayersDemo />;

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
const H_ALIGN = 160;

// ── 对齐演示 ────────────────────────────────────────────────────────────────
const AlignDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [alignType, setAlignType] = useState<
    "left" | "center" | "right" | "top" | "middle" | "bottom"
  >("left");

  const renderAlign = (type: typeof alignType) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 初始位置（随机散布的方块）
    const blocks = [
      { id: "a1", x: 20, y: 30, w: 60, h: 40, color: "#e74c3c" },
      { id: "a2", x: 100, y: 60, w: 80, h: 30, color: "#3498db" },
      { id: "a3", x: 200, y: 20, w: 50, h: 60, color: "#27ae60" },
      { id: "a4", x: 290, y: 70, w: 70, h: 40, color: "#f39c12" },
      { id: "a5", x: 380, y: 40, w: 55, h: 50, color: "#9b59b6" },
    ];

    blocks.forEach(({ id, x, y, w, h, color }) => {
      p.addLayer({
        type: "rect",
        id,
        x,
        y,
        width: w,
        height: h,
        fillStyle: color,
        radius: 6,
      });
    });

    p.align(type);
    p.render();
  };

  useEffect(() => {
    renderAlign(alignType);
  }, [alignType]);

  const buttons: Array<{ type: typeof alignType; label: string }> = [
    { type: "left", label: "left 左对齐" },
    { type: "center", label: "center 水平居中" },
    { type: "right", label: "right 右对齐" },
    { type: "top", label: "top 上对齐" },
    { type: "middle", label: "middle 垂直居中" },
    { type: "bottom", label: "bottom 下对齐" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {buttons.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => setAlignType(type)}
            style={{
              padding: "4px 12px",
              fontSize: 12,
              cursor: "pointer",
              background: alignType === type ? "#2c3e50" : "#ecf0f1",
              color: alignType === type ? "#fff" : "#333",
              border: "none",
              borderRadius: 4,
              fontFamily: "sans-serif",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <canvas
        ref={ref}
        width={W}
        height={H_ALIGN}
        style={{ border: "1px solid #eee", background: "#f8f9fa" }}
      />
      <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#999", marginTop: 4 }}>
        align(type) — 多图层之间互相对齐（基于包围盒）
      </div>
    </div>
  );
};

// ── 分布演示 ────────────────────────────────────────────────────────────────
const DistributeDemo = () => {
  const refH = useRef<HTMLCanvasElement>(null);
  const refV = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // 水平分布
    (() => {
      const ctx = refH.current!.getContext("2d")!;
      const p = createDrawPoster(ctx, { ratio: 1 });

      // 故意不均匀排列
      const items = [
        { id: "d1", x: 10, y: 30, color: "#e74c3c" },
        { id: "d2", x: 80, y: 40, color: "#3498db" },
        { id: "d3", x: 120, y: 20, color: "#27ae60" },
        { id: "d4", x: 280, y: 50, color: "#f39c12" },
        { id: "d5", x: 380, y: 30, color: "#9b59b6" },
      ];

      items.forEach(({ id, x, y, color }) => {
        p.addLayer({
          type: "rect",
          id,
          x,
          y,
          width: 60,
          height: 60,
          fillStyle: color,
          radius: 6,
        });
      });

      // 先顶对齐，再水平分布
      p.align("top");
      p.distribute("horizontal");
      p.render();

      // 标注
      p.drawText({
        text: "水平分布后（间距均等）",
        x: W / 2,
        y: 104,
        fontSize: 11,
        color: "#666",
        textAlign: "center",
        textBaseline: "top",
      });
    })();

    // 垂直分布
    (() => {
      const ctx = refV.current!.getContext("2d")!;
      const p = createDrawPoster(ctx, { ratio: 1 });

      const items = [
        { id: "v1", x: 30, y: 5, color: "#e74c3c" },
        { id: "v2", x: 130, y: 30, color: "#3498db" },
        { id: "v3", x: 230, y: 60, color: "#27ae60" },
        { id: "v4", x: 330, y: 180, color: "#f39c12" },
        { id: "v5", x: 60, y: 220, color: "#9b59b6" },
      ];

      items.forEach(({ id, x, y, color }) => {
        p.addLayer({
          type: "rect",
          id,
          x,
          y,
          width: 60,
          height: 50,
          fillStyle: color,
          radius: 6,
        });
      });

      // 先左对齐，再垂直分布
      p.align("left");
      p.distribute("vertical");
      p.render();

      p.drawText({
        text: "垂直分布后（间距均等）",
        x: 190,
        y: 284,
        fontSize: 11,
        color: "#666",
        textAlign: "center",
        textBaseline: "top",
      });
    })();
  }, []);

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <div>
        <canvas
          ref={refH}
          width={W}
          height={125}
          style={{ border: "1px solid #eee", background: "#f8f9fa", display: "block" }}
        />
      </div>
      <div>
        <canvas
          ref={refV}
          width={W}
          height={305}
          style={{ border: "1px solid #eee", background: "#f8f9fa", display: "block" }}
        />
      </div>
    </div>
  );
};

// ── 单图层相对画布对齐 ────────────────────────────────────────────────────
const SingleLayerAlignDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [alignType, setAlignType] = useState<
    "left" | "center" | "right" | "top" | "middle" | "bottom"
  >("center");

  const render = (type: typeof alignType) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    p.addLayer({
      type: "rect",
      id: "box",
      x: 50,
      y: 50,
      width: 100,
      height: 60,
      fillStyle: "#6c5ce7",
      radius: 10,
    });
    p.addLayer({
      type: "text",
      id: "box-label",
      text: type,
      x: 0,
      y: 0,
      fontSize: 13,
      color: "#fff",
      fontWeight: "bold",
      textAlign: "center",
      textBaseline: "middle",
    });

    p.align(type, ["box"]);

    // 重新定位文字到矩形中心（仅演示用）
    const layers = p.getLayers();
    const box = layers.find((l) => l.id === "box") as any;
    if (box) {
      const textLayer = layers.find((l) => l.id === "box-label") as any;
      if (textLayer) {
        textLayer.x = box.x + box.width / 2;
        textLayer.y = box.y + box.height / 2;
      }
    }

    p.render();
  };

  useEffect(() => {
    render(alignType);
  }, [alignType]);

  const buttons: Array<{ type: typeof alignType; label: string }> = [
    { type: "left", label: "left" },
    { type: "center", label: "center" },
    { type: "right", label: "right" },
    { type: "top", label: "top" },
    { type: "middle", label: "middle" },
    { type: "bottom", label: "bottom" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {buttons.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => setAlignType(type)}
            style={{
              padding: "4px 12px",
              fontSize: 12,
              cursor: "pointer",
              background: alignType === type ? "#6c5ce7" : "#ecf0f1",
              color: alignType === type ? "#fff" : "#333",
              border: "none",
              borderRadius: 4,
              fontFamily: "sans-serif",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <canvas
        ref={ref}
        width={W}
        height={180}
        style={{ border: "2px dashed #ccc", background: "#f8f9fa" }}
      />
      <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#999", marginTop: 4 }}>
        单个图层时，相对画布边界对齐
      </div>
    </div>
  );
};

// ── Story ─────────────────────────────────────────────────────────────────────
const LayoutDemo = () => (
  <div
    style={{
      padding: 32,
      fontFamily: "sans-serif",
      background: "#fafafa",
      minHeight: "100vh",
    }}
  >
    <h2 style={{ margin: "0 0 24px", color: "#222" }}>自动布局 Layout</h2>

    <Section
      title="多图层对齐 align()"
      desc="支持 left / center / right / top / middle / bottom 六种对齐方式"
    >
      <AlignDemo />
    </Section>

    <Section
      title="单图层相对画布对齐"
      desc="只有一个图层时，align() 会相对画布边界对齐"
    >
      <SingleLayerAlignDemo />
    </Section>

    <Section
      title="图层分布 distribute()"
      desc="将 3 个以上图层均匀分布（水平或垂直间距相等）"
    >
      <DistributeDemo />
    </Section>
  </div>
);

export default {
  title: "Core/07-Layout",
  component: LayoutDemo,
};

export const Default = () => <LayoutDemo />;

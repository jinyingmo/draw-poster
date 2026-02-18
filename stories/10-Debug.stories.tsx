import React, { useEffect, useRef } from "react";
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
      <div
        style={{
          fontFamily: "sans-serif",
          fontSize: 12,
          color: "#888",
          marginBottom: 8,
        }}
      >
        {desc}
      </div>
    )}
    {children}
  </div>
);

const W = 460;

// ── 图层边界框 debug: true ────────────────────────────────────────────────
const BoundsDebugDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, {
      ratio: 1,
      debug: true, // 开启 debug 模式，自动绘制图层边界框（红色框）
    });

    p.addLayer({
      type: "rect",
      id: "r1",
      x: 20,
      y: 20,
      width: 120,
      height: 80,
      fillStyle: "#3498db",
      radius: 8,
    });

    p.addLayer({
      type: "circle",
      id: "c1",
      x: 220,
      y: 70,
      radius: 50,
      fillStyle: "#e74c3c",
    });

    p.addLayer({
      type: "text",
      id: "t1",
      text: "文本图层边界框",
      x: 340,
      y: 50,
      fontSize: 16,
      color: "#27ae60",
    });

    p.addLayer({
      type: "polygon",
      id: "p1",
      points: [
        [30, 140],
        [80, 110],
        [130, 140],
        [110, 175],
        [50, 175],
      ],
      fillStyle: "#f39c12",
    });

    p.render();
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={200}
      style={{ border: "1px solid #eee", background: "#fff" }}
    />
  );
};

// ── 网格辅助线 grid ──────────────────────────────────────────────────────
const GridDebugDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, {
      ratio: 1,
      debug: {
        bounds: false, // 关闭边界框
        grid: {
          size: 20,
          color: "rgba(0, 120, 255, 0.2)",
          lineWidth: 1,
        },
      },
    });

    // 内容图层
    p.addLayer({
      type: "rect",
      id: "card",
      x: 40,
      y: 30,
      width: 180,
      height: 120,
      fillStyle: "rgba(52, 152, 219, 0.3)",
      strokeStyle: "#3498db",
      lineWidth: 2,
      radius: 8,
    });
    p.addLayer({
      type: "circle",
      id: "dot",
      x: 300,
      y: 80,
      radius: 40,
      fillStyle: "rgba(231, 76, 60, 0.3)",
      strokeStyle: "#e74c3c",
      lineWidth: 2,
    });
    p.addLayer({
      type: "text",
      id: "label",
      text: "20px 网格辅助线",
      x: W / 2,
      y: 170,
      fontSize: 13,
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
      height={200}
      style={{ border: "1px solid #eee", background: "#fff" }}
    />
  );
};

// ── 自定义网格 ────────────────────────────────────────────────────────────
const CustomGridDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, {
      ratio: 1,
      debug: {
        bounds: false,
        grid: {
          size: 50, // 大间距
          color: "rgba(255, 100, 0, 0.15)",
          lineWidth: 2,
        },
      },
    });

    p.addLayer({
      type: "rect",
      id: "bg",
      x: 0,
      y: 0,
      width: W,
      height: 200,
      fillStyle: "#1a1a2e",
    });
    p.addLayer({
      type: "text",
      id: "label",
      text: "50px 网格，自定义颜色和线宽",
      x: W / 2,
      y: 100,
      fontSize: 14,
      color: "rgba(255,255,255,0.6)",
      textAlign: "center",
      textBaseline: "middle",
    });

    p.render();
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={200}
      style={{ border: "1px solid #eee" }}
    />
  );
};

// ── 基准线 guides ────────────────────────────────────────────────────────
const GuidesDebugDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, {
      ratio: 1,
      debug: {
        bounds: false,
        guides: [
          // 水平基准线
          {
            direction: "horizontal",
            position: 50,
            color: "rgba(255, 0, 128, 0.8)",
            lineWidth: 1,
            lineDash: [4, 4],
          },
          {
            direction: "horizontal",
            position: 120,
            color: "rgba(0, 128, 255, 0.8)",
            lineWidth: 1,
          },
          {
            direction: "horizontal",
            position: 190,
            color: "rgba(255, 150, 0, 0.8)",
            lineWidth: 2,
            lineDash: [8, 4],
          },
          // 垂直基准线
          {
            direction: "vertical",
            position: 120,
            color: "rgba(0, 200, 100, 0.8)",
            lineWidth: 1,
            lineDash: [4, 4],
          },
          {
            direction: "vertical",
            position: 230,
            color: "rgba(200, 0, 200, 0.8)",
            lineWidth: 1,
          },
          {
            direction: "vertical",
            position: 350,
            color: "rgba(100, 100, 255, 0.8)",
            lineWidth: 2,
            lineDash: [6, 3],
          },
        ],
      },
    });

    // 内容图层
    p.addLayer({
      type: "rect",
      id: "r1",
      x: 120,
      y: 50,
      width: 110,
      height: 70,
      fillStyle: "rgba(52, 152, 219, 0.4)",
      strokeStyle: "#3498db",
      lineWidth: 2,
    });

    p.addLayer({
      type: "text",
      id: "label",
      text: "水平 & 垂直基准线（自定义颜色/样式）",
      x: W / 2,
      y: 200,
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
      height={220}
      style={{ border: "1px solid #eee", background: "#fff" }}
    />
  );
};

// ── 综合调试（边界框 + 网格 + 基准线） ─────────────────────────────────────
const FullDebugDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, {
      ratio: 1,
      debug: {
        bounds: true, // 边界框
        grid: { size: 30, color: "rgba(0, 120, 255, 0.1)" }, // 网格
        guides: [
          { direction: "horizontal", position: 120, color: "rgba(255, 0, 128, 0.6)" },
          { direction: "vertical", position: W / 2, color: "rgba(0, 180, 80, 0.6)" },
        ],
      },
    });

    p.addLayer({
      type: "rect",
      id: "main-card",
      x: 60,
      y: 40,
      width: 200,
      height: 80,
      fillStyle: "#ecf0f1",
      strokeStyle: "#bdc3c7",
      lineWidth: 1,
      radius: 8,
    });
    p.addLayer({
      type: "circle",
      id: "accent",
      x: 320,
      y: 80,
      radius: 50,
      fillStyle: "#ffeaa7",
    });
    p.addLayer({
      type: "text",
      id: "title",
      text: "边界框 + 网格 + 基准线",
      x: 160,
      y: 80,
      fontSize: 14,
      color: "#2c3e50",
      textAlign: "center",
      textBaseline: "middle",
    });

    p.render();
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={200}
      style={{ border: "1px solid #eee", background: "#fff" }}
    />
  );
};

// ── Story ─────────────────────────────────────────────────────────────────────
const DebugDemo = () => (
  <div
    style={{
      padding: 32,
      fontFamily: "sans-serif",
      background: "#fafafa",
      minHeight: "100vh",
    }}
  >
    <h2 style={{ margin: "0 0 24px", color: "#222" }}>调试辅助 Debug</h2>

    <Section
      title="图层边界框 debug: true"
      desc="开启 debug 后，每个可见图层周围自动绘制红色边界框"
    >
      <BoundsDebugDemo />
    </Section>

    <Section
      title="网格辅助线 grid"
      desc="debug.grid 配置网格间距、颜色和线宽，辅助对齐元素"
    >
      <GridDebugDemo />
    </Section>

    <Section
      title="大间距自定义网格（深色背景）"
      desc="grid.size: 50，适用于大版面布局调试"
    >
      <CustomGridDemo />
    </Section>

    <Section
      title="基准线 guides"
      desc="debug.guides 支持水平 / 垂直两种方向，可自定义颜色、线宽、虚线样式"
    >
      <GuidesDebugDemo />
    </Section>

    <Section
      title="综合调试 bounds + grid + guides"
      desc="三种调试辅助可同时开启，互不干扰"
    >
      <FullDebugDemo />
    </Section>
  </div>
);

export default {
  title: "Core/10-Debug",
  component: DebugDemo,
};

export const Default = () => <DebugDemo />;

import React, { useEffect, useRef } from "react";
import createDrawPoster from "../packages/core/src";

const W = 420;

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div style={{ marginBottom: 32 }}>
    <div
      style={{
        fontFamily: "sans-serif",
        fontSize: 13,
        fontWeight: 600,
        color: "#555",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 1,
      }}
    >
      {title}
    </div>
    {children}
  </div>
);

// ── 矩形 ─────────────────────────────────────────────────────────────────────
const RectDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 实心矩形
    p.drawRect({ x: 10, y: 10, width: 80, height: 60, fillStyle: "#4a90e2" });

    // 描边矩形
    p.drawRect({
      x: 110,
      y: 10,
      width: 80,
      height: 60,
      strokeStyle: "#e24a4a",
      lineWidth: 3,
    });

    // 虚线矩形
    p.drawRect({
      x: 210,
      y: 10,
      width: 80,
      height: 60,
      strokeStyle: "#27ae60",
      lineWidth: 2,
      lineDash: [8, 4],
    });

    // 圆角矩形
    p.drawRect({
      x: 310,
      y: 10,
      width: 90,
      height: 60,
      fillStyle: "#9b59b6",
      radius: 16,
    });

    // 带阴影的矩形
    p.drawRect({
      x: 10,
      y: 90,
      width: 100,
      height: 60,
      fillStyle: "#f39c12",
      shadowColor: "rgba(0,0,0,0.4)",
      shadowBlur: 12,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
    });

    // 混合圆角（左上/右下）
    p.drawRect({
      x: 130,
      y: 90,
      width: 100,
      height: 60,
      fillStyle: "#1abc9c",
      radius: [20, 0, 20, 0],
    });

    // 填充 + 描边
    p.drawRect({
      x: 250,
      y: 90,
      width: 100,
      height: 60,
      fillStyle: "#ecf0f1",
      strokeStyle: "#2c3e50",
      lineWidth: 3,
      radius: 8,
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={170}
      style={{ border: "1px solid #eee", background: "#fff" }}
    />
  );
};

// ── 圆形 ─────────────────────────────────────────────────────────────────────
const CircleDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    p.drawCircle({ x: 50, y: 60, radius: 45, fillStyle: "#e74c3c" });
    p.drawCircle({
      x: 160,
      y: 60,
      radius: 45,
      strokeStyle: "#3498db",
      lineWidth: 4,
    });
    p.drawCircle({
      x: 270,
      y: 60,
      radius: 45,
      fillStyle: "#2ecc71",
      strokeStyle: "#27ae60",
      lineWidth: 3,
    });
    p.drawCircle({
      x: 380,
      y: 60,
      radius: 45,
      fillStyle: "#f1c40f",
      shadowColor: "rgba(0,0,0,0.3)",
      shadowBlur: 16,
      shadowOffsetY: 6,
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={120}
      style={{ border: "1px solid #eee", background: "#fff" }}
    />
  );
};

// ── 线条 ─────────────────────────────────────────────────────────────────────
const LineDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 普通直线
    p.drawLine({
      x1: 10,
      y1: 20,
      x2: 130,
      y2: 20,
      strokeStyle: "#333",
      lineWidth: 2,
    });

    // 粗线
    p.drawLine({
      x1: 10,
      y1: 50,
      x2: 130,
      y2: 50,
      strokeStyle: "#e74c3c",
      lineWidth: 6,
    });

    // 虚线
    p.drawLine({
      x1: 10,
      y1: 80,
      x2: 130,
      y2: 80,
      strokeStyle: "#3498db",
      lineWidth: 2,
      lineDash: [10, 5],
    });

    // 点线
    p.drawLine({
      x1: 10,
      y1: 110,
      x2: 130,
      y2: 110,
      strokeStyle: "#27ae60",
      lineWidth: 2,
      lineDash: [2, 6],
      lineCap: "round",
    });

    // 斜线带阴影
    p.drawLine({
      x1: 160,
      y1: 20,
      x2: 260,
      y2: 120,
      strokeStyle: "#9b59b6",
      lineWidth: 3,
      shadowColor: "rgba(155,89,182,0.4)",
      shadowBlur: 8,
    });

    // 端点样式：round
    p.drawLine({
      x1: 290,
      y1: 30,
      x2: 410,
      y2: 30,
      strokeStyle: "#f39c12",
      lineWidth: 10,
      lineCap: "round",
    });

    // 端点样式：square
    p.drawLine({
      x1: 290,
      y1: 70,
      x2: 410,
      y2: 70,
      strokeStyle: "#1abc9c",
      lineWidth: 10,
      lineCap: "square",
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={140}
      style={{ border: "1px solid #eee", background: "#fff" }}
    />
  );
};

// ── 多边形 ────────────────────────────────────────────────────────────────────
const PolygonDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 三角形
    p.drawPolygon({
      points: [
        [60, 10],
        [110, 100],
        [10, 100],
      ],
      fillStyle: "#3498db",
    });

    // 五边形
    const makeNgon = (cx: number, cy: number, r: number, n: number) => {
      const pts: [number, number][] = [];
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
      }
      return pts;
    };

    p.drawPolygon({
      points: makeNgon(200, 60, 55, 5),
      fillStyle: "#e74c3c",
    });

    // 六边形 (描边)
    p.drawPolygon({
      points: makeNgon(330, 60, 55, 6),
      strokeStyle: "#27ae60",
      lineWidth: 3,
    });

    // 星形（开放路径）
    const starPoints: [number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 45 : 20;
      const angle = (Math.PI * 2 * i) / 10 - Math.PI / 2;
      starPoints.push([
        100 + Math.cos(angle) * r + 250,
        60 + Math.sin(angle) * r,
      ]);
    }
    p.drawPolygon({
      points: starPoints,
      fillStyle: "#f1c40f",
      strokeStyle: "#f39c12",
      lineWidth: 2,
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={120}
      style={{ border: "1px solid #eee", background: "#fff" }}
    />
  );
};

// ── Story ─────────────────────────────────────────────────────────────────────
const ShapesDemo = () => (
  <div style={{ padding: 32, fontFamily: "sans-serif", background: "#fafafa", minHeight: "100vh" }}>
    <h2 style={{ margin: "0 0 24px", color: "#222" }}>基础图形 Basic Shapes</h2>

    <Section title="矩形 Rect — 填充 / 描边 / 虚线 / 圆角 / 阴影">
      <RectDemo />
    </Section>

    <Section title="圆形 Circle — 填充 / 描边 / 阴影">
      <CircleDemo />
    </Section>

    <Section title="线条 Line — 粗细 / 虚线 / 端点样式 / 阴影">
      <LineDemo />
    </Section>

    <Section title="多边形 Polygon — 三角形 / 五边形 / 六边形 / 星形">
      <PolygonDemo />
    </Section>
  </div>
);

export default {
  title: "Core/01-Shapes",
  component: ShapesDemo,
};

export const Default = () => <ShapesDemo />;

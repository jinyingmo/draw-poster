import React, { useEffect, useRef } from "react";
import createDrawPoster from "../packages/core/src";

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

const W = 420;

// ── 线性渐变 ────────────────────────────────────────────────────────────────
const LinearGradientDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 水平渐变
    p.drawRect({
      x: 10,
      y: 10,
      width: 180,
      height: 80,
      fillStyle: {
        type: "linear",
        x0: 10,
        y0: 10,
        x1: 190,
        y1: 10,
        stops: [
          { offset: 0, color: "#f093fb" },
          { offset: 1, color: "#f5576c" },
        ],
      },
      radius: 8,
    });

    // 垂直渐变
    p.drawRect({
      x: 210,
      y: 10,
      width: 200,
      height: 80,
      fillStyle: {
        type: "linear",
        x0: 210,
        y0: 10,
        x1: 210,
        y1: 90,
        stops: [
          { offset: 0, color: "#4facfe" },
          { offset: 1, color: "#00f2fe" },
        ],
      },
      radius: 8,
    });

    // 多色渐变
    p.drawRect({
      x: 10,
      y: 110,
      width: 180,
      height: 80,
      fillStyle: {
        type: "linear",
        x0: 10,
        y0: 110,
        x1: 190,
        y1: 110,
        stops: [
          { offset: 0, color: "#ff0844" },
          { offset: 0.3, color: "#ffb199" },
          { offset: 0.6, color: "#43e97b" },
          { offset: 1, color: "#38f9d7" },
        ],
      },
      radius: 8,
    });

    // 对角线渐变 + 描边
    p.drawRect({
      x: 210,
      y: 110,
      width: 200,
      height: 80,
      fillStyle: {
        type: "linear",
        x0: 210,
        y0: 110,
        x1: 410,
        y1: 190,
        stops: [
          { offset: 0, color: "#a18cd1" },
          { offset: 1, color: "#fbc2eb" },
        ],
      },
      strokeStyle: "#a18cd1",
      lineWidth: 2,
      radius: 8,
    });

    // 圆形中的渐变
    p.drawCircle({
      x: 80,
      y: 250,
      radius: 55,
      fillStyle: {
        type: "linear",
        x0: 25,
        y0: 195,
        x1: 135,
        y1: 305,
        stops: [
          { offset: 0, color: "#ffecd2" },
          { offset: 1, color: "#fcb69f" },
        ],
      },
    });

    p.drawCircle({
      x: 250,
      y: 250,
      radius: 55,
      fillStyle: {
        type: "linear",
        x0: 195,
        y0: 195,
        x1: 305,
        y1: 305,
        stops: [
          { offset: 0, color: "#667eea" },
          { offset: 1, color: "#764ba2" },
        ],
      },
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={320}
      style={{ border: "1px solid #eee", background: "#f8f8f8" }}
    />
  );
};

// ── 径向渐变 ────────────────────────────────────────────────────────────────
const RadialGradientDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 同心径向渐变（正常）
    p.drawRect({
      x: 10,
      y: 10,
      width: 180,
      height: 140,
      fillStyle: {
        type: "radial",
        x0: 100,
        y0: 80,
        r0: 0,
        x1: 100,
        y1: 80,
        r1: 90,
        stops: [
          { offset: 0, color: "#fff7f0" },
          { offset: 0.5, color: "#ff9a9e" },
          { offset: 1, color: "#c0392b" },
        ],
      },
      radius: 8,
    });

    // 偏心径向渐变（模拟光晕）
    p.drawRect({
      x: 210,
      y: 10,
      width: 200,
      height: 140,
      fillStyle: {
        type: "radial",
        x0: 280,
        y0: 50,
        r0: 10,
        x1: 310,
        y1: 80,
        r1: 100,
        stops: [
          { offset: 0, color: "#fffde7" },
          { offset: 0.4, color: "#ff6f00" },
          { offset: 1, color: "#1a237e" },
        ],
      },
      radius: 8,
    });

    // 圆形内径向渐变
    p.drawCircle({
      x: 80,
      y: 230,
      radius: 70,
      fillStyle: {
        type: "radial",
        x0: 60,
        y0: 210,
        r0: 0,
        x1: 80,
        y1: 230,
        r1: 70,
        stops: [
          { offset: 0, color: "#f9f871" },
          { offset: 0.5, color: "#43cbff" },
          { offset: 1, color: "#9708cc" },
        ],
      },
    });

    p.drawCircle({
      x: 280,
      y: 230,
      radius: 70,
      fillStyle: {
        type: "radial",
        x0: 280,
        y0: 230,
        r0: 0,
        x1: 280,
        y1: 230,
        r1: 70,
        stops: [
          { offset: 0, color: "#ffffff" },
          { offset: 0.4, color: "#43e97b" },
          { offset: 1, color: "#38f9d7" },
        ],
      },
      strokeStyle: "#38f9d7",
      lineWidth: 2,
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={320}
      style={{ border: "1px solid #eee", background: "#222" }}
    />
  );
};

// ── 图案填充 ────────────────────────────────────────────────────────────────
const PatternFillDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 创建棋盘格图案
    const makeCheckerboard = (size: number, c1: string, c2: string) => {
      const pc = document.createElement("canvas");
      pc.width = size * 2;
      pc.height = size * 2;
      const pctx = pc.getContext("2d")!;
      pctx.fillStyle = c1;
      pctx.fillRect(0, 0, size * 2, size * 2);
      pctx.fillStyle = c2;
      pctx.fillRect(0, 0, size, size);
      pctx.fillRect(size, size, size, size);
      return pc;
    };

    // 创建斜条纹图案
    const makeStripes = (
      size: number,
      fg: string,
      bg: string,
      angle = 45,
    ) => {
      const pc = document.createElement("canvas");
      pc.width = size;
      pc.height = size;
      const pctx = pc.getContext("2d")!;
      pctx.fillStyle = bg;
      pctx.fillRect(0, 0, size, size);
      pctx.strokeStyle = fg;
      pctx.lineWidth = size / 4;
      pctx.save();
      pctx.translate(size / 2, size / 2);
      pctx.rotate((angle * Math.PI) / 180);
      pctx.beginPath();
      pctx.moveTo(-size, 0);
      pctx.lineTo(size, 0);
      pctx.stroke();
      pctx.restore();
      return pc;
    };

    // 创建圆点图案
    const makeDots = (size: number, fg: string, bg: string) => {
      const pc = document.createElement("canvas");
      pc.width = size;
      pc.height = size;
      const pctx = pc.getContext("2d")!;
      pctx.fillStyle = bg;
      pctx.fillRect(0, 0, size, size);
      pctx.fillStyle = fg;
      pctx.beginPath();
      pctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
      pctx.fill();
      return pc;
    };

    // 棋盘格矩形
    p.drawRect({
      x: 10,
      y: 10,
      width: 180,
      height: 130,
      fillStyle: {
        type: "pattern",
        image: makeCheckerboard(15, "#fff", "#ddd"),
        repetition: "repeat",
      },
      radius: 8,
    });

    // 斜条纹圆形
    p.drawCircle({
      x: 320,
      y: 75,
      radius: 65,
      fillStyle: {
        type: "pattern",
        image: makeStripes(20, "#4a90e2", "#e8f4fd"),
      },
    });

    // 圆点图案矩形
    p.drawRect({
      x: 10,
      y: 160,
      width: 180,
      height: 130,
      fillStyle: {
        type: "pattern",
        image: makeDots(20, "#e74c3c", "#ffeaa7"),
        repetition: "repeat",
      },
      radius: 8,
    });

    // 棋盘 + 描边
    p.drawRect({
      x: 220,
      y: 160,
      width: 180,
      height: 130,
      fillStyle: {
        type: "pattern",
        image: makeCheckerboard(10, "#2c3e50", "#ecf0f1"),
        repetition: "repeat",
      },
      strokeStyle: "#2c3e50",
      lineWidth: 3,
      radius: 12,
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={310}
      style={{ border: "1px solid #eee", background: "#f0f0f0" }}
    />
  );
};

// ── Story ─────────────────────────────────────────────────────────────────────
const AdvancedFillDemo = () => (
  <div
    style={{
      padding: 32,
      fontFamily: "sans-serif",
      background: "#fafafa",
      minHeight: "100vh",
    }}
  >
    <h2 style={{ margin: "0 0 24px", color: "#222" }}>
      高级填充 Advanced Fill
    </h2>

    <Section title="线性渐变 Linear Gradient — 水平 / 垂直 / 多色 / 对角">
      <LinearGradientDemo />
    </Section>

    <Section title="径向渐变 Radial Gradient — 同心 / 偏心 / 光晕效果">
      <RadialGradientDemo />
    </Section>

    <Section title="图案填充 Pattern Fill — 棋盘格 / 斜条纹 / 圆点">
      <PatternFillDemo />
    </Section>
  </div>
);

export default {
  title: "Core/02-AdvancedFill",
  component: AdvancedFillDemo,
};

export const Default = () => <AdvancedFillDemo />;

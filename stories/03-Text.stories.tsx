import React, { useEffect, useRef } from "react";
import createDrawPoster from "../packages/core/src";
import { drawTextOnArc } from "../packages/core/src";

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

const W = 500;

// ── 基础文本 & 字体样式 ────────────────────────────────────────────────────
const BasicTextDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    p.drawText({
      text: "普通文本 16px sans-serif",
      x: 10,
      y: 24,
      fontSize: 16,
      color: "#333",
    });

    p.drawText({
      text: "粗体文本 Bold 20px",
      x: 10,
      y: 60,
      fontSize: 20,
      fontWeight: "bold",
      color: "#222",
    });

    p.drawText({
      text: "斜体文本 Italic serif",
      x: 10,
      y: 94,
      fontSize: 18,
      fontStyle: "italic",
      fontFamily: "serif",
      color: "#555",
    });

    p.drawText({
      text: "带颜色 Colored Text",
      x: 10,
      y: 128,
      fontSize: 20,
      color: "#e74c3c",
      fontWeight: "700",
    });

    p.drawText({
      text: "带阴影 Shadow Text",
      x: 10,
      y: 162,
      fontSize: 22,
      color: "#2c3e50",
      fontWeight: "bold",
      shadowColor: "rgba(0,0,0,0.3)",
      shadowBlur: 8,
      shadowOffsetX: 2,
      shadowOffsetY: 3,
    });

    p.drawText({
      text: "描边文本 Stroke Text",
      x: 10,
      y: 200,
      fontSize: 26,
      color: "#fff",
      strokeText: true,
      strokeColor: "#3498db",
      strokeWidth: 2,
    });

    p.drawText({
      text: "大字号 48px Bold",
      x: 10,
      y: 260,
      fontSize: 48,
      fontWeight: "900",
      color: "#f39c12",
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={290}
      style={{ border: "1px solid #eee", background: "#fff" }}
    />
  );
};

// ── 文本对齐 ────────────────────────────────────────────────────────────────
const TextAlignDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    const cx = W / 2;
    // 中心参考线
    p.drawLine({
      x1: cx,
      y1: 0,
      x2: cx,
      y2: 180,
      strokeStyle: "rgba(0,0,0,0.1)",
      lineWidth: 1,
      lineDash: [4, 4],
    });

    p.drawText({
      text: "← left 对齐",
      x: cx,
      y: 24,
      fontSize: 16,
      color: "#e74c3c",
      textAlign: "left",
    });

    p.drawText({
      text: "center 居中对齐",
      x: cx,
      y: 60,
      fontSize: 16,
      color: "#3498db",
      textAlign: "center",
    });

    p.drawText({
      text: "right 对齐 →",
      x: cx,
      y: 96,
      fontSize: 16,
      color: "#27ae60",
      textAlign: "right",
    });

    // textBaseline
    const bx = 60;
    p.drawLine({
      x1: bx - 10,
      y1: 140,
      x2: bx + 200,
      y2: 140,
      strokeStyle: "rgba(0,0,0,0.2)",
      lineWidth: 1,
    });
    p.drawText({
      text: "top",
      x: bx,
      y: 140,
      fontSize: 18,
      color: "#9b59b6",
      textBaseline: "top",
    });
    p.drawText({
      text: "middle",
      x: bx + 60,
      y: 140,
      fontSize: 18,
      color: "#e74c3c",
      textBaseline: "middle",
    });
    p.drawText({
      text: "bottom",
      x: bx + 150,
      y: 140,
      fontSize: 18,
      color: "#27ae60",
      textBaseline: "bottom",
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={180}
      style={{ border: "1px solid #eee", background: "#fff" }}
    />
  );
};

// ── 自动换行与省略 ────────────────────────────────────────────────────────────
const TextWrapDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 分隔线
    const drawLabel = (text: string, y: number) =>
      p.drawText({
        text,
        x: 10,
        y,
        fontSize: 11,
        color: "#999",
        textBaseline: "top",
      });

    drawLabel("▼ maxWidth=220, lineHeight=22, maxLines 不限", 4);
    p.drawText({
      text: "这是一段比较长的文字，超过最大宽度后会自动换行，行高为 22px，演示多行文本的排布效果。",
      x: 10,
      y: 20,
      fontSize: 14,
      color: "#333",
      maxWidth: 220,
      lineHeight: 22,
      textBaseline: "top",
    });

    drawLabel("▼ maxLines=2，超出显示省略号", 110);
    p.drawText({
      text: "这段文本超过两行后将自动截断并显示省略号，不管后面还有多少内容都不会继续显示。",
      x: 10,
      y: 126,
      fontSize: 14,
      color: "#e74c3c",
      maxWidth: 220,
      lineHeight: 22,
      maxLines: 2,
      textBaseline: "top",
    });

    // 右侧：更窄宽度演示
    drawLabel("▼ maxWidth=160, maxLines=3", 4);
    p.drawText({
      text: "更窄宽度下的换行效果，每行能放更少文字，省略在第3行末尾显示。",
      x: 260,
      y: 20,
      fontSize: 14,
      color: "#3498db",
      maxWidth: 160,
      lineHeight: 22,
      maxLines: 3,
      textBaseline: "top",
    });
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

// ── 字距控制 ────────────────────────────────────────────────────────────────
const LetterSpacingDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    const configs = [
      { spacing: 0, label: "letterSpacing: 0 (默认)" },
      { spacing: 4, label: "letterSpacing: 4px" },
      { spacing: 8, label: "letterSpacing: 8px" },
      { spacing: -1, label: "letterSpacing: -1px (紧缩)" },
    ];

    configs.forEach(({ spacing, label }, i) => {
      p.drawText({
        text: `HELLO WORLD — ${label}`,
        x: 10,
        y: 20 + i * 42,
        fontSize: 16,
        color: "#2c3e50",
        letterSpacing: spacing,
        textBaseline: "top",
      });
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={180}
      style={{ border: "1px solid #eee", background: "#fff" }}
    />
  );
};

// ── 竖排文本 ────────────────────────────────────────────────────────────────
const VerticalTextDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 背景
    p.drawRect({ x: 0, y: 0, width: W, height: 300, fillStyle: "#fdf6e3" });

    p.drawText({
      text: "竖排文本演示",
      x: 60,
      y: 20,
      fontSize: 22,
      color: "#8b4513",
      fontFamily: "serif",
      direction: "vertical",
      textBaseline: "top",
    });

    p.drawText({
      text: "DrawPoster",
      x: 140,
      y: 20,
      fontSize: 18,
      color: "#3498db",
      direction: "vertical",
      letterSpacing: 4,
      textBaseline: "top",
    });

    p.drawText({
      text: "字距控制效果",
      x: 220,
      y: 20,
      fontSize: 18,
      color: "#e74c3c",
      fontWeight: "bold",
      direction: "vertical",
      letterSpacing: 8,
      textBaseline: "top",
    });

    p.drawText({
      text: "竖排描边文本",
      x: 320,
      y: 20,
      fontSize: 20,
      color: "#fff",
      direction: "vertical",
      strokeText: true,
      strokeColor: "#9b59b6",
      strokeWidth: 2,
      textBaseline: "top",
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={300}
      style={{ border: "1px solid #eee" }}
    />
  );
};

// ── 弧线路径文字 ────────────────────────────────────────────────────────────
const ArcTextDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    p.drawRect({ x: 0, y: 0, width: W, height: 340, fillStyle: "#1a1a2e" });

    // 圆弧参考圆
    p.drawCircle({
      x: 130,
      y: 130,
      radius: 90,
      strokeStyle: "rgba(255,255,255,0.1)",
      lineWidth: 1,
    });

    // 朝外弧线文字（上方）
    drawTextOnArc(
      ctx,
      {
        text: "DRAW·POSTER·弧线文字",
        x: 0,
        y: 0,
        cx: 130,
        cy: 130,
        arcRadius: 90,
        startAngle: -Math.PI / 2,
        facing: "outward",
        fontSize: 15,
        color: "#f1c40f",
        fontWeight: "bold",
        letterSpacing: 2,
      },
      1,
    );

    // 朝内弧线文字（下方）
    drawTextOnArc(
      ctx,
      {
        text: "✦ Canvas Drawing Library ✦",
        x: 0,
        y: 0,
        cx: 130,
        cy: 130,
        arcRadius: 90,
        startAngle: Math.PI / 2,
        facing: "inward",
        fontSize: 13,
        color: "#74b9ff",
        letterSpacing: 1,
      },
      1,
    );

    // 中心装饰
    p.drawCircle({ x: 130, y: 130, radius: 40, fillStyle: "#fdcb6e" });
    p.drawText({
      text: "绘",
      x: 130,
      y: 130,
      fontSize: 28,
      color: "#fff",
      fontWeight: "bold",
      fontFamily: "serif",
      textAlign: "center",
      textBaseline: "middle",
    });

    // 第二个弧线文字示例（描边）
    p.drawCircle({
      x: 370,
      y: 170,
      radius: 100,
      strokeStyle: "rgba(255,255,255,0.1)",
      lineWidth: 1,
    });

    drawTextOnArc(
      ctx,
      {
        text: "描边弧线 Stroke Arc Text",
        x: 0,
        y: 0,
        cx: 370,
        cy: 170,
        arcRadius: 100,
        startAngle: -Math.PI * 0.7,
        facing: "outward",
        fontSize: 15,
        color: "#dfe6e9",
        strokeText: true,
        strokeColor: "#e17055",
        strokeWidth: 1,
        letterSpacing: 3,
      },
      1,
    );

    p.drawCircle({ x: 370, y: 170, radius: 55, fillStyle: "#6c5ce7" });
    p.drawText({
      text: "Arc",
      x: 370,
      y: 170,
      fontSize: 26,
      color: "#fff",
      fontWeight: "bold",
      textAlign: "center",
      textBaseline: "middle",
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={340}
      style={{ border: "1px solid #eee" }}
    />
  );
};

// ── Story ─────────────────────────────────────────────────────────────────────
const TextDemo = () => (
  <div
    style={{
      padding: 32,
      fontFamily: "sans-serif",
      background: "#fafafa",
      minHeight: "100vh",
    }}
  >
    <h2 style={{ margin: "0 0 24px", color: "#222" }}>文本绘制 Text Drawing</h2>

    <Section title="基础文本 — 字体 / 粗细 / 斜体 / 颜色 / 阴影 / 描边">
      <BasicTextDemo />
    </Section>

    <Section title="文本对齐 — textAlign (left/center/right) & textBaseline (top/middle/bottom)">
      <TextAlignDemo />
    </Section>

    <Section title="自动换行与省略 — maxWidth / lineHeight / maxLines (省略号)">
      <TextWrapDemo />
    </Section>

    <Section title="字距控制 letterSpacing">
      <LetterSpacingDemo />
    </Section>

    <Section title="竖排文本 direction: 'vertical'">
      <VerticalTextDemo />
    </Section>

    <Section title="弧线路径文字 drawTextOnArc — outward / inward / 描边">
      <ArcTextDemo />
    </Section>
  </div>
);

export default {
  title: "Core/03-Text",
  component: TextDemo,
};

export const Default = () => <TextDemo />;

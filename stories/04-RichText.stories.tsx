import React, { useEffect, useRef } from "react";
import { createDrawPoster } from "../packages/core/src";
import type { TextLayer } from "../packages/core/src";

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

// ── 多样式片段 ────────────────────────────────────────────────────────────────
// 富文本通过图层系统使用：addLayer({ type: 'text', spans: [...] }) + render()
const MultiStyleSpanDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 多色混合段落
    p.addLayer({
      type: "text",
      id: "rt1",
      text: "",
      x: 16,
      y: 20,
      fontSize: 18,
      textBaseline: "top",
      spans: [
        { text: "富文本 ", color: "#e74c3c", fontSize: 20, fontWeight: "bold" },
        { text: "Rich", color: "#3498db", fontStyle: "italic", fontSize: 18 },
        { text: "Text ", color: "#27ae60", fontSize: 18 },
        { text: "多样式", color: "#9b59b6", fontSize: 20, fontWeight: "bold" },
        { text: " 混合", color: "#f39c12", fontSize: 18 },
      ],
    } as TextLayer);

    // 不同字号混排
    p.addLayer({
      type: "text",
      id: "rt2",
      text: "",
      x: 16,
      y: 58,
      textBaseline: "top",
      spans: [
        { text: "大", color: "#e74c3c", fontSize: 32, fontWeight: "900" },
        { text: "中", color: "#3498db", fontSize: 22, fontWeight: "bold" },
        { text: "小", color: "#27ae60", fontSize: 14 },
        { text: " — 不同字号排列", color: "#555", fontSize: 14 },
      ],
    } as TextLayer);

    // 带描边片段
    p.addLayer({
      type: "text",
      id: "rt3",
      text: "",
      x: 16,
      y: 110,
      textBaseline: "top",
      spans: [
        {
          text: "OUTLINED ",
          color: "#fff",
          fontSize: 22,
          fontWeight: "bold",
          strokeText: true,
          strokeColor: "#c0392b",
          strokeWidth: 2,
        },
        { text: "& ", color: "#333", fontSize: 22 },
        {
          text: "FILLED",
          color: "#2980b9",
          fontSize: 22,
          fontWeight: "bold",
        },
      ],
    } as TextLayer);

    // 字距控制片段
    p.addLayer({
      type: "text",
      id: "rt4",
      text: "",
      x: 16,
      y: 156,
      textBaseline: "top",
      spans: [
        {
          text: "WIDE ",
          color: "#8e44ad",
          fontSize: 18,
          letterSpacing: 8,
        },
        { text: "vs ", color: "#555", fontSize: 18 },
        {
          text: "NARROW",
          color: "#16a085",
          fontSize: 18,
          letterSpacing: -1,
        },
      ],
    } as TextLayer);

    p.render();
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={210}
      style={{ border: "1px solid #eee", background: "#fff" }}
    />
  );
};

// ── 自动换行富文本 ────────────────────────────────────────────────────────────
const WrappingRichTextDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 卡片背景
    p.addLayer({
      type: "rect",
      id: "card-bg",
      x: 20,
      y: 20,
      width: 460,
      height: 200,
      fillStyle: "#ffffff",
      radius: 12,
      shadowColor: "rgba(0,0,0,0.08)",
      shadowBlur: 16,
      shadowOffsetY: 4,
    });

    // 标题（富文本）
    p.addLayer({
      type: "text",
      id: "card-title",
      text: "",
      x: 36,
      y: 40,
      textBaseline: "top",
      spans: [
        { text: "🎨 ", fontSize: 18 },
        { text: "产品", color: "#2c3e50", fontSize: 20, fontWeight: "bold" },
        { text: " 介绍", color: "#7f8c8d", fontSize: 16 },
      ],
    } as TextLayer);

    // 混合样式正文（带换行）
    p.addLayer({
      type: "text",
      id: "card-body",
      text: "",
      x: 36,
      y: 76,
      maxWidth: 420,
      lineHeight: 26,
      textBaseline: "top",
      spans: [
        {
          text: "draw-poster",
          color: "#3498db",
          fontSize: 15,
          fontWeight: "bold",
        },
        {
          text: " 是一个高性能 Canvas 绘图库，支持图层系统、",
          color: "#555",
          fontSize: 14,
        },
        { text: "富文本", color: "#e74c3c", fontSize: 14, fontWeight: "bold" },
        {
          text: "、渐变填充、蒙版裁剪等丰富能力。",
          color: "#555",
          fontSize: 14,
        },
      ],
    } as TextLayer);

    p.render();

    // 标签行（使用立即绘制模式）
    const tags = [
      { text: "图层系统", color: "#3498db" },
      { text: "富文本", color: "#e74c3c" },
      { text: "二维码", color: "#27ae60" },
      { text: "插件", color: "#9b59b6" },
    ];
    let tx = 36;
    tags.forEach(({ text, color }) => {
      const tw = text.length * 14 + 16;
      p.drawRect({
        x: tx,
        y: 175,
        width: tw,
        height: 26,
        fillStyle: color + "20",
        strokeStyle: color + "80",
        lineWidth: 1,
        radius: 13,
      });
      p.drawText({
        text,
        x: tx + tw / 2,
        y: 188,
        fontSize: 12,
        color,
        textAlign: "center",
        textBaseline: "middle",
      });
      tx += tw + 8;
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={240}
      style={{ border: "1px solid #eee", background: "#f8f9fa" }}
    />
  );
};

// ── 混合字号对齐 ────────────────────────────────────────────────────────────
const MixedSizeDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 新闻标题风格
    p.addLayer({
      type: "text",
      id: "news",
      text: "",
      x: 16,
      y: 20,
      textBaseline: "top",
      lineHeight: 32,
      maxWidth: 460,
      spans: [
        { text: "【独家】", color: "#e74c3c", fontSize: 14, fontWeight: "bold" },
        {
          text: "draw-poster v3.0 正式发布",
          color: "#1a1a1a",
          fontSize: 18,
          fontWeight: "bold",
        },
      ],
    } as TextLayer);

    p.addLayer({
      type: "text",
      id: "body",
      text: "",
      x: 16,
      y: 60,
      textBaseline: "top",
      lineHeight: 22,
      maxWidth: 460,
      spans: [
        { text: "新版本带来了 ", color: "#555", fontSize: 13 },
        {
          text: "50+",
          color: "#e74c3c",
          fontSize: 16,
          fontWeight: "bold",
        },
        { text: " 项新特性，性能提升 ", color: "#555", fontSize: 13 },
        {
          text: "3x",
          color: "#27ae60",
          fontSize: 16,
          fontWeight: "bold",
        },
        {
          text: "，支持完整的富文本排版系统。",
          color: "#555",
          fontSize: 13,
        },
      ],
    } as TextLayer);

    // 价格标签风格
    p.addLayer({
      type: "text",
      id: "price",
      text: "",
      x: 16,
      y: 120,
      textBaseline: "top",
      spans: [
        { text: "¥", color: "#e74c3c", fontSize: 16, fontWeight: "bold" },
        { text: "299", color: "#e74c3c", fontSize: 40, fontWeight: "900" },
        { text: ".99", color: "#e74c3c", fontSize: 20, fontWeight: "bold" },
        { text: "  原价 ¥599", color: "#999", fontSize: 14 },
      ],
    } as TextLayer);

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

// ── 字距控制对比 ────────────────────────────────────────────────────────────
const LetterSpacingCompareDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    const spacings = [0, 2, 4, 6, 8, 12];
    spacings.forEach((sp, i) => {
      // 背景条
      p.drawRect({
        x: 10,
        y: 10 + i * 44,
        width: W - 20,
        height: 36,
        fillStyle: i % 2 === 0 ? "#f8f9fa" : "#ffffff",
        radius: 4,
      });

      // 左侧标签
      p.drawText({
        text: `+${sp}px`,
        x: 20,
        y: 28 + i * 44,
        fontSize: 12,
        color: "#999",
        textBaseline: "middle",
        fontFamily: "monospace",
      });

      // 演示文本（字距控制通过逐字绘制实现）
      p.drawText({
        text: "ABCDE 12345 你好世界",
        x: 80,
        y: 28 + i * 44,
        fontSize: 15,
        color: "#2c3e50",
        textBaseline: "middle",
        letterSpacing: sp,
      });
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={280}
      style={{ border: "1px solid #eee", background: "#fff" }}
    />
  );
};

// ── Story ─────────────────────────────────────────────────────────────────────
const RichTextDemo = () => (
  <div
    style={{
      padding: 32,
      fontFamily: "sans-serif",
      background: "#fafafa",
      minHeight: "100vh",
    }}
  >
    <h2 style={{ margin: "0 0 24px", color: "#222" }}>富文本 Rich Text</h2>
    <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "#666", marginBottom: 24, marginTop: 0 }}>
      富文本通过图层系统使用：<code>addLayer({"{ type: 'text', spans: [...] }"})</code> + <code>render()</code>
    </p>

    <Section title="多样式文本片段 TextSpan — 颜色 / 字号 / 粗细 / 斜体 / 描边 / 字距">
      <MultiStyleSpanDemo />
    </Section>

    <Section title="富文本换行与卡片组合">
      <WrappingRichTextDemo />
    </Section>

    <Section title="混合字号 — 新闻标题 / 价格标签">
      <MixedSizeDemo />
    </Section>

    <Section title="字距对比 letterSpacing 0 ~ 12px">
      <LetterSpacingCompareDemo />
    </Section>
  </div>
);

export default {
  title: "Core/04-RichText",
  component: RichTextDemo,
};

export const Default = () => <RichTextDemo />;

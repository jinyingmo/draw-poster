import React, { useEffect, useRef, useState } from "react";
import { createDrawPoster } from "../packages/core/src";
import type { Layer } from "../packages/core/src";

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

// ── 基础模板注册与使用 ─────────────────────────────────────────────────────
const BasicTemplateDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 注册一个"徽章"模板
    p.registerTemplate<{ label: string; color: string }>(
      "badge",
      ({ label, color }) => [
        {
          type: "rect",
          x: 0,
          y: 0,
          width: 100,
          height: 32,
          fillStyle: color,
          radius: 16,
        } as Layer,
        {
          type: "text",
          text: label,
          x: 50,
          y: 16,
          fontSize: 13,
          fontWeight: "bold",
          color: "#fff",
          textAlign: "center",
          textBaseline: "middle",
        } as Layer,
      ],
    );

    // 使用模板创建多个徽章（不同偏移量）
    const badges = [
      { label: "已发布", color: "#27ae60", offset: { x: 20, y: 20 } },
      { label: "待审核", color: "#f39c12", offset: { x: 140, y: 20 } },
      { label: "已归档", color: "#95a5a6", offset: { x: 260, y: 20 } },
      { label: "紧急！", color: "#e74c3c", offset: { x: 380, y: 20 } },
    ];

    badges.forEach(({ label, color, offset }) => {
      const layers = p.createFromTemplate("badge", { label, color }, offset);
      layers.forEach((layer) => p.addLayer(layer));
    });

    p.render();
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={80}
      style={{ border: "1px solid #eee", background: "#f8f9fa" }}
    />
  );
};

// ── 复杂模板（卡片）─────────────────────────────────────────────────────────
const CardTemplateDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 注册"信息卡片"模板
    p.registerTemplate<{
      title: string;
      subtitle: string;
      value: string;
      accentColor: string;
    }>("info-card", ({ title, subtitle, value, accentColor }) => [
      // 卡片背景
      {
        type: "rect",
        x: 0,
        y: 0,
        width: 180,
        height: 110,
        fillStyle: "#ffffff",
        strokeStyle: "#e8ecf0",
        lineWidth: 1,
        radius: 10,
        shadowColor: "rgba(0,0,0,0.06)",
        shadowBlur: 10,
        shadowOffsetY: 2,
      } as Layer,
      // 左侧彩色条
      {
        type: "rect",
        x: 0,
        y: 0,
        width: 6,
        height: 110,
        fillStyle: accentColor,
        radius: [10, 0, 0, 10],
      } as Layer,
      // 标题
      {
        type: "text",
        text: title,
        x: 20,
        y: 22,
        fontSize: 12,
        color: "#7f8c8d",
        textBaseline: "top",
      } as Layer,
      // 数值
      {
        type: "text",
        text: value,
        x: 20,
        y: 42,
        fontSize: 28,
        fontWeight: "bold",
        color: accentColor,
        textBaseline: "top",
      } as Layer,
      // 副标题
      {
        type: "text",
        text: subtitle,
        x: 20,
        y: 82,
        fontSize: 11,
        color: "#bdc3c7",
        textBaseline: "top",
      } as Layer,
    ]);

    // 实例化 3 张卡片
    const cards = [
      {
        title: "总访问量",
        subtitle: "较上月 ↑ 12.3%",
        value: "24,891",
        accentColor: "#3498db",
        offset: { x: 20, y: 20 },
      },
      {
        title: "转化率",
        subtitle: "较上月 ↑ 2.1%",
        value: "8.74%",
        accentColor: "#27ae60",
        offset: { x: 220, y: 20 },
      },
      {
        title: "错误率",
        subtitle: "较上月 ↓ 0.5%",
        value: "0.12%",
        accentColor: "#e74c3c",
        offset: { x: 20, y: 150 },
      },
    ];

    cards.forEach(({ offset, ...data }) => {
      const layers = p.createFromTemplate("info-card", data, offset);
      layers.forEach((layer) => p.addLayer(layer));
    });

    p.render();
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={290}
      style={{ border: "1px solid #eee", background: "#f0f3f7" }}
    />
  );
};

// ── 模板 + 偏移量平铺 ────────────────────────────────────────────────────
const TileTemplateDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 注册"单元格"模板
    p.registerTemplate<{ row: number; col: number; value: number }>(
      "cell",
      ({ row, col, value }) => {
        const hue = (row * 5 + col * 25) % 360;
        const color = `hsl(${hue}, 70%, 60%)`;
        return [
          {
            type: "rect",
            x: 0,
            y: 0,
            width: 56,
            height: 56,
            fillStyle: color,
            radius: 4,
          } as Layer,
          {
            type: "text",
            text: String(value),
            x: 28,
            y: 28,
            fontSize: 16,
            fontWeight: "bold",
            color: "#fff",
            textAlign: "center",
            textBaseline: "middle",
          } as Layer,
        ];
      },
    );

    // 5×7 网格
    const COLS = 7;
    const ROWS = 4;
    const CELL = 60;
    const MARGIN = 10;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const layers = p.createFromTemplate(
          "cell",
          { row: r, col: c, value: r * COLS + c + 1 },
          { x: MARGIN + c * CELL, y: MARGIN + r * CELL },
        );
        layers.forEach((layer) => p.addLayer(layer));
      }
    }

    p.render();
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={260}
      style={{ border: "1px solid #eee", background: "#f8f9fa" }}
    />
  );
};

// ── 动态模板（交互式）──────────────────────────────────────────────────────
const DynamicTemplateDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [items, setItems] = useState([
    { id: 1, label: "设计", emoji: "🎨", color: "#9b59b6" },
    { id: 2, label: "开发", emoji: "💻", color: "#3498db" },
    { id: 3, label: "测试", emoji: "🧪", color: "#27ae60" },
  ]);
  const pRef = useRef<ReturnType<typeof createDrawPoster> | null>(null);

  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });
    pRef.current = p;

    // 注册"步骤卡"模板
    p.registerTemplate<{ label: string; emoji: string; color: string; step: number }>(
      "step-card",
      ({ label, emoji, color, step }) => [
        {
          type: "rect",
          x: 0,
          y: 0,
          width: 120,
          height: 90,
          fillStyle: "#fff",
          strokeStyle: color,
          lineWidth: 2,
          radius: 10,
        } as Layer,
        {
          type: "circle",
          x: 60,
          y: 28,
          radius: 20,
          fillStyle: color,
        } as Layer,
        {
          type: "text",
          text: emoji,
          x: 60,
          y: 28,
          fontSize: 16,
          textAlign: "center",
          textBaseline: "middle",
        } as Layer,
        {
          type: "text",
          text: `步骤 ${step}`,
          x: 60,
          y: 56,
          fontSize: 11,
          color: "#aaa",
          textAlign: "center",
          textBaseline: "top",
        } as Layer,
        {
          type: "text",
          text: label,
          x: 60,
          y: 70,
          fontSize: 13,
          fontWeight: "bold",
          color,
          textAlign: "center",
          textBaseline: "top",
        } as Layer,
      ],
    );
  }, []);

  const renderCards = (currentItems: typeof items) => {
    const p = pRef.current;
    if (!p) return;

    // 清空并重新添加
    p.getLayers().forEach((l) => l.id && p.removeLayer(l.id));

    // 背景
    p.addLayer({
      type: "rect",
      id: "bg",
      x: 0,
      y: 0,
      width: W,
      height: 140,
      fillStyle: "#f8f9fa",
    });

    currentItems.forEach((item, i) => {
      const layers = p.createFromTemplate(
        "step-card",
        { ...item, step: i + 1 },
        { x: 20 + i * 145, y: 25 },
      );
      layers.forEach((layer, j) => {
        layer.id = `step-${item.id}-${j}`;
        p.addLayer(layer);
      });

      // 连接箭头
      if (i < currentItems.length - 1) {
        p.addLayer({
          type: "line",
          id: `arrow-${i}`,
          x1: 150 + i * 145,
          y1: 70,
          x2: 165 + i * 145,
          y2: 70,
          strokeStyle: "#bdc3c7",
          lineWidth: 2,
        });
      }
    });

    p.render();
  };

  useEffect(() => {
    renderCards(items);
  }, [items]);

  const addItem = () => {
    const newItems = [
      { id: 4, label: "发布", emoji: "🚀", color: "#e74c3c" },
      { id: 5, label: "监控", emoji: "📊", color: "#f39c12" },
    ];
    const next = newItems.find((n) => !items.find((i) => i.id === n.id));
    if (next) setItems((prev) => [...prev, next]);
  };

  const removeItem = () => {
    if (items.length > 1) setItems((prev) => prev.slice(0, -1));
  };

  return (
    <div>
      <div style={{ marginBottom: 8, display: "flex", gap: 8 }}>
        <button
          onClick={addItem}
          disabled={items.length >= 5}
          style={{
            padding: "4px 14px",
            fontSize: 12,
            cursor: items.length < 5 ? "pointer" : "not-allowed",
            background: "#27ae60",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            fontFamily: "sans-serif",
          }}
        >
          + 添加步骤
        </button>
        <button
          onClick={removeItem}
          disabled={items.length <= 1}
          style={{
            padding: "4px 14px",
            fontSize: 12,
            cursor: items.length > 1 ? "pointer" : "not-allowed",
            background: "#e74c3c",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            fontFamily: "sans-serif",
          }}
        >
          − 移除步骤
        </button>
      </div>
      <canvas
        ref={ref}
        width={W}
        height={140}
        style={{ border: "1px solid #eee", display: "block" }}
      />
      <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#999", marginTop: 4 }}>
        每次操作后调用 createFromTemplate() 重新实例化模板，再 render()
      </div>
    </div>
  );
};

// ── Story ─────────────────────────────────────────────────────────────────────
const TemplateDemo = () => (
  <div
    style={{
      padding: 32,
      fontFamily: "sans-serif",
      background: "#fafafa",
      minHeight: "100vh",
    }}
  >
    <h2 style={{ margin: "0 0 24px", color: "#222" }}>模板化渲染 Template</h2>

    <Section
      title="基础模板 registerTemplate / createFromTemplate"
      desc="注册可复用的图层模板函数，通过 offset 在不同位置实例化"
    >
      <BasicTemplateDemo />
    </Section>

    <Section
      title="复杂模板 — 多图层信息卡片"
      desc="模板可包含任意数量图层（矩形、文本等），数据驱动生成"
    >
      <CardTemplateDemo />
    </Section>

    <Section
      title="模板平铺 — 网格单元格"
      desc="用循环调用 createFromTemplate，通过 offset 控制排列位置，实现均匀平铺"
    >
      <TileTemplateDemo />
    </Section>

    <Section
      title="动态模板 — 交互式步骤流"
      desc="React 状态变化驱动 createFromTemplate 重新实例化，配合图层管理实现动态更新"
    >
      <DynamicTemplateDemo />
    </Section>
  </div>
);

export default {
  title: "Core/13-Template",
  component: TemplateDemo,
};

export const Default = () => <TemplateDemo />;

import React, { useEffect, useRef, useState } from "react";
import { createDrawPoster, createJsonTemplate } from "../packages/core/src";
import type { JsonTemplateLayer } from "../packages/core/src";

// ─── 共用样式组件 ─────────────────────────────────────────────────────────────

const Section = ({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) => (
  <div style={{ marginBottom: 48 }}>
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
      <div style={{ fontFamily: "sans-serif", fontSize: 12, color: "#888", marginBottom: 12 }}>
        {desc}
      </div>
    )}
    {children}
  </div>
);

const JsonBlock = ({ data }: { data: unknown }) => (
  <pre
    style={{
      background: "#1e1e2e",
      color: "#cdd6f4",
      borderRadius: 8,
      padding: "12px 16px",
      fontSize: 11,
      lineHeight: 1.6,
      overflowX: "auto",
      margin: "0 0 12px 0",
      fontFamily: "monospace",
      maxHeight: 260,
      overflowY: "auto",
    }}
  >
    {JSON.stringify(data, null, 2)}
  </pre>
);

// ─── 用户卡片模板 JSON（可序列化，可从服务端加载）────────────────────────────

/**
 * 模板定义：纯 JSON，不含任何逻辑代码
 * {{path}} 和 {{nested.path}} 在渲染时被替换为数据值
 */
const USER_CARD_TEMPLATE: JsonTemplateLayer[] = [
  // 背景
  { type: "rect", x: 0, y: 0, width: 240, height: 320, fillStyle: "{{theme.bg}}", radius: 12 },
  // 顶部高亮条
  { type: "rect", x: 0, y: 0, width: 240, height: 5, fillStyle: "{{theme.accent}}", radius: [12, 12, 0, 0] },
  // 头像外圈光晕
  { type: "circle", x: 120, y: 90, radius: 46, fillStyle: "{{theme.accent}}", globalAlpha: 0.15 },
  // 头像底色圆
  { type: "circle", x: 120, y: 90, radius: 38, fillStyle: "{{theme.accent}}" },
  // 头像首字
  {
    type: "text",
    text: "{{initials}}",
    x: 120,
    y: 90,
    fontSize: 30,
    fontWeight: "bold",
    fillStyle: "#fff",
    textAlign: "center",
    textBaseline: "middle",
  },
  // 用户名
  {
    type: "text",
    text: "{{username}}",
    x: 120,
    y: 154,
    fontSize: 18,
    fontWeight: "bold",
    fillStyle: "{{theme.text}}",
    textAlign: "center",
    textBaseline: "top",
  },
  // 职位
  {
    type: "text",
    text: "{{role}}",
    x: 120,
    y: 178,
    fontSize: 12,
    fillStyle: "{{theme.sub}}",
    textAlign: "center",
    textBaseline: "top",
  },
  // 分割线
  { type: "line", x1: 32, y1: 208, x2: 208, y2: 208, strokeStyle: "{{theme.divider}}", lineWidth: 1 },
  // 徽章背景
  { type: "rect", x: 80, y: 220, width: 80, height: 24, fillStyle: "{{badge.bg}}", radius: 12 },
  // 徽章文字
  {
    type: "text",
    text: "{{badge.label}}",
    x: 120,
    y: 232,
    fontSize: 11,
    fillStyle: "#fff",
    textAlign: "center",
    textBaseline: "middle",
  },
  // 统计标签
  { type: "text", text: "发帖", x: 56, y: 266, fontSize: 11, fillStyle: "{{theme.sub}}", textAlign: "center", textBaseline: "top" },
  { type: "text", text: "关注", x: 120, y: 266, fontSize: 11, fillStyle: "{{theme.sub}}", textAlign: "center", textBaseline: "top" },
  { type: "text", text: "获赞", x: 184, y: 266, fontSize: 11, fillStyle: "{{theme.sub}}", textAlign: "center", textBaseline: "top" },
  // 统计数值
  { type: "text", text: "{{stats.posts}}", x: 56, y: 282, fontSize: 16, fontWeight: "bold", fillStyle: "{{theme.text}}", textAlign: "center", textBaseline: "top" },
  { type: "text", text: "{{stats.followers}}", x: 120, y: 282, fontSize: 16, fontWeight: "bold", fillStyle: "{{theme.accent}}", textAlign: "center", textBaseline: "top" },
  { type: "text", text: "{{stats.likes}}", x: 184, y: 282, fontSize: 16, fontWeight: "bold", fillStyle: "{{theme.text}}", textAlign: "center", textBaseline: "top" },
];

// ─── 三组不同用户数据（模拟来自 API 的 JSON 响应）────────────────────────────

const USERS = [
  {
    username: "张  三",
    role: "高级工程师",
    initials: "张",
    joinDate: "2022-03-15",
    theme: {
      bg: "#1a1a2e",
      text: "#eee",
      sub: "#888",
      accent: "#e94560",
      divider: "#333",
    },
    badge: { label: "VIP 会员", bg: "#e94560" },
    stats: { posts: "128", followers: "3.2k", likes: "892" },
  },
  {
    username: "李  四",
    role: "产品设计师",
    initials: "李",
    joinDate: "2023-07-20",
    theme: {
      bg: "#0f3460",
      text: "#d6eaf8",
      sub: "#7fa8c9",
      accent: "#4da3ff",
      divider: "#1a4a7a",
    },
    badge: { label: "创作者", bg: "#1a4a7a" },
    stats: { posts: "56", followers: "1.8k", likes: "2.4k" },
  },
  {
    username: "王  五",
    role: "数据科学家",
    initials: "王",
    joinDate: "2021-11-03",
    theme: {
      bg: "#1b4332",
      text: "#d8f3dc",
      sub: "#95d5b2",
      accent: "#52b788",
      divider: "#2d6a4f",
    },
    badge: { label: "专家认证", bg: "#52b788" },
    stats: { posts: "347", followers: "12k", likes: "45k" },
  },
];

// ─── Demo 1：展示 JSON 模板结构 ───────────────────────────────────────────────

const TemplateJsonDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 1. 将 JSON 模板注册到 DrawPoster
    p.registerTemplate("userCard", createJsonTemplate(USER_CARD_TEMPLATE));

    // 2. 传入数据，createFromTemplate 替换所有 {{}} 占位符
    p.createFromTemplate("userCard", USERS[0]).forEach((l) => p.addLayer(l));

    p.render();
  }, []);

  return (
    <div>
      <div style={{ fontFamily: "sans-serif", fontSize: 12, color: "#666", marginBottom: 8 }}>
        模板 JSON（截取前 4 项）：
      </div>
      <JsonBlock data={USER_CARD_TEMPLATE.slice(0, 4)} />
      <div style={{ fontFamily: "sans-serif", fontSize: 12, color: "#666", marginBottom: 8 }}>
        数据 JSON：
      </div>
      <JsonBlock data={USERS[0]} />
      <canvas
        ref={ref}
        width={240}
        height={320}
        style={{ border: "1px solid #eee", borderRadius: 12, display: "block" }}
      />
    </div>
  );
};

// ─── Demo 2：同一模板，多份数据，多实例平铺 ───────────────────────────────────

const MultiInstanceDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const W = 800;
  const CARD_W = 240;
  const GAP = 20;

  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 注册一次模板
    p.registerTemplate("userCard", createJsonTemplate(USER_CARD_TEMPLATE));

    // 用不同数据 + offset 实例化三张卡片
    USERS.forEach((user, i) => {
      const offset = { x: GAP + i * (CARD_W + GAP), y: 20 };
      p.createFromTemplate("userCard", user, offset).forEach((l) => p.addLayer(l));
    });

    p.render();
  }, []);

  return (
    <canvas
      ref={ref}
      width={W}
      height={360}
      style={{ border: "1px solid #eee", borderRadius: 8, display: "block" }}
    />
  );
};

// ─── Demo 3：交互切换数据，同一模板重新渲染 ───────────────────────────────────

const InteractiveDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const pRef = useRef<ReturnType<typeof createDrawPoster> | null>(null);

  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    pRef.current = createDrawPoster(ctx, { ratio: 1 });
    pRef.current.registerTemplate("userCard", createJsonTemplate(USER_CARD_TEMPLATE));
  }, []);

  useEffect(() => {
    const p = pRef.current;
    if (!p) return;

    // 清空图层，重新填充数据
    p.getLayers().forEach((l) => l.id && p.removeLayer(l.id));
    const layers = p.createFromTemplate("userCard", USERS[activeIndex]);
    layers.forEach((l, i) => {
      l.id = `card-layer-${i}`;
      p.addLayer(l);
    });
    p.render();
  }, [activeIndex]);

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 16px",
    fontSize: 12,
    fontFamily: "sans-serif",
    cursor: "pointer",
    border: "none",
    borderRadius: 6,
    background: active ? "#e94560" : "#eee",
    color: active ? "#fff" : "#333",
    fontWeight: active ? 600 : 400,
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {USERS.map((u, i) => (
          <button key={i} style={btnStyle(activeIndex === i)} onClick={() => setActiveIndex(i)}>
            {u.username.trim()}
          </button>
        ))}
      </div>
      <canvas
        ref={ref}
        width={240}
        height={320}
        style={{ border: "1px solid #eee", borderRadius: 12, display: "block" }}
      />
      <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#999", marginTop: 8 }}>
        切换用户 → 同一模板，传入不同数据 JSON，重新 render()
      </div>
    </div>
  );
};

// ─── Story ────────────────────────────────────────────────────────────────────

const JsonTemplateDemo = () => (
  <div
    style={{
      padding: 32,
      fontFamily: "sans-serif",
      background: "#fafafa",
      minHeight: "100vh",
    }}
  >
    <h2 style={{ margin: "0 0 8px", color: "#222" }}>JSON 模板驱动渲染</h2>
    <p style={{ margin: "0 0 32px", fontSize: 13, color: "#666", lineHeight: 1.6 }}>
      通过 <code>createJsonTemplate(layers)</code> 将纯 JSON 数组转换为模板函数。
      <br />
      模板中的 <code>{"{{key}}"}</code> 和 <code>{"{{nested.key}}"}</code>{" "}
      占位符在渲染时自动替换为数据值，模板定义可序列化、可从服务端加载。
    </p>

    <Section
      title="1. JSON 模板结构展示"
      desc="模板 JSON + 数据 JSON → 渲染结果。两者均为纯 JSON，无逻辑代码"
    >
      <TemplateJsonDemo />
    </Section>

    <Section
      title="2. 同一模板 × 多份数据"
      desc="registerTemplate 注册一次，createFromTemplate + offset 实例化多张卡片"
    >
      <MultiInstanceDemo />
    </Section>

    <Section
      title="3. 交互切换数据"
      desc="切换数据 JSON → 清空图层 → createFromTemplate → render()，模板不变"
    >
      <InteractiveDemo />
    </Section>
  </div>
);

export default {
  title: "Core/14-JsonTemplate",
  component: JsonTemplateDemo,
};

export const Default = () => <JsonTemplateDemo />;

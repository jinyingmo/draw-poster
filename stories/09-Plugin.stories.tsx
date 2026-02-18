import React, { useEffect, useRef, useState } from "react";
import { createDrawPoster } from "../packages/core/src";
import type { DrawPosterPlugin, CanvasContext, Layer, DrawPosterOptions } from "../packages/core/src";

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

// ── 插件生命周期 onInit / beforeDraw / afterDraw ─────────────────────────
const LifecyclePluginDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const events: string[] = [];

    const logPlugin: DrawPosterPlugin = {
      name: "logger",
      onInit: (_ctx, _opts) => {
        events.push("[onInit] 插件已初始化，画布就绪");
      },
      beforeDraw: (_ctx, layers, _opts) => {
        events.push(`[beforeDraw] 即将渲染 ${layers.length} 个图层`);
      },
      afterDraw: (_ctx, layers, _opts) => {
        events.push(`[afterDraw] 渲染完成，共 ${layers.length} 个图层`);
        setLog([...events]);
      },
    };

    const p = createDrawPoster(ctx, {
      ratio: 1,
      plugins: [logPlugin],
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
      type: "rect",
      id: "r2",
      x: 160,
      y: 30,
      width: 100,
      height: 70,
      fillStyle: "#e74c3c",
      radius: 8,
    });
    p.addLayer({
      type: "text",
      id: "t1",
      text: "插件生命周期演示",
      x: W / 2,
      y: 120,
      fontSize: 14,
      color: "#555",
      textAlign: "center",
      textBaseline: "top",
    });

    p.render();
  }, []);

  return (
    <div>
      <canvas
        ref={ref}
        width={W}
        height={150}
        style={{ border: "1px solid #eee", background: "#fff", display: "block", marginBottom: 8 }}
      />
      <div
        style={{
          background: "#1e1e1e",
          color: "#d4d4d4",
          fontFamily: "monospace",
          fontSize: 12,
          padding: "12px 16px",
          borderRadius: 4,
          minHeight: 60,
          lineHeight: 1.7,
        }}
      >
        {log.length === 0 ? (
          <span style={{ color: "#6a9955" }}>// 等待插件日志...</span>
        ) : (
          log.map((line, i) => (
            <div key={i}>
              <span
                style={{
                  color: line.startsWith("[onInit]")
                    ? "#9cdcfe"
                    : line.startsWith("[beforeDraw]")
                    ? "#ce9178"
                    : "#4ec9b0",
                }}
              >
                {line}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ── 水印插件（afterDraw 钩子）────────────────────────────────────────────
const WatermarkPluginDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;

    // 水印插件：在每次渲染后绘制全局水印
    const watermarkPlugin: DrawPosterPlugin = {
      name: "watermark",
      afterDraw: (ctx: CanvasContext) => {
        const canvas = ctx.canvas as HTMLCanvasElement;
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = "#2c3e50";
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // 倾斜水印
        const step = 120;
        for (let y = 0; y < canvas.height; y += step) {
          for (let x = 0; x < canvas.width; x += step) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-Math.PI / 6);
            ctx.fillText("draw-poster", 0, 0);
            ctx.restore();
          }
        }
        ctx.restore();
      },
    };

    const p = createDrawPoster(ctx, { ratio: 1, plugins: [watermarkPlugin] });

    // 内容图层
    p.addLayer({
      type: "rect",
      x: 0,
      y: 0,
      width: W,
      height: 200,
      fillStyle: {
        type: "linear",
        x0: 0,
        y0: 0,
        x1: W,
        y1: 200,
        stops: [
          { offset: 0, color: "#ffecd2" },
          { offset: 1, color: "#fcb69f" },
        ],
      },
    });
    p.addLayer({
      type: "text",
      text: "受版权保护的内容",
      x: W / 2,
      y: 80,
      fontSize: 22,
      fontWeight: "bold",
      color: "#c0392b",
      textAlign: "center",
      textBaseline: "middle",
    });
    p.addLayer({
      type: "text",
      text: "水印由 afterDraw 插件钩子自动绘制",
      x: W / 2,
      y: 115,
      fontSize: 13,
      color: "#7f8c8d",
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
      style={{ border: "1px solid #eee" }}
    />
  );
};

// ── 背景插件（beforeDraw 钩子）────────────────────────────────────────────
const BackgroundPluginDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;

    // 背景插件：在每次渲染前绘制渐变背景
    const backgroundPlugin: DrawPosterPlugin = {
      name: "background",
      beforeDraw: (ctx: CanvasContext) => {
        const canvas = ctx.canvas as HTMLCanvasElement;
        const grad = (ctx as CanvasRenderingContext2D).createLinearGradient(
          0, 0, canvas.width, canvas.height
        );
        grad.addColorStop(0, "#667eea");
        grad.addColorStop(1, "#764ba2");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 装饰圆
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(canvas.width * 0.8, canvas.height * 0.2, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(canvas.width * 0.1, canvas.height * 0.8, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      },
    };

    const p = createDrawPoster(ctx, { ratio: 1, plugins: [backgroundPlugin] });

    p.addLayer({
      type: "text",
      text: "背景由 beforeDraw 插件提供",
      x: W / 2,
      y: 70,
      fontSize: 18,
      fontWeight: "bold",
      color: "#fff",
      textAlign: "center",
      textBaseline: "middle",
    });
    p.addLayer({
      type: "text",
      text: "插件在每次 render() 之前自动执行",
      x: W / 2,
      y: 100,
      fontSize: 13,
      color: "rgba(255,255,255,0.75)",
      textAlign: "center",
      textBaseline: "top",
    });

    p.render();
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={160}
      style={{ border: "1px solid #eee" }}
    />
  );
};

// ── 动态添加插件（use() API）────────────────────────────────────────────
const DynamicPluginDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [pluginCount, setPluginCount] = useState(0);
  const pRef = useRef<ReturnType<typeof createDrawPoster> | null>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });
    pRef.current = p;

    // 基础内容
    p.addLayer({
      type: "rect",
      x: 0,
      y: 0,
      width: W,
      height: 150,
      fillStyle: "#f8f9fa",
    });
    p.addLayer({
      type: "text",
      text: "已添加 0 个插件",
      id: "count-text",
      x: W / 2,
      y: 75,
      fontSize: 16,
      color: "#333",
      textAlign: "center",
      textBaseline: "middle",
    });
    p.render();
  }, []);

  const addPlugin = () => {
    const p = pRef.current!;
    const newCount = pluginCount + 1;

    const borderColors = ["#e74c3c", "#3498db", "#27ae60", "#f39c12", "#9b59b6"];
    const color = borderColors[(newCount - 1) % borderColors.length];

    const borderPlugin: DrawPosterPlugin = {
      name: `border-${newCount}`,
      afterDraw: (ctx: CanvasContext) => {
        const canvas = ctx.canvas as HTMLCanvasElement;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = newCount * 2;
        ctx.globalAlpha = 0.7;
        ctx.strokeRect(
          newCount * 4,
          newCount * 4,
          canvas.width - newCount * 8,
          canvas.height - newCount * 8,
        );
        ctx.restore();
      },
    };

    p.use(borderPlugin);
    setPluginCount(newCount);

    // 更新文字
    const layers = p.getLayers();
    const textLayer = layers.find((l) => l.id === "count-text") as any;
    if (textLayer) {
      textLayer.text = `已添加 ${newCount} 个插件`;
    }
    p.render();
  };

  return (
    <div>
      <button
        onClick={addPlugin}
        disabled={pluginCount >= 5}
        style={{
          padding: "6px 18px",
          fontSize: 13,
          cursor: pluginCount < 5 ? "pointer" : "not-allowed",
          background: "#3498db",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          fontFamily: "sans-serif",
          marginBottom: 8,
        }}
      >
        + 动态添加插件（use()）
      </button>
      <canvas
        ref={ref}
        width={W}
        height={150}
        style={{ border: "1px solid #eee", display: "block" }}
      />
      <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#999", marginTop: 4 }}>
        每次添加一个绘制边框的 afterDraw 插件，最多演示 5 个
      </div>
    </div>
  );
};

// ── Story ─────────────────────────────────────────────────────────────────────
const PluginDemo = () => (
  <div
    style={{
      padding: 32,
      fontFamily: "sans-serif",
      background: "#fafafa",
      minHeight: "100vh",
    }}
  >
    <h2 style={{ margin: "0 0 24px", color: "#222" }}>插件系统 Plugin System</h2>

    <Section
      title="插件生命周期 onInit / beforeDraw / afterDraw"
      desc="通过 plugins 选项传入，或使用 use() 动态注册"
    >
      <LifecyclePluginDemo />
    </Section>

    <Section
      title="beforeDraw 钩子 — 全局背景插件"
      desc="在每次 render() 前执行，适合绘制背景、清空特定区域等操作"
    >
      <BackgroundPluginDemo />
    </Section>

    <Section
      title="afterDraw 钩子 — 水印插件"
      desc="在每次 render() 后执行，适合添加水印、统计、UI 覆盖层等"
    >
      <WatermarkPluginDemo />
    </Section>

    <Section
      title="动态插件 poster.use()"
      desc="运行时动态注册插件，立即触发 onInit，之后所有 render() 都会执行"
    >
      <DynamicPluginDemo />
    </Section>
  </div>
);

export default {
  title: "Core/09-Plugin",
  component: PluginDemo,
};

export const Default = () => <PluginDemo />;

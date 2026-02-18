import React, { useEffect, useRef, useState } from "react";
import { createDrawPoster, ResourceManager } from "../packages/core/src";

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

/** 生成内存中的 data URL 图片（不需要网络） */
function makeDataUrl(color: string, label: string, w = 100, h = 100): string {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, w / 2, h / 2);
  return c.toDataURL();
}

// ── ResourceManager 预加载与缓存 ──────────────────────────────────────────
const ResourceManagerDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setLog([]);
    const events: string[] = [];

    const rm = new ResourceManager();

    // 准备 3 个 data URL 图片（模拟多图资源）
    const urls = [
      makeDataUrl("#e74c3c", "图片 A"),
      makeDataUrl("#3498db", "图片 B"),
      makeDataUrl("#27ae60", "图片 C"),
    ];

    events.push("开始预加载 3 张图片...");
    const t0 = performance.now();

    // 第一次加载（无缓存）
    await rm.preload(urls);
    const t1 = performance.now();
    events.push(`预加载完成，耗时: ${(t1 - t0).toFixed(1)} ms`);

    // 检查缓存
    urls.forEach((url, i) => {
      const cached = rm.get(url);
      events.push(
        `图片 ${["A", "B", "C"][i]}: ${cached ? `✅ 已缓存 (${cached.width}×${cached.height})` : "❌ 未缓存"}`,
      );
    });

    // 第二次加载（走缓存）
    const t2 = performance.now();
    await rm.preload(urls);
    const t3 = performance.now();
    events.push(`再次加载（命中缓存），耗时: ${(t3 - t2).toFixed(1)} ms`);

    // 在画布上绘制
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1, resourceManager: rm });

    urls.forEach((url, i) => {
      p.addLayer({
        type: "image",
        id: `img-${i}`,
        image: url,
        x: 20 + i * 120,
        y: 20,
        width: 100,
        height: 100,
        radius: 8,
      });
    });
    await p.render();

    events.push("已使用共享 ResourceManager 渲染图层（无重复加载）");
    setLog(events);
    setLoading(false);
  };

  useEffect(() => {
    run();
  }, []);

  return (
    <div>
      <canvas
        ref={ref}
        width={W}
        height={140}
        style={{ border: "1px solid #eee", background: "#f8f9fa", display: "block", marginBottom: 8 }}
      />
      <button
        onClick={run}
        disabled={loading}
        style={{
          padding: "5px 14px",
          fontSize: 12,
          cursor: loading ? "not-allowed" : "pointer",
          background: "#3498db",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          fontFamily: "sans-serif",
          marginBottom: 8,
        }}
      >
        {loading ? "加载中..." : "重新演示预加载"}
      </button>
      <div
        style={{
          background: "#1e1e1e",
          color: "#d4d4d4",
          fontFamily: "monospace",
          fontSize: 12,
          padding: "10px 14px",
          borderRadius: 4,
          lineHeight: 1.8,
          minHeight: 60,
        }}
      >
        {log.map((line, i) => (
          <div key={i}>
            <span
              style={{
                color: line.startsWith("开始") ? "#569cd6"
                  : line.includes("✅") ? "#4ec9b0"
                  : line.includes("❌") ? "#f44747"
                  : line.includes("缓存") ? "#ce9178"
                  : "#d4d4d4",
              }}
            >
              {line}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── 性能统计 stats ─────────────────────────────────────────────────────────
const PerformanceStatsDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<{
    renderTime: number;
    loadTime: number;
    layerCount: number;
  } | null>(null);
  const [layerCount, setLayerCount] = useState(10);

  const render = async (count: number) => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 添加背景
    p.addLayer({
      type: "rect",
      id: "bg",
      x: 0,
      y: 0,
      width: W,
      height: 200,
      fillStyle: "#f8f9fa",
    });

    // 随机图层
    const colors = ["#e74c3c", "#3498db", "#27ae60", "#f39c12", "#9b59b6", "#1abc9c"];
    for (let i = 0; i < count; i++) {
      const type = i % 3 === 0 ? "circle" : i % 3 === 1 ? "rect" : "text";
      const x = Math.random() * (W - 60) + 10;
      const y = Math.random() * 150 + 10;
      const color = colors[i % colors.length];

      if (type === "circle") {
        p.addLayer({
          type: "circle",
          id: `l${i}`,
          x,
          y,
          radius: 15 + Math.random() * 20,
          fillStyle: color + "88",
        });
      } else if (type === "rect") {
        p.addLayer({
          type: "rect",
          id: `l${i}`,
          x,
          y,
          width: 40 + Math.random() * 60,
          height: 20 + Math.random() * 40,
          fillStyle: color + "88",
          radius: 4,
        });
      } else {
        p.addLayer({
          type: "text",
          id: `l${i}`,
          text: `图层 ${i + 1}`,
          x,
          y,
          fontSize: 12,
          color,
        });
      }
    }

    await p.render();
    setStats({ ...p.stats });
  };

  useEffect(() => {
    render(layerCount);
  }, [layerCount]);

  return (
    <div>
      <div style={{ marginBottom: 8, display: "flex", gap: 12, alignItems: "center" }}>
        <label style={{ fontFamily: "sans-serif", fontSize: 12, color: "#555" }}>
          图层数量：
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={layerCount}
            onChange={(e) => setLayerCount(Number(e.target.value))}
            style={{ marginLeft: 8, width: 120 }}
          />
          {" "}{layerCount}
        </label>
        <button
          onClick={() => render(layerCount)}
          style={{
            padding: "4px 12px",
            fontSize: 12,
            cursor: "pointer",
            background: "#27ae60",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            fontFamily: "sans-serif",
          }}
        >
          重新渲染
        </button>
      </div>
      <canvas
        ref={ref}
        width={W}
        height={200}
        style={{ border: "1px solid #eee", display: "block", marginBottom: 8 }}
      />
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
          }}
        >
          {[
            { label: "图层数量", value: stats.layerCount, unit: "layers", color: "#3498db" },
            { label: "渲染耗时", value: stats.renderTime.toFixed(2), unit: "ms", color: "#e74c3c" },
            { label: "加载耗时", value: stats.loadTime.toFixed(2), unit: "ms", color: "#27ae60" },
          ].map(({ label, value, unit, color }) => (
            <div
              key={label}
              style={{
                background: "#fff",
                border: `2px solid ${color}`,
                borderRadius: 8,
                padding: "10px 14px",
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#999", marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 22, color, fontWeight: "bold" }}>
                {value}
              </div>
              <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#aaa" }}>
                {unit}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── OffscreenCanvas 离屏渲染 ────────────────────────────────────────────────
const OffscreenCanvasDemo = () => {
  const displayRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState("");
  const [info, setInfo] = useState("");

  const runOffscreen = async () => {
    if (typeof OffscreenCanvas === "undefined") {
      setInfo("当前环境不支持 OffscreenCanvas");
      return;
    }

    const offscreen = new OffscreenCanvas(300, 200);
    const offCtx = offscreen.getContext("2d")!;
    const p = createDrawPoster(offCtx as any, { ratio: 1 });

    // 在离屏 Canvas 上绘制
    p.drawRect({
      x: 0,
      y: 0,
      width: 300,
      height: 200,
      fillStyle: {
        type: "radial",
        x0: 150,
        y0: 100,
        r0: 0,
        x1: 150,
        y1: 100,
        r1: 150,
        stops: [
          { offset: 0, color: "#f6d365" },
          { offset: 1, color: "#fda085" },
        ],
      },
    });
    p.drawCircle({ x: 150, y: 100, radius: 60, fillStyle: "rgba(255,255,255,0.3)" });
    p.drawText({
      text: "OffscreenCanvas",
      x: 150,
      y: 90,
      fontSize: 18,
      fontWeight: "bold",
      color: "#fff",
      textAlign: "center",
      textBaseline: "middle",
    });
    p.drawText({
      text: "离屏渲染",
      x: 150,
      y: 115,
      fontSize: 13,
      color: "rgba(255,255,255,0.8)",
      textAlign: "center",
      textBaseline: "middle",
    });

    // 将离屏 canvas 转换为 Blob 并展示
    const blob = await offscreen.convertToBlob({ type: "image/png" });
    const url = URL.createObjectURL(blob);
    setResult(url);
    setInfo(`OffscreenCanvas 渲染完成，大小: ${(blob.size / 1024).toFixed(1)} KB`);

    // 也可以通过 transferToImageBitmap 绘制到普通 canvas
    const displayCtx = displayRef.current!.getContext("2d")!;
    const imageBitmap = await createImageBitmap(blob);
    displayCtx.clearRect(0, 0, 460, 200);
    displayCtx.drawImage(imageBitmap, 0, 0);
    imageBitmap.close();
  };

  useEffect(() => {
    runOffscreen();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
        <div>
          <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#999", marginBottom: 4 }}>
            OffscreenCanvas(300×200) → 绘制到普通 canvas
          </div>
          <canvas
            ref={displayRef}
            width={W}
            height={200}
            style={{ border: "1px solid #eee", display: "block" }}
          />
        </div>
        {result && (
          <div>
            <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#999", marginBottom: 4 }}>
              convertToBlob() → &lt;img&gt;
            </div>
            <img
              src={result}
              width={300}
              height={200}
              alt="offscreen"
              style={{ border: "1px solid #eee", display: "block" }}
            />
          </div>
        )}
      </div>
      {info && (
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "#555",
            padding: "6px 10px",
            background: "#f8f9fa",
            borderRadius: 4,
          }}
        >
          {info}
        </div>
      )}
    </div>
  );
};

// ── Story ─────────────────────────────────────────────────────────────────────
const ResourceDemo = () => (
  <div
    style={{
      padding: 32,
      fontFamily: "sans-serif",
      background: "#fafafa",
      minHeight: "100vh",
    }}
  >
    <h2 style={{ margin: "0 0 24px", color: "#222" }}>
      性能与资源 Performance & Resource
    </h2>

    <Section
      title="ResourceManager — 预加载与缓存"
      desc="preload() 批量预加载图片，load() 自动缓存，多个 DrawPoster 实例可共享同一 ResourceManager"
    >
      <ResourceManagerDemo />
    </Section>

    <Section
      title="性能统计 poster.stats"
      desc="每次 render() 后自动统计：渲染耗时、资源加载耗时、图层数量"
    >
      <PerformanceStatsDemo />
    </Section>

    <Section
      title="OffscreenCanvas 离屏渲染"
      desc="在 Worker 或主线程中使用 OffscreenCanvas，不阻塞 UI，渲染完成后转换为 Blob 或 ImageBitmap"
    >
      <OffscreenCanvasDemo />
    </Section>
  </div>
);

export default {
  title: "Core/12-Resource",
  component: ResourceDemo,
};

export const Default = () => <ResourceDemo />;

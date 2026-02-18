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

// ── 基础二维码 ────────────────────────────────────────────────────────────
const BasicQRCodeDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    p.drawQRCode({
      text: "https://github.com",
      x: 20,
      y: 20,
      width: 140,
      height: 140,
    }).then(() => {
      p.drawText({
        text: "默认样式",
        x: 90,
        y: 168,
        fontSize: 12,
        color: "#666",
        textAlign: "center",
        textBaseline: "top",
      });
    });

    // 带 margin
    p.drawQRCode({
      text: "https://github.com",
      x: 180,
      y: 20,
      width: 140,
      height: 140,
      margin: 4,
    }).then(() => {
      p.drawText({
        text: "margin: 4",
        x: 250,
        y: 168,
        fontSize: 12,
        color: "#666",
        textAlign: "center",
        textBaseline: "top",
      });
    });

    // 小尺寸
    p.drawQRCode({
      text: "draw-poster",
      x: 340,
      y: 40,
      width: 100,
      height: 100,
    }).then(() => {
      p.drawText({
        text: "100×100",
        x: 390,
        y: 148,
        fontSize: 12,
        color: "#666",
        textAlign: "center",
        textBaseline: "top",
      });
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={460}
      height={190}
      style={{ border: "1px solid #eee", background: "#fff" }}
    />
  );
};

// ── 纠错等级 ────────────────────────────────────────────────────────────────
const ErrorLevelDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    const levels: Array<"L" | "M" | "Q" | "H"> = ["L", "M", "Q", "H"];
    const colors = ["#3498db", "#27ae60", "#f39c12", "#e74c3c"];

    levels.forEach((level, i) => {
      const x = 10 + i * 115;
      p.drawQRCode({
        text: "draw-poster QR",
        x,
        y: 10,
        width: 100,
        height: 100,
        errorCorrectionLevel: level,
        margin: 2,
      }).then(() => {
        p.drawText({
          text: `纠错等级 ${level}`,
          x: x + 50,
          y: 115,
          fontSize: 12,
          color: colors[i],
          fontWeight: "bold",
          textAlign: "center",
          textBaseline: "top",
        });
        const desc = {
          L: "~7% 可还原",
          M: "~15% 可还原",
          Q: "~25% 可还原",
          H: "~30% 可还原",
        };
        p.drawText({
          text: desc[level],
          x: x + 50,
          y: 130,
          fontSize: 10,
          color: "#999",
          textAlign: "center",
          textBaseline: "top",
        });
      });
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={460}
      height={160}
      style={{ border: "1px solid #eee", background: "#fff" }}
    />
  );
};

// ── 自定义颜色 ────────────────────────────────────────────────────────────
const ColoredQRCodeDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    const colorConfigs = [
      {
        dark: "#e74c3c",
        light: "#fef9f9",
        label: "红色",
        bg: "#fff5f5",
      },
      {
        dark: "#2980b9",
        light: "#eaf4fb",
        label: "蓝色",
        bg: "#eaf4fb",
      },
      {
        dark: "#27ae60",
        light: "#f0faf4",
        label: "绿色",
        bg: "#f0faf4",
      },
      {
        dark: "#f39c12",
        light: "#1a1a1a",
        label: "暗底橙色",
        bg: "#1a1a1a",
      },
    ];

    colorConfigs.forEach(({ dark, light, label, bg }, i) => {
      const x = 10 + i * 115;
      // 背景
      p.drawRect({
        x,
        y: 10,
        width: 100,
        height: 100,
        fillStyle: bg,
        radius: 8,
      });
      p.drawQRCode({
        text: "draw-poster",
        x: x + 5,
        y: 15,
        width: 90,
        height: 90,
        errorCorrectionLevel: "M",
        margin: 1,
        color: { dark, light },
      }).then(() => {
        p.drawText({
          text: label,
          x: x + 50,
          y: 116,
          fontSize: 12,
          color: "#555",
          textAlign: "center",
          textBaseline: "top",
        });
      });
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={460}
      height={145}
      style={{ border: "1px solid #eee", background: "#f8f9fa" }}
    />
  );
};

// ── 二维码 + 海报组合 ────────────────────────────────────────────────────
const QRCodePosterDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    const W = 240;
    const H = 340;

    // 背景
    p.drawRect({
      x: 0,
      y: 0,
      width: W,
      height: H,
      fillStyle: {
        type: "linear",
        x0: 0,
        y0: 0,
        x1: W,
        y1: H,
        stops: [
          { offset: 0, color: "#2c3e50" },
          { offset: 1, color: "#3498db" },
        ],
      },
    });

    // 标题
    p.drawText({
      text: "扫码访问",
      x: W / 2,
      y: 24,
      fontSize: 20,
      fontWeight: "bold",
      color: "#fff",
      textAlign: "center",
      textBaseline: "top",
    });

    p.drawText({
      text: "draw-poster 示例",
      x: W / 2,
      y: 52,
      fontSize: 13,
      color: "rgba(255,255,255,0.7)",
      textAlign: "center",
      textBaseline: "top",
    });

    // 分割线
    p.drawLine({
      x1: 30,
      y1: 80,
      x2: W - 30,
      y2: 80,
      strokeStyle: "rgba(255,255,255,0.2)",
      lineWidth: 1,
    });

    // 二维码白色背景
    p.drawRect({
      x: 40,
      y: 96,
      width: 160,
      height: 160,
      fillStyle: "#fff",
      radius: 12,
    });

    // 二维码
    p.drawQRCode({
      text: "https://github.com",
      x: 52,
      y: 108,
      width: 136,
      height: 136,
      errorCorrectionLevel: "H",
      margin: 2,
      color: { dark: "#2c3e50", light: "#ffffff" },
    });

    // 底部说明
    p.drawText({
      text: "github.com",
      x: W / 2,
      y: 272,
      fontSize: 13,
      color: "rgba(255,255,255,0.9)",
      textAlign: "center",
      textBaseline: "top",
    });

    p.drawText({
      text: "长按或扫描二维码",
      x: W / 2,
      y: 292,
      fontSize: 11,
      color: "rgba(255,255,255,0.5)",
      textAlign: "center",
      textBaseline: "top",
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={240}
      height={340}
      style={{ border: "1px solid #eee" }}
    />
  );
};

// ── Story ─────────────────────────────────────────────────────────────────────
const QRCodeDemo = () => (
  <div
    style={{
      padding: 32,
      fontFamily: "sans-serif",
      background: "#fafafa",
      minHeight: "100vh",
    }}
  >
    <h2 style={{ margin: "0 0 24px", color: "#222" }}>二维码 QR Code</h2>

    <Section title="基础二维码 drawQRCode" desc="内容 / 尺寸 / 边距（margin）">
      <BasicQRCodeDemo />
    </Section>

    <Section
      title="纠错等级 errorCorrectionLevel"
      desc="L / M / Q / H，等级越高可还原率越高，图案越复杂"
    >
      <ErrorLevelDemo />
    </Section>

    <Section
      title="自定义颜色 color.dark / color.light"
      desc="前景色（深色模块）和背景色（浅色模块）均可自定义"
    >
      <ColoredQRCodeDemo />
    </Section>

    <Section title="二维码 + 海报组合">
      <QRCodePosterDemo />
    </Section>
  </div>
);

export default {
  title: "Core/08-QRCode",
  component: QRCodeDemo,
};

export const Default = () => <QRCodeDemo />;

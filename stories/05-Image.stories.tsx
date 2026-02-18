import React, { useEffect, useRef, useState } from "react";
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

const W = 500;

/** 创建一个纯色图像的 data URL，用于演示 */
function makeColorImage(
  color: string,
  w = 120,
  h = 100,
  label = "",
): string {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const cx = c.getContext("2d")!;
  cx.fillStyle = color;
  cx.fillRect(0, 0, w, h);
  if (label) {
    cx.fillStyle = "rgba(255,255,255,0.9)";
    cx.font = "bold 14px sans-serif";
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillText(label, w / 2, h / 2);
  }
  return c.toDataURL();
}

/** 创建带有图案的演示图像 */
function makeGradientImage(w = 120, h = 100): string {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const cx = c.getContext("2d")!;
  const g = cx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#4facfe");
  g.addColorStop(1, "#00f2fe");
  cx.fillStyle = g;
  cx.fillRect(0, 0, w, h);
  cx.fillStyle = "rgba(255,255,255,0.8)";
  cx.font = "bold 12px sans-serif";
  cx.textAlign = "center";
  cx.textBaseline = "middle";
  cx.fillText("GRADIENT", w / 2, h / 2);
  return c.toDataURL();
}

/** 创建九宫格测试图像（带明显边框）*/
function makeScale9Image(w = 60, h = 60): string {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const cx = c.getContext("2d")!;
  // 背景
  cx.fillStyle = "#dfe6e9";
  cx.fillRect(0, 0, w, h);
  // 边框区域
  cx.strokeStyle = "#2d3436";
  cx.lineWidth = 2;
  cx.strokeRect(1, 1, w - 2, h - 2);
  // 角标记
  cx.fillStyle = "#e17055";
  cx.fillRect(0, 0, 15, 15);
  cx.fillRect(w - 15, 0, 15, 15);
  cx.fillRect(0, h - 15, 15, 15);
  cx.fillRect(w - 15, h - 15, 15, 15);
  // 中心
  cx.fillStyle = "#74b9ff";
  cx.fillRect(15, 15, w - 30, h - 30);
  return c.toDataURL();
}

// ── 基础图像绘制 & 圆角 ────────────────────────────────────────────────────
const BasicImageDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    const img1 = makeColorImage("#e74c3c", 110, 90, "普通图片");
    const img2 = makeGradientImage(110, 90);

    // 普通图片
    p.drawImage({ source: img1, x: 10, y: 10, width: 110, height: 90 }).then(
      () => {
        p.drawText({
          text: "普通",
          x: 65,
          y: 108,
          fontSize: 11,
          color: "#666",
          textAlign: "center",
          textBaseline: "top",
        });
      },
    );

    // 圆角矩形 - 统一圆角
    p.drawImage({
      source: img2,
      x: 140,
      y: 10,
      width: 110,
      height: 90,
      radius: 16,
    }).then(() => {
      p.drawText({
        text: "radius: 16",
        x: 195,
        y: 108,
        fontSize: 11,
        color: "#666",
        textAlign: "center",
        textBaseline: "top",
      });
    });

    // 圆角 - 分别控制四角
    const img3 = makeColorImage("#27ae60", 110, 90, "四角各异");
    p.drawImage({
      source: img3,
      x: 270,
      y: 10,
      width: 110,
      height: 90,
      radius: [24, 0, 24, 0],
    }).then(() => {
      p.drawText({
        text: "[24,0,24,0]",
        x: 325,
        y: 108,
        fontSize: 11,
        color: "#666",
        textAlign: "center",
        textBaseline: "top",
      });
    });

    // 圆形（radius = min(w,h)/2）
    const img4 = makeColorImage("#9b59b6", 90, 90, "圆形");
    p.drawImage({
      source: img4,
      x: 400,
      y: 10,
      width: 90,
      height: 90,
      radius: 45,
    }).then(() => {
      p.drawText({
        text: "radius: 45",
        x: 445,
        y: 108,
        fontSize: 11,
        color: "#666",
        textAlign: "center",
        textBaseline: "top",
      });
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={128}
      style={{ border: "1px solid #eee", background: "#fff" }}
    />
  );
};

// ── 旋转 & 透明度 ────────────────────────────────────────────────────────────
const RotateOpacityDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    const imgA = makeColorImage("#f39c12", 100, 80, "旋转");
    const imgB = makeColorImage("#3498db", 100, 80, "透明度");

    // 旋转 15度
    p.drawImage({
      source: imgA,
      x: 40,
      y: 30,
      width: 100,
      height: 80,
      rotate: Math.PI / 12,
    }).then(() =>
      p.drawText({
        text: "rotate: π/12",
        x: 90,
        y: 125,
        fontSize: 11,
        color: "#666",
        textAlign: "center",
        textBaseline: "top",
      }),
    );

    // 旋转 45度
    p.drawImage({
      source: imgA,
      x: 180,
      y: 30,
      width: 100,
      height: 80,
      rotate: Math.PI / 4,
    }).then(() =>
      p.drawText({
        text: "rotate: π/4",
        x: 230,
        y: 125,
        fontSize: 11,
        color: "#666",
        textAlign: "center",
        textBaseline: "top",
      }),
    );

    // 透明度 0.5
    p.drawImage({
      source: imgB,
      x: 320,
      y: 30,
      width: 100,
      height: 80,
      globalAlpha: 0.5,
    }).then(() =>
      p.drawText({
        text: "opacity: 0.5",
        x: 370,
        y: 125,
        fontSize: 11,
        color: "#666",
        textAlign: "center",
        textBaseline: "top",
      }),
    );

    // 透明度 0.2
    p.drawImage({
      source: imgB,
      x: 440,
      y: 30,
      width: 100,
      height: 80,
      globalAlpha: 0.2,
    }).then(() =>
      p.drawText({
        text: "opacity: 0.2",
        x: 490,
        y: 125,
        fontSize: 11,
        color: "#666",
        textAlign: "center",
        textBaseline: "top",
      }),
    );
  }, []);
  return (
    <canvas
      ref={ref}
      width={600}
      height={145}
      style={{ border: "1px solid #eee", background: "#f0f0f0" }}
    />
  );
};

// ── 滤镜 & 混合模式 ────────────────────────────────────────────────────────
const FilterBlendDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    const img = makeGradientImage(100, 90);

    // 原始
    p.drawImage({ source: img, x: 10, y: 10, width: 100, height: 90 });
    p.drawText({
      text: "原始",
      x: 60,
      y: 106,
      fontSize: 11,
      color: "#666",
      textAlign: "center",
      textBaseline: "top",
    });

    // 模糊滤镜
    p.drawImage({
      source: img,
      x: 130,
      y: 10,
      width: 100,
      height: 90,
      filter: "blur(4px)",
    }).then(() =>
      p.drawText({
        text: "blur(4px)",
        x: 180,
        y: 106,
        fontSize: 11,
        color: "#666",
        textAlign: "center",
        textBaseline: "top",
      }),
    );

    // 灰度滤镜
    p.drawImage({
      source: img,
      x: 250,
      y: 10,
      width: 100,
      height: 90,
      filter: "grayscale(100%)",
    }).then(() =>
      p.drawText({
        text: "grayscale(100%)",
        x: 300,
        y: 106,
        fontSize: 11,
        color: "#666",
        textAlign: "center",
        textBaseline: "top",
      }),
    );

    // 亮度/对比度
    p.drawImage({
      source: img,
      x: 370,
      y: 10,
      width: 100,
      height: 90,
      filter: "brightness(1.5) contrast(1.3)",
    }).then(() =>
      p.drawText({
        text: "brightness+contrast",
        x: 420,
        y: 106,
        fontSize: 10,
        color: "#666",
        textAlign: "center",
        textBaseline: "top",
      }),
    );

    // 混合模式演示（叠加两个矩形）
    p.drawRect({
      x: 10,
      y: 135,
      width: 150,
      height: 100,
      fillStyle: "#3498db",
    });
    p.drawRect({
      x: 80,
      y: 155,
      width: 150,
      height: 100,
      fillStyle: "#e74c3c",
      globalCompositeOperation: "multiply",
    });
    p.drawText({
      text: "multiply 混合",
      x: 115,
      y: 265,
      fontSize: 11,
      color: "#666",
      textAlign: "center",
      textBaseline: "top",
    });

    p.drawRect({
      x: 270,
      y: 135,
      width: 150,
      height: 100,
      fillStyle: "#27ae60",
    });
    p.drawRect({
      x: 340,
      y: 155,
      width: 150,
      height: 100,
      fillStyle: "#f1c40f",
      globalCompositeOperation: "screen",
    });
    p.drawText({
      text: "screen 混合",
      x: 380,
      y: 265,
      fontSize: 11,
      color: "#666",
      textAlign: "center",
      textBaseline: "top",
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={285}
      style={{ border: "1px solid #eee", background: "#fff" }}
    />
  );
};

// ── 图像裁剪 crop ────────────────────────────────────────────────────────────
const ImageCropDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 创建 200x200 带格子的源图像
    const c = document.createElement("canvas");
    c.width = 200;
    c.height = 200;
    const cx2 = c.getContext("2d")!;
    const colors = ["#e74c3c", "#3498db", "#27ae60", "#f39c12"];
    const labels = ["左上", "右上", "左下", "右下"];
    [[0, 0], [100, 0], [0, 100], [100, 100]].forEach(([ox, oy], i) => {
      cx2.fillStyle = colors[i];
      cx2.fillRect(ox, oy, 100, 100);
      cx2.fillStyle = "rgba(255,255,255,0.8)";
      cx2.font = "bold 18px sans-serif";
      cx2.textAlign = "center";
      cx2.textBaseline = "middle";
      cx2.fillText(labels[i], ox + 50, oy + 50);
    });
    const srcUrl = c.toDataURL();

    // 展示原始图像
    p.drawText({
      text: "源图 200×200",
      x: 5,
      y: 3,
      fontSize: 11,
      color: "#666",
      textBaseline: "top",
    });
    p.drawImage({ source: srcUrl, x: 5, y: 20, width: 200, height: 200 });

    // 裁剪左上角
    p.drawText({
      text: "裁剪左上 (0,0,100,100)",
      x: 225,
      y: 3,
      fontSize: 11,
      color: "#666",
      textBaseline: "top",
    });
    p.drawImage({
      source: srcUrl,
      x: 225,
      y: 20,
      width: 120,
      height: 120,
      crop: { sx: 0, sy: 0, sw: 100, sh: 100 },
    });

    // 裁剪右下角
    p.drawText({
      text: "裁剪右下 (100,100,100,100)",
      x: 365,
      y: 3,
      fontSize: 11,
      color: "#666",
      textBaseline: "top",
    });
    p.drawImage({
      source: srcUrl,
      x: 365,
      y: 20,
      width: 120,
      height: 120,
      crop: { sx: 100, sy: 100, sw: 100, sh: 100 },
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={230}
      style={{ border: "1px solid #eee", background: "#f8f9fa" }}
    />
  );
};

// ── 九宫格拉伸 scale9Grid ───────────────────────────────────────────────────
const Scale9GridDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    const s9Url = makeScale9Image(60, 60);

    p.drawText({
      text: "源图 60×60",
      x: 10,
      y: 3,
      fontSize: 11,
      color: "#666",
      textBaseline: "top",
    });
    p.drawImage({ source: s9Url, x: 10, y: 20, width: 60, height: 60 });

    p.drawText({
      text: "scale9Grid [15,15,15,15] → 200×80",
      x: 90,
      y: 3,
      fontSize: 11,
      color: "#666",
      textBaseline: "top",
    });
    p.drawImage({
      source: s9Url,
      x: 90,
      y: 20,
      width: 200,
      height: 80,
      scale9Grid: [15, 15, 15, 15],
    });

    p.drawText({
      text: "scale9Grid → 300×50",
      x: 310,
      y: 3,
      fontSize: 11,
      color: "#666",
      textBaseline: "top",
    });
    p.drawImage({
      source: s9Url,
      x: 310,
      y: 20,
      width: 185,
      height: 50,
      scale9Grid: [15, 15, 15, 15],
    });
  }, []);
  return (
    <canvas
      ref={ref}
      width={W}
      height={100}
      style={{ border: "1px solid #eee", background: "#fff" }}
    />
  );
};

// ── Story ─────────────────────────────────────────────────────────────────────
const ImageDemo = () => (
  <div
    style={{
      padding: 32,
      fontFamily: "sans-serif",
      background: "#fafafa",
      minHeight: "100vh",
    }}
  >
    <h2 style={{ margin: "0 0 24px", color: "#222" }}>图像处理 Image</h2>

    <Section title="基础绘制 & 圆角 radius — 统一 / 四角各异 / 圆形">
      <BasicImageDemo />
    </Section>

    <Section title="旋转 rotate & 透明度 globalAlpha">
      <RotateOpacityDemo />
    </Section>

    <Section title="滤镜 filter & 混合模式 globalCompositeOperation">
      <FilterBlendDemo />
    </Section>

    <Section title="图像裁剪 crop — 指定源区域映射到目标区域">
      <ImageCropDemo />
    </Section>

    <Section title="九宫格拉伸 scale9Grid — 保持边角不变形">
      <Scale9GridDemo />
    </Section>
  </div>
);

export default {
  title: "Core/05-Image",
  component: ImageDemo,
};

export const Default = () => <ImageDemo />;

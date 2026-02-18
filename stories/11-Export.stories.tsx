import React, { useEffect, useRef, useState } from "react";
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

/** 绘制演示海报内容 */
const drawPosterContent = (
  p: ReturnType<typeof createDrawPoster>,
  w: number,
  h: number,
) => {
  // 背景
  p.drawRect({
    x: 0,
    y: 0,
    width: w,
    height: h,
    fillStyle: {
      type: "linear",
      x0: 0,
      y0: 0,
      x1: w,
      y1: h,
      stops: [
        { offset: 0, color: "#4facfe" },
        { offset: 1, color: "#00f2fe" },
      ],
    },
  });
  // 内容
  p.drawCircle({ x: w / 2, y: h * 0.38, radius: 50, fillStyle: "#fff" });
  p.drawText({
    text: "🎨",
    x: w / 2,
    y: h * 0.38,
    fontSize: 36,
    textAlign: "center",
    textBaseline: "middle",
  });
  p.drawText({
    text: "draw-poster",
    x: w / 2,
    y: h * 0.62,
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    textBaseline: "middle",
  });
  p.drawText({
    text: "Canvas 海报绘制库",
    x: w / 2,
    y: h * 0.75,
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    textBaseline: "middle",
  });
};

const W = 200;
const H = 160;

// ── exportDataURL ─────────────────────────────────────────────────────────
const ExportDataURLDemo = () => {
  const srcRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState("");
  const [quality, setQuality] = useState(0.9);
  const [mimeType, setMimeType] = useState("image/png");
  const [info, setInfo] = useState("");

  const draw = () => {
    const ctx = srcRef.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });
    drawPosterContent(p, W, H);

    const url = p.exportDataURL(mimeType, quality);
    setDataUrl(url);

    // 估算大小
    const base64 = url.split(",")[1] || "";
    const bytes = Math.ceil((base64.length * 3) / 4);
    setInfo(
      `格式: ${mimeType} | 质量: ${mimeType === "image/jpeg" ? quality : "N/A"} | 大小: ~${(bytes / 1024).toFixed(1)} KB`,
    );
  };

  useEffect(() => {
    draw();
  }, [mimeType, quality]);

  return (
    <div>
      <div style={{ marginBottom: 8, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ fontFamily: "sans-serif", fontSize: 12, color: "#555" }}>
          格式：
          <select
            value={mimeType}
            onChange={(e) => setMimeType(e.target.value)}
            style={{ marginLeft: 4, fontSize: 12 }}
          >
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WebP</option>
          </select>
        </label>
        {mimeType !== "image/png" && (
          <label style={{ fontFamily: "sans-serif", fontSize: 12, color: "#555" }}>
            质量：
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              style={{ marginLeft: 4, width: 100 }}
            />
            {" "}{quality.toFixed(2)}
          </label>
        )}
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#999", marginBottom: 4 }}>
            源 Canvas
          </div>
          <canvas
            ref={srcRef}
            width={W}
            height={H}
            style={{ border: "1px solid #eee", display: "block" }}
          />
        </div>
        {dataUrl && (
          <div>
            <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#999", marginBottom: 4 }}>
              exportDataURL() → &lt;img&gt;
            </div>
            <img
              src={dataUrl}
              width={W}
              height={H}
              alt="exported"
              style={{ border: "1px solid #eee", display: "block" }}
            />
          </div>
        )}
        {dataUrl && (
          <div>
            <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#999", marginBottom: 4 }}>
              下载
            </div>
            <a
              href={dataUrl}
              download={`poster.${mimeType.split("/")[1]}`}
              style={{
                display: "inline-block",
                padding: "8px 16px",
                background: "#3498db",
                color: "#fff",
                borderRadius: 4,
                textDecoration: "none",
                fontSize: 12,
                fontFamily: "sans-serif",
              }}
            >
              💾 下载图片
            </a>
          </div>
        )}
      </div>
      {info && (
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "#555",
            marginTop: 8,
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

// ── exportBlob ────────────────────────────────────────────────────────────
const ExportBlobDemo = () => {
  const srcRef = useRef<HTMLCanvasElement>(null);
  const [blobUrl, setBlobUrl] = useState("");
  const [info, setInfo] = useState("");
  const [status, setStatus] = useState("点击按钮导出 Blob");

  useEffect(() => {
    const ctx = srcRef.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });
    drawPosterContent(p, W, H);
  }, []);

  const doExportBlob = async () => {
    setStatus("导出中...");
    if (blobUrl) URL.revokeObjectURL(blobUrl);

    const ctx = srcRef.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });
    drawPosterContent(p, W, H);

    const blob = await p.exportBlob("image/png");
    if (!blob) {
      setStatus("导出失败");
      return;
    }

    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    setInfo(
      `Blob 大小: ${(blob.size / 1024).toFixed(1)} KB | 类型: ${blob.type}`,
    );
    setStatus("导出成功！");
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#999", marginBottom: 4 }}>
            源 Canvas
          </div>
          <canvas
            ref={srcRef}
            width={W}
            height={H}
            style={{ border: "1px solid #eee", display: "block" }}
          />
        </div>
        {blobUrl && (
          <div>
            <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#999", marginBottom: 4 }}>
              exportBlob() → Blob URL → &lt;img&gt;
            </div>
            <img
              src={blobUrl}
              width={W}
              height={H}
              alt="blob export"
              style={{ border: "1px solid #eee", display: "block" }}
            />
          </div>
        )}
      </div>
      <button
        onClick={doExportBlob}
        style={{
          padding: "6px 18px",
          fontSize: 13,
          cursor: "pointer",
          background: "#27ae60",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          fontFamily: "sans-serif",
        }}
      >
        exportBlob()
      </button>
      <span
        style={{
          marginLeft: 12,
          fontFamily: "sans-serif",
          fontSize: 12,
          color: "#555",
        }}
      >
        {status}
      </span>
      {info && (
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "#555",
            marginTop: 8,
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

// ── exportImageData ───────────────────────────────────────────────────────
const ExportImageDataDemo = () => {
  const srcRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [info, setInfo] = useState("");

  useEffect(() => {
    const ctx = srcRef.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });
    drawPosterContent(p, W, H);
  }, []);

  const doExportImageData = () => {
    const ctx = srcRef.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });
    drawPosterContent(p, W, H);

    // 导出全部 ImageData
    const imageData = p.exportImageData();

    // 导出局部区域
    const cropData = p.exportImageData([40, 30, 120, 100]);

    // 在预览 canvas 上重绘
    const previewCtx = previewRef.current!.getContext("2d")!;
    previewCtx.clearRect(0, 0, W, H);
    // 将 cropData 放置到预览画布
    previewCtx.putImageData(cropData, 0, 0);

    const totalPixels = imageData.width * imageData.height;
    const cropPixels = cropData.width * cropData.height;
    setInfo(
      `全图: ${imageData.width}×${imageData.height} (${totalPixels.toLocaleString()} 像素)\n` +
      `裁剪区域 [40,30,120,100]: ${cropData.width}×${cropData.height} (${cropPixels.toLocaleString()} 像素)`,
    );
  };

  useEffect(() => {
    doExportImageData();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#999", marginBottom: 4 }}>
            源 Canvas (200×160)
          </div>
          <canvas
            ref={srcRef}
            width={W}
            height={H}
            style={{ border: "1px solid #eee", display: "block" }}
          />
        </div>
        <div>
          <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#999", marginBottom: 4 }}>
            exportImageData([40,30,120,100]) → putImageData
          </div>
          <canvas
            ref={previewRef}
            width={120}
            height={100}
            style={{ border: "2px dashed #3498db", display: "block" }}
          />
        </div>
      </div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: "#555",
          padding: "6px 10px",
          background: "#f8f9fa",
          borderRadius: 4,
          whiteSpace: "pre",
        }}
      >
        {info}
      </div>
    </div>
  );
};

// ── 画布变换（save/restore/transform）─────────────────────────────────────
const TransformDemo = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    const p = createDrawPoster(ctx, { ratio: 1 });

    // 原始矩形
    p.drawRect({
      x: 20,
      y: 20,
      width: 80,
      height: 60,
      fillStyle: "#3498db",
      radius: 4,
    });
    p.drawText({
      text: "原始",
      x: 60,
      y: 55,
      fontSize: 12,
      color: "#fff",
      textAlign: "center",
      textBaseline: "middle",
    });

    // 平移
    p.save();
    p.transform({ translateX: 140, translateY: 0 });
    p.drawRect({ x: 20, y: 20, width: 80, height: 60, fillStyle: "#e74c3c", radius: 4 });
    p.drawText({ text: "translate", x: 60, y: 55, fontSize: 12, color: "#fff", textAlign: "center", textBaseline: "middle" });
    p.restore();

    // 旋转（绕中心）
    p.save();
    p.transform({ translateX: 290, translateY: 50, rotate: Math.PI / 6 });
    p.drawRect({ x: -40, y: -30, width: 80, height: 60, fillStyle: "#27ae60", radius: 4 });
    p.drawText({ text: "rotate π/6", x: 0, y: 0, fontSize: 11, color: "#fff", textAlign: "center", textBaseline: "middle" });
    p.restore();

    // 缩放
    p.save();
    p.transform({ translateX: 370, translateY: 20, scaleX: 1.5, scaleY: 0.7 });
    p.drawRect({ x: 0, y: 0, width: 60, height: 60, fillStyle: "#f39c12", radius: 4 });
    p.drawText({ text: "scale", x: 30, y: 30, fontSize: 12, color: "#fff", textAlign: "center", textBaseline: "middle" });
    p.restore();

    // 组合变换
    p.save();
    p.transform({ translateX: 140, translateY: 100, rotate: Math.PI / 8, scaleX: 1.2, scaleY: 1.2 });
    p.drawRect({ x: -40, y: -30, width: 80, height: 60, fillStyle: "#9b59b6", radius: 4 });
    p.drawText({ text: "组合", x: 0, y: 0, fontSize: 12, color: "#fff", textAlign: "center", textBaseline: "middle" });
    p.restore();
  }, []);
  return (
    <canvas
      ref={ref}
      width={460}
      height={180}
      style={{ border: "1px solid #eee", background: "#f8f9fa" }}
    />
  );
};

// ── Story ─────────────────────────────────────────────────────────────────────
const ExportDemo = () => (
  <div
    style={{
      padding: 32,
      fontFamily: "sans-serif",
      background: "#fafafa",
      minHeight: "100vh",
    }}
  >
    <h2 style={{ margin: "0 0 24px", color: "#222" }}>导出能力 & 画布变换 Export</h2>

    <Section
      title="exportDataURL() — 导出为 Data URL"
      desc="支持 PNG / JPEG / WebP 格式，JPEG 和 WebP 可控制质量（0.1 ~ 1.0）"
    >
      <ExportDataURLDemo />
    </Section>

    <Section
      title="exportBlob() — 导出为 Blob 对象"
      desc="适合上传服务器或通过 createObjectURL 创建临时预览"
    >
      <ExportBlobDemo />
    </Section>

    <Section
      title="exportImageData() — 导出原始像素数据"
      desc="返回 ImageData 对象，可指定 [x, y, width, height] 只导出局部区域"
    >
      <ExportImageDataDemo />
    </Section>

    <Section
      title="画布变换 save / restore / transform"
      desc="translate / rotate / scale 可组合使用，save/restore 保护上下文状态"
    >
      <TransformDemo />
    </Section>
  </div>
);

export default {
  title: "Core/11-Export",
  component: ExportDemo,
};

export const Default = () => <ExportDemo />;

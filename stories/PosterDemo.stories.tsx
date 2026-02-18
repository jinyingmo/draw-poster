import React, { useEffect, useRef, useState } from "react";
import createDrawPoster from "../packages/core/src";

const PosterDemo = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#111";
    ctx.font = "16px sans-serif";
    const drawPoster = createDrawPoster(ctx, { ratio: 1 });
    drawPoster.wrapText(
      "draw-poster 提供的 wrapText 能力演示：超过宽度自动换行与省略",
      12,
      28,
      276,
      20,
      3,
    );
    drawPoster.resizeImage("#f5f5f5", 200, 120, "12").then(setImageDataUrl);
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <canvas ref={canvasRef} width={300} height={120} />
        {imageDataUrl ? (
          <img
            src={imageDataUrl}
            alt="resizeImage result"
            width={200}
            height={120}
          />
        ) : null}
      </div>
    </div>
  );
};

export default {
  title: "Core/PosterDemo",
  component: PosterDemo,
};

export const Default = () => <PosterDemo />;

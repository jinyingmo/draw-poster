"use client";

import { useEffect, useRef } from "react";

interface RulerProps {
  length: number;
  orientation: "horizontal" | "vertical";
  offset?: number;
}

export default function Ruler({ length, orientation, offset = 0 }: RulerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 20;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = orientation === "horizontal" ? length : size;
    const h = orientation === "horizontal" ? size : length;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#9ca3af";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const step = 10;
    const longStep = 50;

    if (orientation === "horizontal") {
      ctx.beginPath();
      for (let i = 0; i <= length; i += step) {
        const x = i + offset;
        if (x < 0 || x > length) continue;
        const isLong = i % longStep === 0;
        const tickH = isLong ? 12 : 6;
        ctx.moveTo(x + 0.5, size - tickH);
        ctx.lineTo(x + 0.5, size);
        if (isLong) {
          ctx.fillText(i.toString(), x + 2, 0);
        }
      }
      ctx.stroke();
    } else {
      ctx.beginPath();
      for (let i = 0; i <= length; i += step) {
        const y = i + offset;
        if (y < 0 || y > length) continue;
        const isLong = i % longStep === 0;
        const tickW = isLong ? 12 : 6;
        ctx.moveTo(size - tickW, y + 0.5);
        ctx.lineTo(size, y + 0.5);
        if (isLong) {
          ctx.save();
          ctx.translate(0, y + 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(i.toString(), 0, 0);
          ctx.restore();
        }
      }
      ctx.stroke();
    }
  }, [length, orientation, offset]);

  return <canvas ref={canvasRef} />;
}

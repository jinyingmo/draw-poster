import React, { useEffect, useRef } from "react";
import createDrawPoster from "../packages/core/src";

const Poster2026Demo = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = 360;
    const height = 520;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    const poster = createDrawPoster(ctx, { ratio: 1 });

    const bg = ctx.createRadialGradient(width / 2, height * 0.35, 20, width / 2, height / 2, height);
    bg.addColorStop(0, "#ff5a48");
    bg.addColorStop(0.5, "#e31f1f");
    bg.addColorStop(1, "#b90d12");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    poster.drawRect({
      x: 8,
      y: 8,
      width: width - 16,
      height: height - 16,
      strokeStyle: "#f8d57a",
      lineWidth: 2
    });

    const drawCorner = (x: number, y: number, dirX: number, dirY: number) => {
      poster.drawLine({ x1: x, y1: y, x2: x + 20 * dirX, y2: y, strokeStyle: "#f8d57a", lineWidth: 2 });
      poster.drawLine({ x1: x, y1: y, x2: x, y2: y + 20 * dirY, strokeStyle: "#f8d57a", lineWidth: 2 });
      poster.drawLine({
        x1: x + 24 * dirX,
        y1: y,
        x2: x + 24 * dirX,
        y2: y + 24 * dirY,
        strokeStyle: "#f8d57a",
        lineWidth: 2
      });
      poster.drawLine({
        x1: x,
        y1: y + 24 * dirY,
        x2: x + 24 * dirX,
        y2: y + 24 * dirY,
        strokeStyle: "#f8d57a",
        lineWidth: 2
      });
    };

    drawCorner(16, 16, 1, 1);
    drawCorner(width - 16, 16, -1, 1);
    drawCorner(16, height - 16, 1, -1);
    drawCorner(width - 16, height - 16, -1, -1);

    poster.drawText({
      text: "恭贺2026新春",
      x: width / 2,
      y: 36,
      fontSize: 34,
      fontWeight: "700",
      fontFamily: "serif",
      textAlign: "center",
      textBaseline: "top",
      color: "#ffe9b5",
      strokeStyle: "#b40f16",
      lineWidth: 4,
      shadowColor: "rgba(0,0,0,0.15)",
      shadowBlur: 6,
      strokeText: true
    });

    const drawFirework = (cx: number, cy: number, radius: number, color: string) => {
      for (let i = 0; i < 12; i += 1) {
        const angle = (Math.PI * 2 * i) / 12;
        poster.drawLine({
          x1: cx,
          y1: cy,
          x2: cx + Math.cos(angle) * radius,
          y2: cy + Math.sin(angle) * radius,
          strokeStyle: color,
          lineWidth: 2
        });
      }
      poster.drawCircle({ x: cx, y: cy, radius: 4, fillStyle: color });
    };

    drawFirework(80, 140, 28, "#ffcc6b");
    drawFirework(270, 150, 22, "#ffd26f");

    poster.drawCircle({ x: 180, y: 340, radius: 95, fillStyle: "#ffe9cc" });
    poster.drawCircle({ x: 180, y: 280, radius: 70, fillStyle: "#ffe9cc" });
    poster.drawCircle({ x: 180, y: 315, radius: 45, fillStyle: "#ffd9b3" });

    poster.drawCircle({ x: 155, y: 280, radius: 10, fillStyle: "#4a2416" });
    poster.drawCircle({ x: 205, y: 280, radius: 10, fillStyle: "#4a2416" });
    poster.drawCircle({ x: 155, y: 276, radius: 3, fillStyle: "#ffffff" });
    poster.drawCircle({ x: 205, y: 276, radius: 3, fillStyle: "#ffffff" });

    poster.drawCircle({ x: 170, y: 315, radius: 4, fillStyle: "#f2a77d" });
    poster.drawCircle({ x: 190, y: 315, radius: 4, fillStyle: "#f2a77d" });

    poster.drawPolygon({
      points: [
        [135, 238],
        [150, 210],
        [170, 240]
      ],
      fillStyle: "#ffe9cc"
    });
    poster.drawPolygon({
      points: [
        [225, 238],
        [210, 210],
        [190, 240]
      ],
      fillStyle: "#ffe9cc"
    });

    poster.drawCircle({ x: 245, y: 250, radius: 18, fillStyle: "#ffb266" });
    poster.drawCircle({ x: 262, y: 265, radius: 16, fillStyle: "#ffb266" });
    poster.drawCircle({ x: 260, y: 292, radius: 18, fillStyle: "#ffb266" });

    const ribbonGradient = ctx.createLinearGradient(40, 320, 320, 420);
    ribbonGradient.addColorStop(0, "#ff4d3f");
    ribbonGradient.addColorStop(1, "#b7001a");
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(40, 330);
    ctx.bezierCurveTo(120, 260, 220, 260, 320, 360);
    ctx.bezierCurveTo(300, 380, 250, 400, 210, 420);
    ctx.lineWidth = 18;
    ctx.strokeStyle = ribbonGradient;
    ctx.stroke();
    ctx.restore();

    const lanternGradient = ctx.createLinearGradient(70, 360, 120, 430);
    lanternGradient.addColorStop(0, "#ffb347");
    lanternGradient.addColorStop(1, "#ff5a1f");
    ctx.fillStyle = lanternGradient;
    ctx.fillRect(70, 360, 50, 60);
    poster.drawCircle({ x: 95, y: 358, radius: 16, fillStyle: "#ff9e2c" });
    poster.drawCircle({ x: 95, y: 424, radius: 14, fillStyle: "#ff7a1a" });
    poster.drawLine({ x1: 95, y1: 438, x2: 95, y2: 458, strokeStyle: "#f5d27a", lineWidth: 2 });
    poster.drawLine({ x1: 90, y1: 458, x2: 100, y2: 458, strokeStyle: "#f5d27a", lineWidth: 2 });

    poster.drawCircle({ x: 52, y: 248, radius: 14, strokeStyle: "#f8d57a", lineWidth: 2 });
    poster.drawCircle({ x: 308, y: 220, radius: 14, strokeStyle: "#f8d57a", lineWidth: 2 });

    ctx.save();
    ctx.translate(305, 330);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = "#d32c1e";
    ctx.fillRect(-16, -16, 32, 32);
    ctx.fillStyle = "#f8d57a";
    ctx.font = "16px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("福", 0, 0);
    ctx.restore();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <canvas ref={canvasRef} width={360} height={520} />
    </div>
  );
};

export default {
  title: "Core/Poster2026Demo",
  component: Poster2026Demo
};

export const Default = () => <Poster2026Demo />;

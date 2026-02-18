import React, { useEffect, useRef } from "react";

const Poster2026Demo = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size (High DPI for better quality)
    const dpr = window.devicePixelRatio || 1;
    const width = 360;
    const height = 540;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // --- Colors ---
    const colors = {
      bgRed: "#D32F2F",
      bgGradientStart: "#F44336",
      bgGradientEnd: "#B71C1C",
      gold: "#FFD700",
      goldDark: "#FFA000",
      goldLight: "#FFF176",
      horseBody: "#FFF3E0",
      horseShadow: "#FFE0B2",
      horseMane: "#FFAB91", // Light orange/pinkish
      horseManeDark: "#FF8A65",
      blush: "#FFCDD2",
      lantern: "#FF5722",
      lanternDark: "#E64A19",
      ribbon: "#D50000",
      ribbonDark: "#B71C1C",
      coin: "#FFC107",
    };

    // --- Helpers ---
    const drawRoundedRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number,
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    // --- 1. Background ---
    const drawBackground = () => {
      const gradient = ctx.createRadialGradient(
        width / 2,
        height * 0.4,
        50,
        width / 2,
        height / 2,
        height,
      );
      gradient.addColorStop(0, "#E53935");
      gradient.addColorStop(0.6, "#C62828");
      gradient.addColorStop(1, "#8E0000"); // Darker edges
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add noise/texture (dots)
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Border lines
      ctx.strokeStyle = colors.goldDark;
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, width - 20, height - 20);

      // Corner ornaments
      const cornerSize = 20;
      const drawCorner = (x: number, y: number, rot: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.strokeStyle = colors.gold;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(cornerSize, 0);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, cornerSize);
        ctx.stroke();
        ctx.restore();
      };
      drawCorner(16, 16, 0);
      drawCorner(width - 16, 16, Math.PI / 2);
      drawCorner(width - 16, height - 16, Math.PI);
      drawCorner(16, height - 16, -Math.PI / 2);
    };

    // --- 2. Fireworks ---
    const drawFirework = (cx: number, cy: number, scale: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.strokeStyle = colors.goldLight;
      ctx.lineWidth = 1.5;

      for (let i = 0; i < 12; i++) {
        ctx.rotate((Math.PI * 2) / 12);
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(25 + Math.random() * 10, 0);
        ctx.stroke();
      }
      ctx.restore();
    };

    // --- 3. Text ---
    const drawTitle = () => {
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const fontSize = 42;
      const y = 60;

      // Shadow/Outline
      ctx.font = `900 ${fontSize}px "Songti SC", "SimSun", serif`;
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#8E0000"; // Dark red outline
      ctx.strokeText("恭贺2026新春", width / 2, y);

      // Main Text
      const gradient = ctx.createLinearGradient(0, y - 20, 0, y + 20);
      gradient.addColorStop(0, "#FFF9C4");
      gradient.addColorStop(0.5, "#FBC02D");
      gradient.addColorStop(1, "#F57F17");
      ctx.fillStyle = gradient;
      ctx.fillText("恭贺2026新春", width / 2, y);

      ctx.restore();
    };

    // --- 4. Horse Character ---
    const drawHorse = (cx: number, cy: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      const scale = 0.85;
      ctx.scale(scale, scale);

      // --- Ribbon (Back) ---
      // We draw parts of the ribbon that are behind the horse
      ctx.save();
      ctx.beginPath();
      // Left loop
      ctx.moveTo(-120, 50);
      ctx.bezierCurveTo(-180, -50, -100, -150, 0, -100);
      // Right loop
      ctx.bezierCurveTo(100, -150, 180, -50, 120, 50);

      ctx.lineWidth = 30;
      ctx.strokeStyle = colors.ribbonDark;
      ctx.lineCap = "round";
      ctx.stroke();

      // Highlight on ribbon
      ctx.lineWidth = 20;
      ctx.strokeStyle = colors.ribbon;
      ctx.stroke();
      ctx.restore();

      // --- Body ---
      ctx.fillStyle = colors.horseBody;
      // Main body shape (pear-like)
      ctx.beginPath();
      ctx.ellipse(0, 80, 70, 80, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- Head ---
      // Head shape (large rounded rectangle)
      ctx.beginPath();
      drawRoundedRect(-75, -90, 150, 130, 60);
      ctx.fill();

      // --- Ears ---
      ctx.fillStyle = colors.horseBody;
      // Left Ear
      ctx.beginPath();
      ctx.moveTo(-40, -80);
      ctx.quadraticCurveTo(-60, -130, -20, -100);
      ctx.fill();
      // Inner Ear (Pinkish)
      ctx.fillStyle = colors.blush;
      ctx.beginPath();
      ctx.moveTo(-35, -85);
      ctx.quadraticCurveTo(-50, -115, -25, -95);
      ctx.fill();

      // Right Ear
      ctx.fillStyle = colors.horseBody;
      ctx.beginPath();
      ctx.moveTo(40, -80);
      ctx.quadraticCurveTo(60, -130, 20, -100);
      ctx.fill();
      // Inner Ear
      ctx.fillStyle = colors.blush;
      ctx.beginPath();
      ctx.moveTo(35, -85);
      ctx.quadraticCurveTo(50, -115, 25, -95);
      ctx.fill();

      // --- Mane (Hair) ---
      ctx.fillStyle = colors.horseMane;
      // Forelock (bangs)
      ctx.beginPath();
      ctx.moveTo(-40, -80);
      ctx.bezierCurveTo(-20, -120, 20, -120, 40, -80); // Base curve
      ctx.bezierCurveTo(30, -60, 0, -50, -40, -80); // Bottom curve
      ctx.fill();
      // More mane details
      ctx.beginPath();
      ctx.moveTo(0, -90);
      ctx.quadraticCurveTo(20, -130, 50, -90);
      ctx.fill();

      // Side/Back Mane
      ctx.beginPath();
      ctx.moveTo(60, -60);
      ctx.bezierCurveTo(90, -40, 90, 20, 60, 40);
      ctx.quadraticCurveTo(80, 0, 60, -60);
      ctx.fill();

      // --- Face Features ---
      // Eyes
      ctx.fillStyle = "#3E2723"; // Dark brown/black
      // Left Eye
      ctx.beginPath();
      ctx.ellipse(-35, -30, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      // Right Eye
      ctx.beginPath();
      ctx.ellipse(35, -30, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eye Highlights (White)
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(-32, -34, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(38, -34, 3, 0, Math.PI * 2);
      ctx.fill();

      // Snout area (slightly lighter/different shading)
      const snoutGradient = ctx.createRadialGradient(0, 10, 10, 0, 10, 50);
      snoutGradient.addColorStop(0, "#FFF8E1");
      snoutGradient.addColorStop(1, "rgba(255, 243, 224, 0)");
      ctx.fillStyle = snoutGradient;
      ctx.beginPath();
      ctx.ellipse(0, 10, 50, 35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nostrils
      ctx.fillStyle = "#FFAB91";
      ctx.beginPath();
      ctx.ellipse(-15, 10, 3, 2, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(15, 10, 3, 2, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Blush
      ctx.fillStyle = "rgba(255, 138, 128, 0.4)";
      ctx.beginPath();
      ctx.arc(-55, -10, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(55, -10, 12, 0, Math.PI * 2);
      ctx.fill();

      // --- Limbs ---
      // Arms
      ctx.fillStyle = colors.horseBody;
      // Left Arm (holding lantern)
      ctx.beginPath();
      ctx.ellipse(-55, 60, 20, 15, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      // Hand/Hoof
      ctx.fillStyle = "#5D4037"; // Dark brown hoof
      ctx.beginPath();
      ctx.arc(-65, 65, 12, 0, Math.PI * 2);
      ctx.fill();

      // Right Arm
      ctx.fillStyle = colors.horseBody;
      ctx.beginPath();
      ctx.ellipse(55, 60, 20, 15, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      // Hand/Hoof
      ctx.fillStyle = "#5D4037";
      ctx.beginPath();
      ctx.arc(65, 65, 12, 0, Math.PI * 2);
      ctx.fill();

      // Legs
      ctx.fillStyle = colors.horseBody;
      // Left Leg
      ctx.beginPath();
      ctx.rect(-45, 120, 30, 40);
      ctx.fill();
      // Right Leg
      ctx.beginPath();
      ctx.rect(15, 120, 30, 40);
      ctx.fill();

      // Hooves
      ctx.fillStyle = "#5D4037";
      // Left Hoof
      drawRoundedRect(-45, 150, 30, 15, 5);
      ctx.fill();
      // Right Hoof
      drawRoundedRect(15, 150, 30, 15, 5);
      ctx.fill();

      // --- Tail ---
      ctx.fillStyle = colors.horseMane;
      ctx.beginPath();
      ctx.moveTo(60, 100);
      ctx.bezierCurveTo(100, 90, 110, 130, 90, 140);
      ctx.bezierCurveTo(80, 150, 70, 120, 60, 110);
      ctx.fill();

      // --- Lantern (Held by left hand) ---
      const lanternX = -65;
      const lanternY = 110;

      // String
      ctx.strokeStyle = "#FFD54F";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-65, 65); // From hand
      ctx.lineTo(lanternX, lanternY - 30);
      ctx.stroke();

      // Lantern Body
      const lGradient = ctx.createLinearGradient(
        lanternX,
        lanternY - 30,
        lanternX,
        lanternY + 30,
      );
      lGradient.addColorStop(0, "#FFCA28"); // Yellow top
      lGradient.addColorStop(0.5, "#FF6F00"); // Orange middle
      lGradient.addColorStop(1, "#D84315"); // Red bottom
      ctx.fillStyle = lGradient;

      ctx.beginPath();
      ctx.ellipse(lanternX, lanternY, 30, 35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lantern Details (Lines)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(lanternX, lanternY, 15, 35, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Top/Bottom caps
      ctx.fillStyle = "#FFD54F";
      ctx.fillRect(lanternX - 10, lanternY - 35, 20, 6);
      ctx.fillRect(lanternX - 10, lanternY + 32, 20, 6);

      // Tassel
      ctx.strokeStyle = "#FF6F00";
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(lanternX - 6 + i * 3, lanternY + 38);
        ctx.lineTo(lanternX - 6 + i * 3, lanternY + 60);
        ctx.stroke();
      }

      // --- Ribbon (Front) ---
      // Flowing ribbon in front
      ctx.save();
      ctx.beginPath();
      // From behind left to front
      ctx.moveTo(-90, 20);
      ctx.bezierCurveTo(-140, 80, -100, 180, 0, 160);
      ctx.bezierCurveTo(100, 140, 150, 180, 180, 200); // Tail of ribbon

      // Width
      ctx.lineWidth = 25;
      ctx.strokeStyle = colors.ribbon;
      ctx.lineCap = "round";
      ctx.stroke();

      // Gradient stroke for 3D effect (simulated by drawing smaller line inside)
      ctx.lineWidth = 10;
      ctx.strokeStyle = "#FF5252";
      ctx.stroke();
      ctx.restore();

      ctx.restore(); // End Horse
    };

    // --- 5. Decorations ---
    const drawCoin = (cx: number, cy: number, size: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      // Outer Circle
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fillStyle = colors.gold;
      ctx.fill();
      ctx.strokeStyle = colors.goldDark;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner Circle (Rim)
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = colors.goldLight;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Square Hole
      const holeSize = size * 0.4;
      ctx.fillStyle = "#B71C1C"; // Background color showing through
      ctx.fillRect(-holeSize / 2, -holeSize / 2, holeSize, holeSize);
      ctx.restore();
    };

    const drawFu = (cx: number, cy: number, size: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 6); // Tilted

      // Diamond background
      ctx.fillStyle = "#D32F2F";
      ctx.strokeStyle = colors.gold;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // "Fu" Text
      ctx.fillStyle = colors.gold;
      ctx.font = `bold ${size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("福", 0, 0);

      ctx.restore();
    };

    // --- Execute Drawing ---
    drawBackground();

    // Fireworks
    drawFirework(80, 120, 1.2);
    drawFirework(280, 100, 1.0);
    drawFirework(50, 200, 0.8);

    drawTitle();

    drawHorse(width / 2, height * 0.55);

    // Floating decorations
    drawCoin(50, 300, 18);
    drawCoin(310, 180, 22);

    drawFu(300, 350, 25);
    drawFu(60, 180, 20);
  }, []);

  return (
    <div
      style={{
        padding: 24,
        background: "#333",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          borderRadius: 8,
        }}
      />
    </div>
  );
};

export default {
  title: "Core/Poster2026Demo",
  component: Poster2026Demo
};

export const Default = () => <Poster2026Demo />;

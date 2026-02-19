import { getLayerBounds } from "../../../core/src/core/layout";
import type { Layer } from "../../../core/src";

export function hitTest(
  ctx: CanvasRenderingContext2D,
  layers: Layer[],
  x: number,
  y: number,
): string | null {
  const visible = layers.filter(l => l.visible !== false && !l.locked);
  const sorted = [...visible].sort(
    (a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0),
  );

  for (const layer of sorted) {
    if (!layer.id) continue;
    const bounds = getLayerBounds(ctx, layer);
    if (
      x >= bounds.x &&
      x <= bounds.x + bounds.width &&
      y >= bounds.y &&
      y <= bounds.y + bounds.height
    ) {
      return layer.id;
    }
  }
  return null;
}

export function canvasCoords(
  e: React.MouseEvent | MouseEvent,
  canvas: HTMLCanvasElement,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

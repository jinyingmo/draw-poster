import type { BoundingBox } from "../../../core/src/core/layout";

const HANDLE_SIZE = 8;
const HANDLE_HIT_SIZE = 14;

export type HandleType = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export function getHandlePositions(
  bounds: BoundingBox,
): Record<HandleType, { x: number; y: number }> {
  return {
    nw: { x: bounds.x, y: bounds.y },
    n: { x: bounds.x + bounds.width / 2, y: bounds.y },
    ne: { x: bounds.x + bounds.width, y: bounds.y },
    e: { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
    se: { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    s: { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
    sw: { x: bounds.x, y: bounds.y + bounds.height },
    w: { x: bounds.x, y: bounds.y + bounds.height / 2 },
  };
}

export function getHandleAtPoint(
  bounds: BoundingBox,
  x: number,
  y: number,
): HandleType | null {
  const handles = getHandlePositions(bounds);
  const hs = HANDLE_HIT_SIZE / 2;
  for (const [type, pos] of Object.entries(handles)) {
    if (x >= pos.x - hs && x <= pos.x + hs && y >= pos.y - hs && y <= pos.y + hs) {
      return type as HandleType;
    }
  }
  return null;
}

export function drawSelection(
  ctx: CanvasRenderingContext2D,
  bounds: BoundingBox,
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.save();

  // Dashed border
  ctx.strokeStyle = "#2563EB";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 3]);
  ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
  ctx.setLineDash([]);

  // Handles
  const handles = getHandlePositions(bounds);
  const hs = HANDLE_SIZE / 2;
  for (const pos of Object.values(handles)) {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#2563EB";
    ctx.lineWidth = 1.5;
    ctx.fillRect(pos.x - hs, pos.y - hs, HANDLE_SIZE, HANDLE_SIZE);
    ctx.strokeRect(pos.x - hs, pos.y - hs, HANDLE_SIZE, HANDLE_SIZE);
  }

  ctx.restore();
}

export function clearSelection(ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export function getHandleCursor(handle: HandleType): string {
  const cursors: Record<HandleType, string> = {
    nw: "nw-resize",
    n: "n-resize",
    ne: "ne-resize",
    e: "e-resize",
    se: "se-resize",
    s: "s-resize",
    sw: "sw-resize",
    w: "w-resize",
  };
  return cursors[handle];
}

import { BoundingBox } from "./layout";

export interface SnapLine {
  type: "vertical" | "horizontal";
  position: number; // x or y coordinate
  min: number; // start of the line (e.g. min y for vertical line)
  max: number; // end of the line
}

export interface SnapResult {
  dx: number; // adjustment needed for x
  dy: number; // adjustment needed for y
  lines: SnapLine[];
}

/**
 * Calculate snap lines and position adjustments
 * @param activeBounds Bounds of the moving layer
 * @param otherBounds List of bounds of other layers
 * @param threshold Snap distance in pixels
 */
export const getSnapLines = (
  active: BoundingBox,
  others: BoundingBox[],
  threshold = 5
): SnapResult => {
  const result: SnapResult = { dx: 0, dy: 0, lines: [] };

  const activeCx = active.x + active.width / 2;
  const activeCy = active.y + active.height / 2;
  const activeRight = active.x + active.width;
  const activeBottom = active.y + active.height;

  // Potential snap points for active layer
  // x: left, center, right
  // y: top, middle, bottom
  
  let minDiffX = threshold + 1;
  let snappedX: number | null = null;
  let snapLineX: SnapLine | null = null;

  let minDiffY = threshold + 1;
  let snappedY: number | null = null;
  let snapLineY: SnapLine | null = null;

  others.forEach((target) => {
    const targetCx = target.x + target.width / 2;
    const targetCy = target.y + target.height / 2;
    const targetRight = target.x + target.width;
    const targetBottom = target.y + target.height;

    // Vertical alignment (X axis)
    const vAligns = [
      { val: target.x, type: "left" },
      { val: targetCx, type: "center" },
      { val: targetRight, type: "right" },
    ];

    vAligns.forEach(({ val: targetVal }) => {
      // Check active left, center, right against targetVal
      const checks = [
        { val: active.x, type: "left", offset: 0 },
        { val: activeCx, type: "center", offset: active.width / 2 },
        { val: activeRight, type: "right", offset: active.width },
      ];

      checks.forEach(({ val: activeVal, offset }) => {
        const diff = Math.abs(activeVal - targetVal);
        if (diff < minDiffX) {
          minDiffX = diff;
          snappedX = targetVal - offset; // New x for active layer
          // Calculate line extent
          const minY = Math.min(active.y, target.y);
          const maxY = Math.max(activeBottom, targetBottom);
          snapLineX = {
            type: "vertical",
            position: targetVal,
            min: minY,
            max: maxY,
          };
        }
      });
    });

    // Horizontal alignment (Y axis)
    const hAligns = [
      { val: target.y, type: "top" },
      { val: targetCy, type: "middle" },
      { val: targetBottom, type: "bottom" },
    ];

    hAligns.forEach(({ val: targetVal }) => {
      // Check active top, middle, bottom against targetVal
      const checks = [
        { val: active.y, type: "top", offset: 0 },
        { val: activeCy, type: "middle", offset: active.height / 2 },
        { val: activeBottom, type: "bottom", offset: active.height },
      ];

      checks.forEach(({ val: activeVal, offset }) => {
        const diff = Math.abs(activeVal - targetVal);
        if (diff < minDiffY) {
          minDiffY = diff;
          snappedY = targetVal - offset; // New y for active layer
          // Calculate line extent
          const minX = Math.min(active.x, target.x);
          const maxX = Math.max(activeRight, targetRight);
          snapLineY = {
            type: "horizontal",
            position: targetVal,
            min: minX,
            max: maxX,
          };
        }
      });
    });
  });

  if (snappedX !== null) {
    result.dx = snappedX - active.x;
    if (snapLineX) result.lines.push(snapLineX);
  }

  if (snappedY !== null) {
    result.dy = snappedY - active.y;
    if (snapLineY) result.lines.push(snapLineY);
  }

  return result;
};

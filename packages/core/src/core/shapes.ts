import { applyStyles, scaleValue, withContext } from "./canvas";
import type {
  CircleOptions,
  LineOptions,
  PolygonOptions,
  RectOptions,
} from "./types";

/**
 * 标准化圆角半径配置
 * @param radius 圆角半径
 * @returns [左上, 右上, 右下, 左下]
 */
const normalizeRadius = (
  radius?: number | [number, number, number, number],
) => {
  if (!radius) {
    return [0, 0, 0, 0];
  }
  if (typeof radius === "number") {
    return [radius, radius, radius, radius];
  }
  const [tl = 0, tr = 0, br = 0, bl = 0] = radius;
  return [tl, tr, br, bl];
};

/**
 * 构建圆角矩形路径
 * @param ctx Canvas 上下文
 * @param x X 坐标
 * @param y Y 坐标
 * @param width 宽度
 * @param height 高度
 * @param radius 圆角半径数组
 */
const buildRoundedRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: [number, number, number, number],
) => {
  const [tl, tr, br, bl] = radius;
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + width - tr, y);
  if (tr) {
    ctx.arcTo(x + width, y, x + width, y + tr, tr);
  }
  ctx.lineTo(x + width, y + height - br);
  if (br) {
    ctx.arcTo(x + width, y + height, x + width - br, y + height, br);
  }
  ctx.lineTo(x + bl, y + height);
  if (bl) {
    ctx.arcTo(x, y + height, x, y + height - bl, bl);
  }
  ctx.lineTo(x, y + tl);
  if (tl) {
    ctx.arcTo(x, y, x + tl, y, tl);
  }
  ctx.closePath();
};

/**
 * 绘制矩形
 * @param ctx Canvas 上下文
 * @param options 矩形配置
 * @param ratio 缩放比例
 */
export const drawRect = (
  ctx: CanvasRenderingContext2D,
  options: RectOptions,
  ratio = 1,
) => {
  const { x, y, width, height, radius, ...styles } = options;
  const scaledRadius = normalizeRadius(radius).map(value =>
    scaleValue(value, ratio),
  ) as [number, number, number, number];
  const draw = () => {
    if (radius) {
      buildRoundedRectPath(
        ctx,
        scaleValue(x, ratio),
        scaleValue(y, ratio),
        scaleValue(width, ratio),
        scaleValue(height, ratio),
        scaledRadius,
      );
      if (styles.fillStyle) {
        ctx.fill();
      }
      if (styles.strokeStyle || styles.lineWidth) {
        ctx.stroke();
      }
      return;
    }
    if (styles.fillStyle) {
      ctx.fillRect(
        scaleValue(x, ratio),
        scaleValue(y, ratio),
        scaleValue(width, ratio),
        scaleValue(height, ratio),
      );
    }
    if (styles.strokeStyle || styles.lineWidth) {
      ctx.strokeRect(
        scaleValue(x, ratio),
        scaleValue(y, ratio),
        scaleValue(width, ratio),
        scaleValue(height, ratio),
      );
    }
  };
  withContext(ctx, styles, ratio, draw);
};

/**
 * 绘制圆形
 * @param ctx Canvas 上下文
 * @param options 圆形配置
 * @param ratio 缩放比例
 */
export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  options: CircleOptions,
  ratio = 1,
) => {
  const { x, y, radius, ...styles } = options;
  const draw = () => {
    ctx.beginPath();
    ctx.arc(
      scaleValue(x, ratio),
      scaleValue(y, ratio),
      scaleValue(radius, ratio),
      0,
      Math.PI * 2,
    );
    if (styles.fillStyle) {
      ctx.fill();
    }
    if (styles.strokeStyle || styles.lineWidth) {
      ctx.stroke();
    }
  };
  withContext(ctx, styles, ratio, draw);
};

/**
 * 绘制线条
 * @param ctx Canvas 上下文
 * @param options 线条配置
 * @param ratio 缩放比例
 */
export const drawLine = (
  ctx: CanvasRenderingContext2D,
  options: LineOptions,
  ratio = 1,
) => {
  const { x1, y1, x2, y2, ...styles } = options;
  const draw = () => {
    ctx.beginPath();
    ctx.moveTo(scaleValue(x1, ratio), scaleValue(y1, ratio));
    ctx.lineTo(scaleValue(x2, ratio), scaleValue(y2, ratio));
    ctx.stroke();
  };
  withContext(
    ctx,
    { ...styles, strokeStyle: styles.strokeStyle || styles.fillStyle },
    ratio,
    draw,
  );
};

/**
 * 绘制多边形
 * @param ctx Canvas 上下文
 * @param options 多边形配置
 * @param ratio 缩放比例
 */
export const drawPolygon = (
  ctx: CanvasRenderingContext2D,
  options: PolygonOptions,
  ratio = 1,
) => {
  const { points, closePath = true, ...styles } = options;
  const draw = () => {
    if (!points.length) {
      return;
    }
    ctx.beginPath();
    const [firstX, firstY] = points[0];
    ctx.moveTo(scaleValue(firstX, ratio), scaleValue(firstY, ratio));
    for (let i = 1; i < points.length; i += 1) {
      const [x, y] = points[i];
      ctx.lineTo(scaleValue(x, ratio), scaleValue(y, ratio));
    }
    if (closePath) {
      ctx.closePath();
    }
    if (styles.fillStyle) {
      ctx.fill();
    }
    if (styles.strokeStyle || styles.lineWidth) {
      ctx.stroke();
    }
  };
  withContext(ctx, styles, ratio, draw);
};

/**
 * 裁剪圆角矩形
 * @param ctx Canvas 上下文
 * @param x X 坐标
 * @param y Y 坐标
 * @param width 宽度
 * @param height 高度
 * @param radius 圆角半径
 * @param ratio 缩放比例
 */
export const clipRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | [number, number, number, number],
  ratio = 1,
) => {
  const scaledRadius = normalizeRadius(radius).map(value =>
    scaleValue(value, ratio),
  ) as [number, number, number, number];
  buildRoundedRectPath(
    ctx,
    scaleValue(x, ratio),
    scaleValue(y, ratio),
    scaleValue(width, ratio),
    scaleValue(height, ratio),
    scaledRadius,
  );
  ctx.clip();
};

export { applyStyles };

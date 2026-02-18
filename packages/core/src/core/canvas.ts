import type {
  StyleOptions,
  TransformOptions,
  FillStyle,
  CanvasContext,
} from "./types";

/**
 * 根据缩放比例计算数值
 * @param value 原始数值
 * @param ratio 缩放比例
 * @returns 缩放后的数值
 */
export const scaleValue = (value: number, ratio: number) => value * ratio;

/**
 * 根据缩放比例计算数组中的数值
 * @param values 原始数值数组
 * @param ratio 缩放比例
 * @returns 缩放后的数值数组
 */
export const scaleArray = (values: number[] | undefined, ratio: number) =>
  values ? values.map(value => value * ratio) : undefined;

/**
 * 解析颜色值，支持字符串、渐变对象、图案对象
 * @param ctx Canvas 上下文
 * @param color 颜色配置
 * @param ratio 缩放比例
 * @returns Canvas 颜色值
 */
const resolveColor = (
  ctx: CanvasContext,
  color: FillStyle,
  ratio: number,
): string | CanvasGradient | CanvasPattern => {
  if (typeof color === "string") return color;
  if (color instanceof CanvasGradient || color instanceof CanvasPattern)
    return color;

  // 线性渐变
  if (color.type === "linear") {
    const { x0, y0, x1, y1, stops } = color;
    const gradient = ctx.createLinearGradient(
      scaleValue(x0, ratio),
      scaleValue(y0, ratio),
      scaleValue(x1, ratio),
      scaleValue(y1, ratio),
    );
    stops.forEach(stop => gradient.addColorStop(stop.offset, stop.color));
    return gradient;
  }

  // 径向渐变
  if (color.type === "radial") {
    const { x0, y0, r0, x1, y1, r1, stops } = color;
    const gradient = ctx.createRadialGradient(
      scaleValue(x0, ratio),
      scaleValue(y0, ratio),
      scaleValue(r0, ratio),
      scaleValue(x1, ratio),
      scaleValue(y1, ratio),
      scaleValue(r1, ratio),
    );
    stops.forEach(stop => gradient.addColorStop(stop.offset, stop.color));
    return gradient;
  }

  // 图案填充
  if (color.type === "pattern") {
    const { image, repetition } = color;
    if (
      image instanceof HTMLImageElement ||
      image instanceof HTMLCanvasElement
    ) {
      const pattern = ctx.createPattern(image, repetition || "repeat");
      return pattern || "transparent";
    }
  }
  return "transparent";
};

/**
 * 应用 Canvas 样式
 * @param ctx Canvas 上下文
 * @param styles 样式配置
 * @param ratio 缩放比例
 */
export const applyStyles = (
  ctx: CanvasContext,
  styles: StyleOptions = {},
  ratio = 1,
) => {
  if (typeof styles.globalAlpha === "number") {
    ctx.globalAlpha = styles.globalAlpha;
  }
  if (styles.fillStyle) {
    ctx.fillStyle = resolveColor(ctx, styles.fillStyle, ratio);
  }
  if (styles.strokeStyle) {
    ctx.strokeStyle = resolveColor(ctx, styles.strokeStyle, ratio);
  }
  if (typeof styles.lineWidth === "number") {
    ctx.lineWidth = scaleValue(styles.lineWidth, ratio);
  }
  if (styles.lineJoin) {
    ctx.lineJoin = styles.lineJoin;
  }
  if (styles.lineCap) {
    ctx.lineCap = styles.lineCap;
  }
  if (styles.lineDash) {
    ctx.setLineDash(scaleArray(styles.lineDash, ratio) || []);
  }
  if (styles.shadowColor) {
    ctx.shadowColor = styles.shadowColor;
  }
  if (typeof styles.shadowBlur === "number") {
    ctx.shadowBlur = scaleValue(styles.shadowBlur, ratio);
  }
  if (typeof styles.shadowOffsetX === "number") {
    ctx.shadowOffsetX = scaleValue(styles.shadowOffsetX, ratio);
  }
  if (typeof styles.shadowOffsetY === "number") {
    ctx.shadowOffsetY = scaleValue(styles.shadowOffsetY, ratio);
  }
  if (styles.globalCompositeOperation) {
    ctx.globalCompositeOperation = styles.globalCompositeOperation;
  }
  if (styles.filter) {
    ctx.filter = styles.filter;
  }
};

/**
 * 设置 Canvas 尺寸
 * @param ctx Canvas 上下文
 * @param width 宽度
 * @param height 高度
 * @param ratio 缩放比例
 */
export const setCanvasSize = (
  ctx: CanvasContext,
  width: number,
  height: number,
  ratio = 1,
) => {
  ctx.canvas.width = scaleValue(width, ratio);
  ctx.canvas.height = scaleValue(height, ratio);
  //ctx.scale(ratio, ratio); // Remove internal scaling to avoid confusion with explicit scaling
};

/**
 * 清除 Canvas
 * @param ctx Canvas 上下文
 * @param rect 清除区域
 * @param ratio 缩放比例
 */
export const clearCanvas = (
  ctx: CanvasContext,
  rect?: [number, number, number, number],
  ratio = 1,
) => {
  if (rect) {
    ctx.clearRect(
      scaleValue(rect[0], ratio),
      scaleValue(rect[1], ratio),
      scaleValue(rect[2], ratio),
      scaleValue(rect[3], ratio),
    );
  } else {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
};

/**
 * 在上下文中执行绘制操作
 * @param ctx Canvas 上下文
 * @param styles 样式
 * @param ratio 缩放比例
 * @param draw 绘制函数
 */
export const withContext = (
  ctx: CanvasContext,
  styles: StyleOptions,
  ratio: number,
  draw: () => void,
) => {
  ctx.save();
  applyStyles(ctx, styles, ratio);
  draw();
  ctx.restore();
};

/**
 * 应用变换
 * @param ctx Canvas 上下文
 * @param transform 变换选项
 * @param ratio 缩放比例
 */
export const applyTransform = (
  ctx: CanvasContext,
  transform: TransformOptions,
  ratio = 1,
) => {
  const { translateX, translateY, rotate, scaleX, scaleY } = transform;
  if (
    translateX !== undefined ||
    translateY !== undefined ||
    rotate !== undefined ||
    scaleX !== undefined ||
    scaleY !== undefined
  ) {
    ctx.translate(
      scaleValue(translateX || 0, ratio),
      scaleValue(translateY || 0, ratio),
    );
    if (rotate) ctx.rotate(rotate);
    ctx.scale(scaleX ?? 1, scaleY ?? 1);
  }
};

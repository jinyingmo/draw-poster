import { scaleValue } from "./canvas";
import type {
  CanvasContext,
  Layer,
  RectLayer,
  ImageLayer,
  QRCodeLayer,
  CircleLayer,
  LineLayer,
  PolygonLayer,
  TextLayer,
} from "./types";

/**
 * 网格配置
 */
export type DebugGridOptions = {
  /** 网格大小（逻辑像素，默认 20） */
  size?: number;
  /** 网格线颜色（默认 rgba(0, 120, 255, 0.15)） */
  color?: string;
  /** 网格线宽（默认 1） */
  lineWidth?: number;
};

/**
 * 基准线配置
 */
export type DebugGuide = {
  /** 方向：horizontal 水平线，vertical 垂直线 */
  direction: "horizontal" | "vertical";
  /** 位置（逻辑像素） */
  position: number;
  /** 颜色（默认 rgba(255, 0, 128, 0.8)） */
  color?: string;
  /** 线宽（默认 1） */
  lineWidth?: number;
  /** 虚线模式（默认 [4, 4]） */
  lineDash?: number[];
};

/**
 * 调试选项
 */
export type DebugOptions = {
  /** 是否绘制图层边界框（默认 true） */
  bounds?: boolean;
  /** 是否绘制网格 */
  grid?: boolean | DebugGridOptions;
  /** 基准线列表 */
  guides?: DebugGuide[];
};

/**
 * 绘制调试网格
 */
export const drawDebugGrid = (
  ctx: CanvasContext,
  options: DebugGridOptions,
  ratio: number,
) => {
  const size = scaleValue(options.size || 20, ratio);
  const color = options.color || "rgba(0, 120, 255, 0.15)";
  const lineWidth = options.lineWidth || 1;
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);

  for (let x = 0; x <= canvasWidth; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }

  for (let y = 0; y <= canvasHeight; y += size) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }

  ctx.restore();
};

/**
 * 绘制单条基准线
 */
export const drawDebugGuide = (
  ctx: CanvasContext,
  guide: DebugGuide,
  ratio: number,
) => {
  const pos = scaleValue(guide.position, ratio);
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  ctx.save();
  ctx.strokeStyle = guide.color || "rgba(255, 0, 128, 0.8)";
  ctx.lineWidth = guide.lineWidth || 1;
  ctx.globalAlpha = 1;
  ctx.setLineDash(guide.lineDash || [4, 4]);

  ctx.beginPath();
  if (guide.direction === "horizontal") {
    ctx.moveTo(0, pos);
    ctx.lineTo(canvasWidth, pos);
  } else {
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvasHeight);
  }
  ctx.stroke();
  ctx.restore();
};

/**
 * 绘制图层边界框
 */
export const drawDebugBounds = (
  ctx: CanvasContext,
  layers: Layer[],
  ratio: number,
) => {
  ctx.save();
  ctx.strokeStyle = "red";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);

  layers.forEach(layer => {
    if (layer.visible === false) return;

    ctx.beginPath();
    switch (layer.type) {
      case "rect":
      case "image":
      case "qrcode": {
        const l = layer as RectLayer | ImageLayer | QRCodeLayer;
        ctx.strokeRect(
          scaleValue(l.x, ratio),
          scaleValue(l.y, ratio),
          scaleValue(l.width, ratio),
          scaleValue(l.height, ratio),
        );
        break;
      }
      case "circle": {
        const l = layer as CircleLayer;
        ctx.arc(
          scaleValue(l.x, ratio),
          scaleValue(l.y, ratio),
          scaleValue(l.radius, ratio),
          0,
          Math.PI * 2,
        );
        ctx.stroke();
        break;
      }
      case "line": {
        const l = layer as LineLayer;
        ctx.moveTo(scaleValue(l.x1, ratio), scaleValue(l.y1, ratio));
        ctx.lineTo(scaleValue(l.x2, ratio), scaleValue(l.y2, ratio));
        ctx.stroke();
        break;
      }
      case "polygon": {
        const l = layer as PolygonLayer;
        if (l.points.length > 0) {
          const [first, ...rest] = l.points;
          ctx.moveTo(scaleValue(first[0], ratio), scaleValue(first[1], ratio));
          rest.forEach(p =>
            ctx.lineTo(scaleValue(p[0], ratio), scaleValue(p[1], ratio)),
          );
          if (l.closePath) ctx.closePath();
          ctx.stroke();
        }
        break;
      }
      case "text": {
        const l = layer as TextLayer;
        const metrics = ctx.measureText(l.text);
        const width = metrics.width;
        const height = (l.fontSize || 12) * ratio;
        ctx.strokeRect(
          scaleValue(l.x, ratio),
          scaleValue(l.y, ratio) - height,
          width,
          height,
        );
        break;
      }
    }
  });

  ctx.restore();
};

/**
 * 渲染所有调试辅助（网格、基准线、边界框）
 * @param ctx Canvas 上下文
 * @param layers 图层列表
 * @param debugOpt debug 配置
 * @param ratio 缩放比例
 */
export const renderDebugHelpers = (
  ctx: CanvasContext,
  layers: Layer[],
  debugOpt: boolean | DebugOptions,
  ratio: number,
) => {
  if (!debugOpt) return;

  const opts: DebugOptions =
    typeof debugOpt === "boolean" ? { bounds: true } : debugOpt;

  // 网格
  if (opts.grid) {
    const gridOptions: DebugGridOptions =
      typeof opts.grid === "boolean" ? {} : opts.grid;
    drawDebugGrid(ctx, gridOptions, ratio);
  }

  // 基准线
  if (opts.guides && opts.guides.length > 0) {
    opts.guides.forEach(guide => drawDebugGuide(ctx, guide, ratio));
  }

  // 边界框（默认显示）
  if (opts.bounds !== false) {
    drawDebugBounds(ctx, layers, ratio);
  }
};

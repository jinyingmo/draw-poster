import {
  Layer,
  RectLayer,
  CircleLayer,
  LineLayer,
  PolygonLayer,
  TextLayer,
  ImageLayer,
  QRCodeLayer,
} from "./types";
import { layoutLines, buildFont } from "./text";

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 获取图层包围盒
 * @param ctx Canvas 上下文
 * @param layer 图层
 * @returns 包围盒
 */
export const getLayerBounds = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  layer: Layer,
): BoundingBox => {
  switch (layer.type) {
    case "rect":
    case "image":
    case "qrcode": {
      const l = layer as RectLayer | ImageLayer | QRCodeLayer;
      return { x: l.x, y: l.y, width: l.width, height: l.height };
    }
    case "circle": {
      const l = layer as CircleLayer;
      return {
        x: l.x - l.radius,
        y: l.y - l.radius,
        width: l.radius * 2,
        height: l.radius * 2,
      };
    }
    case "line": {
      const l = layer as LineLayer;
      const minX = Math.min(l.x1, l.x2);
      const minY = Math.min(l.y1, l.y2);
      return {
        x: minX,
        y: minY,
        width: Math.abs(l.x1 - l.x2),
        height: Math.abs(l.y1 - l.y2),
      };
    }
    case "polygon": {
      const l = layer as PolygonLayer;
      if (!l.points || l.points.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
      }
      const xs = l.points.map(p => p[0]);
      const ys = l.points.map(p => p[1]);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    case "text": {
      const l = layer as TextLayer;
      ctx.save();
      // 使用 ratio=1 计算逻辑坐标下的包围盒
      ctx.font = buildFont(l, 1);
      const lines = layoutLines(ctx, l.text, l.maxWidth, l.maxLines);
      let width = 0;
      lines.forEach(line => {
        const m = ctx.measureText(line);
        if (m.width > width) width = m.width;
      });
      const lineHeight =
        typeof l.lineHeight === "number"
          ? l.lineHeight
          : l.fontSize
          ? l.fontSize * 1.2
          : 19.2;
      const height = lines.length * lineHeight;

      // Handle textAlign
      let x = l.x;
      if (l.textAlign === "center") {
        x = l.x - width / 2;
      } else if (l.textAlign === "right" || l.textAlign === "end") {
        x = l.x - width;
      }

      // Handle textBaseline
      let y = l.y;
      if (l.textBaseline === "top") {
        y = l.y;
      } else if (l.textBaseline === "middle") {
        y = l.y - height / 2;
      } else if (l.textBaseline === "bottom") {
        y = l.y - height;
      } else {
        // default alphabetic ~ bottom
        // 这是一个近似值，alphabetic 基线通常在底部上方一点
        y = l.y - height * 0.8; 
      }

      ctx.restore();
      return { x, y, width, height };
    }
    default:
      return { x: 0, y: 0, width: 0, height: 0 };
  }
};

/**
 * 移动图层
 * @param layer 图层
 * @param dx X 轴偏移
 * @param dy Y 轴偏移
 */
export const moveLayer = (layer: Layer, dx: number, dy: number) => {
  switch (layer.type) {
    case "rect":
    case "image":
    case "qrcode":
    case "text": {
      const l = layer as any; 
      l.x += dx;
      l.y += dy;
      break;
    }
    case "circle": {
      const l = layer as CircleLayer;
      l.x += dx;
      l.y += dy;
      break;
    }
    case "line": {
      const l = layer as LineLayer;
      l.x1 += dx;
      l.y1 += dy;
      l.x2 += dx;
      l.y2 += dy;
      break;
    }
    case "polygon": {
      const l = layer as PolygonLayer;
      l.points = l.points.map(p => [p[0] + dx, p[1] + dy]);
      break;
    }
  }
};

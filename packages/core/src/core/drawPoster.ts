import { loadImage, getImageData } from '../utils/imgUtils'
import resizeImage from '../utils/resize'
import { contextWrapText } from '../utils/textUtils'
import {
  applyTransform,
  clearCanvas,
  setCanvasSize,
  scaleValue,
} from "./canvas";
import { getLayerBounds, moveLayer } from "./layout";
import { exportBlob, exportDataURL, exportImageData } from "./export";
import { drawImage } from "./image";
import { drawQRCode } from "./qrcode";
import { drawCircle, drawLine, drawPolygon, drawRect } from "./shapes";
import { drawText } from "./text";
import type {
  CircleLayer,
  CircleOptions,
  DrawPosterPlugin,
  DrawPosterOptions,
  ImageLayer,
  ImageOptions,
  Layer,
  LineLayer,
  LineOptions,
  PolygonLayer,
  PolygonOptions,
  QRCodeLayer,
  QRCodeOptions,
  RectLayer,
  RectOptions,
  TextLayer,
  TextOptions,
  TransformOptions,
} from "./types";

/**
 * 创建 DrawPoster 实例
 * @param ctx Canvas 上下文
 * @param options 配置选项
 * @returns DrawPoster 实例
 */
export const createDrawPoster = (
  ctx: CanvasRenderingContext2D,
  options: DrawPosterOptions = {},
) => {
  if (!ctx) {
    throw new Error("Canvas context is required!");
  }
  const { ratio = 1, debug = false } = options;
  contextWrapText();

  const layers: Layer[] = [];
  const plugins: DrawPosterPlugin[] = options.plugins || [];

  // 初始化插件
  plugins.forEach(plugin => plugin.onInit?.(ctx, options));

  /**
   * 加载图片
   * @param src 图片地址
   * @returns 图片元素
   */
  const load = async (src: string): Promise<HTMLImageElement> => {
    if (!src || typeof src !== "string") {
      throw new Error("Image url is required and must be a string!");
    }
    return loadImage(src);
  };

  /**
   * 获取图片数据
   * @param img 图片元素
   * @param rect 截取区域 [x, y, width, height]
   * @returns ImageData
   */
  const imageData = async (
    img: HTMLImageElement,
    rect: [number, number, number, number] = [0, 0, img.width, img.height],
  ): Promise<ImageData> => {
    if (!img) {
      throw new Error("Image is required!");
    }
    if (!(img instanceof Image)) {
      throw new Error("Image type error!");
    }
    return getImageData(img, rect);
  };

  /**
   * 调整图片大小
   * @param img 图片元素或地址
   * @param w 目标宽度
   * @param h 目标高度
   * @param radius 圆角半径
   * @returns Base64 图片字符串
   */
  const resize = async (
    img: HTMLImageElement | string,
    w: number,
    h: number,
    radius = "0",
  ): Promise<string> => {
    if (!img) {
      throw new Error("Image is required!");
    }
    const targetWidth = w * ratio;
    const targetHeight = h * ratio;
    const targetRadius = radius
      .split(" ")
      .map(num => Number(num) * ratio)
      .join(" ");
    return resizeImage(img, targetWidth, targetHeight, targetRadius);
  };

  /**
   * 渲染调试辅助线
   */
  const renderDebug = () => {
    if (!debug) return;
    ctx.save();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 1;

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
            ctx.moveTo(
              scaleValue(first[0], ratio),
              scaleValue(first[1], ratio),
            );
            rest.forEach(p =>
              ctx.lineTo(scaleValue(p[0], ratio), scaleValue(p[1], ratio)),
            );
            if (l.closePath) {
              ctx.closePath();
            }
            ctx.stroke();
          }
          break;
        }
        case "text": {
          const l = layer as TextLayer;
          // 估算文本包围盒
          const metrics = ctx.measureText(l.text);
          const width = metrics.width;
          const height = (l.fontSize || 12) * ratio; // 粗略估算
          ctx.strokeRect(
            scaleValue(l.x, ratio),
            scaleValue(l.y, ratio) - height, // 文本基线通常在底部，这是粗略的
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
   * 渲染所有图层
   */
  const render = async () => {
    layers.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    for (const plugin of plugins) {
      plugin.beforeDraw?.(ctx, layers, options);
    }

    // 默认情况下，渲染会清除画布。
    // 如果用户想要保留背景，他们应该通过图层或插件来管理。
    clearCanvas(ctx, undefined, ratio);

    for (const layer of layers) {
      if (layer.visible === false) continue;

      switch (layer.type) {
        case "rect":
          drawRect(ctx, layer as RectLayer, ratio);
          break;
        case "circle":
          drawCircle(ctx, layer as CircleLayer, ratio);
          break;
        case "line":
          drawLine(ctx, layer as LineLayer, ratio);
          break;
        case "polygon":
          drawPolygon(ctx, layer as PolygonLayer, ratio);
          break;
        case "text":
          drawText(ctx, layer as TextLayer, ratio);
          break;
        case "image":
          await drawImage(ctx, layer as ImageLayer, ratio);
          break;
        case "qrcode":
          await drawQRCode(ctx, layer as QRCodeLayer, ratio);
          break;
      }
    }

    renderDebug();

    for (const plugin of plugins) {
      plugin.afterDraw?.(ctx, layers, options);
    }
  };

  /**
   * 对齐图层
   */
  const align = (
    type: "left" | "center" | "right" | "top" | "middle" | "bottom",
    layerIds?: string[],
  ) => {
    const targetLayers = layerIds
      ? layers.filter(l => layerIds.includes(l.id!))
      : layers;

    if (targetLayers.length === 0) return;

    // 计算画布逻辑尺寸
    const canvasWidth = ctx.canvas.width / ratio;
    const canvasHeight = ctx.canvas.height / ratio;

    if (targetLayers.length === 1) {
      // 只有一个图层时，相对于画布对齐
      const layer = targetLayers[0];
      const bounds = getLayerBounds(ctx, layer);

      let dx = 0;
      let dy = 0;

      if (type === "left") dx = -bounds.x;
      if (type === "center") dx = (canvasWidth - bounds.width) / 2 - bounds.x;
      if (type === "right") dx = canvasWidth - bounds.width - bounds.x;
      if (type === "top") dy = -bounds.y;
      if (type === "middle") dy = (canvasHeight - bounds.height) / 2 - bounds.y;
      if (type === "bottom") dy = canvasHeight - bounds.height - bounds.y;

      moveLayer(layer, dx, dy);
    } else {
      // 多个图层时，相互对齐（基于包围盒）
      const allBounds = targetLayers.map(l => getLayerBounds(ctx, l));
      const minX = Math.min(...allBounds.map(b => b.x));
      const maxX = Math.max(...allBounds.map(b => b.x + b.width));
      const minY = Math.min(...allBounds.map(b => b.y));
      const maxY = Math.max(...allBounds.map(b => b.y + b.height));

      let targetX = minX;
      let targetY = minY;

      if (type === "center") targetX = minX + (maxX - minX) / 2;
      if (type === "right") targetX = maxX;
      if (type === "middle") targetY = minY + (maxY - minY) / 2;
      if (type === "bottom") targetY = maxY;

      targetLayers.forEach((layer, index) => {
        const bounds = allBounds[index];
        let dx = 0;
        let dy = 0;

        if (["left", "center", "right"].includes(type)) {
          if (type === "left") dx = targetX - bounds.x;
          if (type === "center") dx = targetX - (bounds.x + bounds.width / 2);
          if (type === "right") dx = targetX - (bounds.x + bounds.width);
          moveLayer(layer, dx, 0);
        } else {
          if (type === "top") dy = targetY - bounds.y;
          if (type === "middle") dy = targetY - (bounds.y + bounds.height / 2);
          if (type === "bottom") dy = targetY - (bounds.y + bounds.height);
          moveLayer(layer, 0, dy);
        }
      });
    }
  };

  /**
   * 分布图层
   */
  const distribute = (type: "horizontal" | "vertical", layerIds?: string[]) => {
    const targetLayers = layerIds
      ? layers.filter(l => layerIds.includes(l.id!))
      : layers;

    if (targetLayers.length < 3) return;

    const items = targetLayers.map(l => ({
      layer: l,
      bounds: getLayerBounds(ctx, l),
    }));

    if (type === "horizontal") {
      // 按中心点排序
      items.sort((a, b) => {
        const centerA = a.bounds.x + a.bounds.width / 2;
        const centerB = b.bounds.x + b.bounds.width / 2;
        return centerA - centerB;
      });

      const first = items[0];
      const last = items[items.length - 1];
      const startCenter = first.bounds.x + first.bounds.width / 2;
      const endCenter = last.bounds.x + last.bounds.width / 2;
      const totalSpan = endCenter - startCenter;
      const step = totalSpan / (items.length - 1);

      for (let i = 1; i < items.length - 1; i++) {
        const current = items[i];
        const targetCenter = startCenter + step * i;
        const currentCenter = current.bounds.x + current.bounds.width / 2;
        const dx = targetCenter - currentCenter;
        moveLayer(current.layer, dx, 0);
      }
    } else {
      items.sort((a, b) => {
        const centerA = a.bounds.y + a.bounds.height / 2;
        const centerB = b.bounds.y + b.bounds.height / 2;
        return centerA - centerB;
      });

      const first = items[0];
      const last = items[items.length - 1];
      const startCenter = first.bounds.y + first.bounds.height / 2;
      const endCenter = last.bounds.y + last.bounds.height / 2;
      const totalSpan = endCenter - startCenter;
      const step = totalSpan / (items.length - 1);

      for (let i = 1; i < items.length - 1; i++) {
        const current = items[i];
        const targetCenter = startCenter + step * i;
        const currentCenter = current.bounds.y + current.bounds.height / 2;
        const dy = targetCenter - currentCenter;
        moveLayer(current.layer, 0, dy);
      }
    }
  };

  return {
    loadImage: load,
    getImageData: imageData,
    resizeImage: resize,
    /**
     * 文本换行
     * @param text 文本
     * @param x X 坐标
     * @param y Y 坐标
     * @param maxWidth 最大宽度
     * @param lineHeight 行高
     * @param maxLines 最大行数
     * @returns 换行信息
     */
    wrapText: (
      text: string,
      x: number,
      y: number,
      maxWidth?: number,
      lineHeight?: number,
      maxLines?: number,
    ) => ctx.wrapText(text, x, y, maxWidth, lineHeight, maxLines),
    /**
     * 设置画布大小
     * @param width 宽度
     * @param height 高度
     */
    setSize: (width: number, height: number) =>
      setCanvasSize(ctx, width, height, ratio),
    /**
     * 清除画布
     * @param rect 清除区域 [x, y, width, height]
     */
    clear: (rect?: [number, number, number, number]) =>
      clearCanvas(ctx, rect, ratio),
    /** 保存画布状态 */
    save: () => ctx.save(),
    /** 恢复画布状态 */
    restore: () => ctx.restore(),
    /**
     * 应用变换
     * @param transformOptions 变换选项
     */
    transform: (transformOptions: TransformOptions) =>
      applyTransform(ctx, transformOptions, ratio),

    // 即时绘制 API
    /**
     * 绘制矩形
     * @param drawOptions 矩形配置
     */
    drawRect: (drawOptions: RectOptions) => drawRect(ctx, drawOptions, ratio),
    /**
     * 绘制圆形
     * @param drawOptions 圆形配置
     */
    drawCircle: (drawOptions: CircleOptions) =>
      drawCircle(ctx, drawOptions, ratio),
    /**
     * 绘制线条
     * @param drawOptions 线条配置
     */
    drawLine: (drawOptions: LineOptions) => drawLine(ctx, drawOptions, ratio),
    /**
     * 绘制多边形
     * @param drawOptions 多边形配置
     */
    drawPolygon: (drawOptions: PolygonOptions) =>
      drawPolygon(ctx, drawOptions, ratio),
    /**
     * 绘制文本
     * @param drawOptions 文本配置
     */
    drawText: (drawOptions: TextOptions) => drawText(ctx, drawOptions, ratio),
    /**
     * 绘制图片
     * @param drawOptions 图片配置
     */
    drawImage: async (drawOptions: ImageOptions) =>
      drawImage(ctx, drawOptions, ratio),
    /**
     * 绘制二维码
     * @param drawOptions 二维码配置
     */
    drawQRCode: async (drawOptions: QRCodeOptions) =>
      drawQRCode(ctx, drawOptions, ratio),

    /**
     * 导出 DataURL
     * @param type 图片类型
     * @param quality 图片质量
     * @returns DataURL 字符串
     */
    exportDataURL: (type?: string, quality?: number) =>
      exportDataURL(ctx, type, quality),
    /**
     * 导出 Blob
     * @param type 图片类型
     * @param quality 图片质量
     * @returns Blob 对象
     */
    exportBlob: (type?: string, quality?: number) =>
      exportBlob(ctx, type, quality),
    /**
     * 导出 ImageData
     * @param rect 区域 [x, y, width, height]
     * @returns ImageData
     */
    exportImageData: (rect?: [number, number, number, number]) =>
      exportImageData(ctx, rect, ratio),

    // 图层系统 API
    /**
     * 添加图层
     * @param layer 图层对象
     */
    addLayer: (layer: Layer) => {
      layers.push(layer);
      layers.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    },
    /**
     * 移除图层
     * @param id 图层 ID
     */
    removeLayer: (id: string) => {
      const index = layers.findIndex(l => l.id === id);
      if (index > -1) {
        layers.splice(index, 1);
      }
    },
    /** 获取所有图层 */
    getLayers: () => layers,
    /** 渲染 */
    render,

    // Layout API
    align,
    distribute,

    // 插件 API
    /**
     * 使用插件
     * @param plugin 插件对象
     */
    use: (plugin: DrawPosterPlugin) => {
      plugins.push(plugin);
      plugin.onInit?.(ctx, options);
    },
    /** Canvas 元素 */
    canvas: ctx.canvas,
    /** Canvas 上下文 */
    ctx,
    /**
     * 缩放数值
     * @param value 原始数值
     * @returns 缩放后的数值
     */
    scaleValue: (value: number) => scaleValue(value, ratio),
  };
};


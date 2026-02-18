import { loadImage, getImageData } from '../utils/imgUtils'
import { ResourceManager } from "../utils/resource";
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
import { drawRichText } from "./richText";
import {
  drawCircle,
  drawLine,
  drawPolygon,
  drawRect,
  createLayerPath,
} from "./shapes";
import { drawText } from "./text";
import { renderDebugHelpers } from "./debug";
import { TemplateRegistry } from "./template";
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
  PerformanceStats,
  CanvasContext,
  TemplateData,
  TemplateFn,
} from "./types";

/**
 * 创建 DrawPoster 实例
 * @param ctx Canvas 上下文
 * @param options 配置选项
 * @returns DrawPoster 实例
 */
export const createDrawPoster = (
  ctx: CanvasContext,
  options: DrawPosterOptions = {},
) => {
  if (!ctx) {
    throw new Error("Canvas context is required!");
  }
  const { ratio = 1, debug = false } = options;
  const resourceManager = options.resourceManager || new ResourceManager();
  const stats: PerformanceStats = {
    renderTime: 0,
    loadTime: 0,
    layerCount: 0,
  };

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
    const start = performance.now();
    try {
      const img = await resourceManager.load(src);
      stats.loadTime += performance.now() - start;
      return img;
    } catch (e) {
      stats.loadTime += performance.now() - start;
      throw e;
    }
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

  const templateRegistry = new TemplateRegistry();

  /**
   * 渲染所有图层
   */
  const render = async () => {
    const renderStart = performance.now();
    stats.layerCount = layers.length;

    layers.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    for (const plugin of plugins) {
      plugin.beforeDraw?.(ctx, layers, options);
    }

    // 默认情况下，渲染会清除画布。
    // 如果用户想要保留背景，他们应该通过图层或插件来管理。
    clearCanvas(ctx, undefined, ratio);

    for (const layer of layers) {
      if (layer.visible === false) continue;

      const hasMask = !!layer.mask;
      if (hasMask) {
        ctx.save();
        createLayerPath(ctx, layer.mask!, ratio);
        ctx.clip();
      }

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
        case "text": {
          const textLayer = layer as TextLayer;
          if (textLayer.spans) {
            drawRichText(ctx, { ...textLayer, spans: textLayer.spans }, ratio);
          } else {
            drawText(ctx, textLayer, ratio);
          }
          break;
        }
        case "image": {
          const { image, crop, ...rest } = layer as ImageLayer;
          // Use resourceManager to load image if it's a string
          let imgSource = image;
          if (typeof image === "string") {
             const loadStart = performance.now();
             try {
               imgSource = await resourceManager.load(image);
             } finally {
               stats.loadTime += performance.now() - loadStart;
             }
          }
          const options: ImageOptions = {
            ...rest,
            source: imgSource as string | HTMLImageElement,
          };
          if (crop) {
            options.crop = {
              sx: crop.x,
              sy: crop.y,
              sw: crop.width,
              sh: crop.height,
            };
          }
          await drawImage(ctx, options, ratio);
          break;
        }
        case "qrcode":
          await drawQRCode(ctx, layer as QRCodeLayer, ratio);
          break;
      }

      if (hasMask) {
        ctx.restore();
      }
    }

    renderDebugHelpers(ctx, layers, debug, ratio);

    for (const plugin of plugins) {
      plugin.afterDraw?.(ctx, layers, options);
    }

    stats.renderTime = performance.now() - renderStart;
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

    // 模板 API
    /**
     * 注册可复用模板
     * @param name 模板名称
     * @param fn 模板函数
     */
    registerTemplate: <T extends TemplateData>(name: string, fn: TemplateFn<T>) =>
      templateRegistry.register(name, fn),
    /**
     * 根据模板创建图层列表
     * @param name 模板名称
     * @param data 模板数据
     * @param offset 坐标偏移
     */
    createFromTemplate: <T extends TemplateData>(
      name: string,
      data?: T,
      offset?: { x?: number; y?: number },
    ) => templateRegistry.create(name, data, offset),
    resource: resourceManager,
    stats,
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


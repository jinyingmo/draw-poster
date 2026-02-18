/**
 * 渐变颜色停止点
 */
export type GradientColorStop = {
  /** 偏移量 (0-1) */
  offset: number;
  /** 颜色值 */
  color: string;
};

/**
 * 线性渐变配置
 */
export type LinearGradientOptions = {
  type: "linear";
  /** 起点 x 坐标 */
  x0: number;
  /** 起点 y 坐标 */
  y0: number;
  /** 终点 x 坐标 */
  x1: number;
  /** 终点 y 坐标 */
  y1: number;
  /** 渐变色停止点列表 */
  stops: GradientColorStop[];
};

/**
 * 径向渐变配置
 */
export type RadialGradientOptions = {
  type: "radial";
  /** 起始圆心 x 坐标 */
  x0: number;
  /** 起始圆心 y 坐标 */
  y0: number;
  /** 起始圆半径 */
  r0: number;
  /** 结束圆心 x 坐标 */
  x1: number;
  /** 结束圆心 y 坐标 */
  y1: number;
  /** 结束圆半径 */
  r1: number;
  /** 渐变色停止点列表 */
  stops: GradientColorStop[];
};

/**
 * 图案填充配置
 */
export type PatternOptions = {
  type: "pattern";
  /** 图案源图像 */
  image: string | HTMLImageElement | HTMLCanvasElement;
  /** 重复方式 */
  repetition?: string;
};

/**
 * 填充样式类型
 */
export type FillStyle =
  | string
  | CanvasGradient
  | CanvasPattern
  | LinearGradientOptions
  | RadialGradientOptions
  | PatternOptions;

/**
 * 通用样式配置
 */
export type StyleOptions = {
  /** 填充样式 */
  fillStyle?: FillStyle;
  /** 描边样式 */
  strokeStyle?: FillStyle;
  /** 线条宽度 */
  lineWidth?: number;
  /** 线条连接样式 */
  lineJoin?: CanvasLineJoin;
  /** 线条端点样式 */
  lineCap?: CanvasLineCap;
  /** 虚线样式 */
  lineDash?: number[];
  /** 阴影颜色 */
  shadowColor?: string;
  /** 阴影模糊度 */
  shadowBlur?: number;
  /** 阴影 X 轴偏移 */
  shadowOffsetX?: number;
  /** 阴影 Y 轴偏移 */
  shadowOffsetY?: number;
  /** 全局透明度 */
  globalAlpha?: number;
};

/**
 * 变换配置
 */
export type TransformOptions = {
  /** X 轴平移 */
  translateX?: number;
  /** Y 轴平移 */
  translateY?: number;
  /** X 轴缩放 */
  scaleX?: number;
  /** Y 轴缩放 */
  scaleY?: number;
  /** 旋转角度 (弧度) */
  rotate?: number;
};

/**
 * 矩形绘制配置
 */
export type RectOptions = StyleOptions & {
  /** X 坐标 */
  x: number;
  /** Y 坐标 */
  y: number;
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 圆角半径，支持数字或数组 [tl, tr, br, bl] */
  radius?: number | [number, number, number, number];
};

/**
 * 圆形绘制配置
 */
export type CircleOptions = StyleOptions & {
  /** 圆心 X 坐标 */
  x: number;
  /** 圆心 Y 坐标 */
  y: number;
  /** 半径 */
  radius: number;
};

/**
 * 线条绘制配置
 */
export type LineOptions = StyleOptions & {
  /** 起点 X 坐标 */
  x1: number;
  /** 起点 Y 坐标 */
  y1: number;
  /** 终点 X 坐标 */
  x2: number;
  /** 终点 Y 坐标 */
  y2: number;
};

/**
 * 多边形绘制配置
 */
export type PolygonOptions = StyleOptions & {
  /** 顶点坐标数组 */
  points: Array<[number, number]>;
  /** 是否闭合路径 */
  closePath?: boolean;
};

/**
 * 文本绘制配置
 */
export type TextOptions = StyleOptions & {
  /** 文本内容 */
  text: string;
  /** X 坐标 */
  x: number;
  /** Y 坐标 */
  y: number;
  /** 最大宽度，超出自动换行 */
  maxWidth?: number;
  /** 行高 */
  lineHeight?: number;
  /** 最大行数，超出显示省略号 */
  maxLines?: number;
  /** 字体大小 */
  fontSize?: number;
  /** 字体族 */
  fontFamily?: string;
  /** 字体粗细 */
  fontWeight?: string | number;
  /** 字体样式 */
  fontStyle?: string;
  /** 文本对齐方式 */
  textAlign?: CanvasTextAlign;
  /** 文本基线 */
  textBaseline?: CanvasTextBaseline;
  /** 文本颜色 (简写，优先于 fillStyle) */
  color?: string;
  /** 是否描边文本 */
  strokeText?: boolean;
};

/**
 * 图片裁剪配置
 */
export type ImageCropOptions = {
  /** 源图像裁剪起点 X */
  sx: number;
  /** 源图像裁剪起点 Y */
  sy: number;
  /** 源图像裁剪宽度 */
  sw: number;
  /** 源图像裁剪高度 */
  sh: number;
};

/**
 * 图片绘制配置
 */
export type ImageOptions = StyleOptions & {
  /** 图片源 */
  source: string | HTMLImageElement;
  /** X 坐标 */
  x: number;
  /** Y 坐标 */
  y: number;
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 裁剪配置 */
  crop?: ImageCropOptions;
  /** 圆角半径 */
  radius?: number;
  /** 旋转角度 */
  rotate?: number;
  /** 图片填充模式 */
  objectFit?: "contain" | "cover" | "fill";
};

/**
 * 二维码绘制配置
 */
export type QRCodeOptions = StyleOptions & {
  /** 二维码内容 */
  text: string;
  /** X 坐标 */
  x: number;
  /** Y 坐标 */
  y: number;
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 边距 */
  margin?: number;
  /** 容错等级 */
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  /** 颜色配置 */
  color?: {
    /** 暗色 (前景色) */
    dark?: string;
    /** 亮色 (背景色) */
    light?: string;
  };
};

/**
 * 图层基础接口
 */
export interface BaseLayer {
  /** 图层 ID */
  id?: string;
  /** 层级 (z-index) */
  zIndex?: number;
  /** 是否可见 */
  visible?: boolean;
  /** 是否锁定 */
  locked?: boolean;
}

/**
 * 矩形图层
 */
export interface RectLayer extends BaseLayer, RectOptions {
  type: "rect";
}

/**
 * 圆形图层
 */
export interface CircleLayer extends BaseLayer, CircleOptions {
  type: "circle";
}

/**
 * 线条图层
 */
export interface LineLayer extends BaseLayer, LineOptions {
  type: "line";
}

/**
 * 多边形图层
 */
export interface PolygonLayer extends BaseLayer, PolygonOptions {
  type: "polygon";
}

/**
 * 文本图层
 */
export interface TextLayer extends BaseLayer, TextOptions {
  type: "text";
}

/**
 * 图片图层
 */
export interface ImageLayer extends BaseLayer, ImageOptions {
  type: "image";
}

/**
 * 二维码图层
 */
export interface QRCodeLayer extends BaseLayer, QRCodeOptions {
  type: "qrcode";
}

/**
 * 图层联合类型
 */
export type Layer =
  | RectLayer
  | CircleLayer
  | LineLayer
  | PolygonLayer
  | TextLayer
  | ImageLayer
  | QRCodeLayer;

/**
 * 插件接口
 */
export interface DrawPosterPlugin {
  /** 插件名称 */
  name: string;
  /** 绘制前钩子 */
  beforeDraw?: (
    ctx: CanvasRenderingContext2D,
    layers: Layer[],
    options: DrawPosterOptions,
  ) => void;
  /** 绘制后钩子 */
  afterDraw?: (
    ctx: CanvasRenderingContext2D,
    layers: Layer[],
    options: DrawPosterOptions,
  ) => void;
  /** 初始化钩子 */
  onInit?: (ctx: CanvasRenderingContext2D, options: DrawPosterOptions) => void;
}

/**
 * DrawPoster 初始化选项
 */
export type DrawPosterOptions = {
  /** 像素比率 (默认 1) */
  ratio?: number;
  /** 插件列表 */
  plugins?: DrawPosterPlugin[];
  /** 调试模式 */
  debug?: boolean;
};

/**
 * DrawPoster 实例接口
 */
export interface DrawPoster {
  /** Canvas 元素 */
  canvas: HTMLCanvasElement;
  /** 绘图上下文 */
  ctx: CanvasRenderingContext2D;

  // Helpers
  /** 数值缩放工具 */
  scaleValue: (value: number) => number;

  // Methods
  /** 文本换行计算 */
  wrapText: (
    text: string,
    x: number,
    y: number,
    maxWidth?: number,
    lineHeight?: number,
    maxLines?: number,
  ) => { lineNumber: number };
  /** 设置画布尺寸 */
  setSize: (width: number, height: number) => void;
  /** 清空画布 */
  clear: (rect?: [number, number, number, number]) => void;
  /** 保存画布状态 */
  save: () => void;
  /** 恢复画布状态 */
  restore: () => void;
  /** 变换画布 */
  transform: (transformOptions: TransformOptions) => void;

  // Immediate Mode API (立即绘制模式 API)
  /** 绘制矩形 */
  drawRect: (drawOptions: RectOptions) => void;
  /** 绘制圆形 */
  drawCircle: (drawOptions: CircleOptions) => void;
  /** 绘制线条 */
  drawLine: (drawOptions: LineOptions) => void;
  /** 绘制多边形 */
  drawPolygon: (drawOptions: PolygonOptions) => void;
  /** 绘制文本 */
  drawText: (drawOptions: TextOptions) => void;
  /** 绘制图片 */
  drawImage: (drawOptions: ImageOptions) => Promise<void>;
  /** 绘制二维码 */
  drawQRCode: (drawOptions: QRCodeOptions) => Promise<void>;

  /** 导出 DataURL */
  exportDataURL: (type?: string, quality?: number) => string;
  /** 导出 Blob */
  exportBlob: (type?: string, quality?: number) => Promise<Blob | null>;
  /** 导出 ImageData */
  exportImageData: (rect?: [number, number, number, number]) => ImageData;

  // Layout API (布局 API)
  /**
   * 对齐图层
   * @param type 对齐方式
   * @param layerIds 图层 ID 列表，默认选中所有
   */
  align: (
    type: "left" | "center" | "right" | "top" | "middle" | "bottom",
    layerIds?: string[],
  ) => void;
  /**
   * 分布图层
   * @param type 分布方式
   * @param layerIds 图层 ID 列表，默认选中所有
   */
  distribute: (type: "horizontal" | "vertical", layerIds?: string[]) => void;

  // Layer System API (图层系统 API)
  /** 添加图层 */
  addLayer: (layer: Layer) => void;
  /** 移除图层 */
  removeLayer: (id: string) => void;
  /** 获取所有图层 */
  getLayers: () => Layer[];
  /** 渲染所有图层 */
  render: () => Promise<void>;

  // Plugin API (插件 API)
  /** 使用插件 */
  use: (plugin: DrawPosterPlugin) => void;
}

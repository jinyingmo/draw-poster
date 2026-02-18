# @draw-poster/core

高性能的 Canvas 海报绘制库，提供完整的图层系统、高级绘制功能和模板化渲染能力。

## 特性

### 🎨 核心绘制功能
- **画布管理**：支持画布尺寸设置、清屏、保存/恢复、变换（平移/旋转/缩放）
- **基础图形**：矩形、圆形、线条、多边形，支持填充、描边、阴影、线型配置
- **文本绘制**：完整的字体样式支持、文本对齐、自动换行、最大行数限制、文本省略
- **图像处理**：图像加载、裁剪、圆角、旋转、透明度控制
- **二维码生成**：集成 qrcode 库，支持自定义样式和纠错等级

### 🏗️ 高级特性
- **图层系统**：完整的图层管理（添加/删除/获取），支持 zIndex 排序和图层显隐控制
- **高级填充**：线性渐变、径向渐变、图案填充
- **富文本能力**：支持多样式文本片段（TextSpan）、字距控制（letterSpacing）、字体动态加载
- **蒙版系统**：支持任意图层作为蒙版进行裁剪
- **高级图像处理**：滤镜、混合模式、九宫格拉伸（scale9Grid）
- **复杂文本排版**：竖排文本、弧线路径文字（drawTextOnArc）、横排字距精确控制

### 🔌 扩展与调试
- **插件系统**：提供 onInit、beforeDraw、afterDraw 生命周期钩子
- **调试模式**：可视化网格、基准线、图层边界框，支持细粒度控制
- **模板系统**：TemplateRegistry 支持注册/注销可复用图层模板
- **性能统计**：渲染/加载耗时追踪、图层计数统计

### 📦 导出与资源
- **导出格式**：DataURL、Blob、ImageData
- **资源管理**：ResourceManager 提供资源预加载与缓存
- **多环境支持**：支持离屏渲染（OffscreenCanvas）

## 安装

```bash
pnpm add @draw-poster/core
```

## 快速开始

### 基础使用

```ts
import createDrawPoster from '@draw-poster/core';

// 获取 Canvas 上下文
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// 创建 DrawPoster 实例
const poster = createDrawPoster(ctx, {
  ratio: 1,        // 像素比例
  debug: false,    // 调试模式
});

// 设置画布大小
poster.setCanvasSize(800, 600);

// 绘制矩形
poster.drawRect({
  x: 10,
  y: 10,
  width: 100,
  height: 50,
  fillStyle: '#FF0000',
});

// 绘制文本
poster.drawText({
  x: 120,
  y: 30,
  text: 'Hello World',
  fontSize: 24,
  fillStyle: '#000000',
});

// 导出
const dataUrl = await poster.exportDataURL();
```

### 图层模式（推荐）

```ts
const poster = createDrawPoster(ctx);

// 添加图层
poster.addLayer({
  type: 'rect',
  x: 10,
  y: 10,
  width: 100,
  height: 50,
  fillStyle: '#FF0000',
  zIndex: 1,
});

poster.addLayer({
  type: 'text',
  x: 120,
  y: 30,
  text: 'Hello',
  fontSize: 24,
  zIndex: 2,
});

// 渲染所有图层
await poster.render();
```

## API 文档

### DrawPoster 实例方法

#### 画布操作
- `setCanvasSize(width: number, height: number): void` - 设置画布大小
- `clearCanvas(): void` - 清空画布
- `save(): void` - 保存画布状态
- `restore(): void` - 恢复画布状态

#### 图形绘制（同步）
- `drawRect(options: RectOptions): void` - 绘制矩形
- `drawCircle(options: CircleOptions): void` - 绘制圆形
- `drawLine(options: LineOptions): void` - 绘制线条
- `drawPolygon(options: PolygonOptions): void` - 绘制多边形
- `drawText(options: TextOptions): void` - 绘制文本

#### 图像与二维码
- `drawImage(options: ImageOptions): Promise<void>` - 绘制图像
- `drawQRCode(options: QRCodeOptions): void` - 绘制二维码

#### 富文本
- `drawRichText(options: any): Promise<void>` - 绘制富文本

#### 图层操作
- `addLayer(layer: Layer): string` - 添加图层，返回图层 ID
- `removeLayer(layerId: string): void` - 删除图层
- `getLayer(layerId: string): Layer | undefined` - 获取图层
- `getLayers(): Layer[]` - 获取所有图层
- `render(): Promise<void>` - 渲染所有图层

#### 变换
- `transform(options: TransformOptions): void` - 应用变换（平移、旋转、缩放）
- `moveLayer(layerId: string, dx: number, dy: number): void` - 移动图层位置

#### 布局
- `alignLayers(layerIds: string[], align: AlignType): void` - 对齐图层
- `distributeLayers(layerIds: string[], distribute: DistributeType): void` - 分布图层

#### 导出
- `exportDataURL(type?: string, quality?: number): Promise<string>` - 导出为 DataURL
- `exportBlob(type?: string, quality?: number): Promise<Blob>` - 导出为 Blob
- `exportImageData(): ImageData` - 导出为 ImageData

#### 调试
- `addDebugGuides(options: GuideOptions[]): void` - 添加基准线
- `getPerformanceStats(): PerformanceStats` - 获取性能统计

### 图层类型

所有图层都支持以下基础属性：
- `type: string` - 图层类型（'rect', 'circle', 'text' 等）
- `zIndex?: number` - 堆叠顺序（默认 0）
- `visible?: boolean` - 是否显示（默认 true）
- `mask?: string` - 蒙版图层 ID
- `filter?: string` - CSS 滤镜
- `globalCompositeOperation?: string` - 混合模式

#### RectLayer
```ts
{
  type: 'rect',
  x: number,
  y: number,
  width: number,
  height: number,
  fillStyle?: FillStyle,
  strokeStyle?: FillStyle,
  lineWidth?: number,
  // ... 更多样式选项
}
```

#### CircleLayer
```ts
{
  type: 'circle',
  x: number,
  y: number,
  radius: number,
  fillStyle?: FillStyle,
  // ... 更多样式选项
}
```

#### TextLayer
```ts
{
  type: 'text',
  x: number,
  y: number,
  text?: string,
  spans?: TextSpan[],       // 富文本
  fontSize?: number,
  fontFamily?: string,
  direction?: 'horizontal' | 'vertical',
  // ... 更多文本选项
}
```

#### ImageLayer
```ts
{
  type: 'image',
  x: number,
  y: number,
  src: string | HTMLImageElement,
  width?: number,
  height?: number,
  // ... 更多图像选项
}
```

#### QRCodeLayer
```ts
{
  type: 'qrcode',
  x: number,
  y: number,
  text: string,
  size?: number,
  fillStyle?: string,
  // ... 更多二维码选项
}
```

## 高级用法

### 渐变填充

```ts
// 线性渐变
poster.drawRect({
  x: 10,
  y: 10,
  width: 100,
  height: 50,
  fillStyle: {
    type: 'linear',
    x0: 10,
    y0: 10,
    x1: 110,
    y1: 60,
    stops: [
      { offset: 0, color: '#FF0000' },
      { offset: 1, color: '#0000FF' },
    ],
  },
});

// 径向渐变
poster.drawCircle({
  x: 50,
  y: 50,
  radius: 30,
  fillStyle: {
    type: 'radial',
    x0: 40,
    y0: 40,
    r0: 0,
    x1: 50,
    y1: 50,
    r1: 30,
    stops: [
      { offset: 0, color: '#FFFFFF' },
      { offset: 1, color: '#000000' },
    ],
  },
});
```

### 富文本渲染

```ts
poster.addLayer({
  type: 'text',
  x: 10,
  y: 10,
  spans: [
    { text: 'Hello', fontSize: 20, fillStyle: '#FF0000' },
    { text: ' World', fontSize: 20, fillStyle: '#0000FF' },
  ],
});

await poster.render();
```

### 模板系统

```ts
import { TemplateRegistry } from '@draw-poster/core';

const registry = new TemplateRegistry();

// 注册模板
registry.register('badge', (data) => [
  {
    type: 'rect',
    x: 0,
    y: 0,
    width: 80,
    height: 30,
    fillStyle: data.color,
  },
  {
    type: 'text',
    x: 40,
    y: 15,
    text: data.label,
    textAlign: 'center',
    verticalAlign: 'middle',
  },
]);

// 使用模板
const layers = registry.create('badge', {
  color: '#FF0000',
  label: 'New',
});

poster.addLayers(layers);
await poster.render();
```

### 调试模式

```ts
const poster = createDrawPoster(ctx, {
  debug: true,  // 启用调试
});

poster.addLayer({
  type: 'rect',
  x: 10,
  y: 10,
  width: 100,
  height: 50,
  fillStyle: '#FF0000',
});

// 添加基准线
poster.addDebugGuides([
  { type: 'horizontal', position: 10 },
  { type: 'vertical', position: 10 },
]);

await poster.render();  // 会自动显示边界框和基准线
```

### 插件系统

```ts
const myPlugin = {
  onInit(ctx, options) {
    console.log('初始化');
  },
  beforeDraw(layer) {
    console.log('绘制前', layer);
  },
  afterDraw(layer) {
    console.log('绘制后', layer);
  },
};

const poster = createDrawPoster(ctx, {
  plugins: [myPlugin],
});
```

## 性能优化

### ResourceManager 资源缓存

```ts
import { ResourceManager } from '@draw-poster/core';

const resourceManager = new ResourceManager();

// 预加载资源
await resourceManager.loadImage('https://example.com/image.png');

const poster = createDrawPoster(ctx, {
  resourceManager,
});

// 图片会从缓存中读取
await poster.drawImage({
  src: 'https://example.com/image.png',
  x: 10,
  y: 10,
});
```

### 离屏渲染

在 Node.js 环境中使用 OffscreenCanvas：

```ts
import { createCanvas } from 'canvas';  // or use polyfill

const offscreenCanvas = new OffscreenCanvas(800, 600);
const ctx = offscreenCanvas.getContext('2d')!;

const poster = createDrawPoster(ctx);
// ... 绘制内容
```

## 测试

```bash
pnpm test
```

支持的测试覆盖：
- 核心绘制功能
- 导出能力
- 图层系统
- 富文本渲染
- 高级特性

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 许可证

ISC

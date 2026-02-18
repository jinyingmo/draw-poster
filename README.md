# Draw Poster

高性能的 Canvas 海报绘制库 + AI 驱动的设计平台。快速生成、编辑和导出精美海报。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 项目介绍

**draw-poster** 是一个完整的海报设计解决方案，包含：

- **@draw-poster/core** - 高性能 Canvas 绘制库，提供图层系统、富文本、渐变、蒙版等高级功能
- **draw-poster-client** - 基于 Next.js 的 Web 平台，集成 AI 自动设计
- **draw-poster-server** - 后端服务，负责 AI 设计生成和资源管理

## ✨ 核心特性

### 📐 绘制功能
- 完整的图形绘制（矩形、圆形、线条、多边形）
- 高级填充（线性/径向渐变、图案填充）
- 富文本支持（多样式片段、字距控制、竖排、弧线路径文字）
- 图像处理（裁剪、圆角、旋转、透明度、滤镜、九宫格拉伸）
- 二维码生成

### 🏗️ 系统功能
- **图层系统** - 完整的图层管理（zIndex、显隐控制、蒙版、混合模式）
- **模板系统** - 可复用的图层模板注册和实例化
- **调试模式** - 网格、基准线、图层边界框可视化
- **性能优化** - 资源缓存、离屏渲染支持、性能统计

### 🤖 AI 平台
- 自然语言生成海报设计
- 即时预览和实时编辑
- JSON 编辑和导入导出
- 图层细粒度控制

## 📁 项目结构

```
draw-poster/
├── packages/
│   ├── core/                 # Canvas 绘制库核心
│   │   ├── src/
│   │   ├── tests/
│   │   └── README.md
│   ├── client/              # Next.js Web 平台
│   │   ├── app/
│   │   ├── components/
│   │   └── ...
│   └── server/              # 后端服务
├── stories/                 # Storybook 开发文档
├── .storybook/
├── pnpm-workspace.yaml
└── package.json
```

## 🚀 快速开始

### 前置要求

- Node.js 16+
- pnpm 7.33.6+

### 安装依赖

```bash
# 安装所有工作区的依赖
pnpm install
```

### 运行开发环境

```bash
# 启动 Storybook（展示组件和 API 文档）
pnpm storybook
# 访问 http://localhost:6006

# 启动所有包的开发服务（包括 Next.js、后端等）
pnpm dev
```

### 构建项目

```bash
# 构建所有工作区
pnpm build

# 构建 Storybook
pnpm storybook:build
```

### 运行测试

```bash
# 运行所有单元测试
pnpm test

# 运行 linting
pnpm lint

# 运行 TypeScript 类型检查
pnpm typecheck
```

### 清理构建文件

```bash
pnpm clean
```

## 📚 使用示例

### 基础使用

```typescript
import createDrawPoster from '@draw-poster/core';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

const poster = createDrawPoster(ctx);
poster.setCanvasSize(800, 600);

// 绘制矩形
poster.drawRect({
  x: 10,
  y: 10,
  width: 100,
  height: 50,
  fillStyle: '#FF0000',
});

// 导出
const dataUrl = await poster.exportDataURL();
```

### 图层模式（推荐）

```typescript
const poster = createDrawPoster(ctx);

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
  text: 'Hello World',
  fontSize: 24,
  zIndex: 2,
});

await poster.render();
```

### 富文本

```typescript
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

详见 [@draw-poster/core README](packages/core/README.md) 获取完整 API 文档。

## 📦 工作区说明

### @draw-poster/core

高性能 Canvas 库，可独立使用：

```bash
pnpm add @draw-poster/core
```

完整文档：[packages/core/README.md](packages/core/README.md)

### draw-poster-client

Next.js Web 平台，支持：
- AI 自动设计生成
- 实时编辑预览
- 图层管理
- 导出下载

### draw-poster-server

后端服务，提供：
- Kimi AI 集成
- 设计生成 API
- 资源管理

## 🛠️ 开发指南

### 添加新的绘制功能

在 `packages/core/src` 中实现，参考现有的图形绘制逻辑。

### 添加新的图层类型

1. 在 `packages/core/src/types` 中定义图层类型
2. 在 `packages/core/src/core/layers` 中实现渲染逻辑
3. 在 `packages/core/src/core/drawPoster.ts` 中注册

### 开发 UI 功能

在 `packages/client` 中开发 Next.js 组件。

## 🧪 测试

项目使用 Jest 进行单元测试：

```bash
pnpm test
```

## 📖 文档

- [Core API 文档](packages/core/README.md)
- [功能追踪](POSTER_FEATURES.md)
- Storybook: `pnpm storybook`

## 🌐 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

- GitHub: [jinyingmo/draw-poster](https://github.com/jinyingmo/draw-poster)
- Issues: [GitHub Issues](https://github.com/jinyingmo/draw-poster/issues)

# Draw Poster Client

AI 驱动的在线海报设计器，集成 Kimi AI 实现从自然语言描述到可视化海报的快速生成。

## 功能特性

### 🤖 AI 驱动设计
- **自然语言转设计**：使用 Kimi AI 将文字描述转换为海报 JSON 配置
- **智能理解**：AI 理解设计意图，生成合理的布局和样式
- **迭代优化**：支持基于用户反馈的多轮优化

### 🎨 可视化编辑
- **实时画布渲染**：使用 @draw-poster/core 进行高性能渲染
- **图层管理**：直观的图层编辑面板，支持：
  - 图层的显示/隐藏
  - 图层的删除和复制
  - 图层的堆叠顺序调整
  - 图层属性编辑

### 📝 JSON 编辑
- **原始 JSON 编辑**：支持直接粘贴和编辑 JSON 配置
- **实时验证**：JSON 格式验证和错误提示
- **快速应用**：编辑后一键应用到画布

### 💾 文件操作
- **模板保存**：保存自定义设计模板
- **模板加载**：快速加载和应用保存的模板
- **导出支持**：导出为图片格式

## 技术栈

- **框架**：Next.js 16.1.6
- **UI**：React 19.2.3 + React DOM 19.2.3
- **语言**：TypeScript 5.0+
- **工具链**：ESLint 9+
- **核心库**：@draw-poster/core（同仓库）
- **AI 服务**：Kimi Chat Completions API

## 项目结构

```
packages/client/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/
│   │   │   └── kimi/        # Kimi API 路由
│   │   ├── layout.tsx       # 全局布局
│   │   └── page.tsx         # 主页
│   ├── config/              # 配置文件
│   │   ├── index.ts         # 通用配置
│   │   └── template.ts      # 模板配置和预设
│   ├── prompts/             # AI Prompt 模板
│   │   └── index.ts         # Prompt 定义
│   ├── types/               # TypeScript 类型定义
│   └── components/          # React 组件（如需）
├── public/                  # 静态资源
├── package.json
├── tsconfig.json
└── README.md
```

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 配置 Kimi API

编辑 `packages/client/src/config/template.ts`：

```ts
export const KIMI_CONFIG = {
  baseUrl: "https://api.moonshot.cn/v1",
  model: "kimi-k2-0905-preview",
  apiKey: "your-api-key-here",  // 替换为真实的 API Key
};
```

### 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:3000`

### 构建

```bash
pnpm build
```

### 生产运行

```bash
pnpm start
```

## 使用流程

### 1️⃣ 输入描述

在顶部输入框中输入海报的文字描述，例如：
```
制作一个高端电子产品发布会海报，包含产品名称、发布日期、地点等信息
```

### 2️⃣ AI 生成配置

点击"生成"按钮，AI 将：
- 解析你的描述
- 生成 JSON 格式的海报配置
- 支持 @draw-poster/core 的所有图层类型

生成的 JSON 格式示例：
```json
{
  "layers": [
    {
      "type": "rect",
      "x": 0,
      "y": 0,
      "width": 800,
      "height": 600,
      "fillStyle": "#F5F5F5",
      "zIndex": 0
    },
    {
      "type": "text",
      "x": 400,
      "y": 100,
      "text": "产品发布会",
      "fontSize": 48,
      "fontFamily": "PingFang SC",
      "textAlign": "center",
      "fillStyle": "#000000",
      "zIndex": 1
    }
  ]
}
```

### 3️⃣ 画布渲染

AI 生成的配置自动应用到画布，实时预览设计效果。

### 4️⃣ 编辑优化

#### 方式一：图层面板编辑
- 点击图层进行选中
- 修改图层属性（颜色、大小、位置等）
- 实时反馈到画布

#### 方式二：JSON 直接编辑
- 点击"编辑 JSON"标签
- 复制全部 JSON 或粘贴新 JSON
- 点击"应用"更新画布

## API 路由

### POST `/api/kimi`

调用 Kimi AI 生成海报配置。

**请求**
```json
{
  "prompt": "海报描述文字"
}
```

**响应**
```json
{
  "success": true,
  "content": {
    "layers": [...]  // 海报 JSON 配置
  },
  "message": "生成成功"
}
```

**错误响应**
```json
{
  "success": false,
  "message": "错误信息"
}
```

## 配置选项

### Kimi API 配置

`packages/client/src/config/template.ts` 中的 `KIMI_CONFIG` 对象：

```ts
export const KIMI_CONFIG = {
  baseUrl: string;           // API 基础 URL
  model: string;             // 模型名称
  apiKey: string;            // API Key
};
```

### 模板预设

在 `packages/client/src/config/template.ts` 中定义：

```ts
export const TEMPLATE_PRESETS = [
  {
    name: '电商促销',
    description: '适用于商品促销和打折活动',
    prompt: '...',
  },
  // 更多模板...
];
```

## 支持的海报类型

所有 @draw-poster/core 支持的图层类型都可以使用：

| 类型 | 描述 | 用途 |
|-----|------|------|
| `rect` | 矩形 | 背景、卡片、装饰 |
| `circle` | 圆形 | 头像、装饰圆点 |
| `line` | 直线 | 分割线、装饰线 |
| `polygon` | 多边形 | 复杂形状 |
| `text` | 文本 | 标题、内容、说明文字 |
| `image` | 图像 | 产品图、背景图 |
| `qrcode` | 二维码 | 链接、推广码 |

## Prompt 工程

AI 生成质量取决于 prompt 的质量。参考 `packages/client/src/prompts/index.ts`：

### Prompt 结构
```
1. 角色定义 - 告诉 AI 它是一个海报设计师
2. 任务说明 - 说明要生成什么
3. 输出格式 - 明确指定 JSON 格式要求
4. 样式指南 - 提供设计建议
5. 示例 - 给出示例输出
```

### Prompt 优化建议
- 使用明确的设计术语（对齐、间距、对比等）
- 提供设计约束（尺寸、颜色方案等）
- 给出参考示例提高生成质量
- 明确指定图层结构和属性

## 常见问题

### Q: 如何修改生成的设计？

**A:** 有两种方式：
1. 使用图层编辑面板修改单个属性
2. 在 JSON 编辑器中修改 JSON 然后点击应用

### Q: AI 生成的设计不符合预期怎么办？

**A:**
1. 修改输入描述，提供更详细的要求
2. 调整 Prompt 工程参数
3. 手动编辑 JSON 配置

### Q: 如何保存设计？

**A:**
1. 导出为图片：点击导出按钮
2. 保存配置：保存页面上的 JSON 配置文件

### Q: 支持哪些图片格式？

**A:**
- JPEG
- PNG
- GIF
- WebP

### Q: 能否离线使用？

**A:** 当前版本依赖 Kimi AI API，需要网络连接。

## 性能优化

- 使用 React 18+ 的 Suspense 和动态导入
- Canvas 渲染使用 @draw-poster/core 的性能优化
- 图片和资源使用缓存机制
- 支持 Next.js 的 Image Optimization

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 开发指南

### 添加新的模板预设

1. 编辑 `packages/client/src/config/template.ts`
2. 在 `TEMPLATE_PRESETS` 数组中添加新条目
3. 提供清晰的 `prompt` 说明

### 自定义 Prompt

1. 编辑 `packages/client/src/prompts/index.ts`
2. 修改系统 prompt 或设计指南
3. 测试生成效果

### 扩展 UI 组件

在 `packages/client/src` 下创建 `components` 目录：

```
components/
├── Canvas/
├── LayerPanel/
├── JsonEditor/
└── ...
```

## 调试

### 启用详细日志

```ts
// 在任何需要的地方
console.log('调试信息', data);
```

### 查看 API 请求

在浏览器开发工具的 Network 标签中查看：
- `/api/kimi` 请求
- 响应的 JSON 配置

## 许可证

MIT

## 贡献

欢迎提交 Issues 和 Pull Requests！

## 相关文档

- [@draw-poster/core](../core/README.md) - 核心绘制库文档
- [Next.js 文档](https://nextjs.org/docs)
- [Kimi API 文档](https://platform.moonshot.cn/docs/api)

# 海报设计 AI 助手提示词

这个目录包含了用于 AI 助手的系统提示词（System Prompt），用于引导 LLM 正确理解和生成海报设计的图层 JSON 配置。

## 文件说明

### 📄 system-prompt.md
完整的系统提示词文档，包含：

- **角色定义**：明确 AI 助手的职责和目标
- **核心规则**：强调只输出 JSON，不允许其他格式
- **画布参数**：动态化的尺寸信息（由 `{canvasWidth}` 和 `{canvasHeight}` 占位符定义）
- **7 种图层类型**的详细说明：
  - rect（矩形）
  - circle（圆形）
  - line（线条）
  - polygon（多边形）
  - text（文本，含富文本支持）
  - image（图片，含裁剪、圆角、缩放等）
  - qrcode（二维码）

- **高级特性**：
  - 线性渐变、径向渐变、图案填充
  - 图层通用属性（id、zIndex、visible、locked）
  - 样式通用属性（阴影、透明度、混合模式、滤镜）

- **设计建议**：
  - 颜色选择
  - 尺寸计算
  - 文本排版
  - 图片优化
  - 视觉效果

- **输出格式规范**：严格的 JSON 结构要求
- **常见模式**：卡片设计、头像展示、数据展示等
- **错误避免**：6 个常见陷阱及其解决方案

### 📦 index.ts
加载和动态化提示词的 TypeScript 模块，导出：

```typescript
export function loadSystemPrompt(canvasWidth: number, canvasHeight: number): string
```

**功能**：
- 将提示词模板中的 `{canvasWidth}` 和 `{canvasHeight}` 替换为实际数值
- 确保提示词对特定的画布尺寸进行定制化

## 使用示例

在 API 路由中使用：

```typescript
import { loadSystemPrompt } from "@/prompts";

const systemPrompt = loadSystemPrompt(375, 667); // 动态生成提示词
```

## 相比之前的改进

### ❌ 之前（简陋版本）
```
"你是专业海报设计助手，需要把用户描述转换为图层 JSON 数组。"
"只输出 JSON 数组，不能输出任何 Markdown 或解释文字。"
"每个图层对象必须包含 type 字段，可选类型：rect、circle、text、image、line、polygon、qrcode。"
"画布尺寸为 {canvasWidth}x{canvasHeight}"
"坐标以左上角为 (0,0)。"
"图片图层使用 image 字段，值为可访问的图片 URL。"
"文本图层使用 text 字段，可使用 color 或 fillStyle。"
"尽量给每个图层一个清晰的 id。"
```

### ✅ 之后（完善版本）

1. **详尽的类型文档**：每种图层类型都有：
   - 明确的必需字段
   - 可选字段的完整列表
   - 具体的使用示例（JSON 代码块）

2. **高级特性说明**：
   - 渐变填充（线性 & 径向）
   - 图片高级选项（crop、scale9Grid、objectFit、radius 等）
   - 富文本支持（spans 数组）
   - 文本描边效果
   - 二维码容错等级

3. **样式系统完全覆盖**：
   - 阴影（shadowColor、shadowBlur、shadowOffsetX/Y）
   - 混合模式（globalCompositeOperation）
   - 滤镜（filter）
   - 透明度（globalAlpha）
   - 线条样式（lineCap、lineJoin、lineDash）

4. **最佳实践指导**：
   - 颜色选择建议
   - 文本排版规范
   - 图片优化技巧
   - 视觉效果设计

5. **常见设计模式**：
   - 卡片设计
   - 头像展示
   - 数据展示
   - 每个都包含具体的组件组合建议

6. **错误防范**：
   - 列出 6 个常见的实现错误
   - 配套的纠正方案

## 效果对比

使用更详尽的提示词，AI 生成的图层配置将能够：

✨ **更复杂的设计**：利用渐变、滤镜、混合模式等高级特性
✨ **更精准的排版**：充分利用文本对齐、行高、字距等参数
✨ **更丰富的表现**：圆角、阴影、缩放、裁剪等视觉效果
✨ **更少的错误**：明确指出常见陷阱和避免方法
✨ **更易维护**：鼓励为图层设置有意义的 ID

## 集成方式

只需在 API 路由中导入使用：

```typescript
import { loadSystemPrompt } from "@/prompts";

// 替换原来的硬编码 systemPrompt
const systemPrompt = loadSystemPrompt(canvasWidth, canvasHeight);
```

其余代码保持不变，对下游客户端完全透明。

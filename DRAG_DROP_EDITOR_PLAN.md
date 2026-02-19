# 拖拽式海报编辑器 — 实现方案

## 一、现状分析

### 1.1 Core 层能力

`packages/core` 已提供完整的 Canvas 绘制引擎，关键能力如下：

| 能力 | API | 说明 |
|------|-----|------|
| 图层管理 | `addLayer()` / `removeLayer()` / `getLayers()` / `render()` | 支持 7 种图层类型，zIndex 排序 |
| 包围盒计算 | `getLayerBounds(ctx, layer)` | 可获取任意图层的 BoundingBox（x, y, width, height） |
| 图层移动 | `moveLayer(layer, dx, dy)` | 支持所有类型的坐标偏移，含 polygon/line 特殊处理 |
| 对齐/分布 | `align()` / `distribute()` | 多图层对齐与等距分布 |
| 调试模式 | `debug: { bounds, grid, guides }` | 可视化边界框、网格、辅助线 |
| 导出 | `exportDataURL()` / `exportBlob()` | 导出为图片 |

**结论：Core 已具备拖拽编辑所需的底层能力**（碰撞检测 via `getLayerBounds`、移动 via `moveLayer`、渲染 via `render`），无需修改核心代码。

### 1.2 Client 层现状

`packages/client` 是基于 Next.js 的 Web 平台，当前功能：
- AI 生成 JSON 图层 → 渲染到 Canvas
- 侧边栏选中图层 → 表单编辑属性（x, y, width, height 等）
- JSON 文本框手动编辑

---

## 二、整体架构设计

```
┌──────────────────────────────────────────────────┐
│                   Editor Shell                    │
│  ┌──────────┐  ┌──────────────────┐  ┌─────────┐ │
│  │ Toolbar  │  │   Canvas Stage   │  │ Props   │ │
│  │ (左侧)   │  │   (中央画布)      │  │ Panel   │ │
│  │          │  │                  │  │ (右侧)  │ │
│  │ - 矩形   │  │  ┌────────────┐  │  │         │ │
│  │ - 圆形   │  │  │ Render     │  │  │ - 位置  │ │
│  │ - 文本   │  │  │ Canvas     │  │  │ - 尺寸  │ │
│  │ - 图片   │  │  │ (draw-     │  │  │ - 样式  │ │
│  │ - 二维码 │  │  │  poster)   │  │  │ - 文本  │ │
│  │          │  │  └────────────┘  │  │ - 图片  │ │
│  │ - 线条   │  │  ┌────────────┐  │  │         │ │
│  │ - 多边形 │  │  │ Overlay    │  │  │ 图层列表│ │
│  │          │  │  │ Canvas     │  │  │ (可拖拽 │ │
│  │ 操作按钮  │  │  │ (选中框/   │  │  │  排序)  │ │
│  │ - 撤销   │  │  │  手柄)     │  │  │         │ │
│  │ - 重做   │  │  └────────────┘  │  │ ✨AI生成│ │
│  │ - 删除   │  │                  │  │ (折叠)  │ │
│  │ - 导出   │  │  Mouse/Touch     │  │         │ │
│  └──────────┘  │  Event Handler   │  └─────────┘ │
│                └──────────────────┘              │
│              EditorState (useReducer)             │
│              History Stack (undo/redo)            │
└──────────────────────────────────────────────────┘
```

### 核心设计原则

1. **双 Canvas 架构**：底层 Canvas 由 `draw-poster` 渲染内容；顶层透明 Canvas 绘制交互 UI（选中框、手柄），避免交互与内容相互干扰
2. **状态驱动**：所有编辑操作修改 `layers` 状态 → 触发 `render()` → 画布更新
3. **不修改 Core**：所有编辑器逻辑在 Client 层实现，Core 保持纯粹的绘制引擎角色

---

## 三、已实现功能清单

### ✅ 已完成（P0 全部 + P1 全部）

| 功能 | 文件 | 状态 |
|------|------|------|
| 三栏布局（Toolbar / Canvas / PropsPanel） | `page.tsx`, `page.module.css` | ✅ |
| 双 Canvas 架构（render + overlay） | `CanvasStage.tsx` | ✅ |
| 点击选中图层 | `hitTest.ts`, `CanvasStage.tsx` | ✅ |
| 选中框绘制（蓝色虚线 + 8 个方块手柄） | `selectionRenderer.ts`, `CanvasStage.tsx` | ✅ |
| 拖拽移动图层（绝对坐标计算，支持 rect/circle/text/image/qrcode/line/polygon） | `CanvasStage.tsx` | ✅ |
| Resize 手柄缩放（8 个方向，rect/image/qrcode/circle/text） | `CanvasStage.tsx` | ✅ |
| 工具栏点击添加元素（7 种类型） | `Toolbar.tsx`, `layerDefaults.ts` | ✅ |
| 属性面板（按类型动态渲染字段） | `PropsPanel.tsx` | ✅ |
| 图层列表（可拖拽排序、可见切换、删除） | `PropsPanel.tsx` | ✅ |
| 撤销/重做（历史栈） | `useEditorState.ts` | ✅ |
| 键盘快捷键（Delete、Ctrl+Z/Shift+Z、Ctrl+D、方向键微调） | `page.tsx` | ✅ |
| 导出图片（PNG） | `page.tsx` | ✅ |
| AI 生成功能（折叠在右侧面板） | `PropsPanel.tsx` | ✅ |
| 鼠标 cursor 智能切换（move / resize 方向 / default） | `CanvasStage.tsx` | ✅ |

### ❌ 未实现（P2/P3，本次范围外）

| 功能 | 说明 |
|------|------|
| line/polygon 的 resize 手柄 | 几何较复杂，仅支持移动 |
| 智能辅助线（Snap） | 吸附对齐功能 |
| 旋转手柄 | 图层旋转交互 |
| 右键上下文菜单 | 置顶/置底/复制等 |
| 多选（框选/Shift+点击） | 批量操作 |
| 画布缩放/平移（滚轮） | 超出画布视口时的缩放 |
| 图片本地上传 | 当前仅支持 URL |
| 标尺（Ruler） | 画布标尺显示 |

---

## 四、新增文件结构

```
packages/client/src/
├── app/
│   ├── page.tsx                    ✅ 重构为编辑器 Shell
│   ├── page.module.css             ✅ 三栏布局样式
│   └── api/kimi/route.ts           (保持不变)
├── components/
│   ├── CanvasStage.tsx             ✅ 双 Canvas 画布 + 鼠标交互
│   ├── CanvasStage.module.css      ✅
│   ├── Toolbar.tsx                 ✅ 左侧工具栏
│   ├── Toolbar.module.css          ✅
│   ├── PropsPanel.tsx              ✅ 右侧属性面板（图层列表+编辑+AI生成）
│   └── PropsPanel.module.css       ✅
├── hooks/
│   └── useEditorState.ts           ✅ useReducer 状态管理 + 历史栈
├── utils/
│   ├── hitTest.ts                  ✅ 碰撞检测 + 坐标转换
│   ├── selectionRenderer.ts        ✅ 选中框/手柄绘制
│   └── layerDefaults.ts            ✅ 各类型图层默认值
├── config/                         (保持不变)
├── prompts/                        (保持不变)
└── types/                          (保持不变)
```

---

## 五、关键实现细节

### 5.1 状态管理（useEditorState）

```
EditorAction 类型：
  SET_LAYERS     — 替换全部图层（自动推历史）
  ADD_LAYER      — 添加图层（自动推历史）
  UPDATE_LAYER   — 更新属性（不推历史，用于拖拽实时预览）
  REMOVE_LAYER   — 删除图层（自动推历史）
  SELECT         — 选中图层（不影响历史）
  REORDER        — 图层排序（自动推历史）
  PUSH_HISTORY   — 手动保存快照（拖拽结束时调用）
  UNDO / REDO    — 历史跳转
```

### 5.2 拖拽机制

- **初始化**：mousedown 时记录 `mouseStartX/Y` 和 `initialProps`（图层属性快照）
- **Move**：`新坐标 = 初始坐标 + (当前鼠标 - 起始鼠标)`，避免增量累积误差
- **Resize**：从 `startBounds` + 总 delta 计算新 bounds，再映射回各类型属性
- **提交**：mouseup 时若 `hasMoved=true`，dispatch `PUSH_HISTORY`

### 5.3 坐标转换

```ts
// 处理画布 CSS 尺寸与实际像素尺寸的差异
const scaleX = canvas.width / canvas.getBoundingClientRect().width;
const x = (e.clientX - rect.left) * scaleX;
```

### 5.4 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Delete` / `Backspace` | 删除选中图层 |
| `Ctrl+Z` | 撤销 |
| `Ctrl+Shift+Z` | 重做 |
| `Ctrl+D` | 复制并偏移选中图层 |
| `方向键` | 微调 1px |
| `Shift+方向键` | 微调 10px |

---

## 六、验证方法

1. `cd packages/client && pnpm dev`，访问 http://localhost:3000
2. 点击左侧 Toolbar 各按钮，验证元素添加到画布
3. 点击画布元素，验证选中框出现（蓝色虚线 + 8 个手柄）
4. 拖拽元素，验证实时移动
5. 拖拽 resize 手柄，验证元素尺寸变化
6. 在 PropsPanel 修改属性，验证画布实时更新
7. Ctrl+Z 撤销，Ctrl+Shift+Z 重做
8. Delete 键删除选中图层
9. 方向键微调位置（1px），Shift+方向键（10px）
10. 右侧 AI 生成面板展开 → 输入 prompt → 生成 → 图层注入编辑器
11. 图层列表拖拽排序，验证 zIndex 更新
12. 点击眼睛图标切换图层可见性

import type { Layer } from "./types";

/**
 * 模板数据类型（键值对）
 */
export type TemplateData = Record<string, unknown>;

/**
 * 模板函数：接收数据，返回图层列表
 */
export type TemplateFn<T extends TemplateData = TemplateData> = (
  data: T,
) => Layer[];

/**
 * 对图层列表施加坐标偏移
 */
const applyLayerOffset = (layers: Layer[], dx: number, dy: number): Layer[] => {
  if (dx === 0 && dy === 0) return layers;
  return layers.map(layer => {
    const l = { ...layer } as Record<string, unknown>;
    if ("x" in l && typeof l.x === "number") l.x += dx;
    if ("y" in l && typeof l.y === "number") l.y += dy;
    if ("x1" in l && typeof l.x1 === "number") l.x1 += dx;
    if ("y1" in l && typeof l.y1 === "number") l.y1 += dy;
    if ("x2" in l && typeof l.x2 === "number") l.x2 += dx;
    if ("y2" in l && typeof l.y2 === "number") l.y2 += dy;
    if ("points" in l && Array.isArray(l.points)) {
      l.points = (l.points as [number, number][]).map(([px, py]) => [
        px + dx,
        py + dy,
      ]);
    }
    return l as unknown as Layer;
  });
};

/**
 * 模板注册表：管理可复用的图层模板
 *
 * @example
 * ```ts
 * const registry = new TemplateRegistry();
 *
 * registry.register('badge', (data) => [
 *   { type: 'rect', x: data.x, y: data.y, width: 80, height: 30, fillStyle: data.color },
 *   { type: 'text', x: data.x + 40, y: data.y + 15, text: data.label, textAlign: 'center' },
 * ]);
 *
 * const layers = registry.create('badge', { x: 0, y: 0, color: 'red', label: 'New' });
 * ```
 */
export class TemplateRegistry {
  private templates = new Map<string, TemplateFn<TemplateData>>();

  /**
   * 注册模板
   * @param name 模板名称
   * @param fn 模板函数
   */
  register<T extends TemplateData>(name: string, fn: TemplateFn<T>): void {
    this.templates.set(name, fn as TemplateFn<TemplateData>);
  }

  /**
   * 是否已注册该模板
   */
  has(name: string): boolean {
    return this.templates.has(name);
  }

  /**
   * 注销模板
   */
  unregister(name: string): void {
    this.templates.delete(name);
  }

  /**
   * 使用模板创建图层列表
   * @param name 模板名称
   * @param data 模板数据
   * @param offset 坐标偏移（可选）
   */
  create<T extends TemplateData>(
    name: string,
    data?: T,
    offset?: { x?: number; y?: number },
  ): Layer[] {
    const fn = this.templates.get(name);
    if (!fn) {
      throw new Error(`Template "${name}" is not registered.`);
    }
    const layers = fn((data ?? {}) as TemplateData);
    const dx = offset?.x ?? 0;
    const dy = offset?.y ?? 0;
    return applyLayerOffset(layers, dx, dy);
  }

  /**
   * 获取所有已注册的模板名称
   */
  getNames(): string[] {
    return Array.from(this.templates.keys());
  }
}

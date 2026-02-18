import type { Layer } from "../core/types";
import type { TemplateFn, TemplateData } from "../core/template";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

/**
 * 图层描述符：与 Layer 结构相同，但字符串值可含 {{path}} 占位符
 *
 * @example
 * ```ts
 * const layer: JsonTemplateLayer = {
 *   type: "text",
 *   text: "{{username}}",
 *   x: 150,
 *   y: 100,
 *   fillStyle: "{{theme.primary}}",
 * };
 * ```
 */
export type JsonTemplateLayer = JsonObject;

/** 按 . 分隔的路径从数据对象中取值，支持多级嵌套 */
function getNestedValue(data: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc !== null && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, data);
}

/**
 * 解析单个值中的 {{path}} 占位符：
 * - 非字符串值原样返回
 * - 整体占位符 "{{path}}" → 返回原始类型（保留 number/boolean 等）
 * - 部分占位符 "Hello {{name}}!" → 字符串拼接
 */
function resolveValue(value: JsonValue, data: Record<string, unknown>): unknown {
  if (typeof value !== "string") return value;

  // 整体替换：保留原始数据类型
  const fullMatch = value.match(/^\{\{([\w.]+)\}\}$/);
  if (fullMatch) {
    return getNestedValue(data, fullMatch[1]);
  }

  // 部分插值：转为字符串后拼接
  return value.replace(/\{\{([\w.]+)\}\}/g, (_, path: string) => {
    const val = getNestedValue(data, path);
    return val != null ? String(val) : "";
  });
}

/** 递归解析层描述符（支持嵌套对象和数组） */
function resolveLayer(
  layerDef: JsonObject | JsonArray,
  data: Record<string, unknown>,
): unknown {
  if (Array.isArray(layerDef)) {
    return layerDef.map((item) =>
      item !== null && typeof item === "object"
        ? resolveLayer(item as JsonObject | JsonArray, data)
        : resolveValue(item as JsonPrimitive, data),
    );
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(layerDef)) {
    if (value !== null && typeof value === "object") {
      result[key] = resolveLayer(value as JsonObject | JsonArray, data);
    } else {
      result[key] = resolveValue(value as JsonPrimitive, data);
    }
  }
  return result;
}

/**
 * 将 JSON 图层描述数组转换为模板函数，可直接传给 `p.registerTemplate()`。
 *
 * 支持的占位符语法：
 * - `"{{key}}"` — 整体替换，保留原始类型（number/boolean/string/object）
 * - `"{{key.nested}}"` — 多级路径嵌套访问
 * - `"前缀 {{key}} 后缀"` — 字符串部分插值
 *
 * @param layers JSON 图层描述数组（可序列化为 JSON，可从服务端加载）
 * @returns 可注册的模板函数 `TemplateFn<T>`
 *
 * @example
 * ```ts
 * const TEMPLATE: JsonTemplateLayer[] = [
 *   { type: "rect", x: 0, y: 0, width: 300, height: 400, fillStyle: "{{theme.bg}}" },
 *   { type: "text", text: "{{username}}", x: 150, y: 170, fontSize: 22, textAlign: "center" },
 * ];
 *
 * p.registerTemplate("card", createJsonTemplate(TEMPLATE));
 *
 * p.createFromTemplate("card", {
 *   username: "张三",
 *   theme: { bg: "#1a1a2e" },
 * }).forEach(l => p.addLayer(l));
 *
 * await p.render();
 * ```
 */
export function createJsonTemplate<T extends TemplateData>(
  layers: JsonTemplateLayer[],
): TemplateFn<T> {
  return (data: T) =>
    layers.map(
      (layerDef) =>
        resolveLayer(layerDef, data as Record<string, unknown>) as Layer,
    );
}

import { createDrawPoster } from './core'
import type { DrawPoster, DrawPosterOptions, CanvasContext } from "./core";

/**
 * 创建 DrawPoster 实例 (默认导出)
 * @param ctx Canvas 上下文
 * @param options 配置选项
 * @returns DrawPoster 实例
 */
export default function create(
  ctx: CanvasContext,
  options: DrawPosterOptions = {},
): DrawPoster {
  const drawPoster = createDrawPoster(ctx, options);
  return drawPoster;
}

export * from "./core";
export { createJsonTemplate } from "./utils/jsonTemplate";
export type { JsonTemplateLayer } from "./utils/jsonTemplate";

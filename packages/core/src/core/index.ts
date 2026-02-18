import type { DrawPoster, DrawPosterOptions } from "./types";
import { createDrawPoster as createDrawPosterCore } from "./drawPoster";

/**
 * 创建 DrawPoster 实例
 * @param ctx Canvas 上下文
 * @param options 配置选项
 * @returns DrawPoster 实例
 */
export const createDrawPoster = (
  ctx: CanvasRenderingContext2D,
  options: DrawPosterOptions = {},
): DrawPoster => createDrawPosterCore(ctx, options);

export * from "./types";

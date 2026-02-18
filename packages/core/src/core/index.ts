import type { DrawPoster, DrawPosterOptions, CanvasContext } from "./types";
import { createDrawPoster as createDrawPosterCore } from "./drawPoster";

/**
 * 创建 DrawPoster 实例
 * @param ctx Canvas 上下文
 * @param options 配置选项
 * @returns DrawPoster 实例
 */
export const createDrawPoster = (
  ctx: CanvasContext,
  options: DrawPosterOptions = {},
): DrawPoster => createDrawPosterCore(ctx, options);

export * from "./types";
export * from "../utils/font";
export * from "../utils/resource";

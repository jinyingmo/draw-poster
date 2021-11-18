import { createDrawPoster } from './core/'

/**
 * 获取drawPoster对象
 * @param {Object} ctx  - canvas context
 * @param {Number} ratio - 海报像素缩放比例
 */
export default function(ctx, options = {}) {
  const drawPoster = createDrawPoster(ctx, options)
  return drawPoster
}
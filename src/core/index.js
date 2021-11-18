import DrawPoster from './drawPoster'

/**
 * 实例化DrawPoster类并返回
 * @param {Object} ctx  - canvas context
 * @param {Number} ratio - 海报像素缩放比例
 */
export const createDrawPoster = (ctx, { ratio = 1 }) => {
  const drawPoster = new DrawPoster(ctx, { ratio })
  return drawPoster
}
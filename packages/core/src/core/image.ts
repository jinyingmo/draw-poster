import { scaleValue, withContext } from "./canvas";
import { clipRoundedRect } from "./shapes";
import type { ImageOptions } from "./types";
import { loadImage } from "../utils/imgUtils";

/**
 * 解析图片资源
 * @param source 图片地址或元素
 * @returns Promise<HTMLImageElement>
 */
const resolveImage = async (source: string | HTMLImageElement) => {
  if (typeof source === "string") {
    return loadImage(source);
  }
  return source;
};

/**
 * 绘制图片
 * @param ctx Canvas 上下文
 * @param options 图片配置
 * @param ratio 缩放比例
 */
export const drawImage = async (
  ctx: CanvasRenderingContext2D,
  options: ImageOptions,
  ratio = 1,
) => {
  const { source, x, y, width, height, radius, crop, rotate, ...styles } =
    options;
  const img = await resolveImage(source);
  const draw = () => {
    const targetX = scaleValue(x, ratio);
    const targetY = scaleValue(y, ratio);
    const targetWidth = scaleValue(width, ratio);
    const targetHeight = scaleValue(height, ratio);
    if (rotate) {
      ctx.translate(targetX + targetWidth / 2, targetY + targetHeight / 2);
      ctx.rotate(rotate);
      ctx.translate(
        -(targetX + targetWidth / 2),
        -(targetY + targetHeight / 2),
      );
    }
    if (radius) {
      clipRoundedRect(ctx, x, y, width, height, radius, ratio);
    }
    if (crop) {
      ctx.drawImage(
        img,
        scaleValue(crop.sx, ratio),
        scaleValue(crop.sy, ratio),
        scaleValue(crop.sw, ratio),
        scaleValue(crop.sh, ratio),
        targetX,
        targetY,
        targetWidth,
        targetHeight,
      );
    } else {
      ctx.drawImage(img, targetX, targetY, targetWidth, targetHeight);
    }
  };
  withContext(ctx, styles, ratio, draw);
};

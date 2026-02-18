import { scaleValue, withContext } from "./canvas";
import { clipRoundedRect } from "./shapes";
import type { ImageOptions, CanvasContext } from "./types";
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
  ctx: CanvasContext,
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
    const { scale9Grid } = options;
    if (scale9Grid) {
      const [top, right, bottom, left] = scale9Grid;
      const imgWidth = img.width as number;
      const imgHeight = img.height as number;

      // 源图像区域划分
      const sX = [0, left, imgWidth - right];
      const sY = [0, top, imgHeight - bottom];
      const sW = [left, imgWidth - left - right, right];
      const sH = [top, imgHeight - top - bottom, bottom];

      // 目标区域划分（应用缩放比例）
      const dLeft = scaleValue(left, ratio);
      const dRight = scaleValue(right, ratio);
      const dTop = scaleValue(top, ratio);
      const dBottom = scaleValue(bottom, ratio);

      const dX = [targetX, targetX + dLeft, targetX + targetWidth - dRight];
      const dY = [targetY, targetY + dTop, targetY + targetHeight - dBottom];
      const dW = [dLeft, Math.max(0, targetWidth - dLeft - dRight), dRight];
      const dH = [dTop, Math.max(0, targetHeight - dTop - dBottom), dBottom];

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (sW[col] > 0 && sH[row] > 0 && dW[col] > 0 && dH[row] > 0) {
            ctx.drawImage(
              img,
              sX[col],
              sY[row],
              sW[col],
              sH[row],
              dX[col],
              dY[row],
              dW[col],
              dH[row],
            );
          }
        }
      }
    } else if (crop) {
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

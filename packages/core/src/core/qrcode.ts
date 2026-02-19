import QRCode from "qrcode";
import { scaleValue, withContext } from "./canvas";
import { loadImage } from "../utils/imgUtils";
import type { QRCodeOptions, CanvasContext } from "./types";

/**
 * 绘制二维码
 * @param ctx Canvas 上下文
 * @param options 二维码配置
 * @param ratio 缩放比例
 */
export const drawQRCode = async (
  ctx: CanvasContext,
  options: QRCodeOptions,
  ratio = 1,
) => {
  const {
    text,
    x,
    y,
    width,
    height,
    errorCorrectionLevel,
    margin,
    color,
    rotate,
    ...styles
  } = options;

  try {
    const url = await QRCode.toDataURL(text, {
      errorCorrectionLevel,
      margin,
      color,
    });

    const img = await loadImage(url);

    const draw = () => {
      if (rotate) {
        const cx = scaleValue(x + width / 2, ratio);
        const cy = scaleValue(y + height / 2, ratio);
        ctx.translate(cx, cy);
        ctx.rotate(rotate);
        ctx.translate(-cx, -cy);
      }
      ctx.drawImage(
        img,
        scaleValue(x, ratio),
        scaleValue(y, ratio),
        scaleValue(width, ratio),
        scaleValue(height, ratio),
      );
    };
    withContext(ctx, styles, ratio, draw);
  } catch (e) {
    console.error("DrawPoster: QRCode generation failed", e);
  }
};

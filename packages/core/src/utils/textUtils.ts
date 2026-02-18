type WrapTextResult = {
  lineNumber: number;
};

declare global {
  interface CanvasRenderingContext2D {
    wrapText: (
      text: string,
      x: number,
      y: number,
      maxWidth?: number,
      lineHeight?: number,
      maxLines?: number,
    ) => WrapTextResult;
  }
  interface OffscreenCanvasRenderingContext2D {
    wrapText: (
      text: string,
      x: number,
      y: number,
      maxWidth?: number,
      lineHeight?: number,
      maxLines?: number,
    ) => WrapTextResult;
  }
}

/**
 * 扩展 Canvas 上下文，添加 wrapText 方法
 */
export function contextWrapText() {
  /**
   * 绘制自动换行文本
   * @param text 文本内容
   * @param x X 坐标
   * @param y Y 坐标
   * @param maxWidth 最大宽度
   * @param lineHeight 行高
   * @param maxLines 最大行数
   * @returns { lineNumber: number } 绘制的行数
   */
  const wrapTextImpl = function (
    this: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth?: number,
    lineHeight?: number,
    maxLines?: number,
  ) {
    if (
      typeof text !== "string" ||
      typeof x !== "number" ||
      typeof y !== "number"
    ) {
      return { lineNumber: 0 };
    }

    const context = this as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    const canvas = context.canvas;

    if (typeof maxWidth === "undefined") {
      maxWidth = (canvas && canvas.width) || 300;
    }
    if (typeof lineHeight === "undefined") {
      lineHeight = 20; // default line height for offscreen canvas
    }

    const arrText = Array.from(text);

    let line = "";
    let lineNumber = 0;

    for (let n = 0; n < arrText.length; n++) {
      const testLine = line + arrText[n];
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lineNumber++;
        if (typeof maxLines !== "undefined" && lineNumber >= maxLines) {
          context.fillText(line.substring(0, line.length - 1) + "...", x, y);
          line = "";
          break;
        } else {
          context.fillText(line, x, y);
          line = arrText[n];
          y += lineHeight;
        }
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
    return {
      lineNumber,
    };
  };

  CanvasRenderingContext2D.prototype.wrapText = wrapTextImpl;
  OffscreenCanvasRenderingContext2D.prototype.wrapText = wrapTextImpl;
}

export {};

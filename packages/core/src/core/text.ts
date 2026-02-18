import { scaleValue, withContext } from "./canvas";
import type { TextOptions, CanvasContext } from "./types";

/**
 * 构建字体字符串
 * @param options 文本配置
 * @param ratio 缩放比例
 * @returns 字体字符串
 */
export const buildFont = (options: Partial<TextOptions>, ratio: number) => {
  const fontStyle = options.fontStyle || "normal";
  const fontWeight = options.fontWeight ? String(options.fontWeight) : "normal";
  const fontSize = options.fontSize
    ? scaleValue(options.fontSize, ratio)
    : scaleValue(16, ratio);
  const fontFamily = options.fontFamily || "sans-serif";
  return `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
};

/**
 * 计算文本行布局
 * @param ctx Canvas 上下文
 * @param text 文本内容
 * @param maxWidth 最大宽度
 * @param maxLines 最大行数
 * @returns 分行后的文本数组
 */
export const layoutLines = (
  ctx: CanvasContext,
  text: string,
  maxWidth?: number,
  maxLines?: number,
) => {
  if (!maxWidth) {
    return [text];
  }
  const chars = Array.from(text);
  const lines: string[] = [];
  let line = "";
  for (let i = 0; i < chars.length; i += 1) {
    const testLine = line + chars[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      lines.push(line);
      line = chars[i];
      if (maxLines && lines.length >= maxLines) {
        break;
      }
    } else {
      line = testLine;
    }
  }
  if (lines.length < (maxLines || Infinity)) {
    lines.push(line);
  }
  if (maxLines && lines.length > maxLines) {
    lines.splice(maxLines);
  }
  if (maxLines && lines.length === maxLines && chars.length) {
    const lastIndex = lines.length - 1;
    let lastLine = lines[lastIndex];
    while (
      ctx.measureText(`${lastLine}...`).width > maxWidth &&
      lastLine.length > 0
    ) {
      lastLine = lastLine.slice(0, -1);
    }
    lines[lastIndex] = `${lastLine}...`;
  }
  return lines;
};

/**
 * 绘制文本
 * @param ctx Canvas 上下文
 * @param options 文本配置
 * @param ratio 缩放比例
 * @returns 绘制结果 { lineNumber: 行数 }
 */
export const drawText = (ctx: CanvasContext, options: TextOptions, ratio = 1) => {
  const {
    text,
    x,
    y,
    maxWidth,
    lineHeight,
    maxLines,
    color,
    textAlign,
    textBaseline,
    strokeText,
    ...styles
  } = options;
  const scaledMaxWidth =
    typeof maxWidth === "number" ? scaleValue(maxWidth, ratio) : undefined;
  const scaledLineHeight =
    typeof lineHeight === "number"
      ? scaleValue(lineHeight, ratio)
      : options.fontSize
      ? scaleValue(options.fontSize * 1.2, ratio)
      : scaleValue(19.2, ratio);
  let lineCount = 0;
  const draw = () => {
    ctx.font = buildFont(options, ratio);
    if (textAlign) {
      ctx.textAlign = textAlign;
    }
    if (textBaseline) {
      ctx.textBaseline = textBaseline;
    }
    if (color) {
      ctx.fillStyle = color;
    }
    const lines = layoutLines(ctx, text, scaledMaxWidth, maxLines);
    lineCount = Math.max(0, lines.length - 1);
    const startX = scaleValue(x, ratio);
    let cursorY = scaleValue(y, ratio);
    for (let i = 0; i < lines.length; i += 1) {
      ctx.fillText(lines[i], startX, cursorY, scaledMaxWidth);
      if (strokeText) {
        ctx.strokeText(lines[i], startX, cursorY, scaledMaxWidth);
      }
      cursorY += scaledLineHeight;
    }
  };
  withContext(
    ctx,
    { ...styles, fillStyle: color || styles.fillStyle },
    ratio,
    draw,
  );
  return { lineNumber: lineCount };
};

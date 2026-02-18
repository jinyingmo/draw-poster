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
    strokeColor,
    strokeWidth,
    direction,
    letterSpacing,
    ...styles
  } = options;

  // 描边增强：strokeColor / strokeWidth 优先于 styles.strokeStyle / styles.lineWidth
  const resolvedStrokeStyle = strokeColor || styles.strokeStyle;
  const resolvedLineWidth = strokeWidth ?? styles.lineWidth;
  const resolvedStyles = {
    ...styles,
    fillStyle: color || styles.fillStyle,
    ...(resolvedStrokeStyle ? { strokeStyle: resolvedStrokeStyle } : {}),
    ...(resolvedLineWidth !== undefined ? { lineWidth: resolvedLineWidth } : {}),
  };

  let lineCount = 0;

  // 竖排文本
  if (direction === "vertical") {
    const charSize = options.fontSize
      ? scaleValue(options.fontSize, ratio)
      : scaleValue(16, ratio);
    const spacing = letterSpacing ? scaleValue(letterSpacing, ratio) : 0;

    const draw = () => {
      ctx.font = buildFont(options, ratio);
      if (textAlign) ctx.textAlign = textAlign;
      if (textBaseline) ctx.textBaseline = textBaseline;
      if (color) ctx.fillStyle = color;

      const scaledX = scaleValue(x, ratio);
      let cursorY = scaleValue(y, ratio);
      const chars = Array.from(text);

      for (const char of chars) {
        ctx.fillText(char, scaledX, cursorY);
        if (strokeText) {
          if (strokeColor) ctx.strokeStyle = strokeColor;
          if (strokeWidth !== undefined) ctx.lineWidth = strokeWidth;
          ctx.strokeText(char, scaledX, cursorY);
        }
        cursorY += charSize + spacing;
      }
      lineCount = chars.length;
    };

    withContext(ctx, resolvedStyles, ratio, draw);
    return { lineNumber: lineCount };
  }

  // 横排文本（默认）
  const scaledMaxWidth =
    typeof maxWidth === "number" ? scaleValue(maxWidth, ratio) : undefined;
  const scaledLineHeight =
    typeof lineHeight === "number"
      ? scaleValue(lineHeight, ratio)
      : options.fontSize
      ? scaleValue(options.fontSize * 1.2, ratio)
      : scaleValue(19.2, ratio);

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

    // 字距（横排）
    if (letterSpacing) {
      const scaledSpacing = scaleValue(letterSpacing, ratio);
      for (let i = 0; i < lines.length; i += 1) {
        let cursorX = startX;
        for (const char of Array.from(lines[i])) {
          ctx.fillText(char, cursorX, cursorY);
          if (strokeText) {
            ctx.strokeText(char, cursorX, cursorY);
          }
          cursorX += ctx.measureText(char).width + scaledSpacing;
        }
        cursorY += scaledLineHeight;
      }
    } else {
      for (let i = 0; i < lines.length; i += 1) {
        ctx.fillText(lines[i], startX, cursorY, scaledMaxWidth);
        if (strokeText) {
          ctx.strokeText(lines[i], startX, cursorY, scaledMaxWidth);
        }
        cursorY += scaledLineHeight;
      }
    }
  };

  withContext(ctx, resolvedStyles, ratio, draw);
  return { lineNumber: lineCount };
};

/**
 * 沿弧线绘制路径文字
 * @param ctx Canvas 上下文
 * @param options 配置
 * @param ratio 缩放比例
 */
export const drawTextOnArc = (
  ctx: CanvasContext,
  options: TextOptions & {
    /** 圆弧中心 X（逻辑像素） */
    cx: number;
    /** 圆弧中心 Y（逻辑像素） */
    cy: number;
    /** 圆弧半径（逻辑像素） */
    arcRadius: number;
    /** 起始角度（弧度，0 = 右方，默认 -Math.PI/2 = 上方） */
    startAngle?: number;
    /** 文字朝向：outward 字面朝外（默认），inward 字面朝内 */
    facing?: "outward" | "inward";
  },
  ratio = 1,
) => {
  const {
    text,
    cx,
    cy,
    arcRadius,
    startAngle = -Math.PI / 2,
    facing = "outward",
    color,
    textAlign: _align,
    textBaseline: _baseline,
    strokeText,
    strokeColor,
    strokeWidth,
    direction: _direction,
    letterSpacing,
    maxWidth: _maxWidth,
    maxLines: _maxLines,
    lineHeight: _lineHeight,
    ...styles
  } = options;

  const resolvedStyles = {
    ...styles,
    fillStyle: color || styles.fillStyle,
    ...(strokeColor ? { strokeStyle: strokeColor } : {}),
    ...(strokeWidth !== undefined ? { lineWidth: strokeWidth } : {}),
  };

  const draw = () => {
    ctx.font = buildFont(options, ratio);
    if (color) ctx.fillStyle = color;

    const scaledCx = scaleValue(cx, ratio);
    const scaledCy = scaleValue(cy, ratio);
    const scaledR = scaleValue(arcRadius, ratio);
    const scaledSpacing = letterSpacing ? scaleValue(letterSpacing, ratio) : 0;
    const chars = Array.from(text);

    // 计算每个字符的宽度，用于均匀排布
    const charWidths = chars.map(c => ctx.measureText(c).width + scaledSpacing);
    const totalWidth = charWidths.reduce((s, w) => s + w, 0);

    // 起始偏移角，使整体文字居中
    const totalAngle = totalWidth / scaledR;
    let angle = startAngle - totalAngle / 2;

    for (let i = 0; i < chars.length; i++) {
      const charWidth = charWidths[i];
      angle += charWidth / 2 / scaledR;

      ctx.save();
      ctx.translate(scaledCx, scaledCy);
      ctx.rotate(facing === "inward" ? angle + Math.PI : angle);
      ctx.textAlign = "center";
      ctx.textBaseline = facing === "inward" ? "top" : "bottom";

      ctx.fillText(chars[i], 0, facing === "inward" ? scaledR : -scaledR);
      if (strokeText) {
        if (strokeColor) ctx.strokeStyle = strokeColor;
        if (strokeWidth !== undefined) ctx.lineWidth = strokeWidth;
        ctx.strokeText(chars[i], 0, facing === "inward" ? scaledR : -scaledR);
      }
      ctx.restore();

      angle += charWidth / 2 / scaledR;
    }
  };

  withContext(ctx, resolvedStyles, ratio, draw);
};

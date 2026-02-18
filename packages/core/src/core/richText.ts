import { buildFont } from "./text";
import { scaleValue, withContext } from "./canvas";
import type { RichTextOptions, TextSpan, CanvasContext } from "./types";

interface RichTextSegment {
  text: string;
  width: number;
  style: TextSpan;
}

interface RichTextLine {
  segments: RichTextSegment[];
  width: number; // Total width of line
  height: number; // Max height (fontSize * 1.2 or lineHeight)
}

/**
 * 测量文本片段宽度 (考虑字距)
 */
const measureTextWidth = (
  ctx: CanvasContext,
  text: string,
  style: TextSpan,
  ratio: number,
) => {
  const letterSpacing = style.letterSpacing
    ? scaleValue(style.letterSpacing, ratio)
    : 0;
  const metrics = ctx.measureText(text);
  let width = metrics.width;
  if (letterSpacing && text.length > 1) {
    width += (text.length - 1) * letterSpacing;
  }
  return width;
};

/**
 * 计算富文本布局
 */
export const layoutRichLines = (
  ctx: CanvasContext,
  options: RichTextOptions,
  ratio: number,
): RichTextLine[] => {
  const { spans, maxWidth, maxLines, lineHeight, ...defaultStyle } = options;
  const scaledMaxWidth = maxWidth ? scaleValue(maxWidth, ratio) : undefined;

  const lines: RichTextLine[] = [];
  let currentLine: RichTextLine = { segments: [], width: 0, height: 0 };

  // Helper to add segment to current line
  const addSegment = (
    text: string,
    style: TextSpan,
    width: number,
    height: number,
  ) => {
    currentLine.segments.push({ text, width, style });
    currentLine.width += width;
    currentLine.height = Math.max(currentLine.height, height);
  };

  // Helper to finalize current line and start new one
  const breakLine = () => {
    lines.push(currentLine);
    currentLine = { segments: [], width: 0, height: 0 };
  };

  for (const span of spans) {
    const style = { ...defaultStyle, ...span };
    ctx.font = buildFont(style, ratio);
    const fontSize = style.fontSize
      ? scaleValue(style.fontSize, ratio)
      : scaleValue(16, ratio);
    // Determine line height for this span: priority explicit lineHeight > span fontSize * 1.2
    // If global lineHeight is set, use it as minimum? Or absolute?
    // Usually lineHeight is per-paragraph or per-line.
    // Here we use max(spanHeight) for the line unless global lineHeight is fixed.
    // Let's assume global lineHeight overrides if present.
    const spanHeight = lineHeight
      ? scaleValue(lineHeight, ratio)
      : fontSize * 1.2;

    const chars = Array.from(span.text);
    let currentText = "";
    let currentWidth = 0;

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const charWidth = measureTextWidth(ctx, char, style, ratio);

      // Check if adding this char exceeds maxWidth
      // But we need to account for existing line width
      if (
        scaledMaxWidth &&
        currentLine.width + currentWidth + charWidth > scaledMaxWidth
      ) {
        // Push current accumulated text as segment
        if (currentText) {
          addSegment(currentText, style, currentWidth, spanHeight);
          currentText = "";
          currentWidth = 0;
        }

        // Start new line
        breakLine();

        // If maxLines reached, stop processing (we might need ellipsis later)
        if (maxLines && lines.length >= maxLines) {
          // Handle ellipsis... complex. For now just break.
          return lines;
        }

        // Add char to new line (if it fits, otherwise it's a very narrow width issue)
        currentText += char;
        currentWidth += charWidth;
      } else {
        currentText += char;
        // Add spacing if not first char in current accumulation?
        // measureTextWidth handles spacing for the whole string.
        // We need to be careful. measureTextWidth(A) + measureTextWidth(B) != measureTextWidth(AB) if spacing involved?
        // Actually: width(AB) = width(A) + spacing + width(B).
        // My measureTextWidth adds spacing for length > 1.
        // So strict accumulation:
        // newWidth = measureTextWidth(currentText + char)
        // This is safer but slower.
        const nextWidth = measureTextWidth(ctx, currentText, style, ratio);
        currentWidth = nextWidth;
      }
    }

    // Push remaining text in span
    if (currentText) {
      addSegment(currentText, style, currentWidth, spanHeight);
    }
  }

  if (currentLine.segments.length > 0) {
    lines.push(currentLine);
  }

  return lines;
};

/**
 * 绘制富文本
 */
export const drawRichText = (
  ctx: CanvasContext,
  options: RichTextOptions,
  ratio = 1,
) => {
  const { x, y, textAlign, textBaseline, ...defaultStyle } = options;

  // Prepare context for measurement (some defaults needed)
  ctx.save();
  const lines = layoutRichLines(ctx, options, ratio);
  ctx.restore();

  const startX = scaleValue(x, ratio);
  let currentY = scaleValue(y, ratio);

  // Calculate total height for vertical alignment if needed (not implemented yet, default baseline top/middle/alphabetic?)
  // Standard drawText uses y as start of first line (baseline).

  for (const line of lines) {
    let lineX = startX;

    // Handle alignment
    if (textAlign === "center") {
      lineX -= line.width / 2;
    } else if (textAlign === "right") {
      lineX -= line.width;
    } else if (textAlign === "left" || textAlign === "start") {
      // Default
    } else if (textAlign === "end") {
      lineX -= line.width; // Assuming LTR
    }

    // Adjust Y based on max height of line
    // If textBaseline is top, we draw down.
    // If bottom, we draw up?
    // Standard fillText y is baseline.
    // But we have mixed font sizes. We need to align baselines.
    // This simple implementation assumes alphabetic baseline alignment.

    for (const segment of line.segments) {
      const style = { ...defaultStyle, ...segment.style };
      const segmentWidth = segment.width;

      // Merge color into fillStyle for withContext if not present
      const finalStyle = { ...style };
      if (finalStyle.color && !finalStyle.fillStyle) {
        finalStyle.fillStyle = finalStyle.color;
      }
      // Ensure fillStyle is set if neither is present (default black)
      if (
        !finalStyle.fillStyle &&
        !finalStyle.strokeStyle &&
        !finalStyle.strokeText
      ) {
        finalStyle.fillStyle = "#000";
      }

      if (finalStyle.strokeText && !finalStyle.strokeStyle) {
        finalStyle.strokeStyle = finalStyle.color || "#000";
      }

      const draw = () => {
        ctx.font = buildFont(finalStyle, ratio);

        const letterSpacing = finalStyle.letterSpacing
          ? scaleValue(finalStyle.letterSpacing, ratio)
          : 0;

        if (letterSpacing) {
          let charX = lineX;
          for (const char of segment.text) {
            if (finalStyle.fillStyle) {
              ctx.fillText(char, charX, currentY);
            }
            if (finalStyle.strokeText || finalStyle.strokeStyle) {
              ctx.strokeText(char, charX, currentY);
            }
            const charW = ctx.measureText(char).width;
            charX += charW + letterSpacing;
          }
        } else {
          if (finalStyle.fillStyle) {
            ctx.fillText(segment.text, lineX, currentY);
          }
          if (finalStyle.strokeText || finalStyle.strokeStyle) {
            ctx.strokeText(segment.text, lineX, currentY);
          }
        }
      };

      withContext(ctx, finalStyle, ratio, draw);
      lineX += segmentWidth;

      // Add spacing between segments? No, handled by startX of next segment.
      // But wait, my segment width calculation included internal spacing.
      // What about spacing between segments?
      // If segment1 ends with char, segment2 starts with char.
      // Should there be spacing?
      // Current logic: segments are just chunks.
      // If I split "Hello World" into "Hello" and " World", it's fine.
      // If I split "AB" into "A" and "B" with letterSpacing...
      // My measureTextWidth("A") = width(A).
      // My measureTextWidth("B") = width(B).
      // layoutRichLines logic accumulates width.
      // If I have span "AB", char loop adds spacing.
      // If I have span "A" and span "B"...
      // layoutRichLines treats them as separate spans.
      // We don't add spacing BETWEEN spans automatically.
      // This is standard behavior (HTML span behavior).
    }

    currentY += line.height;
  }
};
